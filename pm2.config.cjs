module.exports = {
  apps: [
    {
      name: "meduza_mainweb",
      script: "./server.js",
      watch: false,
      env: {
        PORT: 3000,
        NODE_ENV: "development",
      },
      env_production: {
        PORT: 4444,
        HOST: "0.0.0.0",
        NODE_ENV: "production",
      },
    },
  ],
};
