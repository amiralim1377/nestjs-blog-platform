import { Module } from '@nestjs/common';
import { MailController } from './mail.controller.js';
import { MailService } from './providers/mail.service.js';
import { SendResetPasswordMailProvider } from './providers/actions/send-reset-password-mail.provider.js';
import { MailerModule } from '@nestjs-modules/mailer';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { createRequire } from 'module';
import { SendWelcomeMailProvider } from './providers/actions/send-welcome-mail.provider.js';
import { BullModule } from '@nestjs/bullmq';
import { MailProcessor } from './processors/mail.processor.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const require = createRequire(import.meta.url);

const mailerMainPath = require.resolve('@nestjs-modules/mailer');
const ejsAdapterPath = join(
  dirname(mailerMainPath),
  'adapters',
  'ejs.adapter.js',
);

const { EjsAdapter } = require(ejsAdapterPath);

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
    BullModule.registerQueue({
      name: 'mail-queue',
    }),
  ],
  controllers: [MailController],
  providers: [
    MailService,
    SendResetPasswordMailProvider,
    SendWelcomeMailProvider,
    MailProcessor,
  ],

  exports: [MailService, BullModule],
})
export class MailModule {}
