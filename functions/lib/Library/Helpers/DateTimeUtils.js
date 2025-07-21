"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addSubtractTime = addSubtractTime;
exports.getEventDates = getEventDates;
const firebase_admin_1 = require("firebase-admin");
const moment_timezone_1 = __importDefault(require("moment-timezone"));
//Add or subtract time
function addSubtractTime(dateToChange, days, hours, minutes) {
    //add: boolean,
    const oneMinute = 60 * 1000;
    const oneHour = 60 * oneMinute;
    const oneDay = 24 * oneHour;
    return firebase_admin_1.firestore.Timestamp.fromMillis(dateToChange.toMillis() +
        minutes * oneMinute +
        hours * oneHour +
        days * oneDay);
}
//Get Evetn Dates as array
function getEventDates(fromDate, toDate) {
    const eventDates = [];
    // Start the date from 12 in the night for the loop to work correctly
    const startDate = (0, moment_timezone_1.default)(fromDate).subtract((0, moment_timezone_1.default)(fromDate).hours(), "hours");
    // Do not add the last date if event is ending before 10 AM
    const endDate = (0, moment_timezone_1.default)(toDate).subtract(10, "hours");
    for (const day = startDate; day.isSameOrBefore(endDate); day.add(1, "days"))
        eventDates.push((0, moment_timezone_1.default)(day.toDate()).format("DDMMYY"));
    // console.log(startDate.date() + " to9 " + endDate.date() + " --  " + eventDates);\
    return eventDates;
}
// export function getDaysFromToday(fromDate:firestore.Timestamp){
//   // const fromDate: Date = new Date('2024-01-01'); // Replace '2024-01-01' with your desired date
//   // Current date
//   if(fromDate==undefined){
//     return 0;
//   }
//   const now: Date = new Date();
//   const fromDateMs: number = fromDate.toMillis();
//   const fromDateObj: Date = new Date(fromDateMs);
//   // Calculate the difference in milliseconds
//   const differenceInMs: number = now.getTime() - fromDateObj.getTime();
//   // Convert milliseconds to days
//   const daysDifference: number = differenceInMs / (1000 * 3600 * 24);
//   return daysDifference;
// }
//# sourceMappingURL=DateTimeUtils.js.map