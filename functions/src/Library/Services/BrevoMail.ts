import nodemailer from "nodemailer";
import IMailSend from "../Interfaces/SendMail";
class BrevoMailSender implements IMailSend {
  private transporter: any;
  constructor(password?: string) {
    this.transporter = nodemailer.createTransport({
      host: "smtp-relay.brevo.com",
      port: 465,
      secure: true, // true for 465, false for other ports
      auth: {
        user: "admin@partyhunt.com", // any user
        pass: password // generated mandrill password
      }
    });
  }
  SendEmail = async (data: {
    attachments?: any;
    from?: string;
    to?: string;
    text: string;
    subject: string;
    html?: string;
  }) => {
    try {
      console.log(`email sender started brevo`);
      const info = await this.transporter.sendMail({
        from: data.from, // sender address
        to: data.to, // list of receivers
        subject: data.subject, // Subject line
        text: data.text, // plain text body
        html: `${data.html}`, // html body
        attachments: data.attachments
      });
      console.log("mail sent");
      return "Message sent: %s" + info.messageId;
    } catch (err) {
      console.log(`catch error for sending mail : ${err}`);
      throw err;
    }
  };
}

export default BrevoMailSender;
