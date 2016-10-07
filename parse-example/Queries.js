import Parse from 'parse/node';

// Counting
// -----------------------
// const Product = Parse.Object.extend('Product');
// const query = new Parse.Query(Product);
// query.equalTo('shop', 'Tổ Cú Hoàng Quốc Việt');
// query.count({
//   shop: 'Tổ Cú Hoàng Quốc Việt',
// })
// .then(console.log)
// .catch(console.error);

// Get an address
// --------------------------
// const addressQuery = new Parse.Query('Address');
// addressQuery.get('4cjTLNpPfP', { sessionToken: 'r:0f812cc6ade98156fd65f84fb53ad03c' })
// .then(addressObj => {
//   console.log(addressObj.toJSON());
// });


// Get a Order
// --------------------------
// const orderQuery = new Parse.Query('Order');
// orderQuery.get('F6O53cFAXo', { sessionToken: 'r:0f812cc6ade98156fd65f84fb53ad03c' })
// .then(orderObj => {
//   console.log(orderObj.get('createdBy'));
// });

// Query array in Object
// -------------------------
// const orderQuery = new Parse.Query('Order');
// orderQuery.equalTo('lines2.productId', 'zzz');
// orderQuery.find({ useMasterKey: true })
// .then(console.log);

// console.log(require('node-uuid').v4());

// Search user by name words
// -------------------------------
const queryUser = new Parse.Query(Parse.User);
queryUser.containedIn('nameToWords', ['kieu', 'phuc']);
queryUser.find({ useMasterKey: true })
.then(console.log)
.catch(console.error);
