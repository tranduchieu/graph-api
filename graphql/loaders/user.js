import DataLoader from 'dataloader';
import Parse from 'parse/node';
// Parse.initialize('oss-f8-app-2016');

export const userByIdLoader = new DataLoader(ids => {
  const queryUser = new Parse.Query(Parse.User);
  queryUser.containedIn('objectId', ids);
  return queryUser.find();
});

export const allUserLoader = new DataLoader(keys => {
  console.log(keys);
  const queryUser = new Parse.Query(Parse.User);

  if (keys[0] !== 'allUsers' && typeof JSON.parse(keys[0]) === 'object') {
    const argObj = JSON.parse(keys[0]);
    Object.keys(argObj).forEach(key => {
      queryUser.equalTo(key, argObj[key]);
    });
  }

  return Promise.all([queryUser.find()]);
});

const queryUser = new Parse.Query(Parse.User);
queryUser.equalTo('username', 'tranduchieu2');
const promise = queryUser.find();
// const promise = allUserLoader.load('allUsers');
promise
.then(users => {
  console.log(users);
})
.catch(console.error);
