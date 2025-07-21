import * as Constants from "../../Helpers/Constants";
import * as DateTimeUtils from "../../Helpers/DateTimeUtils";
import { firestore } from "firebase-admin"; //admin,
import moment from "moment-timezone";
import * as functions from "firebase-functions";
import { db } from "../../..";
import { EventBookingInterface, EventInterface } from "../../Interfaces/EventInterfaces/EventHome";

moment.tz.setDefault(Constants.timezone);

export const cron_cache_diamond_events = functions
  .runWith(Constants.runTimeOptionsLong)
  .pubsub.schedule("00 04 * * *")
  .timeZone(Constants.timezone)
  .onRun(async (_context) => {
    const futureDate = DateTimeUtils.addSubtractTime(
      firestore.Timestamp.now(),
      7,
      18,
      0
    );

    const allTodayEvents = await db
      .collection("events")
      .where("toDate", ">=", firestore.Timestamp.now())
      .where("toDate", "<=", futureDate)
      .where("publishStatus", "==", 1)
      .where("promotionPackage", "==", 40)
      .orderBy("toDate")
      .get();

    console.log(`allTagsList :${allTodayEvents.docs.length}`);
    const eventList: EventInterface[] = [];
    allTodayEvents.docs.forEach((el) => {
      const eventData = el.data();
      const followers: string[] = [];

      // Parse list of followers into list of IDs
      if (eventData.listFollowers) {
        for (const followerRef of eventData.listFollowers) {
          if (followerRef !== undefined) {
            const followerId = followerRef.id; // Assuming listFollowers is an array of DocumentReference
            followers.push(followerId);
          }
        }
      }
      const eventUserBooking: EventBookingInterface = {
        anbocasOrderId:
          eventData.eventUserBookings !== undefined
            ? eventData.eventUserBookings.anbocasOrderId
            : "",
        ticketsCount:
          eventData.eventUserBookings !== undefined
            ? eventData.eventUserBookings.ticketsCount
            : 0,
        userId:
          eventData.eventUserBookings !== undefined
            ? eventData.eventUserBookings.userId
            : ""
      };
      eventList.push({
        objectId: el.id,
        isUnderground: eventData.isUnderground,
        publishStatus:
          eventData.publishStatus !== undefined ? eventData.publishStatus : 0,
        pictureThumbnail:
          eventData["picture_thumbnail"] !== undefined
            ? eventData["picture_thumbnail"]
            : "",
        picture: eventData.picture,
        toDate: eventData.toDate,
        reward: eventData.reward,
        name: eventData.eventName,
        locality:
          eventData.placeData !== undefined && eventData.placeData !== null
            ? eventData.placeData.locality
            : "",
        promotionPackage: eventData.promotionPackage,
        idPlace:eventData.placeData !== undefined ? eventData.placeData.idPlace : '',
        venueName:
          eventData.placeData !== undefined ? eventData.placeData.name : "",
        latLng:
          eventData.placeData.latLng !== undefined
            ? eventData.placeData.latLng
            : "",
        fromDate: eventData.fromDate,
        entryFee: eventData.entryFee,
        ownerId: eventData.ownerId,
        urlTicket: eventData.urlTicket,
        listTags: eventData.listTags,
        userCheckinList: eventData.userCheckinList,
        listFollowers: followers,
        listBlocked: eventData.listBlocked,
        tribe: eventData.tribe,
        isFeatured: eventData.isFeatured ?? false,
        specialOffer: eventData.specialOffer ?? "",
        sellTickets: eventData.sellTickets ?? false,
        hasTicket: eventData.hasTicket ?? true,
        anbocasEventId: eventData.anbocasEventId ?? "",
        eventUserBookings: eventUserBooking
      });
    });
    // const redisClient = connectRedis();
    // for(let key in eventDict){
    //   if (eventDict.hasOwnProperty(key)) {
    //     const value = eventDict[key];
    //     (await redisClient).set(key,JSON.stringify(value)).catch((e)=>{
    //       console.log(`error is logged for redis ${e.toString()}`)
    //     });
    //     console.log(`diamond events written to ${key}`);
    //  }
    // }
  });
