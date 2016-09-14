/* global Parse, @flow */

// Before Save
// =========================
// - Tính toán lại order

const reCalculateOrder = async (Order: Object): Promise<boolean> => {
  const total: number = Order.get('total') || 0;
  const subTotal: number = Order.get('subTotal') || 0;
  const shippingCost: number = Order.get('shippingCost') || 0;
  const percentageDiscount: number = Order.get('percentageDiscount') || 0;
  const fixedDiscount: number = Order.get('fixedDiscount') || 0;
  const totalDiscounts: number = Order.get('totalDiscounts') || 0;

  const linesRelation = Order.relation('lines');
  const OrderLines = await linesRelation.query().find({ useMasterKey: true });

  // Tính tổng OrderLines
  let totalLinesAmount = 0;
  OrderLines.forEach(line => {
    if (line.get('unitPrice') * line.get('quantity') !== line.get('amount')) {
      throw new Error('OrderLine amount không đúng');
    }
    totalLinesAmount += line.get('amount');
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

Parse.Cloud.beforeSave('Order', async (req, res) => {
  const order: Object = req.object;
  try {
    await reCalculateOrder(order);
  } catch (error) {
    return res.error(error.message);
  }

  return res.success();
});
