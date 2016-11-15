// @flow
import DataLoader from 'dataloader';
import Parse from 'parse/node';
import Promise from 'bluebird';
import moment from 'moment';
import { userByIdLoader } from './user';

const revenueCalc = async (start, end, shops: string[], staffObj): Promise<Object> => {
  const query = new Parse.Query('Order');
  query.greaterThanOrEqualTo('updatedAt', moment(start).toDate());
  query.lessThanOrEqualTo('updatedAt', moment(end).toDate());
  query.containedIn('shop', shops);
  if (staffObj) query.equalTo('history.updatedBy', staffObj.id);
  query.equalTo('history.type', 'addPayment');
  const orders = await query.find({ useMasterKey: true });

  if (orders.length === 0) {
    return Promise.resolve({
      revenue: 0,
      cash: 0,
      bank: 0,
    });
  }

  return Promise.map(orders, order => {
    const resolveObj = {
      revenue: 0,
      cash: 0,
      bank: 0,
    };

    order.get('history').forEach(historyItem => {
      if (historyItem.type === 'addPayment' &&
          moment(historyItem.updatedAt).isSameOrAfter(start) &&
          moment(historyItem.updatedAt).isSameOrBefore(end)) {
        if ((staffObj && historyItem.updatedBy === staffObj.id) || !staffObj) {
          resolveObj.revenue += historyItem.content.amount;
          if (historyItem.content.paymentMethod === 'cash') {
            resolveObj.cash += historyItem.content.amount;
          }
        }
      }
    });

    resolveObj.bank = resolveObj.revenue - resolveObj.cash;
    return resolveObj;
  })
  .then(result => {
    const sum = result.reduce((a, b) => {
      a.revenue += b.revenue;
      a.cash += b.cash;
      a.bank += b.bank;
      return a;
    }, {
      revenue: 0,
      cash: 0,
      bank: 0,
    });
    return sum;
  });
};

const itemsSoldCalc = async (start, end, shops: string[], staffObj) => {
  const query = new Parse.Query('Order');
  query.greaterThanOrEqualTo('createdAt', moment(start).toDate());
  query.lessThanOrEqualTo('createdAt', moment(end).toDate());
  query.containedIn('shop', shops);
  if (staffObj) query.equalTo('createdBy', staffObj);
  query.containedIn('status', ['partiallyPaid', 'paid', 'sending', 'completed']);
  const orders = await query.find({ useMasterKey: true });

  if (orders.length === 0) return Promise.resolve(0);

  return Promise.map(orders, order => {
    let totalQuantity = 0;
    order.get('lines').forEach(line => {
      totalQuantity += line.quantity;
    });
    return totalQuantity;
  })
  .then(result => {
    const sum = result.reduce((a, b) => {
      return a + b;
    }, 0);
    return sum;
  });
};

export const salesReportLoader = new DataLoader(keys => {
  return Promise.map(keys, async key => {
    const args = JSON.parse(key);
    const { start, end, shops, staff } = args;

    let staffObj = null;
    if (staff) {
      staffObj = await userByIdLoader.load(staff);
    }
    if (staff && !staffObj) {
      throw new Error(`Không tìm thấy UserId ${staff}`);
    }

    return Promise.all([
      revenueCalc(start, end, shops, staffObj),
      itemsSoldCalc(start, end, shops, staffObj),
    ])
    .then(result => {
      result[0].itemsSold = result[1];
      return result[0];
    });
  });
});

export const customersReportLoader = new DataLoader(keys => {
  return Promise.map(keys, key => {
    return key;
  });
});
