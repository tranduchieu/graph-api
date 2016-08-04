import DataLoader from 'dataloader';
import Parse from 'parse/node';
import { cursorToOffset } from 'graphql-relay';

export const productByIdLoader = new DataLoader(ids => {
  const Product = Parse.Object.extend('Product');
  const queryProduct = new Parse.Query(Product);
  queryProduct.containedIn('objectId', ids);

  return queryProduct.find()
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
  return Promise.all(keys.map(key => {
    const args = JSON.parse(key);
    const { after, first, sku } = args;
    const Product = Parse.Object.extend('Product');
    const queryProduct = new Parse.Query(Product);
    if (sku) queryProduct.equalTo('sku', sku);
    queryProduct.skip(after ? cursorToOffset(after) + 1 : 0);
    queryProduct.limit(first || 20);

    return queryProduct.find()
      .then(products => {
        console.log(products);
        products.forEach(item => {
          productByIdLoader.prime(item.id, item);
        });
        return products;
      });
  }));
});