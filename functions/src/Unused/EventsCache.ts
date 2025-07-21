// import { RedisClientType } from "redis";
// import IEventCache from "../../Interfaces/Cache/CacheEvents";
// import { EventInterface } from "../../Models/EventHome";
// class EventsCacheRedis implements IEventCache{
//     private client:RedisClientType;
//     constructor(redisClient:RedisClientType){
//         this.client=redisClient;
//     }
//     DeleteHashes = async()=>{
//         await this.client.flushAll();
//     }
//     CreateIndex = async()=>{
//         await this.client.sendCommand([
//             'FT.CREATE', 'idx:event',
//             'ON', 'HASH',
//             'PREFIX', '1', 'event:',
//             'SCHEMA', 'tribe', 'TEXT', 'SORTABLE'
//           ]);
//     }
//     CacheEvents =async (data:{
//         eventList:EventInterface[],
//     })=>{
//         data.eventList.forEach(event=>{
//             const eventId = event.objectId;
//             console.log(eventId)
//             const redisObj =  {
//                 objectId: event.objectId,
//                 isUnderground:event.isUnderground!=undefined? 
//                 event.isUnderground.toString():'false',
//                 publishStatus:event.publishStatus!=undefined?
//                  event.publishStatus.toString():'0', // Convert to string for consistency
//                 pictureThumbnail:event.pictureThumbnail!=undefined?
//                  event.pictureThumbnail:'',
//                 picture: event.picture!=undefined?
//                 event.picture:'',
//                 toDate: event.toDate!=undefined?
//                 JSON.stringify(event.toDate):'', // Assuming toDate is a Date object
//                 reward:event.reward!=undefined?
//                  event.reward:'',
//                 name: event.name!=undefined?
//                 event.name:'',
//                 promotionPackage:event.promotionPackage!=undefined?
//                  event.promotionPackage.toString():'0', // Convert to string for consistency
//                 venueName:event.venueName!=undefined?
//                  event.venueName:'',
//                 latLng:event.latLng!=undefined?
//                  JSON.stringify(event.latLng):'', // Convert to JSON string
//                 fromDate:event.fromDate!=undefined?
//                  JSON.stringify(event.fromDate):'', // Assuming fromDate is a Date object
//                 entryFee: event.entryFee!=undefined?
//                  event.entryFee.toString():'-1', // Convert to string for consistency
//                 ownerId: event.ownerId!=undefined?event.ownerId:'',
//                 urlTicket:event.urlTicket!=undefined?
//                  event.urlTicket:'',
//                 listTags: JSON.stringify(event.listTags!=undefined?
//                     event.listTags:[]), // Convert to JSON string
//                 userCheckinList: JSON.stringify(event.userCheckinList!=undefined?
//                     event.userCheckinList:[]), // Convert to JSON string
//                 listFollowers: JSON.stringify(event.listFollowers!=undefined?
//                     event.listFollowers:[]
//                 ), // Convert to JSON string
//                 listBlocked: JSON.stringify(event.listBlocked!=undefined?event.listBlocked:[]), // Convert to JSON string
//                 tribe: event.tribe!=undefined?
//                 event.tribe:'goa',
//             }
//             //console.log(redisObj);
//             this.client.hSet(`event:${eventId}`,redisObj).then(()=>{
//                 console.log(`write completed for eventId : ${eventId}`)
//               }).catch((err) => {
//                 console.log(redisObj)
//                 console.error('Error occurred:', err);
//               })
//             this.client.expire(`event:${eventId}`,300000000000);
//         })
//         return true
//     }
// }

// export default EventsCacheRedis