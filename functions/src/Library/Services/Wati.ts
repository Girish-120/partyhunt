import Http from "./HTTP";
import IWhatsAppNotification from "../Interfaces/WhatsAppNotification";
class Wati implements IWhatsAppNotification {
  private watiAuthorizationKey: String | undefined;
  private watiBaseUrl: String | undefined;
  Http: Http;
  constructor(
    watiAuthorizationKey: String | undefined,
    watiBaseUrl: string | undefined
  ) {
    this.watiAuthorizationKey = watiAuthorizationKey;
    this.watiBaseUrl = watiBaseUrl;
    this.Http = new Http();
  }
  SendNotificationPaymentSuccess = async (
    whatsapp_number: string,
    name: string,
    email: string,
    product_details: string,
    note: string,
    tribe:string
  ) => {
    try {
      console.log(`making success wati api call`);
      const url =
        this.watiBaseUrl +
        "/api/v1/sendTemplateMessage?whatsappNumber=" +
        whatsapp_number;
      const payload = JSON.stringify({
        parameters: [
          { name: "name", value: name },
          { name: "email", value: email },
          { name: "product_details", value: product_details },
          { name: "note", value: note },
          { name: 'tribe', value: tribe}
        ],
        template_name: "payment_razorpay",
        broadcast_name: "payment_razorpay"
      });
      const response = await this.Http.PostRequest(url, payload, {
        headers: {
          "Content-type": "text/json",
          Authorization: `Bearer ${this.watiAuthorizationKey}`
        }
      });
      if (response.status === 200) {
        console.log("response from wati is success");
      } else {
        console.log(`wati not triggred with response ${response.data}`);
      }
    } catch (err) {
      console.log(`exception error ${err}`);
      throw err;
    }
  };

  SendNotificationPaymentFailure = async (whatsapp_number: string) => {
    try {
      console.log(`making failure wati api call`);
      const url =
        this.watiBaseUrl +
        "/api/v1/sendTemplateMessage?whatsappNumber=" +
        whatsapp_number;
      const payload = JSON.stringify({
        template_name: "payment_failure_",
        broadcast_name: "payment_failure_"
      });
      const response = await this.Http.PostRequest(url, payload, {
        headers: {
          "Content-type": "text/json",
          Authorization: `Bearer ${this.watiAuthorizationKey}`
        }
      });
      if (response.status === 200) {
        console.log("response from wati is success");
      } else {
        console.log(`wati not triggred with response ${response.data}`);
      }
    } catch (err) {
      console.log(`exception error ${err}`);
      throw err;
    }
  };
}

export default Wati;
