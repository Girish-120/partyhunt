"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const HTTP_1 = __importDefault(require("./HTTP"));
class Wati {
    constructor(watiAuthorizationKey, watiBaseUrl) {
        this.SendNotificationPaymentSuccess = (whatsapp_number, name, email, product_details, note, tribe) => __awaiter(this, void 0, void 0, function* () {
            try {
                console.log(`making success wati api call`);
                const url = this.watiBaseUrl +
                    "/api/v1/sendTemplateMessage?whatsappNumber=" +
                    whatsapp_number;
                const payload = JSON.stringify({
                    parameters: [
                        { name: "name", value: name },
                        { name: "email", value: email },
                        { name: "product_details", value: product_details },
                        { name: "note", value: note },
                        { name: 'tribe', value: tribe }
                    ],
                    template_name: "payment_razorpay",
                    broadcast_name: "payment_razorpay"
                });
                const response = yield this.Http.PostRequest(url, payload, {
                    headers: {
                        "Content-type": "text/json",
                        Authorization: `Bearer ${this.watiAuthorizationKey}`
                    }
                });
                if (response.status === 200) {
                    console.log("response from wati is success");
                }
                else {
                    console.log(`wati not triggred with response ${response.data}`);
                }
            }
            catch (err) {
                console.log(`exception error ${err}`);
                throw err;
            }
        });
        this.SendNotificationPaymentFailure = (whatsapp_number) => __awaiter(this, void 0, void 0, function* () {
            try {
                console.log(`making failure wati api call`);
                const url = this.watiBaseUrl +
                    "/api/v1/sendTemplateMessage?whatsappNumber=" +
                    whatsapp_number;
                const payload = JSON.stringify({
                    template_name: "payment_failure_",
                    broadcast_name: "payment_failure_"
                });
                const response = yield this.Http.PostRequest(url, payload, {
                    headers: {
                        "Content-type": "text/json",
                        Authorization: `Bearer ${this.watiAuthorizationKey}`
                    }
                });
                if (response.status === 200) {
                    console.log("response from wati is success");
                }
                else {
                    console.log(`wati not triggred with response ${response.data}`);
                }
            }
            catch (err) {
                console.log(`exception error ${err}`);
                throw err;
            }
        });
        this.watiAuthorizationKey = watiAuthorizationKey;
        this.watiBaseUrl = watiBaseUrl;
        this.Http = new HTTP_1.default();
    }
}
exports.default = Wati;
//# sourceMappingURL=Wati.js.map