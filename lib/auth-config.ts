export const authConfig = {
  adminUsername: process.env.ADMIN_USERNAME || 'admin',
  adminPasswordHash: process.env.ADMIN_PASSWORD_HASH || '$2a$10$hDfWH8AxYI49FH1ehZbIMOCcTMijO01DRrwRbNb0bEvAaemgArQGC',
  nextAuthSecret: process.env.NEXTAUTH_SECRET || 'AjYxQq7X5kJcrWfUhd7s04FU3767V8RXVHTV7LdyvyA=',
  nextAuthUrl: process.env.NEXTAUTH_URL || 'http://localhost:3000',
}
