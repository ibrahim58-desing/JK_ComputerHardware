module.exports = {
  apps: [
    {
      name: 'jk-computer-hardware',
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 3000',
      instances: 'max', // or a specific number of instances
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
    },
  ],
}
