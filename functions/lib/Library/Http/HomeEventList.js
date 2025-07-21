"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
exports.webApi = void 0;
const functions = __importStar(require("firebase-functions"));
const express_1 = __importDefault(require("express"));
const bodyParser = __importStar(require("body-parser"));
const __1 = require("../..");
const EventService_1 = __importDefault(require("../Services/EventService/EventService"));
const SecretVariables_1 = __importDefault(require("../Helpers/SecretVariables"));
const app = (0, express_1.default)();
const main = (0, express_1.default)();
main.use("/api/v1", app);
main.use(bodyParser.json());
exports.webApi = functions.https.onRequest(main);
app.use((req, res, next) => {
    const bearerHeader = req.headers["authorization"];
    if (bearerHeader) {
        const bearer = bearerHeader.split(" ");
        const bearerToken = bearer[1];
        if (bearerToken === SecretVariables_1.default.apiBearerToken) {
            next();
        }
        else {
            res.sendStatus(401);
        }
    }
    else {
        // Forbidden
        res.sendStatus(403);
    }
});
app.post("/eventListHomeToday", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const tribe = req.body.tribe;
    const selectedDate = req.body.selectedDate;
    const isAdmin = req.body.isAdmin;
    console.log(`isAdmin :${isAdmin}`);
    try {
        if (!selectedDate) {
            return res
                .status(400)
                .json({ data: null, error: "selectedDate is required" });
        }
        // Parse the ISO string to a JavaScript Date object
        const date = new Date(selectedDate);
        if (isNaN(date.getTime())) {
            return res
                .status(400)
                .json({ data: null, error: "Invalid selectedDate forma" });
            // return res.status(400).send('Invalid selectedDate format');
        }
        console.log(`tribe :${tribe}, selectedDate :${date}`);
        if (tribe !== undefined && tribe !== "") {
            const iEventService = new EventService_1.default(__1.db);
            const eventData = yield iEventService.GetHomeEvents(tribe, date, isAdmin);
            const diamondData = yield iEventService.GetDiamondEvents(tribe);
            console.log(`event Data :${eventData.length}`);
            return res.json({
                data: {
                    diamondEvents: diamondData,
                    homeEvent: eventData,
                    homeEventLength: eventData.length
                },
                error: null
            });
        }
        return res.status(404).json({ data: null, error: "No Data" });
    }
    catch (err) {
        res.status(500);
        return res.json({ error: err.toString() });
    }
}));
//# sourceMappingURL=HomeEventList.js.map