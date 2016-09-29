/* global Parse, @flow */

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

const checkProductStatus = async (productId: string): Promise<boolean> => {
  const productQuery = new Parse.Query('Product');
  const productObj = await productQuery.get(productId);
  if (!productObj) throw new Error(`Product ${productId} not found`);
  const productStatus = productObj.get('status');
  if (productStatus.indexOf('available') === -1) {
    throw new Error(`Product ${productId} not available for order`);
  }

  return true;
};

Parse.Cloud.beforeSave('Order', async (req, res) => {
  const order: Object = req.object;
  let currentOrder;

  if (order.id) {
    const orderQuery = new Parse.Query('Order');
    currentOrder = await orderQuery.get(order.id, { useMasterKey: true });
  }
  console.log(currentOrder);
  // Check code
  const code = order.get('code');
  if (!currentOrder || (currentOrder && currentOrder.get('code') !== code)) {
    try {
      await checkCode(code);
    } catch (error) {
      return res.error(error.message);
    }
  }

  // Check product
  if (!currentOrder) {
    const lines: Object[] = order.get('lines');
    const checkProductPromises = [];
    lines.map(line => {
      checkProductPromises.push(checkProductStatus(line.productId));
      return line;
    });
    try {
      await Promise.all(checkProductPromises);
    } catch (error) {
      return res.error(error.message);
    }
  }

  // Calculator
  try {
    await reCalculateOrder(order);
  } catch (error) {
    return res.error(error.message);
  }

  return res.success();
});

// AfterSave triggers
// ==============================
// [x] Change Product status

const changeProductStatus = async (productId: string, statusToChange: string): Promise<boolean> => {
  const queryProduct = new Parse.Query('Product');
  const productObj = await queryProduct.get(productId, { useMasterKey: true });
  if (!productObj) throw new Error(`Product ${productId} not found`);

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
