module.exports = {
  apps: [
    {
      name: 'jk-backend-api',
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 3002',
      // NOTE: keep at 1 while lib/rate-limit.ts is in-memory — cluster mode
      // gives each worker its own counter, multiplying effective rate limits
      // (e.g. login attempts) by instance count. Move to a shared store
      // (Redis) before increasing this.
      instances: 1,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3002,
      },
    },
  ],
}
