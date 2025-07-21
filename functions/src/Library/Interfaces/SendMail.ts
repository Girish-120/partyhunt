interface IMailSend {
  SendEmail: (data: {
    attachments?: any;
    from?: string;
    to?: string;
    text: string;
    subject: string;
    html?: string;
  }) => Promise<any>;
}

export default IMailSend;
