/* global Parse, @flow */
import nodeUUID from 'node-uuid';
import _ from 'lodash';
import moment from 'moment';
import loaders from '../graphql/loaders';

// Before Save
// =========================
// [x] Tính toán lại order
// [x] Check code
// [x] Check product status

const reCalculateOrder = async (Order: Object): Promise<boolean> => {
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

const checkProductStatus = async (productId: string, shopOnOrder: string): Promise<boolean> => {
  const productQuery = new Parse.Query('Product');
  const productObj = await productQuery.get(productId);
  if (!productObj) throw new Error(`Product ${productId} not found`);
  if (productObj.get('shop') !== 'Tổ Cú' && shopOnOrder !== 'Tổ Cú Online' && productObj.get('shop') !== shopOnOrder) {
    throw new Error(`Sản phẩm ${productObj.get('code')} đang ở shop ${productObj.get('shop')}`);
  }
  const productStatus = productObj.get('status');
  if (productStatus.indexOf('available') === -1) {
    throw new Error(`Product ${productId} not available for order`);
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
  let checkProductPromise = Promise.resolve();
  if (!currentOrder) {
    const lines: Object[] = order.get('lines');
    const checkProductPromisesArr = [];
    lines.map(line => {
      checkProductPromisesArr.push(checkProductStatus(line.productId, shop));
      return line;
    });
    checkProductPromise = Promise.all(checkProductPromisesArr);
  }

  const shippingAddress = order.get('shippingAddress') || null;
  const customerId = order.get('customer').id;

  // Run Promise all
  const result = await Promise.all([
    // Check code
    checkCodePromise,
    // Check products
    checkProductPromise,
    // Calculator
    reCalculateOrder(order),
    // Add address to User
    createAddress(shippingAddress, customerId),
  ])
  .catch(err => {
    return res.error(err.message);
  });

    // Add history
  const history = order.get('history') || [];
  if (!currentOrder) {
    history.unshift({
      type: 'createOrder',
      content: {
        createdAt: moment().format(),
      },
      updatedAt: moment().format(),
      updatedBy: order.get('createdBy').id,
    });
  }

  // Set other fields
  order.set('history', history);
  order.set('shippingAddress', result[3]);

  return res.success();
});

// AfterSave triggers
// ==============================
// [x] Change Product status
// [] Add createOrder history

const changeProductStatus = async (productId: string, statusToChange: string): Promise<boolean> => {
  const queryProduct = new Parse.Query('Product');
  const productObj = await queryProduct.get(productId, { useMasterKey: true });
  if (!productObj) throw new Error(`Product ${productId} not found`);

  // Nếu là multipleProduct
  if (productObj.get('additionalPrices').length > 0) {
    return Promise.resolve();
  }

  productObj.set('status', statusToChange);
  return productObj.save(null, { useMasterKey: true });
};

Parse.Cloud.afterSave('Order', async (req, res) => {
  const order: Object = req.object;
  const orderStatus: string = order.get('status');
  const lines: Object[] = order.get('lines');

  // Change Product status
  const productStatusToChange = orderStatus === 'pending' ? 'suspended' : 'sold';
  const promisesToChangeProducts = [];
  lines.map(line => {
    promisesToChangeProducts.push(changeProductStatus(line.productId, productStatusToChange));
    return line;
  });
  try {
    await Promise.all(promisesToChangeProducts);
  } catch (error) {
    return res.error(error.message);
  }

  return res.success();
});
