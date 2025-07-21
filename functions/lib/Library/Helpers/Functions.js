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
Object.defineProperty(exports, "__esModule", { value: true });
exports.asyncForEach = asyncForEach;
exports.CheckEmail = CheckEmail;
exports.Listdifference = Listdifference;
exports.toTileCase = toTileCase;
exports.unionDocumentReferences = unionDocumentReferences;
exports.splitIntoChunk = splitIntoChunk;
function asyncForEach(array, callback) {
    return __awaiter(this, void 0, void 0, function* () {
        for (let index = 0; index < array.length; index++) {
            yield callback(array[index], index, array);
        }
    });
}
function CheckEmail(email) {
    const emailRegex = new RegExp(/^[A-Za-z0-9_!#$%&'*+\/=?`{|}~^.-]+@[A-Za-z0-9.-]+$/, "gm");
    const isValidEmail = emailRegex.test(email);
    return isValidEmail;
}
function Listdifference(list1, list2) {
    const set2 = new Set(list2);
    return list1.filter((item) => !set2.has(item));
}
function toTileCase(text) {
    let returnText = text;
    if (text !== undefined && text !== "") {
        returnText = text
            .split(" ")
            .map((w) => w[0].toUpperCase() + w.substring(1).toLowerCase())
            .join(" ");
    }
    return text;
}
function unionDocumentReferences(arr1, arr2) {
    const merged = arr1.concat(arr2.filter((ref) => !arr1.some((r) => r.path === ref.path)));
    return merged;
}
function splitIntoChunk(arr, chunk) {
    const chunkArray = [];
    while (arr.length > 0) {
        const tempArray = arr.splice(0, chunk);
        chunkArray.push(tempArray);
    }
    return chunkArray;
}
//# sourceMappingURL=Functions.js.map