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
exports.cron_monthly_placeData_refetch = void 0;
const __1 = require("../..");
const axios_1 = __importDefault(require("axios"));
const functions = __importStar(require("firebase-functions"));
const helperFunctions = __importStar(require("../Helpers/Functions"));
const Constants = __importStar(require("../Helpers/Constants"));
const firebase_admin_1 = require("firebase-admin"); //admin,
const BatchUpdates_1 = __importDefault(require("../Services/FirebaseDB/Transaction/BatchUpdates"));
const SecretVariables_1 = __importDefault(require("../Helpers/SecretVariables"));
exports.cron_monthly_placeData_refetch = functions
    .runWith(Constants.runTimeOptionsLong)
    .pubsub.schedule("0 0 1 * *") //0 0 1 * *
    .timeZone(Constants.timezone)
    .onRun((_context) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Fetch place Data
        console.log(`place refetch starts`);
        const db_places = yield __1.db.collection("places").get();
        console.log(`database fetched`);
        const place_data = [];
        db_places.forEach((data) => {
            const place = data.data();
            place_data.push({
                place_id: place.idPlace,
                rating: place.rating,
                address: place.address,
                countFollowers: place.countFollowers !== undefined ? place.countFollowers : 0,
                listFollowers: place.listFollowers !== undefined ? place.listFollowers : [],
                listIndexes: place.listIndexes !== undefined ? place.listIndexes : [],
                promotionsSubscription: place.promotionsSubscription !== undefined
                    ? place.promotionsSubscription
                    : 0,
                publishStatus: place.publishStatus !== undefined ? place.publishStatus : 1,
                area: place.area,
                country: place.country,
                editedAt: place.editedAt,
                fixedLocality: place.fixed_locality,
                locality: place.locality,
                name: place.name,
                phone: place.phone !== undefined ? place.phone : "",
                state: place.state,
                types: place.types,
                icon: place.icon,
                latlng: place.latlng,
                doc_id: place.docId,
                photos: place.listPhotos !== undefined ? place.listPhotos : [],
                appName: place.appName === undefined ||
                    place.appName === null ||
                    place.appName === ""
                    ? "partyhunt"
                    : place.appName,
                createdAt: place.createdAt === undefined ? new Date() : place.createdAt
            });
        });
        console.log(`counted place data ${place_data.length}`);
        // const remoteConstants = await Constants.Constants()
        // Make
        const dbPayload = [];
        yield helperFunctions.asyncForEach(place_data, (item) => __awaiter(void 0, void 0, void 0, function* () {
            // make async api call
            console.log(`fetching maps data for place id ${item.place_id}`);
            const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${item.place_id}&key=${SecretVariables_1.default.googleMapApiKey}`;
            const response = yield axios_1.default.get(url);
            const data = response.data;
            if (data.status !== undefined && data.status === "NOT_FOUND") {
                console.log("errors from map ..... skipping");
            }
            else {
                // initiallizing required variable
                let area = "";
                let state = "";
                let fixed_locality = "";
                let country = "";
                const address = data.result.formatted_address !== undefined
                    ? data.result.formatted_address.split(", ").slice(1).join(", ")
                    : item.address;
                const locality = data.result.vicinity !== undefined
                    ? data.result.vicinity.split(", ").slice(1).join(", ")
                    : item.locality;
                const photos = data.result.photos !== undefined || data.result.photos.length > 0
                    ? data.result.photos.map((m) => {
                        return m.photo_reference;
                    })
                    : item.photos;
                const rating = data.result.rating === undefined ? item.rating : data.result.rating;
                const icon = data.result.icon === undefined ? item.icon : data.result.icon;
                const types = data.result.types === undefined ? item.types : data.result.types;
                const phone_numer = data.result.international_phone_number === undefined
                    ? item.phone
                    : data.result.international_phone_number;
                const name = data.result.name === undefined ? item.name : data.result.name;
                const latlng = new firebase_admin_1.firestore.GeoPoint(data.result.geometry.location.lat, data.result.geometry.location.lng);
                data.result.address_components.forEach((el) => {
                    const type = el.types[0];
                    if (type === "locality") {
                        fixed_locality = el.long_name;
                    }
                    if (type === "administrative_area_level_3") {
                        area = el.long_name;
                    }
                    if (type === "administrative_area_level_1") {
                        state = el.long_name;
                    }
                    if (type === "country") {
                        country = el.long_name;
                    }
                });
                dbPayload.push({
                    address: address,
                    appName: item.appName,
                    area: area,
                    country: country,
                    editedAt: new Date(),
                    fixedLocality: fixed_locality,
                    icon: icon,
                    idPlace: item.place_id,
                    latLng: latlng,
                    listPhotos: photos,
                    locality: locality,
                    name: name,
                    phone: phone_numer,
                    promotionsSubscription: item.promotionsSubscription,
                    publishStatus: item.publishStatus,
                    rating: rating,
                    state: state,
                    types: types
                });
            }
        }));
        // Batch Write
        // Dividing batch for 500 maximum limit for firebase to write document in batch
        const iTransaction = new BatchUpdates_1.default(__1.db);
        console.log(`starting the transaction ... `);
        iTransaction
            .BatchUpdate({
            payload: dbPayload,
            chunk: 200,
            collectionName: Constants.Collections[Constants.Collections.places],
            objectId: "idPlace"
        })
            .then(() => {
            console.log("transaction complete");
        })
            .catch((err) => {
            console.log(`error in transaction : ${err}`);
        });
    }
    catch (err) {
        // send notification if error
        // helperFunctions.send_wati_notification()
        // Later either through mail or wati
        console.log("error logged with error" + err);
    }
}));
//# sourceMappingURL=PlaceCrons.js.map