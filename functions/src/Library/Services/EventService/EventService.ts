import IEventService from "../../Interfaces/EventInterfaces/EventService";
import admin, { firestore } from "firebase-admin";
import { EventInterface, EventBookingInterface } from "../../Interfaces/EventInterfaces/EventHome";
import { addSubtractTime } from "../../Helpers/DateTimeUtils";
// import moment from "moment-timezone";

class EventService implements IEventService {
  private db: admin.firestore.Firestore;
  constructor(db: admin.firestore.Firestore) {
    this.db = db;
  }
  GetDiamondEvents = async (tribe: String) => {
    const futureDate = addSubtractTime(firestore.Timestamp.now(), 7, 18, 0);
    const allTodayEvents = await this.db
      .collection("events")
      .where("toDate", ">=", firestore.Timestamp.now())
      .where("toDate", "<=", futureDate)
      .where("publishStatus", "==", 1)
      .where("promotionPackage", "==", 40)
      .where("tribe", "==", tribe)
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
          if (followerRef !== undefined && followerRef !== null) {
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
        publishStatus: eventData.publishStatus ?? 0,
        pictureThumbnail: eventData["picture_thumbnail"] ?? "",
        picture: eventData.picture,
        toDate: eventData.toDate,
        reward: eventData.reward,
        name: eventData.eventName,
        promotionPackage: eventData.promotionPackage,
        idPlace: eventData.placeData !== undefined ? eventData.placeData.idPlace : '',
        venueName:
          eventData.placeData !== undefined ? eventData.placeData.name : "",
        latLng: eventData.placeData.latLng ?? "",
        locality:
          eventData.placeData !== undefined && eventData.placeData !== null
            ? eventData.placeData.locality
            : "",
        fromDate: eventData.fromDate,
        entryFee: eventData.entryFee ?? -1,
        ownerId: eventData.ownerId,
        urlTicket: eventData.urlTicket ?? "",
        listTags: eventData.listTags ?? [],
        userCheckinList: eventData.userCheckinList ?? [],
        listFollowers: followers ?? [],
        listBlocked: eventData.listBlocked ?? [],
        tribe: eventData.tribe ?? "goa",
        isFeatured: eventData.isFeatured ?? false,
        specialOffer: eventData.specialOffer ?? "",
        hasTicket: eventData.hasTicket ?? true,
        sellTickets: eventData.sellTickets ?? false,
        anbocasEventId: eventData.anbocasEventId ?? "",
        eventUserBookings: eventUserBooking
      });
    });
    return eventList;
  };
  GetHomeEvents = async (
    tribe: String,
    selectedDate: Date,
    isAdmin: boolean
  ) => {
    //selectedDate.setHours(0, 0, 0, 0);
    selectedDate.setHours(0, 0, 0, 0);

    const midnightTimestamp = firestore.Timestamp.fromDate(selectedDate);
    const midnightDate = midnightTimestamp.toDate();
    //let selectedDateIST = moment(selectedDate).startOf('day');
    midnightDate.setDate(midnightDate.getDate() + 1);

    midnightDate.setHours(midnightDate.getHours() + 4);
    //const midnightTimestamp = firestore.Timestamp.fromDate(selectedDateIST.toDate());
    //const midnightDate = midnightTimestamp.toDate();

    // Add one day (24 hours)
    //selectedDateIST.add(1, 'day');

    // Add 4 hours in IST timezone
    //selectedDateIST.add(4, 'hours');

    // Convert the updated date back to a Firestore Timestamp
    const updatedTimestamp = firestore.Timestamp.fromDate(midnightDate);
    console.log(midnightTimestamp.toDate().toLocaleDateString());
    console.log(midnightTimestamp.toDate().toLocaleTimeString());
    console.log(updatedTimestamp.toDate().toLocaleDateString());
    console.log(updatedTimestamp.toDate().toLocaleTimeString());
    let baseQuery = this.db
      .collection("events")
      .where("fromDate", ">=", midnightTimestamp)
      .where("fromDate", "<", updatedTimestamp)
      .where("tribe", "==", tribe);

    if (!isAdmin) {
      baseQuery = baseQuery.where("publishStatus", "==", 1);
    }

    const allTodayEvents = await baseQuery.get();

    console.log(`allTagsList :${allTodayEvents.docs.length}`);

    const eventList: EventInterface[] = [];
    allTodayEvents.docs.forEach((el) => {
      const eventData = el.data();
      const followers: string[] = [];

      // Parse list of followers into list of IDs
      if (eventData.listFollowers) {
        for (const followerRef of eventData.listFollowers) {
          if (followerRef !== undefined && followerRef !== null) {
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
      //eventList.push()
      eventList.push({
        objectId: el.id,
        isUnderground: eventData.isUnderground,
        publishStatus: eventData.publishStatus ?? 0,
        pictureThumbnail: eventData["picture_thumbnail"] ?? "",
        picture: eventData.picture,
        toDate: eventData.toDate,
        reward: eventData.reward,
        name: eventData.eventName,
        promotionPackage: eventData.promotionPackage,
        idPlace: eventData.placeData !== undefined ? eventData.placeData.idPlace : '',
        venueName:
          eventData.placeData !== undefined ? eventData.placeData.name : "",
        latLng: eventData.placeData.latLng ?? "",
        locality:
          eventData.placeData !== undefined && eventData.placeData !== null
            ? eventData.placeData.locality
            : "",
        fromDate: eventData.fromDate,
        entryFee: eventData.entryFee ?? -1,
        ownerId: eventData.ownerId,
        urlTicket: eventData.urlTicket ?? "",
        listTags: eventData.listTags ?? [],
        userCheckinList: eventData.userCheckinList ?? [],
        listFollowers: followers ?? [],
        listBlocked: eventData.listBlocked ?? [],
        tribe: eventData.tribe ?? "goa",
        isFeatured: eventData.isFeatured ?? false,
        specialOffer: eventData.specialOffer ?? "",
        sellTickets: eventData.sellTickets ?? false,
        hasTicket: eventData.hasTicket ?? true,
        anbocasEventId: eventData.anbocasEventId ?? "",
        eventUserBookings: eventUserBooking
      });
    });
    return eventList;
  };
}

export default EventService;
