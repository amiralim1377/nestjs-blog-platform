import { Module } from '@nestjs/common';
import { MailController } from './mail.controller.js';
import { MailService } from './providers/mail.service.js';
import { SendResetPasswordMailProvider } from './providers/actions/send-reset-password-mail.provider.js';
import { MailerModule } from '@nestjs-modules/mailer';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { SendWelcomeMailProvider } from './providers/actions/send-welcome-mail.provider.js';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const {
  EjsAdapter,
} = require('@nestjs-modules/mailer/dist/adapters/ejs.adapter');

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

@Module({
  imports: [
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        transport: {
          host: configService.get('mail.host'),
          port: configService.get('mail.port'),
          secure: configService.get('mail.secure'),
          ignoreTLS: configService.get('mail.ignoreTLS'),
          auth: {
            user: configService.get('mail.user'),
            pass: configService.get('mail.password'),
          },
        },
        defaults: {
          from: `"${configService.get('mail.defaultName')}" <${configService.get('mail.defaultEmail')}>`,
        },
        template: {
          dir: join(__dirname, 'templates'),
          adapter: new EjsAdapter({
            inlineCssEnabled: true,
          }),
          options: {
            strict: false,
          },
        },
      }),
    }),
  ],
  controllers: [MailController],
  providers: [
    MailService,
    SendResetPasswordMailProvider,
    SendWelcomeMailProvider,
  ],

  exports: [MailService],
})
export class MailModule {}
