import { Injectable } from "@nestjs/common";
import * as nodemailer from 'nodemailer';
import { createTransport } from 'nodemailer';
import * as path from 'path';


@Injectable()
export class EmailService {
    private transporter: nodemailer.Transporter;
    private templatePath: string;

    constructor() {
        this.transporter = createTransport({
            host: process.env.SMTP_HOST,
            port: Number(process.env.SMTP_PORT),
            secure: false,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASSWORD,
            },
        });

        this.templatePath = path.join('src/common/email/templates');
    }

    private loadTemplate(templateName: string): string {
        const templatePath = path.join(this.templatePath, `${templateName}.hbs`);
        return require('fs').readFileSync(templatePath, 'utf-8');
    }

    private compileTemplate(templateName: string, data: any): string {
        const templateSource = this.loadTemplate(templateName);
        const template = require('handlebars').compile(templateSource)
        return template(data);
    }

    async sendMail(to: string, subject: string, html: string) {
        const templateContent = this.compileTemplate('test-email', { html });
        await this.transporter.sendMail({
            from: `"Kirimaja" <${process.env.SMTP_EMAIL_SENDER}>`,
            to,
            subject,
            html: templateContent,
        });
    }
}