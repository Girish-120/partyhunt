import { firestore } from "firebase-admin"; //admin,

export interface EventInterface {
  objectId: string;
  isUnderground: string;
  publishStatus: number;
  pictureThumbnail: string;
  picture: string;
  toDate: firestore.Timestamp;
  reward: string;
  name: string;
  promotionPackage: number;
  idPlace: string,
  venueName: string;
  latLng: firestore.GeoPoint;
  fromDate: firestore.Timestamp;
  entryFee: number;
  locality: string;
  ownerId: string;
  urlTicket: string;
  listTags: string[];
  userCheckinList: string[];
  listFollowers: String[];
  listBlocked: string[];
  tribe: string;
  isFeatured: boolean;
  specialOffer: string;
  anbocasEventId: string;
  sellTickets: boolean;
  hasTicket: boolean,
  eventUserBookings: EventBookingInterface;
}

export interface EventBookingInterface {
  anbocasOrderId: string;
  ticketsCount: number;
  userId: string;
}
