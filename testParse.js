// import Parse from 'parse/node';

// const base64 = 'V29ya2luZyBhdCBQYXJzZSBpcyBncmVhdCE=';
// const file = new Parse.File('myfile222333333.txt', { base64: base64 });
// file.save()
// .then(fileSaved => {
//   const Product = Parse.Object.extend('Product');
//   const product = new Product();
//   product.set('name', 'Chân váy');
//   product.set('image', fileSaved);
//   return product.save()
//   .then(console.log);
// })
// .catch(console.error);


// const box = 'Áo Phông';
// const Product = Parse.Object.extend('Product');
// const queryProduct = new Parse.Query(Product);

// // queryProduct.equalTo('objectId', 'ifGGpQHAmE');
// queryProduct.equalTo('boxes', 'Đầm');
// queryProduct.find()
//   .then(productObj => {
//     console.log(productObj);
//     if (!productObj) return;
//     // productObj.add('boxes', box);
//     // return productObj.save();
//   })
//   .then(console.log)
//   .catch(console.error);

// const queryUser = new Parse.Query(Parse.User);
// queryUser.equalTo('username', 'hieu');
// queryUser.first()
// .then(user => {
//   const queryRoles = new Parse.Query(Parse.Role);
//   queryRoles.equalTo('users', user);
//   queryRoles.include('roles');
//   return queryRoles.find()
//   .then(roles => {
//     console.log(roles[0].get('name'));
//     user.set('roles', roles);
//     console.log(user.get('roles')[0].get('roles'));
//   })
//   .catch(console.error);
// });

// new Role
// --------------------------------
// const roleACL = new Parse.ACL();
// roleACL.setPublicReadAccess(true);
// var role = new Parse.Role('Administrator', roleACL);
// role.save();

// add user to role
// --------------------------------
// const roleACL = new Parse.ACL();
// const role = new Parse.Role('Administrator', roleACL);
// // Query User
// const queryUser = new Parse.Query(Parse.User);
// queryUser.equalTo('username', 'hieu');
// queryUser.first()
//   .then(user => {
//     role.getUsers().add(user);
//     role.save();
//     return;
//   })
//   .catch(console.error);

// Parse.User.become('r:0e599429b398314e83faec822ec1c6ea')
// .then(user => {
//   console.log(user);
// })
// .catch(err => {
//   console.error(err);
// });
