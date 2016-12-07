// @flow
import Parse from 'parse/node';
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

export const reCalculateOrder = (OrderJSON: Object): Promise => {
  return new Promise((resolve, reject) => {
    const total: number = OrderJSON.total || 0;
    const subTotal: number = OrderJSON.subTotal || 0;
    const shippingCost: number = OrderJSON.shippingCost || 0;
    const percentageDiscount: number = OrderJSON.percentageDiscount || 0;
    const fixedDiscount: number = OrderJSON.fixedDiscount || 0;
    const totalDiscounts: number = OrderJSON.totalDiscounts || 0;
    const OrderLines: Object[] = OrderJSON.lines || [];

    // Tính tổng OrderLines
    let totalLinesAmount = 0;
    OrderLines.forEach(line => {
      if (line.unitPrice * line.quantity !== line.amount) {
        return reject(new Error('OrderLine amount không đúng'));
      }
      totalLinesAmount += line.amount;
      return line;
    });

    // Tính subTotal
    if (totalLinesAmount !== subTotal) {
      return reject(new Error('subTotal không đúng'));
    }

    // Tính totalDiscounts
    if (percentageDiscount !== 0 || fixedDiscount !== 0 || totalDiscounts !== 0) {
      if (totalDiscounts !== (((subTotal * percentageDiscount) / 100) + fixedDiscount)) {
        return reject(new Error('totalDiscounts không đúng'));
      }
    }

    // Tính total
    if (total !== (subTotal + shippingCost) - totalDiscounts) {
      return reject(new Error('total không đúng'));
    }

    return resolve(true);
  });
};

export const checkCode = async (code: string) => {
  const orderQuery = new Parse.Query('Order');
  orderQuery.equalTo('code', code);
  const orderObj = await orderQuery.first({ useMasterKey: true });
  if (orderObj) throw new Error(`Code ${code} đã tồn tại`);
  return true;
};

export const checkProductStatus = (productObj: Object, shopOnOrder: string) => {
  if (productObj.shop !== 'Tổ Cú' && shopOnOrder !== 'Tổ Cú Online' && productObj.shop !== shopOnOrder) {
    throw new Error(`Sản phẩm ${productObj.code} đang ở shop ${productObj.shop}`);
  }
  const productStatus = productObj.status;
  if (productStatus.indexOf('available') === -1) {
    throw new Error(`Product ${productObj.objectId} status is ${productStatus}, not available for order`);
  }

  return true;
};

export const createAddress = async (shippingAddress: Object, customerId: string, customerAddresses: []) => {
  if (shippingAddress.id) {
    _.remove(customerAddresses, (item) => {
      return item.id === shippingAddress.id;
    });
  } else {
    shippingAddress.id = nodeUUID.v4();
  }

  customerAddresses.unshift(shippingAddress);

  const user = new Parse.User();
  user.id = customerId;
  user.set('addresses', customerAddresses);
  return user.save(null, { useMasterKey: true });
};

export const checkHistory = (history: Object, total: number, shippingAddress) => {
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

const getCustomerJSON = async (customerId) => {
  const queryUser = new Parse.Query(Parse.User);
  const userObj = await queryUser.get(customerId, { useMasterKey: true })
  .catch(() => {
    throw new Error(`Customer id ${customerId} not found`);
  });
  const customerJSON = userObj.toJSON();
  return customerJSON;
};

export const beforeSaveOrder = async (req, res) => {
  const order: Object = req.object;
  const orderJSON: Object = order.toJSON();
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
  const lines: Object[] = order.get('lines');
  let linesPromise = () => Promise.resolve(lines);
  if (!currentOrder) {
    linesPromise = () => Promise.map(lines, async line => {
      const productQuery = new Parse.Query('Product');
      const productObj = await productQuery.get(line.productId, { useMasterKey: true })
      .catch(() => {
        throw new Error(`Product ${line.productId} not found`);
      });
      const productJSON = productObj.toJSON();

      checkProductStatus(productJSON, shop);
      line.boxes = productObj.get('boxes') || [];
      line.tags = productObj.get('tags') || [];
      line.productName = productObj.get('name');
      return line;
    });
  }

  const shippingAddress = order.get('shippingAddress') || null;

  let createAddressPromise = Promise.resolve();
  if (shippingAddress) {
    const customerId = order.get('customer').id;
    const customerJSON = await getCustomerJSON(customerId);
    createAddressPromise = createAddress(shippingAddress, customerJSON.objectId, customerJSON.addresses);
  }

  // Run Promise all
  const [, linesResult] = await Promise.all([
    // Check code
    checkCodePromise,
    // Check products
    linesPromise(),
    // Calculator
    reCalculateOrder(orderJSON),
    // Add address to User
    createAddressPromise,
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
  order.set('lines', linesResult);
  order.set('history', history);
  order.set('status', statusToChange);

  return res.success();
};

// AfterSave triggers
// ==============================
// [x] Change Product status

export const changeProductStatus = async (productId: string, orderStatus: string): Promise => {
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

export const afterSaveOrder = async (req, res) => {
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
};

export const afterDeleteOrder = (req, res) => {
  const order = req.object;

  // Clear loaders
  loaders.order.clear(order.id);
  loaders.orders.clearAll();
  loaders.searchs.clearAll();
  loaders.searchsCount.clearAll();
  loaders.salesReport.clearAll();

  res.success();
};
