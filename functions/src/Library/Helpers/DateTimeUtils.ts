import { firestore } from "firebase-admin";
import moment from "moment-timezone";

//Add or subtract time
export function addSubtractTime(
  dateToChange: firestore.Timestamp,
  days: number,
  hours: number,
  minutes: number
) {
  //add: boolean,
  const oneMinute = 60 * 1000;
  const oneHour = 60 * oneMinute;
  const oneDay = 24 * oneHour;

  return firestore.Timestamp.fromMillis(
    dateToChange.toMillis() +
      minutes * oneMinute +
      hours * oneHour +
      days * oneDay
  );
}

//Get Evetn Dates as array
export function getEventDates(fromDate: Date, toDate: Date) {
  const eventDates: string[] = [];

  // Start the date from 12 in the night for the loop to work correctly
  const startDate = moment(fromDate).subtract(
    moment(fromDate).hours(),
    "hours"
  );

  // Do not add the last date if event is ending before 10 AM
  const endDate = moment(toDate).subtract(10, "hours");

  for (const day = startDate; day.isSameOrBefore(endDate); day.add(1, "days"))
    eventDates.push(moment(day.toDate()).format("DDMMYY"));

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
