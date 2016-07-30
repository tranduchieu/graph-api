/* global Parse */
import _ from 'lodash';

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

Parse.Cloud.afterSave(Parse.User, (req, res) => {
  Parse.Cloud.useMasterKey();

  const user = req.object;
  const authData = req.object.get('authData2') || null;
  const fbAuthData = authData.facebook || null;

  const Profile = Parse.Object.extend('Profile');
  const profile = new Profile();

  if (user.get('profile') || !fbAuthData) return res.success();

  profile.set('name', fbAuthData.name || null);
  profile.set('email', fbAuthData.email || null);
  profile.set('avatarUrl', _.has(fbAuthData, 'picture.data.url') ?
                                fbAuthData.picture.data.url : null);
  profile.set('user', user);

  return profile.save()
	.then(profileObj => {
  user.set('profile', profileObj);
  return user.save();
	})
	.then(() => {
  return res.success();
	})
	.catch(err => {
  return res.error(err);
	});
});
