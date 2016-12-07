/* global Parse */
import {
  beforeSaveOrder,
  afterSaveOrder,
  afterDeleteOrder,
} from './order';

require('./user');
require('./product');
require('./productTag');
// require('./order');
require('./box');
require('./report');

Parse.Cloud.beforeSave('Order', beforeSaveOrder);
Parse.Cloud.afterSave('Order', afterSaveOrder);
Parse.Cloud.afterDelete('Order', afterDeleteOrder);

// Jobs
require('./jobs');
