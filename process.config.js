module.exports = {
  apps: [{
    name: 'Graph API',
    script: 'app.js',
    watch: true,
    ignore_watch: ['node_modules', 'logs', 'data', 'mongo-data', '.git', '.idea', '.vscode'],
  }],
};
