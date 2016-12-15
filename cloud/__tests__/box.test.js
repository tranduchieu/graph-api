import ParseMockDB from 'parse-mockdb';
import Parse from 'parse/node';
// import * as boxCloud from '../box';

describe('Test Box Cloud funtions', () => {
  beforeEach(() => {
    ParseMockDB.mockDB();
  });

  afterEach(() => {
    ParseMockDB.cleanUp();
  });
  test('new Parse test', () => {
    const Product = Parse.Object.extend('Product');
    const product = new Product();
    product.set('name', 'Macbook');
    return product.save(null)
    .then(item => {
      console.log(item);
      expect(item.get('name')).toEqual('Macbook2');
    })
    .catch(console.error);
  });
});
