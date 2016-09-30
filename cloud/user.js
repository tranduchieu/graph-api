/* global Parse, @flow */
import randomAvatar from '../services/randomAvatar';
import latenize from '../services/latenize';

// {
// 	"facebook":{
// 		"id":"316208265390538",
// 		"access_token":"",
// 		"expiration_date":5294,
// 		"name":"Ng Thong",
// 		"email":"ngthorg@gmail.com",
// 		"picture":{
// 			"data":{
// 				"url":"https://fbcdn-profile-a.akamaihd.net/hprofile-ak-xaf1/v/t1.0-1/p50x50/11796172_117594228585277_8792308650114767132_n.jpg?oh=61c990c9d85db5b6a43cfc50e85469ba&oe=5822E78A&__gda__=1478909501_8182689e17e5d52ba98b1835296b0ad0"
// 			}
// 		}
// 	}
// }

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

  let nameToWords = [];
  if (name) {
    nameToWords = name.match(/[^ ]+/g).map(item => {
      return latenize(item).toLowerCase();
    });
    user.set('nameToWords', nameToWords);
  }

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

  return res.success();
});

