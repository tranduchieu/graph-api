import DataLoader from 'dataloader';
import Parse from 'parse/node';
import { cursorToOffset } from 'graphql-relay';

export const orderByIdLoader = new DataLoader(ids => {
  const Order = Parse.Object.extend('Order');
  const queryOrder = new Parse.Query(Order);
  queryOrder.containedIn('objectId', ids);

  return queryOrder.find()
    .then(orders => {
      return ids.map(id => {
        const orderFilter = orders.filter(order => {
          return order.id === id;
        });

        const result = orderFilter.length >= 1 ? orderFilter[0] : null;
        return result;
      });
    });
});

export const allOrdersLoader = new DataLoader(keys => {
  return Promise.all(keys.map(key => {
    const args = JSON.parse(key);
    const { after, first, code } = args;
    const Order = Parse.Object.extend('Order');
    const queryOrder = new Parse.Query(Order);
    if (code) queryOrder.equalTo('code', code);
    queryOrder.skip(after ? cursorToOffset(after) + 1 : 0);
    queryOrder.limit(first || 20);

    return queryOrder.find()
      .then(orders => {
        orders.forEach(item => {
          orderByIdLoader.prime(item.id, item);
        });
        return orders;
      });
  }));
});

export const linesByOrderLoader = new DataLoader(orderIds => {
  return Promise.all(orderIds.map(orderId => {
    return orderByIdLoader.load(orderId)
    .then(userObj => {
      const linesRelation = userObj.relation('lines');
      return linesRelation.query().find();
    });
  }));
});
