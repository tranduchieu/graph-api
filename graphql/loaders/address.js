import DataLoader from 'dataloader';
import Parse from 'parse/node';
import { cursorToOffset } from 'graphql-relay';

export const addressByIdLoader = new DataLoader(ids => {
  const Address = Parse.Object.extend('Address');
  const queryAddress = new Parse.Query(Address);
  queryAddress.containedIn('objectId', ids);

  return queryAddress.find({ useMasterKey: true })
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

export const allAddressesLoader = new DataLoader(keys => {
  return Promise.all(keys.map(async key => {
    const args = JSON.parse(key);
    const { after, first } = args;
    const Address = Parse.Object.extend('Address');
    const queryAddress = new Parse.Query(Address);

    queryAddress.descending('createdAt');
    queryAddress.skip(after ? cursorToOffset(after) + 1 : 0);
    queryAddress.limit(first || 20);

    return queryAddress.find({ useMasterKey: true })
      .then(addresses => {
        addresses.forEach(item => {
          addressByIdLoader.prime(item.id, item);
        });
        return addresses;
      });
  }));
});
