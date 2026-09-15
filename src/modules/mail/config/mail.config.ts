import { registerAs } from '@nestjs/config';

export default registerAs('mail', () => ({
  host: process.env.MAIL_HOST,
  port: parseInt(process.env.MAIL_PORT, 10) || 587,
  ignoreTLS: process.env.MAIL_IGNORE_TLS === 'true',
  secure: process.env.MAIL_SECURE === 'true',
  user: process.env.MAIL_USER,
  password: process.env.MAIL_PASSWORD,
  defaultEmail: process.env.MAIL_DEFAULT_EMAIL || 'noreply@yourdomain.com',
  defaultName: process.env.MAIL_DEFAULT_NAME || 'My App Team',
}));
