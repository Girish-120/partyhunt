import { db } from "../..";
import axios from "axios";
import * as functions from "firebase-functions";
import * as helperFunctions from "../Helpers/Functions";
import * as Constants from "../Helpers/Constants";
import { firestore } from "firebase-admin"; //admin,
import IBatchUpdate from "../Interfaces/DB/Transactions/batchUpdates";
import FirebaseTransaction from "../Services/FirebaseDB/Transaction/BatchUpdates";
import SecretEnvKeys from "../Helpers/SecretVariables";

export const cron_monthly_placeData_refetch = functions
  .runWith(Constants.runTimeOptionsLong)
  .pubsub.schedule("0 0 1 * *") //0 0 1 * *
  .timeZone(Constants.timezone)
  .onRun(async (_context) => {
    try {
      // Fetch place Data
      console.log(`place refetch starts`);
      const db_places = await db.collection("places").get();
      console.log(`database fetched`);
      const place_data: {
        place_id: any;
        rating: any;
        address: any;
        area: any;
        country: any;
        editedAt: any;
        fixedLocality: any;
        locality: any;
        name: any;
        phone: any;
        state: any;
        types: any;
        icon: any;
        latlng: any;
        doc_id: any;
        photos: any;
        appName: any;
        createdAt: any;
        countFollowers: any;
        listFollowers: any;
        listIndexes: any;
        promotionsSubscription: any;
        publishStatus: any;
      }[] = [];
      db_places.forEach((data: { data: () => any }) => {
        const place = data.data();
        place_data.push({
          place_id: place.idPlace,
          rating: place.rating,
          address: place.address,
          countFollowers:
            place.countFollowers !== undefined ? place.countFollowers : 0,
          listFollowers:
            place.listFollowers !== undefined ? place.listFollowers : [],
          listIndexes: place.listIndexes !== undefined ? place.listIndexes : [],
          promotionsSubscription:
            place.promotionsSubscription !== undefined
              ? place.promotionsSubscription
              : 0,
          publishStatus:
            place.publishStatus !== undefined ? place.publishStatus : 1,
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
          appName:
            place.appName === undefined ||
            place.appName === null ||
            place.appName === ""
              ? "partyhunt"
              : place.appName,
          createdAt:
            place.createdAt === undefined ? new Date() : place.createdAt
        });
      });
      console.log(`counted place data ${place_data.length}`);
      // const remoteConstants = await Constants.Constants()

      // Make
      const dbPayload: any[] = [];
      await helperFunctions.asyncForEach(place_data, async (item) => {
        // make async api call

        console.log(`fetching maps data for place id ${item.place_id}`);
        const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${item.place_id}&key=${SecretEnvKeys.googleMapApiKey}`;
        const response = await axios.get(url);
        const data = response.data;
        if (data.status !== undefined && data.status === "NOT_FOUND") {
          console.log("errors from map ..... skipping");
        } else {
          // initiallizing required variable
          let area = "";
          let state = "";
          let fixed_locality = "";
          let country = "";
          const address =
            data.result.formatted_address !== undefined
              ? data.result.formatted_address.split(", ").slice(1).join(", ")
              : item.address;
          const locality =
            data.result.vicinity !== undefined
              ? data.result.vicinity.split(", ").slice(1).join(", ")
              : item.locality;

          const photos =
            data.result.photos !== undefined || data.result.photos.length > 0
              ? data.result.photos.map((m: { photo_reference: any }) => {
                  return m.photo_reference;
                })
              : item.photos;
          const rating =
            data.result.rating === undefined ? item.rating : data.result.rating;
          const icon =
            data.result.icon === undefined ? item.icon : data.result.icon;
          const types =
            data.result.types === undefined ? item.types : data.result.types;
          const phone_numer =
            data.result.international_phone_number === undefined
              ? item.phone
              : data.result.international_phone_number;
          const name =
            data.result.name === undefined ? item.name : data.result.name;
          const latlng = new firestore.GeoPoint(
            data.result.geometry.location.lat,
            data.result.geometry.location.lng
          );
          data.result.address_components.forEach(
            (el: { types: any[]; long_name: string }) => {
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
            }
          );
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
      });

      // Batch Write
      // Dividing batch for 500 maximum limit for firebase to write document in batch

      const iTransaction: IBatchUpdate = new FirebaseTransaction(db);
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
    } catch (err) {
      // send notification if error
      // helperFunctions.send_wati_notification()
      // Later either through mail or wati
      console.log("error logged with error" + err);
    }
  });
