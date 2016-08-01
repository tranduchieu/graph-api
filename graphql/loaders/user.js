import DataLoader from 'dataloader';
import Parse from 'parse/node';
import { cursorToOffset } from 'graphql-relay';

export const userByIdLoader = new DataLoader(ids => {
  const queryUser = new Parse.Query(Parse.User);
  queryUser.containedIn('objectId', ids);

  return queryUser.find();
});


export const allUserLoader = new DataLoader(keys => {
  return Promise.all(keys.map(key => {
    const args = JSON.parse(key);
    const { after, first, username } = args;

    const queryUser = new Parse.Query(Parse.User);
    if (username) queryUser.equalTo('username', username);
    queryUser.skip(after ? cursorToOffset(after) + 1 : 0);
    queryUser.limit(first || 20);

    return queryUser.find()
      .then(users => {
        users.forEach(item => {
          userByIdLoader.prime(item.id, item);
        });
        return users;
      });
  }));
});

// const queryUser = new Parse.Query(Parse.User);
// queryUser.equalTo('username', 'tranduchieu2');
// const promise = queryUser.find();
// // const promise = allUserLoader.load('allUsers');
// promise
// .then(users => {
//   console.log(users);
// })
// .catch(console.error);

// const promise1 = userByIdLoader.load('9Z399ohBdS');
// const promise2 = userByIdLoader.load('m1HfcEtp8s');

// Promise.all([
//   promise1,
//   promise2,
// ])
// .then(console.log)
// .catch(console.error);

