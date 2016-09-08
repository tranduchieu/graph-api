import DataLoader from 'dataloader';
import Parse from 'parse/node';
import { cursorToOffset } from 'graphql-relay';

export const addressByIdLoader = new DataLoader(ids => {
  const Address = Parse.Object.extend('Address');
  const queryAddress = new Parse.Query(Address);
  queryAddress.containedIn('objectId', ids);

  return queryAddress.find()
    .then(addresses => {
      return ids.map(id => {
        const addressFilter = addresses.filter(address => {
          return address.id === id;
        });

        const result = addressFilter.length >= 1 ? addressFilter[0] : null;
        return result;
      });
    });
});

export const addressesByUserIdLoader = new DataLoader(userIds => {
  return Promise.all(userIds.map(userId => {
    const queryUser = new Parse.Query(Parse.User);
    return queryUser.get(userId)
    .then(userObj => {
      const addressesRelation = userObj.relation('addresses');
      return addressesRelation.query().find();
    });
  }));
});

export const allAddressesLoader = new DataLoader(keys => {
  return Promise.all(keys.map(key => {
    const args = JSON.parse(key);
    const { after, first } = args;
    const Address = Parse.Object.extend('Address');
    const queryAddress = new Parse.Query(Address);
    // if (code) queryAddress.equalTo('code', code);
    queryAddress.skip(after ? cursorToOffset(after) + 1 : 0);
    queryAddress.limit(first || 20);

    return queryAddress.find()
      .then(addresses => {
        addresses.forEach(item => {
          addressByIdLoader.prime(item.id, item);
        });
        return addresses;
      });
  }));
});
