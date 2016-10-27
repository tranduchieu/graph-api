import { readFile } from 'fs';
import path from 'path';
import Parse from 'parse/node';

const file = path.join(__dirname, 'products.json');

readFile(file, 'utf8', async (err, data) => {
  if (err) console.log(err);
  data = JSON.parse(data);

  const userQuery = new Parse.Query(Parse.User);
  const userObj = await userQuery.get('2eN0hIjiqu', { useMasterKey: true });
  console.log(userObj);
  data.forEach(async item => {
    const Product = Parse.Object.extend('Product');
    const product = new Product();
    const acl = new Parse.ACL();
    acl.setPublicReadAccess(true);
    product.setACL(acl);

    item.createdBy = item.updatedBy = userObj;
    const productObjSaved = await product.save(item, { useMasterKey: true });
    console.log(productObjSaved);
  });
});
