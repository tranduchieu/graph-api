import Parse from 'parse/node';

// Counting
// -----------------------
const Product = Parse.Object.extend('Product');
const query = new Parse.Query(Product);
query.equalTo('shop', 'Tổ Cú Hoàng Quốc Việt');
query.count({
  shop: 'Tổ Cú Hoàng Quốc Việt',
})
.then(console.log)
.catch(console.error);
