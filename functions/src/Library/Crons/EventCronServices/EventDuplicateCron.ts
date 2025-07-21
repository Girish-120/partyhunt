import * as Constants from "../../Helpers/Constants";
import * as Helpers from "../../Helpers/Functions";
import * as DateTimeUtils from "../../Helpers/DateTimeUtils";
import { firestore } from "firebase-admin"; //admin,
import moment from "moment-timezone";
import { db } from "../../..";
import * as functions from "firebase-functions";

moment.tz.setDefault(Constants.timezone);

export const cron_weekly_event_duplication = functions
  .runWith(Constants.runTimeOptionsLong)
  .pubsub.schedule("00 11 * * *")
  .timeZone(Constants.timezone)
  .onRun(async (_context) => {
    try {
      const firestoreTimestampNow = firestore.Timestamp.now(); //.toDate();
      // const istDate = moment(date).tz(Constants.timezone).toDate();
      // const firestoreTimestampNow = firestore.Timestamp.fromDate(istDate);
      const startTime = DateTimeUtils.addSubtractTime(
        firestoreTimestampNow,
        0,
        -23,
        -59
      ); //moment(now).subtract(25, "hours").toDate()
      const endTime = DateTimeUtils.addSubtractTime(
        firestoreTimestampNow,
        0,
        0,
        0
      ); //moment(firestore.Timestamp.now()).toDate()

      // const startTimeD = new Date('July 03, 2024 11:00:00'); //moment(now).subtract(25, "hours").toDate()
      // const endTimeD =  new Date('July 04, 2024 11:00:00');//moment(firestore.Timestamp.now()).toDate()

      // const startTime =  firestore.Timestamp.fromDate(startTimeD) //moment(now).subtract(25, "hours").toDate()
      // const endTime = firestore.Timestamp.fromDate(endTimeD) //moment(firestore.Timestamp.now()).toDate()
      // const startTime = new Date('May 17, 2024 11:00:00'); //moment(now).subtract(25, "hours").toDate()
      // const endTime =  new Date('May 18, 2024 11:00:00');//mo
      // console.log(`startime : ${startTimeD.toLocaleDateString()} : ${startTimeD.toLocaleTimeString()}`)
      // console.log(`endtime : ${endTimeD.toLocaleDateString()} : ${endTimeD.toLocaleTimeString()}`)
      
      // const defualtCap = 30
      // const UGCap = 30
      // const promotionSubscriptionFactor = 2
      
      console.log(`startime : ${startTime.toDate()}`);
      console.log(`endtime : ${endTime.toDate()}`);
      const allEvents = await db
        .collection("events")
        .where("fromDate", ">=", startTime)
        .where("fromDate", "<=", endTime)
        .where("isWeekly", "==", true)
        // .orderBy("fromDate") // Dev Mode
        // .limit(1) // Dev Mode
        .get();

      const listEventIds: String[] = [];
      const listUpdatedEventIds: string[] = [];
      const allEventIds: string[] = [];
      const datarwt: any[] = [];

      // collect event place id
      console.log(`total events ${allEvents.docs.length}`);
      console.log("calculating place dictionary");
      const eventsPlaceids = allEvents.docs
        .filter((f) => {
          return f.data().placeData !== undefined;
        })
        .map((m) => {
          const event = m.data();
          return event.placeData.idPlace;
        });
      console.log(`events place id : ${eventsPlaceids.length}`);
      // Query all place data with given place ids from events
      let placeDataContext: firestore.QuerySnapshot<firestore.DocumentData>;
      let placeDataDict: firestore.DocumentData;
      if (eventsPlaceids.length > 0) {
        // break placeids upto upto 30 object
        const placeDataList: firestore.DocumentData[] = [];
        const eventPLaceIdsBatches = Helpers.splitIntoChunk(eventsPlaceids, 30);
        for await (let batch of eventPLaceIdsBatches) {
          //console.log(`batch size length : ${batch.length}`)
          batch = batch.filter((f) => {
            return f !== undefined;
          });
          placeDataContext = await db
            .collection(Constants.Collections[Constants.Collections.places])
            .where("idPlace", "in", batch)
            .get();
          //console.log(`db objects length: ${placeDataContext.docs.length}`)
          placeDataList.push(
            ...placeDataContext.docs.map((m) => {
              return m.data();
            })
          );
        }
        //Make dictionary of the list
        placeDataDict = placeDataList.reduce((obj, item) => {
          obj[item.idPlace] = item;
          return obj;
        }, {});
      }

      // fetch all tags with publish status as 1

      const allTags = await db
        .collection("tags")
        .where("publishStatus", "==", 1)
        .get();

      const dataTagsList = allTags.docs.map((el) => {
        return el.data();
      });
      const listTagDict: firestore.DocumentData = dataTagsList.reduce((obj, item) => {
        obj[item.name] = item;
        return obj;
      }, {});

      //console.log(`tags dictionary : ${JSON.stringify(listTagDict)}`)
      console.log("place dictionary prepared");
      allEvents.forEach(async function (eventDoc) {
        const event = eventDoc.data();
        const eventId = eventDoc.id;
        allEventIds.push(eventId);
        //const eventObjectId =

        if (listEventIds.includes(eventId))
          datarwt.push(eventDoc.ref.delete()); //.then().catch() await
        else if (event.publishStatus !== -2) {
          // Check logic to copy
          // const editedAt = event.editedAt;
          // //const daysToLastUpdate = DateTimeUtils.getDaysFromToday(editedAt);
          // const countFollowers = event.countFollowers;
          // last update less than 60 days and likes more than 10
          //console.log(`days to Last update ${daysToLastUpdate}`)
          //console.log(`count followers ${countFollowers}`)
          //console.log(`logging event id MqH6HYpM5FCzBq7qLIbF`)
          // if (daysToLastUpdate < 90) {
          listEventIds.push(eventId);

          event.fromDate = moment(event.fromDate.toDate())
            .add(7, "days")
            .toDate();
          event.toDate = moment(event.toDate.toDate()).add(7, "days").toDate();
          event.eventDates = DateTimeUtils.getEventDates(
            event.fromDate,
            event.toDate
          );

          // ToDo: Reset Promotion Package (Boost ID) only for single boost and not for seasonal package
          //  is the
          event.promotionPackage = 0;
          // Disable the duplicate isunderground to false
          // event.isUnderground=false

          // Reseting checkin list
          event.totalCheckin = 0;
          event.userCheckinList = [];

          event.anbocasEventId = "";
          event.sellTickets = false;
          event.hasTicket = false;
          event.listFollowers = [];
          event.countFollowers = 0;

          // reseting owner id
          // event.ownerId=""
          // event.ownerId = null
          // Update Promotion package with venue .
          // Check place data
          if (event.placeData !== undefined) {
            const eventPlaceId = event.placeData.idPlace;
            // ToDo : Fetch from cache layer and remove db call
            // updating event promotion package with place data promotion package
            // Avoided DB call every time in the loop
            // Created a dictionary of place data to fetch the relevant promotion package
            if (placeDataDict[eventPlaceId] !== undefined) {
              const placeDataPromotionSubscription =
                placeDataDict[eventPlaceId].promotionsSubscription;
              if (placeDataPromotionSubscription !== undefined) {
                event.promotionPackage = placeDataPromotionSubscription;
              }
            }
          }
          // Reseting Likes of the event : -
          // Formula : Cut off : defaultCap=30 + promotionSubscription*10 + undergroundCap=30

            // const cutOff = defualtCap + event.promotionPackage * promotionSubscriptionFactor + UGCap
            //const cutOff=1
            // if (event.listFollowers !== undefined) {
            //   const noOfLikes = event.listFollowers.length
            //   //console.log(`no likes  , cutoff : ${noOfLikes} , ${cutOff}`)
            //   if (noOfLikes > cutOff) {
            //     // cutting off likes 
            //     // console.log(`docId : ${event.docId}`)
            //     const cutOffFollowers = event.listFollowers.slice(noOfLikes - cutOff, noOfLikes)
            //     // console.log(JSON.stringify(cutOffFollowers),folliowers.length)
            //     event.listFollowers = cutOffFollowers
            //   }
            //   event.countFollowers = event.listFollowers.length
            // }

            if(event.listTags!==undefined){
                const updatedListTags: any[] =[];
                const eventTags = event.listTags;
                if(Array.isArray(eventTags)){
                    eventTags.forEach(el=>{
                        if (listTagDict[el] !== undefined){
                            console.log(`tags updating for event :${eventId} : ${el}`);
                            updatedListTags.push(el);
                        }
                    });
                }
                event.listTags=updatedListTags;
            }
            //if()code correc
            if (event.publishStatus === -1) {
              // Update Date for ToBeUpdated Events
              listUpdatedEventIds.push(eventId);
              datarwt.push(db.collection("events").add(event));
            }
            else {
              //Under review will stay under review for the next week & Published will become ToBeUpdated
              event.publishStatus = event.publishStatus === 0 ? 0 : -1;
              event.commentsCount = 0;
              if(Constants.projectKey==="dev"){
                event.publishStatus =1;
              }
              event.isDiscount = false;
              event.reward = "";
              //Stay rejected for the next week
              // event.publishStatus = event.publishStatus === -2 ? -2 : -1

            //Create new doc for underReview & Published events
            // emptying boostPayment object
            event.boostPayment = {};
            //event.createdAt = new Date() not to be reset
            //console.log(`boost payment is empty ${event.boostPayment}`)
            listUpdatedEventIds.push(eventId);
            datarwt.push(db.collection("events").add(event));
          }
        }
        // event.countFollowers = 0
        // event.listFollowers = []

        // docId remains unchanged to identify parent (first) weekly event in the series
        // event.docId = null

        // Using the last event picture until changed again from
        // event.picture = null
        // event.picture_thumbnail = null
        // }
      });

      console.log(`list events length ${listEventIds.length}`);
      console.log(`all events length ${allEvents.docs.length}`);
      console.log(`all datawrts length ${datarwt.length}`);
      console.log(`executing promise`);

      const listDifference = Helpers.Listdifference(
        allEventIds,
        listUpdatedEventIds
      );

      console.log(`ids not updated : ${listDifference}`);

      // const _dataloaded =
      await Promise.all(datarwt);

      console.log(
        "Total Events Duplicated event after (& until now) " +
          startTime.toDate().toUTCString() +
          " Count - " +
          listEventIds.length +
          " / " +
          allEvents.docs.length
      );
      return "Success of weeklyEventDuplication";
    } catch (error) {
      console.error(error);
      return error;
    }
  });
