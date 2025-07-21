interface IWhatsNotification {
  SendNotificationPaymentSuccess: (
    whatsapp_number: string,
    name: string,
    email: string,
    product_details: string,
    note: string,
    tribe:string,
  ) => Promise<any>;
  SendNotificationPaymentFailure: (whatsapp_number: string) => Promise<any>;
}

export default IWhatsNotification;
