import DataLoader from 'dataloader';
import Parse from 'parse/node';
import { cursorToOffset } from 'graphql-relay';
import Promise from 'bluebird';

export const productByIdLoader = new DataLoader(ids => {
  const Product = Parse.Object.extend('Product');
  const queryProduct = new Parse.Query(Product);
  queryProduct.containedIn('objectId', ids);

  return queryProduct.find({ useMasterKey: true })
    .then(products => {
      return ids.map(id => {
        const productFilter = products.filter(product => {
          return product.id === id;
        });

        const result = productFilter.length >= 1 ? productFilter[0] : null;
        return result;
      });
    });
});

export const allProductsLoader = new DataLoader(keys => {
  return Promise.map(keys, async key => {
    const args = JSON.parse(key);
    const { after, first, skip, limit, code, shop, status, isMultipleProduct, boxes } = args;

    const Product = Parse.Object.extend('Product');
    const queryProduct = new Parse.Query(Product);
    if (code) queryProduct.startsWith('code', code);
    if (shop) queryProduct.containedIn('shop', shop);
    if (status) queryProduct.containedIn('status', status);
    if (boxes) queryProduct.containedIn('boxes', boxes);
    if (isMultipleProduct) {
      queryProduct.notEqualTo('additionalPrices', []);
    }

    queryProduct.descending('createdAt');
    queryProduct.skip(skip || (after ? cursorToOffset(after) + 1 : 0));
    queryProduct.limit(limit || first || 20);

    const products = await queryProduct.find({ useMasterKey: true });

    Promise.map(products, item => {
      productByIdLoader.prime(item.id, item);
      return Promise.resolve();
    });

    return products;
  });
});
