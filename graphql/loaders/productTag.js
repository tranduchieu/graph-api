import DataLoader from 'dataloader';
import Parse from 'parse/node';
import { cursorToOffset } from 'graphql-relay';
import Promise from 'bluebird';

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
  return Promise.map(keys, async key => {
    const args = JSON.parse(key);
    const { after, first, nameStartsWith } = args;
    const ProductTag = Parse.Object.extend('ProductTag');
    const queryProductTag = new Parse.Query(ProductTag);
    if (nameStartsWith) queryProductTag.startsWith('nameToLowerCase', nameStartsWith);

    queryProductTag.descending('createdAt');
    queryProductTag.skip(after ? cursorToOffset(after) + 1 : 0);
    queryProductTag.limit(first || 20);

    const tags = await queryProductTag.find({ useMasterKey: true });

    Promise.map(tags, item => {
      productTagByIdLoader.prime(item.id, item);
      return Promise.resolve();
    });

    return tags;
  });
});
