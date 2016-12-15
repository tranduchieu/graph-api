/* global Parse */
import {
  beforeSaveBox,
  afterSaveBox,
  afterDeleteBox,
} from './box';
import {
  beforeSaveOrder,
  afterSaveOrder,
  afterDeleteOrder,
} from './order';

require('./user');
require('./product');
require('./productTag');
// require('./order');
// require('./box');
require('./report');

Parse.Cloud.beforeSave('Order', beforeSaveOrder);
Parse.Cloud.afterSave('Order', afterSaveOrder);
Parse.Cloud.afterDelete('Order', afterDeleteOrder);

Parse.Cloud.beforeSave('Box', beforeSaveBox);
Parse.Cloud.afterSave('Box', afterSaveBox);
Parse.Cloud.afterDelete('Box', afterDeleteBox);

// Jobs
require('./jobs');
