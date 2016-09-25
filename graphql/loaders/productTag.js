import DataLoader from 'dataloader';
import Parse from 'parse/node';
import { cursorToOffset } from 'graphql-relay';

export const productTagByIdLoader = new DataLoader(ids => {
  const ProductTag = Parse.Object.extend('ProductTag');
  const queryProductTag = new Parse.Query(ProductTag);
  queryProductTag.containedIn('objectId', ids);

  return queryProductTag.find({ useMasterKey: true })
    .then(productTags => {
      return ids.map(id => {
        const productTagFilter = productTags.filter(productTag => {
          return productTag.id === id;
        });

        const result = productTagFilter.length >= 1 ? productTagFilter[0] : null;
        return result;
      });
    });
});

export const allProductTagsLoader = new DataLoader(keys => {
  return Promise.all(keys.map(async key => {
    const args = JSON.parse(key);
    const { after, first, nameStartsWith } = args;
    const ProductTag = Parse.Object.extend('ProductTag');
    const queryProductTag = new Parse.Query(ProductTag);
    if (nameStartsWith) queryProductTag.startsWith('nameToLowerCase', nameStartsWith);

    queryProductTag.descending('createdAt');
    queryProductTag.skip(after ? cursorToOffset(after) + 1 : 0);
    queryProductTag.limit(first || 20);

    return queryProductTag.find({ useMasterKey: true })
      .then(productTags => {
        productTags.forEach(item => {
          productTagByIdLoader.prime(item.id, item);
        });
        return productTags;
      });
  }));
});
