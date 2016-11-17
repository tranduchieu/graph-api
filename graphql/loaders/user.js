import DataLoader from 'dataloader';
import Parse from 'parse/node';
import { cursorToOffset } from 'graphql-relay';
import Promise from 'bluebird';

export const userByIdLoader = new DataLoader(ids => {
  const queryUser = new Parse.Query(Parse.User);
  queryUser.containedIn('objectId', ids);

  return queryUser.find({ useMasterKey: true })
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
  return Promise.map(keys, async key => {
    const args = JSON.parse(key);
    const { after, first, skip, limit, username, name, mobilePhoneStartsWith, role } = args;

    let queryUser = new Parse.Query(Parse.User);

    if (role) {
      const roleQuery = new Parse.Query(Parse.Role);
      roleQuery.equalTo('name', role);
      const roleObj = await roleQuery.first({ useMasterKey: true });
      if (!roleObj) throw new Error(`Role name ${role} not found`);
      queryUser = roleObj.relation('users').query();
    }

    if (username) queryUser.equalTo('username', username);
    if (name) queryUser.containsAll('nameToWords', name);
    if (mobilePhoneStartsWith) queryUser.startsWith('mobilePhone', mobilePhoneStartsWith);

    queryUser.descending('createdAt');
    queryUser.skip(skip || (after ? cursorToOffset(after) + 1 : 0));
    queryUser.limit(limit || first || 20);

    const users = await queryUser.find({ useMasterKey: true });

    Promise.map(users, item => {
      userByIdLoader.prime(item.id, item);
      return Promise.resolve();
    });

    return users;
  });
});

export const rolesByUserLoader = new DataLoader(userIds => {
  return Promise.all(userIds.map(id => userByIdLoader.load(id)))
  .then(userObjs => {
    return Promise.all(
      userObjs.map(user => {
        const roleQuery = new Parse.Query(Parse.Role);
        roleQuery.equalTo('users', user);
        roleQuery.select('name');
        return roleQuery.find({ useMasterKey: true })
          .then(rolesByUser => rolesByUser.map(role => {
            return role.get('name');
          }));
      })
    );
  });
});

