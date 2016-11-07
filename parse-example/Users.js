// import Parse from 'parse/node';

// Signing up
// -------------------------------------
// const user = new Parse.User();
// user.set('username', 'ngthorg');
// user.set('password', '23022302');
// user.set('email', 'ngthorg@gmail.com');
// user.signUp()
// .then(console.log)
// .catch(console.error);

// Query User
// -------------------------
// const queryUser = new Parse.Query(Parse.User);
// queryUser.include('addresses');
// queryUser.get('u9AF63PAEd')
// .then(userObj => {
//   console.log(userObj.get('addresses'));
// });

// Query user by sessioToken
// -----------------------------
// const query = new Parse.Query(Parse.User);
// query.first({
//   sessionToken: 'r:dc7abba1027637aa625587dffd7214fd',
// })
// .then(console.log)
// .catch(console.error);

// const query = new Parse.Query('_Session');
// query.equalTo('sessionToken', 'r:dc7abba1027637aa625587dffd7214fd');
// query.include('user');
// query.first({ useMasterKey: true })
// .then(session => {
//   console.log(session.get('user'));
// })
// .catch(console.error);

// Query User by Role
// -------------------------------------
// const query = new Parse.Query(Parse.Role);
// query.equalTo('name', 'Shipper');
// query.first({ userMasterKey: true })
// .then(role => {
//   role.relation('users').query().find({ userMasterKey: true })
//   .then(console.log);
// });

// Add role to user
// -----------------------------------
// const userQuery = new Parse.Query(Parse.User);
// userQuery.get('gmQcHDPGlV', { userMasterKey: true })
// .then(userObj => {
//   const role = new Parse.Query(Parse.Role);
//   role.equalTo('name', 'Shipper');
//   role.getUsers().add(userObj);
//   role.save(null, { userMasterKey: true })
//   .then(console.log)
//   .catch(console.error);
// });
