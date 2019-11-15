module.exports = {
  apps: [
    {
      name: 'dodoli-backend',
      script: './index.ts',
      env: {
        NODE_ENV: 'production'
      },
      watch: 'true'
    }
  ]
};
