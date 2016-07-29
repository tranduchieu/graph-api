import Parse from 'parse/node';
import _ from 'lodash';

{
	"facebook":{
		"id":"316208265390538",
		"access_token":"EAABxhyntF44BANFhveJx6GGiuxOzYA8FQu7y95d4hs4xpanrRwQTcxZBBe2ZCGmNDxWQkVBeZC3IQJ3vZBZAtB4Kys944f531imkxUmL2ZCZB5vyVYMgZBJXsnqD9MgTls7xaXTSsLCUaCk8Q6UYLz6IgMfIOlJo5bpmRELAwyrTYQZDZD",
		"expiration_date":5294,
		"name":"Ng Thong",
		"email":"ngthorg@gmail.com",
		"picture":{
			"data":{
				"url":"https://fbcdn-profile-a.akamaihd.net/hprofile-ak-xaf1/v/t1.0-1/p50x50/11796172_117594228585277_8792308650114767132_n.jpg?oh=61c990c9d85db5b6a43cfc50e85469ba&oe=5822E78A&__gda__=1478909501_8182689e17e5d52ba98b1835296b0ad0"
			}
		}
	}
}


Parse.Cloud.afterSave(Parse.User, (req, res) => {
    console.log(req.object.get('authData'));
		const user = req.object;
		const authData = req.object.get('authData') || null;
		const fbAuthData = authData.facebook || null;

		const Profile = Parse.Object.extend('Profile');
		const profile = new Profile();

		if (fbAuthData) {
			profile.set('name', fbAuthData.name || null);
			profile.set('email', fbAuthData.email || null);
			profile.set('avatarUrl', _.has(fbAuthData, 'picture.data.url') ? fbAuthData.picture.data.url : null);
			profile.set('user', user);
		}
		profile.save()
		.then(profileObj => {
			user.set('profile', profileObj);
			return user.save();
		})
		.then(() => {
			return res.success();
		})
		.catch(err => {
			return res.
		});
});
