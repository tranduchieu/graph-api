
module.exports = {
  development: {
    DATABASE_URI: 'DATABASE_URI',
    DASHBOARD_AUTH: 'DASHBOARD_AUTH',
    S3_ACCESS_KEY: 'S3_ACCESS_KEY',
    S3_SECRET_KEY: 'S3_SECRET_KEY',
    S3_BUCKET: 'S3_BUCKET',
  },
  production: {
    DATABASE_URI: 'DATABASE_URI',
    DASHBOARD_AUTH: 'DASHBOARD_AUTH',
    S3_ACCESS_KEY: 'S3_ACCESS_KEY',
    S3_SECRET_KEY: 'S3_SECRET_KEY',
    S3_BUCKET: 'S3_BUCKET',
  },
}[process.env.NODE_ENV || 'development'];
