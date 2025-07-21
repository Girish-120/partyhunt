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
Object.defineProperty(exports, "__esModule", { value: true });
const helperFunctions = __importStar(require("../../../Helpers/Functions"));
class FirebaseTransaction {
    constructor(db) {
        this.BatchUpdate = (data) => __awaiter(this, void 0, void 0, function* () {
            try {
                const dataBatches = helperFunctions.splitIntoChunk(data.payload, data.chunk);
                const dataRef = this.db.collection(data.collectionName);
                console.log(`start batch update for total batches: ${dataBatches.length}`);
                let batchCount = 1;
                for (const batchObject of dataBatches) {
                    const batch = this.db.batch();
                    console.log(`initiate batch update for index: ${batchCount} and count ${batchObject.length}`);
                    let operationCount = 0;
                    for (const item of batchObject) {
                        if (item && item[data.objectId]) {
                            const documentId = item[data.objectId];
                            if (typeof documentId === "string" && documentId !== "") {
                                const docRef = dataRef.doc(documentId);
                                batch.update(docRef, item);
                                operationCount++;
                                console.log(`batch object id: ${documentId} updated index: ${operationCount}`);
                            }
                        }
                        else {
                            console.log(`Invalid document ID provided in item: ${JSON.stringify(item)}`);
                        }
                    }
                    try {
                        yield batch.commit();
                        console.log(`commit batch update index: ${batchCount}`);
                    }
                    catch (err) {
                        // Handle document not found error
                        if (err.code === 5 &&
                            err.message.includes("NOT_FOUND")) {
                            console.log(`Error updating batch ${batchCount}: No document found`);
                            // Handle the error as per your requirement (e.g., logging, skipping, or throwing an exception)
                        }
                        else {
                            // Handle other errors
                            console.log(`Error updating batch ${batchCount}: ${err}`);
                            // Handle the error as per your requirement
                        }
                    }
                    batchCount++;
                }
                console.log(`batch commit finished`);
            }
            catch (err) {
                throw err;
            }
        });
        this.db = db;
    }
}
exports.default = FirebaseTransaction;
//# sourceMappingURL=BatchUpdates.js.map