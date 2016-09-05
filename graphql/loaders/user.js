import DataLoader from 'dataloader';
import Parse from 'parse/node';
import { cursorToOffset } from 'graphql-relay';

export const userByIdLoader = new DataLoader(ids => {
  const queryUser = new Parse.Query(Parse.User);
  queryUser.containedIn('objectId', ids);

  return queryUser.find()
    .then(users => {
      return ids.map(id => {
        const userFilter = users.filter(user => {
          return user.id === id;
        });

        const result = userFilter.length >= 1 ? userFilter[0] : null;
        return result;
      });
    });
});


export const allUsersLoader = new DataLoader(keys => {
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

export const rolesByUserLoader = new DataLoader(userIds => {
  return Promise.all(userIds.map(id => userByIdLoader.load(id)))
  .then(userObjs => {
    return Promise.all(
      userObjs.map(user => {
        const roleQuery = new Parse.Query(Parse.Role);
        roleQuery.equalTo('users', user);
        roleQuery.select('name');
        return roleQuery.find()
          .then(rolesByUser => rolesByUser.map(role => {
            return role.get('name');
          }));
      })
    );
  });
});

// const queryUser = new Parse.Query(Parse.User);
// queryUser.equalTo('username', 'hieu');
// const promise = queryUser.find();
// // const promise = allUserLoader.load('allUsers');
// promise
// .then(users => {
//   console.log(users);
// })
// .catch(console.error);

// const promise1 = rolesByUserLoader.load('u9AF63PAEd');
// const promise2 = rolesByUserLoader.load('8JqQOYbX81');

// Promise.all([
//   promise1,
//   promise2,
// ])
// .then(result => {
//   console.log(result);
// })
// .catch(console.error);

