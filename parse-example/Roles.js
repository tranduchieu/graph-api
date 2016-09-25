// import Parse from 'parse/node';

// // Query roles by user
// // --------------------------------------------
// const queryUser = new Parse.Query(Parse.User);
// queryUser.equalTo('username', 'tranduchieu');
// queryUser.first()
//   .then(user => {
//     const roleQuery = new Parse.Query(Parse.Role);
//     roleQuery.equalTo('users', user);
//     roleQuery.include('roles');
//     roleQuery.find()
//     .then(roleObj => console.log(roleObj[0].get('roles')))
//     .catch(console.error);
//   })
//   .catch(console.error);

// const queryOrder = new Parse.Query('Order');
// // queryOrder.equalTo('ACL.permissionsById.u9AF63PAEd.read', true);
// queryOrder.equalTo('createdBy', 'u9AF63PAEd');
// queryOrder.first({ sessionToken: 'r:8730f50985bb6174b7451299af1ced8e' })
// .then(result => {
//   console.log(result);
//   console.log(result.get('ACL').permissionsById.u9AF63PAEd.read);
// });

// Check ACL
// -------------------
// const Address = Parse.Object.extend('Address');
// const addressQuery = new Parse.Query(Address);
// addressQuery.get('LMOPHa4Ijb', { sessionToken: 'r:0f812cc6ade98156fd65f84fb53ad03c' })
// .then(res => {
//   if (!res) throw new Error('Product not found');
//   return res.destroy({ useMasterKey: true })
//   .then(console.log);
// })
// .catch(console.error);
