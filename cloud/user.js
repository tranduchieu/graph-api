/* global Parse, @flow */
import randomAvatar from '../services/randomAvatar';
import latenize from '../services/latenize';
import loaders from '../graphql/loaders';

// BeforeSave triggers
// ===================================
// [x] Check mobilePhone
// [x] Add fbAuthData
// [x] set name toLowerCase

// Profile trigger
const mobilePhoneUniqueValidate = (mobilePhone) => {
  return new Promise((resolve, reject) => {
    // Nếu không có mobilePhone
    if (!mobilePhone) return resolve();

    const queryUser = new Parse.Query(Parse.User);
    queryUser.equalTo('mobilePhone', mobilePhone);
    return queryUser.first()
      .then(user => {
        if (user) return reject(new Error('Số điện thoại đã tồn tại'));
        return resolve();
      })
      .catch(reject);
  });
};

Parse.Cloud.beforeSave(Parse.User, async (req, res) => {
  // console.log('===>', req.object.existed(), req.object.isNew());
  // console.log(req.object);
  const user = req.object;
  let currentUser;
  if (user.id) {
    const userQuery = new Parse.Query(Parse.User);
    currentUser = await userQuery.get(user.id);
  }

  const fbAuthData = (req.object.get('authData') || {}).facebook || {};

  if (fbAuthData.id && !fbAuthData.email) fbAuthData.email = `${fbAuthData.id}@fakemail.com`;

  const email = fbAuthData.email || user.get('email');
  const name = fbAuthData.name || user.get('name') || null;
  const avatarUrl = (((fbAuthData || {}).picture || {}).data || {}).url ||
                    user.get('avatarUrl') || randomAvatar();

  // Check mobilePhone
  const mobilePhone = user.get('mobilePhone') || null;
  if (!currentUser || (currentUser && currentUser.get('mobilePhone') !== mobilePhone)) {
    try {
      await mobilePhoneUniqueValidate(mobilePhone);
    } catch (error) {
      return res.error(error.message);
    }
  }

  // Set fields & res success
  user.set('name', name);
  user.set('email', email);
  user.set('emailVerified', user.get('emailVerified') || false);
  user.set('mobilePhoneVerified', user.get('mobilePhoneVerified') || false);
  user.set('avatarUrl', avatarUrl);
  user.set('staffWorkplaces', user.get('staffWorkplaces') || []);
  user.set('addresses', user.get('addresses') || []);
  user.set('tags', user.get('tags') || []);

  let nameToWords = [];
  if (name) {
    nameToWords = latenize(name)
                  .replace(/[^\w\s]/gi, '')
                  .replace(/\u000b/g, '')
                  .toLowerCase()
                  .match(/[^ ]+/g);
  }
  user.set('nameToWords', nameToWords);

  return res.success();
});

// AfterSave triggers
// ======================================
// [x] Add roles

const addUserRole = (userObj, roleName) => {
  const roleQuery = new Parse.Query(Parse.Role);
  roleQuery.equalTo('name', roleName);
  return roleQuery.first()
  .then(role => {
    role.getUsers().add(userObj);
    return role.save(null, { useMasterKey: true });
  });
};

Parse.Cloud.afterSave(Parse.User, async (req, res) => {
  const userObj = req.object;

  const uuidRegex = '^[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}$';

  const roleName = new RegExp(uuidRegex).test(userObj.get('username')) ?
                    'Customer' :
                    'User';
  try {
    await addUserRole(userObj, roleName);
  } catch (error) {
    return res.error(error.message);
  }
  // console.log(userObj.get('username'), userObj.get('staffWorkingAt'));
  // Clear loaders
  loaders.user.prime(userObj.id, userObj);
  loaders.userByUsername.clear(userObj.get('username')).prime(userObj.get('username'), userObj);
  loaders.users.clearAll();
  loaders.rolesByUser.clear(userObj.id);
  loaders.searchs.clearAll();
  loaders.searchsCount.clearAll();

  return res.success();
});


Parse.Cloud.afterDelete('User', (req, res) => {
  const user = req.object;

  // Clear loaders
  loaders.user.clear(user.id);
  loaders.userByUsername.clear(user.get('username'));
  loaders.users.clearAll();
  loaders.rolesByUser.clear(user.id);
  loaders.searchs.clearAll();
  loaders.searchsCount.clearAll();

  res.success();
});

