// import Parse from 'parse/node';
// import latenize from '../services/latenize';
// import moment from 'moment';

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
// orderQuery.equalTo('history.type', 'addPayment');
// orderQuery.equalTo('history.content.method', 'cash');
// orderQuery.greaterThan('history.updatedAt', '2016-10-27T10:29:27.333Z');
// orderQuery.find({ useMasterKey: true })
// .then(console.log);

// console.log(require('node-uuid').v4());

// Search user by name words
// -------------------------------
// const queryUser = new Parse.Query(Parse.User);
// queryUser.containedIn('nameToWords', ['kieu', 'phuc']);
// queryUser.find({ useMasterKey: true })
// .then(console.log)
// .catch(console.error);

// Search in User class
// [x] Search containsAll nameToWords
// [x] Search startsWith username
// [x] Search startsWith mobilePhone

// const searchUserQuery = (searchText) => {
//   let splitWords = [];
//   splitWords = searchText.match(/[^ ]+/g).map(item => {
//     return latenize(item).toLowerCase().replace(/[^\w\s]/gi, '').replace(/\u000b/g, '');
//   });

//   const queryNameToWords = new Parse.Query(Parse.User);
//   queryNameToWords.containsAll('nameToWords', splitWords);

//   const queryUserName = new Parse.Query(Parse.User);
//   queryUserName.startsWith('username', searchText);

//   const queryMobilePhone = new Parse.Query(Parse.User);
//   queryMobilePhone.startsWith('mobilePhone', searchText);

//   const mainQuery = Parse.Query.or(queryNameToWords, queryUserName, queryMobilePhone);
//   return mainQuery;
// };

// searchUserQuery('tran')
// .count()
// .then(console.log)
// .catch(console.error);

// Query by date
// ------------------------------
// console.log('-->', moment().startOf('day').toDate());
// const query = new Parse.Query('Order');
// query.lessThanOrEqualTo('createdAt', moment().startOf('day').toDate());
// query.find({ useMasterKey: true })
// .then(console.log);

// Query Orderlines
// ---------------------------
// const boxes = ['Váy', 'Chân váy', 'Áo phao'];
// const report = [];
// boxes.forEach(key => {
//   report[key] = 0;
// });

// const query = new Parse.Query('Order');
// query.containedIn('lines.tags', boxes);
// query.find({ useMasterKey: true })
// .then(result => {
//   if (result.length > 0) {
//     result.forEach(order => {
//       order.get('lines').forEach(line => {
//         if (line.tags) {
//           line.tags.forEach(tag => {
//             if (boxes.indexOf(tag) !== -1) {
//               report[tag] += line.quantity;
//             }
//           });
//         }
//       });
//     });
//   }
//   console.log(report);
// });
