/* global Parse, @flow */
import latenize from '../services/latenize';
import loaders from '../graphql/loaders';

// Before Save triggers
// ======================================
// [x] Check box name
// [x] Set name toLowerCase

const checkBoxName = (boxName: string): Promise<boolean> => {
  const boxQuery = new Parse.Query('Box');
  boxQuery.equalTo('name', boxName);
  return boxQuery.first({ useMasterKey: true })
  .then(boxObj => {
    if (!boxObj) return true;
    throw new Error(`box ${boxName} đã tồn tại`);
  });
};

Parse.Cloud.beforeSave('Box', async (req, res) => {
  const box = req.object;
  let currentBox;

  if (box.id) {
    const boxQuery = new Parse.Query('Box');
    currentBox = await boxQuery.get(box.id, { useMasterKey: true });
  }

  // Check boxName
  const boxName = box.get('name') || null;
  if (!currentBox || (currentBox && currentBox.get('name') !== boxName)) {
    try {
      await checkBoxName(boxName);
    } catch (error) {
      return res.error(error.message);
    }
  }
  box.set('nameToLowerCase', latenize(boxName).toLowerCase());
  const acl = new Parse.ACL();
  acl.setPublicReadAccess(true);
  box.setACL(acl);
  return res.success();
});

Parse.Cloud.afterSave('Box', (req, res) => {
  const box = req.object;

  // Clear loaders
  loaders.box.prime(box.id, box);
  loaders.boxes.clearAll();
  loaders.searchs.clearAll();
  loaders.searchsCount.clearAll();

  res.success();
});


Parse.Cloud.afterDelete('Box', (req, res) => {
  const box = req.object;

  // Clear loaders
  loaders.box.clear(box.id);
  loaders.boxes.clearAll();
  loaders.searchs.clearAll();
  loaders.searchsCount.clearAll();

  res.success();
});
