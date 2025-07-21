import { MigrateOptions } from "fireway";
export async function migrate({ firestore }: MigrateOptions) {
  await firestore.collection("remote").doc("constants").update({
   "zoho":{
     "admin":{email:"",role:"",userId:"",userName:""},
     "authUrl":"",
     "clientId":"",
     "clientSecret":"",
     "currencyId":"",
     "hsnOrSac":"",
     "organisationId":"",
     "redirectUri":"",
     "refreshToken":"",
     "url":""
    }
  }).then(()=>{
    console.log(`Zoho Creds fields added`)
  }).catch(err=>{
      console.log(`error ocurred as ${err}`)
  });
}