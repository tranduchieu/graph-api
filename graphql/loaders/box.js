import DataLoader from 'dataloader';
import Parse from 'parse/node';
import { cursorToOffset } from 'graphql-relay';
import Promise from 'bluebird';

export const boxByIdLoader = new DataLoader(ids => {
  const Box = Parse.Object.extend('Box');
  const queryBox = new Parse.Query(Box);
  queryBox.containedIn('objectId', ids);

  return queryBox.find({ useMasterKey: true })
    .then(boxes => {
      return ids.map(id => {
        const boxFilter = boxes.filter(box => {
          return box.id === id;
        });

        const result = boxFilter.length >= 1 ? boxFilter[0] : null;
        return result;
      });
    });
});

export const allBoxesLoader = new DataLoader(keys => {
  return Promise.map(keys, async key => {
    const args = JSON.parse(key);
    const { after, first, skip, limit, type, visible, nameStartsWith } = args;
    const Box = Parse.Object.extend('Box');
    const queryBox = new Parse.Query(Box);
    if (type) queryBox.equalTo('type', type);
    if (visible) queryBox.equalTo('visible', visible);
    if (nameStartsWith) queryBox.startsWith('nameToLowerCase', nameStartsWith);

    queryBox.descending('createdAt');
    queryBox.skip(skip || (after ? cursorToOffset(after) + 1 : 0));
    queryBox.limit(limit || first || 20);

    const boxes = await queryBox.find({ useMasterKey: true });

    Promise.map(boxes, item => {
      boxByIdLoader.prime(item.id, item);
      return Promise.resolve();
    });

    return boxes;
  });
});
