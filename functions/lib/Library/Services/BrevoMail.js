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
const nodemailer_1 = __importDefault(require("nodemailer"));
class BrevoMailSender {
    constructor(password) {
        this.SendEmail = (data) => __awaiter(this, void 0, void 0, function* () {
            try {
                console.log(`email sender started brevo`);
                const info = yield this.transporter.sendMail({
                    from: data.from, // sender address
                    to: data.to, // list of receivers
                    subject: data.subject, // Subject line
                    text: data.text, // plain text body
                    html: `${data.html}`, // html body
                    attachments: data.attachments
                });
                console.log("mail sent");
                return "Message sent: %s" + info.messageId;
            }
            catch (err) {
                console.log(`catch error for sending mail : ${err}`);
                throw err;
            }
        });
        this.transporter = nodemailer_1.default.createTransport({
            host: "smtp-relay.brevo.com",
            port: 465,
            secure: true, // true for 465, false for other ports
            auth: {
                user: "admin@partyhunt.com", // any user
                pass: password // generated mandrill password
            }
        });
    }
}
exports.default = BrevoMailSender;
//# sourceMappingURL=BrevoMail.js.map