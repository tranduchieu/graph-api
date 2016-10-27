import Parse from 'parse/node';

Parse.initialize(process.env.APP_ID);
Parse.serverURL = `http://localhost:${process.env.PORT}/parse`;
Parse.masterKey = process.env.MASTER_KEY;
Parse.Cloud.useMasterKey();

// Tasks
// =============================================

// Product
// ---------------------------------------------
// require('./Product/additionalPricesToArray');
// require('./Product/addProducts');
