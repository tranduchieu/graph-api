// import Parse from 'parse/node';
// import loaders from '../graphql/loaders';

// async function updateOrder1(id, msg) {
//   console.time('updateOrder');
//   const query = new Parse.Query('Order');
//   const order = await query.get(id, { useMasterKey: true });
//   order.set('note', msg);
//   const orderSaved = await order.save(null, { useMasterKey: true });
//   console.log(orderSaved);
//   console.timeEnd('updateOrder');
// }

// async function updateOrder2(id, msg) {
//   console.time('updateOrder');
//   const order = await loaders.order.load(id);
//   console.time('toJSON');
//   const orderToJSON = order.toJSON();
//   console.timeEnd('toJSON');
//   // console.log(orderToJSON);
//   const Order = Parse.Object.extend('Order');
//   const updateOrder = new Order();
//   updateOrder.id = orderToJSON.id;
//   updateOrder.set('note', msg);
//   const orderSaved = await updateOrder.save(null, { useMasterKey: true });
//   console.log(orderSaved);
//   console.timeEnd('updateOrder');
// }

// updateOrder1('yr8WI8krbD', 'updated by function 1');
// setTimeout(() => {
//   updateOrder1('yr8WI8krbD', 'updated by function 1111');
// }, 100000);
