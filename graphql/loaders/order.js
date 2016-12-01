import DataLoader from 'dataloader';
import Parse from 'parse/node';
import Promise from 'bluebird';
import moment from 'moment';
import { cursorToOffset } from 'graphql-relay';
import { userByIdLoader } from './user';

export const orderByIdLoader = new DataLoader(ids => {
  const Order = Parse.Object.extend('Order');
  const queryOrder = new Parse.Query(Order);
  queryOrder.containedIn('objectId', ids);

  return queryOrder.find({ useMasterKey: true })
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
  return Promise.map(keys, async key => {
    const args = JSON.parse(key);
    const { after, first, skip, limit, start, end, code, shop, status, createdBy, customer } = args;
    const Order = Parse.Object.extend('Order');
    const queryOrder = new Parse.Query(Order);
    if (code) queryOrder.startsWith('code', code);
    if (shop) queryOrder.containedIn('shop', shop);
    if (status) queryOrder.containedIn('status', status);
    if (createdBy) {
      const user = await userByIdLoader.load(createdBy);
      queryOrder.equalTo('createdBy', user);
    }
    if (customer) {
      const user = await userByIdLoader.load(customer);
      queryOrder.equalTo('customer', user);
    }
    if (start) {
      queryOrder.greaterThanOrEqualTo('updatedAt', moment(start).toDate());
    }
    if (end) {
      queryOrder.lessThanOrEqualTo('updatedAt', moment(end).toDate());
    }
    queryOrder.descending('updatedAt');
    queryOrder.skip(skip || (after ? cursorToOffset(after) + 1 : 0));
    queryOrder.limit(limit || first || 20);

    const orders = await queryOrder.find({ useMasterKey: true });

    Promise.map(orders, item => {
      orderByIdLoader.prime(item.id, item);
      return Promise.resolve();
    });

    return orders;
  });
});
