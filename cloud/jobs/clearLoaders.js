/* global Parse */
import loaders from '../../graphql/loaders';

Parse.Cloud.job('clearBoxLoaders', (req, res) => {
  loaders.box.clearAll();
  loaders.boxes.clearAll();

  return res.success('Done!');
});

Parse.Cloud.job('clearOrderLoaders', (req, res) => {
  loaders.order.clearAll();
  loaders.orders.clearAll();

  return res.success('Done!');
});

Parse.Cloud.job('clearProductLoaders', (req, res) => {
  loaders.product.clearAll();
  loaders.products.clearAll();

  return res.success('Done!');
});

Parse.Cloud.job('clearProductTagLoaders', (req, res) => {
  loaders.productTag.clearAll();
  loaders.productTags.clearAll();

  return res.success('Done!');
});

Parse.Cloud.job('clearSearchLoaders', (req, res) => {
  loaders.searchs.clearAll();
  loaders.searchsCount.clearAll();

  return res.success('Done!');
});

Parse.Cloud.job('clearUserLoaders', (req, res) => {
  loaders.user.clearAll();
  loaders.users.clearAll();
  loaders.rolesByUser.clearAll();

  return res.success('Done!');
});
