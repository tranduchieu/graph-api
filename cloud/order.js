/* global Parse, @flow */
import nodeUUID from 'node-uuid';
import _ from 'lodash';
import moment from 'moment';
import Promise from 'bluebird';
import loaders from '../graphql/loaders';

// Before Save
// =========================
// [x] Tính toán lại order
// [x] Check code
// [x] Check product status
// [x] Check history

const reCalculateOrder = (Order: Object): Promise<boolean> => {
  const total: number = Order.get('total') || 0;
  const subTotal: number = Order.get('subTotal') || 0;
  const shippingCost: number = Order.get('shippingCost') || 0;
  const percentageDiscount: number = Order.get('percentageDiscount') || 0;
  const fixedDiscount: number = Order.get('fixedDiscount') || 0;
  const totalDiscounts: number = Order.get('totalDiscounts') || 0;
  const OrderLines: Object[] = Order.get('lines') || [];

  // Tính tổng OrderLines
  let totalLinesAmount = 0;
  OrderLines.forEach(line => {
    if (line.unitPrice * line.quantity !== line.amount) {
      throw new Error('OrderLine amount không đúng');
    }
    totalLinesAmount += line.amount;
  });

  // Tính subTotal
  if (totalLinesAmount !== subTotal) {
    throw new Error('subTotal không đúng');
  }

  // Tính totalDiscounts
  if (percentageDiscount !== 0 || fixedDiscount !== 0 || totalDiscounts !== 0) {
    if (totalDiscounts !== (((subTotal * percentageDiscount) / 100) + fixedDiscount)) {
      throw new Error('totalDiscounts không đúng');
    }
  }

  // Tính total
  if (total !== (subTotal + shippingCost) - totalDiscounts) {
    throw new Error('total không đúng');
  }

  return true;
};

const checkCode = async (code: string) => {
  const orderQuery = new Parse.Query('Order');
  orderQuery.equalTo('code', code);
  const orderObj = await orderQuery.first({ useMasterKey: true });
  if (orderObj) throw new Error(`Code ${code} đã tồn tại`);
  return true;
};

const checkProductStatus = (productObj: Object, shopOnOrder: string) => {
  if (productObj.get('shop') !== 'Tổ Cú' && shopOnOrder !== 'Tổ Cú Online' && productObj.get('shop') !== shopOnOrder) {
    throw new Error(`Sản phẩm ${productObj.get('code')} đang ở shop ${productObj.get('shop')}`);
  }
  const productStatus = productObj.get('status');
  if (productStatus.indexOf('available') === -1) {
    throw new Error(`Product ${productObj.id} not available for order`);
  }

  return true;
};

const createAddress = async (shippingAddress, customerId: string) => {
  if (!shippingAddress) {
    return Promise.resolve(shippingAddress);
  }

  const userObj = await loaders.user.load(customerId);
  const addresses = userObj.get('addresses');

  if (shippingAddress.id) {
    _.remove(addresses, (item) => {
      return item.id === shippingAddress.id;
    });
  } else {
    shippingAddress.id = nodeUUID.v4();
  }

  addresses.unshift(shippingAddress);

  userObj.set('addresses', addresses);
  return userObj.save(null, { useMasterKey: true })
  .then(userObjSaved => {
    loaders.users.clearAll();
    loaders.user.prime(customerId, userObjSaved);
    return shippingAddress;
  });
};

const checkHistory = (history: Object, total: number, shippingAddress) => {
  let totalPayments: number = 0;
  let lastHistoryShippingStatus;

  history.forEach(item => {
    if (item.type === 'addPayment') {
      totalPayments += item.content.amount;
    }

    if (item.type === 'addShipping' && !lastHistoryShippingStatus) {
      lastHistoryShippingStatus = item.content.shippingStatus;
    }
  });

  let statusToChange = null;
  // Cases
  // --------------
  if (totalPayments > total) throw new Error('Số tiền khách thanh toán vượt quá hóa đơn');
  if (totalPayments === total && (lastHistoryShippingStatus === 'delivered' || !shippingAddress)) statusToChange = 'completed';
  if (lastHistoryShippingStatus === 'shipperReceived') statusToChange = 'sending';
  if (totalPayments > 0 && totalPayments < total) statusToChange = 'partiallyPaid';

  return statusToChange;
};

Parse.Cloud.beforeSave('Order', async (req, res) => {
  const order: Object = req.object;
  const shop = order.get('shop');
  let currentOrder;

  if (order.id) {
    const orderQuery = new Parse.Query('Order');
    currentOrder = await orderQuery.get(order.id, { useMasterKey: true });
  }

  // Check code
  let checkCodePromise = Promise.resolve();
  const code = order.get('code');
  if (!currentOrder || (currentOrder && currentOrder.get('code') !== code)) {
    checkCodePromise = checkCode(code);
  }

  // Check product
  let linesPromise = Promise.resolve([]);
  if (!currentOrder) {
    const lines: Object[] = order.get('lines');
    console.log(lines);
    linesPromise = Promise.map(lines, async line => {
      const productObj = await loaders.product.load(line.productId);
      if (!productObj) throw new Error(`Product ${line.productId} not found`);

      checkProductStatus(productObj, shop);

      line.boxes = productObj.get('boxes') || [];
      line.tags = productObj.get('tags') || [];
      line.productName = productObj.get('name');

      return line;
    });
  }

  const shippingAddress = order.get('shippingAddress') || null;
  const customerId = order.get('customer').id;

  // Run Promise all
  const result = await Promise.all([
    // Check code
    checkCodePromise,
    // Check products
    linesPromise,
    // Calculator
    reCalculateOrder(order),
    // Add address to User
    createAddress(shippingAddress, customerId),
  ])
  .catch(err => {
    return res.error(err.message);
  });

  const history = order.get('history') || [];
  // Check history
  let statusToChange = order.get('status');
  if (currentOrder && (history.length > currentOrder.get('history').length)) {
    try {
      statusToChange = checkHistory(order.get('history'), order.get('total'), shippingAddress) || order.get('status');
    } catch (error) {
      res.error(error.message);
    }
  }

  // Add history
  if (!currentOrder) {
    history.push({
      type: 'createOrder',
      content: {
        createdAt: moment().format(),
      },
      updatedAt: moment().format(),
      updatedBy: order.get('createdBy').id,
    });
  }

  // Set other fields
  order.set('lines', result[1]);
  order.set('history', history);
  order.set('shippingAddress', result[3]);
  order.set('status', statusToChange);

  return res.success();
});

// AfterSave triggers
// ==============================
// [x] Change Product status

const changeProductStatus = async (productId: string, orderStatus: string): Promise => {
  const queryProduct = new Parse.Query('Product');
  const productObj = await queryProduct.get(productId, { useMasterKey: true });
  if (!productObj) throw new Error(`Product ${productId} not found`);

  const productStatus = productObj.get('status');

  // Nếu là multipleProduct
  if (productObj.get('additionalPrices').length > 0) {
    return Promise.resolve();
  }
  let statusToChange = null;
  // Cases
  if (orderStatus === 'pending') {
    switch (productStatus) {
      case 'inStock':
      case 'availableInStore':
      case 'availableInOnline':
      case 'availableInAll':
        statusToChange = 'suspended';
        break;
      default:
        break;
    }
  }

  if (orderStatus === 'partiallyPaid') {
    switch (productStatus) {
      case 'inStock':
      case 'suspended':
      case 'availableInStore':
      case 'availableInOnline':
      case 'availableInAll':
        statusToChange = 'sold';
        break;
      default:
        break;
    }
  }

  if (orderStatus === 'paid' || orderStatus === 'sending' || orderStatus === 'completed') {
    switch (productStatus) {
      case 'inStock':
      case 'suspended':
      case 'availableInStore':
      case 'availableInOnline':
      case 'availableInAll':
        statusToChange = 'sold';
        break;
      default:
        break;
    }
  }

  if (orderStatus === 'failed' || orderStatus === 'canceled') {
    switch (productStatus) {
      case 'suspended':
      case 'sold':
        statusToChange = 'inStock';
        break;
      default:
        break;
    }
  }

  if (!statusToChange) {
    return Promise.resolve();
  }

  productObj.set('status', statusToChange);
  return productObj.save(null, { useMasterKey: true });
};

Parse.Cloud.afterSave('Order', async (req, res) => {
  const order: Object = req.object;
  const orderStatus: string = order.get('status');
  const lines: Object[] = order.get('lines');

  // Change product status
  Promise.map(lines, line => {
    return changeProductStatus(line.productId, orderStatus);
  });

  // Clear loaders
  loaders.order.prime(order.id, order);
  loaders.orders.clearAll();
  loaders.searchs.clearAll();
  loaders.searchsCount.clearAll();
  loaders.salesReport.clearAll();

  return res.success();
});

Parse.Cloud.afterDelete('Order', (req, res) => {
  const order = req.object;

  // Clear loaders
  loaders.order.clear(order.id);
  loaders.orders.clearAll();
  loaders.searchs.clearAll();
  loaders.searchsCount.clearAll();
  loaders.salesReport.clearAll();

  res.success();
});
