module.exports = {
  apps: [{
    name: 'Graph API',
    script: 'app.js',
    watch: true,
    ignore_watch: ['node_modules', 'logs', 'data', 'mongo-data', '.git', '.idea', '.vscode'],
    // env: {
    //   NODE_ENV: 'development',
    //   PORT: '8080',
    //   HOST: 'localhost',
    //   // Parse server
    //   VERBOSE: '',
    //   APP_ID: 'myAppId',
    //   MASTER_KEY: 'myMasterKey',
    //   DASHBOARD_AUTH: 'admin:admin',
    //   SESSION_LENGTH: 2592000,
    //   // Database
    //   DATABASE_URI: `mongodb://${process.env.MONGODB_PORT_27017_TCP_ADDR}:${process.env.MONGODB_PORT_27017_TCP_PORT}/dev`,
    //   // AWS S3
    //   S3_ACCESS_KEY: 'AKIAIR4HJZERLDFCYQBQ',
    //   S3_SECRET_KEY: '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',
    //   S3_BUCKET: 'ecolab-server',
    //   S3_BUCKET_PREFIX: '',
    // },
    // env_production: {
    //   NODE_ENV: 'production',
    //   PORT: '8080',
    //   HOST: 'localhost',
    //   // Parse server
    //   VERBOSE: '',
    //   APP_ID: 'myAppId',
    //   MASTER_KEY: 'myMasterKey',
    //   DASHBOARD_AUTH: 'admin:admin',
    //   SESSION_LENGTH: 2592000,
    //   // Database
    //   DATABASE_URI: `mongodb://${process.env.MONGODB_PORT_27017_TCP_ADDR}:${process.env.MONGODB_PORT_27017_TCP_PORT}/prod`,
    //   // AWS S3
    //   S3_ACCESS_KEY: 'AKIAIR4HJZERLDFCYQBQ',
    //   S3_SECRET_KEY: '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',
    //   S3_BUCKET: 'ecolab-server',
    //   S3_BUCKET_PREFIX: '',
    // },
  }],
};
