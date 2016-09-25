/* global Parse, @flow */
import latenize from '../services/latenize';

// Before Save triggers
// ======================================
// - Check tag name

const checkTagName = (tagName: string): Promise<boolean> => {
  const tagQuery = new Parse.Query('ProductTag');
  tagQuery.equalTo('name', tagName);
  return tagQuery.first({ useMasterKey: true })
  .then(productTagObj => {
    if (!productTagObj) return true;
    throw new Error(`Tag "${tagName}" đã tồn tại`);
  });
};

Parse.Cloud.beforeSave('ProductTag', async (req, res) => {
  const productTag = req.object;
  let currentProductTag;

  if (productTag.id) {
    const tagQuery = new Parse.Query('ProductTag');
    currentProductTag = await tagQuery.get(productTag.id, { useMasterKey: true });
  }

  // Check tagName
  const tagName = productTag.get('name') || null;
  if (!currentProductTag || (currentProductTag && currentProductTag.get('name') !== tagName)) {
    try {
      await checkTagName(tagName);
    } catch (error) {
      return res.error(error.message);
    }
  }
  productTag.set('nameToLowerCase', latenize(tagName).toLowerCase());

  // Set ACL
  const acl = new Parse.ACL();
  acl.setPublicReadAccess(true);
  productTag.setACL(acl);

  return res.success();
});
