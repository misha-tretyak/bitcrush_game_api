module.exports = {
  apps: [
    {
      script: "./dist/src/main.js",
      name: "bitcrush_api",
      watch: false,
      instances: "1",
      exec_mode: "cluster",
      env: {
        NODE_ENV: "development",
      },
      env_development: {
        NODE_ENV: "development",
      },
      env_production: {
        NODE_ENV: "production",
      },
    },
  ],
  deploy: {
    production: {
      user: "user",
      host: ["host"],
      ref: "origin/branch",
      repo: "repo",
      path: "path",
      "post-deploy":
        "npm install && npm run build && pm2 delete all; pm2 start ecosystem.config.js --env production",
    },
  },
};
