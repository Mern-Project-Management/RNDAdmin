module.exports = {
  apps: [
    {
      name: 'rnd_admin_backend',
      script: 'index.js',
      env: {
        PORT: 3058,
        NODE_ENV: 'production'
      }
    }
  ]
};
