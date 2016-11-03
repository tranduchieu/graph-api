import DataLoader from 'dataloader';
import Parse from 'parse/node';
import { cursorToOffset } from 'graphql-relay';

export const orderHistoryByIdLoader = new DataLoader(ids => {
  const OrderHistory = Parse.Object.extend('OrderHistory');
  const queryOrderHistory = new Parse.Query(OrderHistory);
  queryOrderHistory.containedIn('objectId', ids);

  return queryOrderHistory.find({ useMasterKey: true })
    .then(history => {
      return ids.map(id => {
        const historyFilter = history.filter(item => {
          return item.id === id;
        });

        const result = historyFilter.length >= 1 ? historyFilter[0] : null;
        return result;
      });
    });
});

export const allOrderHistoryLoader = new DataLoader(keys => {
  return Promise.all(keys.map(key => {
    const args = JSON.parse(key);
    const { after, first, skip, limit, type, visible, nameStartsWith } = args;
    const OrderHistory = Parse.Object.extend('OrderHistory');
    const queryOrderHistory = new Parse.Query(OrderHistory);
    if (type) queryOrderHistory.equalTo('type', type);
    if (visible) queryOrderHistory.equalTo('visible', visible);
    if (nameStartsWith) queryOrderHistory.startsWith('nameToLowerCase', nameStartsWith);

    queryOrderHistory.descending('createdAt');
    queryOrderHistory.skip(skip || (after ? cursorToOffset(after) + 1 : 0));
    queryOrderHistory.limit(limit || first || 20);

    return queryOrderHistory.find({ useMasterKey: true })
      .then(history => {
        history.forEach(item => {
          orderHistoryByIdLoader.prime(item.id, item);
        });
        return history;
      });
  }));
});
