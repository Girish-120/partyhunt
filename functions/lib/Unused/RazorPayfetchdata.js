"use strict";
// 1.Fetch Data from razorpay api .
// 2.Write email and phonenumber in excel
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// fetch data from razorpay api
const axios_1 = __importDefault(require("axios"));
const fs_1 = __importDefault(require("fs"));
const papaparse_1 = __importDefault(require("papaparse"));
function fetchRazorpayData() {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, e_1, _b, _c;
        // API call axios
        try {
            const iterables = Array.from(Array(97).keys());
            let jsonResponse = [];
            let skip = 0;
            try {
                for (var _d = true, iterables_1 = __asyncValues(iterables), iterables_1_1; iterables_1_1 = yield iterables_1.next(), _a = iterables_1_1.done, !_a; _d = true) {
                    _c = iterables_1_1.value;
                    _d = false;
                    const _ = _c;
                    const url = 'https://api.razorpay.com/v1/payments?from=le&to=1682042394&count=100&skip=' + skip;
                    const config = {
                        method: 'get',
                        url: url,
                        headers: {
                            'Authorization': ''
                        }
                    };
                    const response = yield (0, axios_1.default)(config);
                    jsonResponse = jsonResponse.concat(response.data.items);
                    skip = skip + 100;
                    console.log(`skip : ${skip} successfull with email ${response.data.items[0]["email"]}`);
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (!_d && !_a && (_b = iterables_1.return)) yield _b.call(iterables_1);
                }
                finally { if (e_1) throw e_1.error; }
            }
            return jsonResponse;
        }
        catch (err) {
            throw err;
        }
    });
}
function WriteFile(data) {
    return __awaiter(this, void 0, void 0, function* () {
        const razorpayData = [];
        for (const item of data) {
            razorpayData.push({
                "id": item.id,
                "entity": item["entity"],
                "amount": item["amount"],
                "currency": item["currency"],
                "status": item["status"],
                "order_id": item["order_id"],
                "invoice_id": item["invoice_id"],
                "international": item["international"],
                "method": item["method"],
                "amount_refunded": item["amount_refunded"],
                "refund_status": item["refund_status"],
                "captured": item["captured"],
                "description": item["description"],
                "email": item["email"],
                "contact": item["contact"],
                "user_name": item["notes"]["userName"],
                "user_id": item["notes"]["userId"],
                "created_at": item["created_at"]
            });
        }
        const csvData = papaparse_1.default.unparse(razorpayData);
        fs_1.default.writeFile('paymwntData.csv', csvData, (err) => {
            if (err)
                throw err;
            return "file written successfully";
        });
    });
}
fetchRazorpayData().then((data) => {
    WriteFile(data).then(out => {
        console.log(out);
    }).catch(err => {
        console.log(`error caught in Write file ${err}`);
    });
    console.log(`fetch data`);
}).catch(err => {
    console.log(`error caught in fetch function ${err}`);
});
//# sourceMappingURL=RazorPayfetchdata.js.map