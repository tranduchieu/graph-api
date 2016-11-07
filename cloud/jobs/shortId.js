/* global Parse */
import ShortParseId from '@tranduchieu/short-parse-id';

const APP_ID = process.env.APP_ID;
const ShortId = new ShortParseId(6, APP_ID);

Parse.Cloud.job('GenerateShortId', (req, res) => {
  ShortId.batchAdd(100);
  return res.success('Done!');
});
