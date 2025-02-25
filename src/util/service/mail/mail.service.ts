import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MailService {
  constructor(
    private mailerService: MailerService,
    private config: ConfigService,
  ) {}

  async sendCodeEmail(email: string, code: string): Promise<void> {
    await this.mailerService
      .sendMail({
        to: email,
        from: this.config.get<string>('MAILER_USER'),
        subject: '비밀번호 재설정 코드',
        template: './email',
        context: { code },
      })
      .then((value) => console.log('success : ', value))
      .catch((reason) => console.log('error : ', reason));
  }
}
