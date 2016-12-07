import ParseMockDB from 'parse-mockdb';
import Parse from 'parse-shim';

ParseMockDB.mockDB(); // Mock the Parse RESTController

const Product = Parse.Object.extend('Product');
const product = new Product();
product.save({
  name: 'Ao',
  code: 'mjf-fjx',
  shop: 'Tổ Cú Minh Khai',
  status: 'availableInAll',
  price: 120000,
}, { useMasterKey: true })
.then(console.log);

ParseMockDB.cleanUp(); // Clear the Database
ParseMockDB.unMockDB(); // Un-mock the Parse RESTController
