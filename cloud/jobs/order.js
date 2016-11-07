/* global Parse */
import Promise from 'bluebird';

Parse.Cloud.job('OrderHistoryToArray', async (req, res) => {
  const queryOrder = new Parse.Query('Order');
  queryOrder.doesNotExist('history');
  const allOrders = await queryOrder.find({ useMasterKey: true });

  return Promise.map(allOrders, order => {
    order.set('history', [{
      type: 'createOrder',
      content: {
        createdAt: order.get('createdAt'),
      },
      updatedAt: order.get('createdAt'),
      updatedBy: order.get('createdBy').id,
    }]);
    return order.save(null, { useMasterKey: true });
  }, { concurrency: 5 })
  .then(() => {
    return res.success('Done!');
  })
  .catch(err => {
    return res.error(err.message);
  });
});
