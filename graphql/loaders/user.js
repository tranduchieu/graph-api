import DataLoader from 'dataloader';
import Parse from 'parse/node';

export const userByIDLoader = new DataLoader(ids => {
  var queryUser = new Parse.Query(Parse.User);
  queryUser.containedIn('objectId', ids);
  return queryUser.find();
});

export const allUserLoader = new DataLoader(keys => {
  var queryUser = new Parse.Query(Parse.User);

  if (keys[0] !== 'allUsers' && typeof JSON.parse(keys[0]) === 'object') {
    const argObj = JSON.parse(keys[0]);
    Object.keys(argObj).forEach(key => {
      queryUser.equalTo(key, argObj.key);
    });
  }

  return queryUser.find();
});
