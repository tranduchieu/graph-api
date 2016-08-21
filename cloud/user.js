/* global Parse */
import randomAvatar from '../services/randomAvatar';

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

// Profile trigger
const mobilePhoneUniqueValidate = (mobilePhone) => {
  return new Promise((resolve, reject) => {
    // Nếu không có mobilePhone
    if (!mobilePhone) return resolve();

    const queryUser = new Parse.Query(Parse.User);
    queryUser.equalTo('mobilePhone', mobilePhone);
    return queryUser.first()
      .then(user => {
        if (user) return reject('Số điện thoại đã tồn tại');
        return resolve();
      })
      .catch(err => {
        throw err;
      });
  });
};

Parse.Cloud.beforeSave(Parse.User, (req, res) => {
  const user = req.object;
  const fbAuthData = (req.object.get('authData') || {}).facebook || {};

  const email = fbAuthData.email || user.get('email') || null;
  const emailVerified = user.get('emailVerified') || false;
  const mobilePhone = user.get('mobilePhone') || null;
  const mobilePhoneVerified = user.get('mobilePhoneVerified') || false;
  const name = fbAuthData.name || user.get('name') || null;
  // const avatarUrl = _.has(fbAuthData, 'picture.data.url') ?
  //                               fbAuthData.picture.data.url : null ||
  //                               user.get('avatarUrl') || randomAvatar();
  const avatarUrl = (((fbAuthData || {}).picture || {}).data || {}).url ||
                    user.get('avatarUrl') || randomAvatar();
  const isCustomerOnly = user.get('isCustomerOnly') || false;

  return mobilePhoneUniqueValidate(mobilePhone)
    .then(() => {
      user.set('name', name);
      user.set('email', email);
      user.set('emailVerified', emailVerified);
      user.set('mobilePhone', mobilePhone);
      user.set('mobilePhoneVerified', mobilePhoneVerified);
      user.set('avatarUrl', avatarUrl);
      user.set('isCustomerOnly', isCustomerOnly);

      return res.success();
    })
    .catch(err => {
      return res.error(err);
    });
});

Parse.Cloud.afterSave(Parse.Role, (req, res) => {
  console.log(req);
  return res.success();
});
