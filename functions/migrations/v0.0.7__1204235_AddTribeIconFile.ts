import { MigrateOptions } from "fireway";
import admin from "firebase-admin";
import fs from "fs";
const path = require('path');
export async function migrate({ firestore}: MigrateOptions) {
    let credFile:string
    let projectId:string 
    let storageBucket:string
    credFile = process.env.GOOGLE_APPLICATION_CREDENTIALS!==undefined?process.env.GOOGLE_APPLICATION_CREDENTIALS:""
    projectId = process.env.FIREBASE_APP_PROJECT_ID!==undefined?process.env.FIREBASE_APP_PROJECT_ID:""
    storageBucket = process.env.FIREBASE_APP_STORAGE_BUCKET!==undefined?process.env.FIREBASE_APP_STORAGE_BUCKET:""

    console.log("process ",credFile)
    //const serviceAccount = JSON.parse(credFile)

     fs.readFile(credFile,'utf8',async  (err, data) => {
        if (err) {
          console.error(err);
          return;
        }
        
        // work around authenticating again
        const jsonData = JSON.parse(data);
       // console.log(jsonData);
        admin.initializeApp({
            credential: admin.credential.cert(jsonData),
            projectId: projectId,
            storageBucket: storageBucket,
          });
        //  const bucket = getStorage().bucket();
        const bucketGoa =admin.storage().bucket();    
        const bucketHimachal = admin.storage().bucket();
        const fileGoa = path.join(__dirname,"assets/tribeIcons/goa/PH_Goa_logo.svg");
        const fileHimachal = path.join(__dirname, "assets/tribeIcons/himachal/PH_Himachal_logo.svg");
        const storageFilePathGoa = "icons/tribeIcons/goa/PH_Goa_logo.svg"
        const storageFilePathHimachal = "icons/tribeIcons/himachal/PH_Himachal_logo.svg"
        const bucketFileGoa =bucketGoa.file(storageFilePathGoa);
        const bucketFileHimachal =bucketHimachal.file(storageFilePathHimachal);

       
        await bucketGoa.upload(fileGoa,{
            metadata: {
                contentType: 'image/svg+xml',
              },
              destination:storageFilePathGoa
              
        })
        await bucketHimachal.upload(fileHimachal,{
            metadata: {
                contentType: 'image/svg+xml',
              },
              destination:storageFilePathHimachal
              
        })
        const goaRemoteUrl=await bucketFileGoa.getSignedUrl({
            action: 'read',
            expires: '03-17-2050'
        })
        const himachalRemoteUrl=await bucketFileHimachal.getSignedUrl({
            action: "read",
            expires: '03-17-2050',
        })
       
        await firestore.collection("remote").doc("constants").update({
          //"exp":1
          "listTribes":[
              {
                  googlePlacesFilter:"Goa, India",
                  id:1,
                  lat:15.386,
                  lng:73.844,
                  name:"goa",
                  radius:90,
                  strict:true,
                  tribeIcon:goaRemoteUrl[0]
              },
              {
                  googlePlacesFilter:"Himachal Pradesh, India",
                  id:2,
                  lat:31.968213,
                  lng:77.306771,
                  name:"himachal",
                  radius:360,
                  strict:true,
                  tribeIcon:himachalRemoteUrl[0]
              }
            ]
          
        }).then(()=>{
          console.log(`tribe icon added for goa and himachal`)
        }).catch(errdb=>{
            console.log(`error ocurred as ${errdb}`)
        });
    })
    
  }