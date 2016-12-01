const IS_DEVELOPMENT = process.env.NODE_ENV !== 'production';

if (IS_DEVELOPMENT) {
  require('babel-register');
  require('babel-polyfill');
  require('./server');
} else {
  require('./dist/server');
}
