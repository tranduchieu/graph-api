/* global Parse */
import { readFile } from 'fs';
import path from 'path';
import Promise from 'bluebird';

const file = path.join(__dirname, '../../files/products.json');

async function createProduct(userObj, args) {
  const Product = Parse.Object.extend('Product');
  const product = new Product();
  const acl = new Parse.ACL();
  acl.setPublicReadAccess(true);
  product.setACL(acl);

  args.createdBy = args.updatedBy = userObj;
  const productObjSaved = await product.save(args, { useMasterKey: true });
  return productObjSaved;
}

Parse.Cloud.job('addProducts', (req, res) => {
  readFile(file, 'utf8', async (err, data) => {
    if (err) res.error(err.message);
    data = JSON.parse(data);

    const userQuery = new Parse.Query(Parse.User);
    const userObj = await userQuery.get('2eN0hIjiqu', { useMasterKey: true });

    return Promise.each(data, (item) => {
      return createProduct(userObj, item);
    })
    .then(() => {
      return res.success('Done!');
    })
    .catch(error => {
      return res.error(error.message);
    });
  });
});


// additionalPricesToArray
// ----------------------------
Parse.Cloud.job('additionalPricesToArray', async (req, res) => {
  const queryProduct = new Parse.Query('Product');
  queryProduct.doesNotExist('additionalPrices');

  const itemsNeedRepair = await queryProduct.find({ useMasterKey: true });

  return Promise.map(itemsNeedRepair, (item) => {
    item.set('additionalPrices', []);
    return item.save(null, { useMasterKey: true });
  }, { concurrency: 5 })
  .then(() => {
    return res.success('Done!');
  })
  .catch(err => {
    return res.error(err.message);
  });
});


Parse.Cloud.job('ProductDescriptionToWords', async (req, res) => {
  const queryProduct = new Parse.Query('Product');
  const allProducts = await queryProduct.find({ useMasterKey: true });

  return Promise.map(allProducts, product => {
    return product.save(null, { useMasterKey: true });
  }, { concurrency: 5 })
  .then(() => {
    return res.success('Done!');
  })
  .catch(err => {
    return res.error(err.message);
  });
});
