/**
 * PM2 Ecosystem Configuration - Onde
 *
 * DEV environment: Always running on LAN only
 * PROD environment: Cloudflare Pages + external services
 *
 * Usage:
 *   pm2 start ecosystem.config.js --env dev    # Start all DEV servers
 *   pm2 start ecosystem.config.js --env prod   # Start PROD servers
 *   pm2 stop all                               # Stop all
 *   pm2 restart all                            # Restart all
 *   pm2 logs                                   # View all logs
 *   pm2 monit                                  # Real-time monitoring
 */

module.exports = {
  apps: [
    // ==========================================
    // ONDE PORTAL - Main website
    // ==========================================
    {
      name: 'onde-portal',
      cwd: './apps/onde-portal',
      script: 'npm',
      args: 'run dev',
      env_dev: {
        NODE_ENV: 'development',
        PORT: 3000,
        HOST: '0.0.0.0'  // LAN accessible
      },
      env_prod: {
        NODE_ENV: 'production',
        // In PROD, this is deployed to Cloudflare Pages
        // This config is for local testing of prod build
        PORT: 3000
      },
      watch: false,
      autorestart: true,
      max_restarts: 10,
      restart_delay: 5000
    },

    // ==========================================
    // B.I.B. DASHBOARD - Business Intelligence
    // ==========================================
    {
      name: 'bib-dashboard',
      cwd: './apps/dashboard',
      script: 'npm',
      args: 'run dev',
      env_dev: {
        NODE_ENV: 'development',
        PORT: 3001,
        HOST: '0.0.0.0'  // LAN accessible
      },
      env_prod: {
        NODE_ENV: 'production',
        PORT: 3001
      },
      watch: false,
      autorestart: true,
      max_restarts: 10,
      restart_delay: 5000
    },

    // ==========================================
    // FACTORY DASHBOARD - Agent monitoring
    // ==========================================
    {
      name: 'factory-dashboard',
      cwd: './apps/factory-dashboard',
      script: 'node',
      args: 'server.js',
      env_dev: {
        NODE_ENV: 'development',
        PORT: 3600,
        HOST: '0.0.0.0'  // LAN accessible
      },
      env_prod: {
        NODE_ENV: 'production',
        PORT: 3600
      },
      watch: false,
      autorestart: true,
      max_restarts: 10,
      restart_delay: 5000
    }
  ]
};
