import { MigrateOptions } from "fireway";
export async function migrate({ firestore }: MigrateOptions) {
  await firestore.collection("remote").doc("constants").update({
    "boostFeatures":[
        {
            availableInBoosts:["Basic","Silver","Gold","Diamond"],
            code:101,
            header:"Basic Publish",
            moreInfo:"Your event will be live once approved by our admin team. For instant approval, choose another boost.",
            specialOfBoost:"Basic"
        },
        {
            availableInBoosts:["Silver","Gold","Diamond"],
            code:101,
            header:"Higher Ranking",
            moreInfo:"Improved ranking on the home screen and more exposure to the users through different sections of the app.",
            specialOfBoost:"Silver"
        },
        {
            availableInBoosts:["Silver","Gold","Diamond"],
            code:201,
            header:"Instant Approval",
            moreInfo:"Event will be immediately live on the app without any delay.",
            specialOfBoost:"Silver"
        },
        {
            availableInBoosts:["Gold","Diamond"],
            code:301,
            header:"Social Media Marketing",
            moreInfo:"Event featured on Party Hunt Facebook page and Instagram stories on the event day. Artist & venue profiles will be tagged.",
            specialOfBoost:"Gold"
        },
        {
            availableInBoosts:["Gold","Diamond"],
            code:401,
            header:"Top Banner",
            moreInfo:"Event featured on top banner of the home screen on the day of the event.",
            specialOfBoost:"Gold"
        },
        {
            availableInBoosts:["Diamond"],
            code:501,
            header:"7-Days Banner",
            moreInfo:"Event featured on Party Hunt Facebook page and Instagram stories on the event day. Artist & venue profiles will be tagged.",
            specialOfBoost:"Diamond"
        },
        {
            availableInBoosts:["Diamond"],
            code:502,
            header:"Reminder Notification",
            moreInfo:"All Party Hunt users will be notified through App Notification, a day before the event",
            specialOfBoost:"Diamond"
        }
    ],
    "boostPlans":[
        {
            boostType:"Basic",
            code:0,
            features:[101],
            price:0
        },
        {
            boostType:"Silver",
            code:10,
            features:[102],
            price:299
        },
        {
            boostType:"Gold",
            code:30,
            features:[103],
            price:799
        },
        {
            boostType:"Diamond",
            code:40,
            features:[104],
            price:3499
        }
    ],
    "listTribes":[
        {
            googlePlacesFilter:"Goa, India",
            id:1,
            lat:15.386,
            lng:73.844,
            name:"Goa",
            radius:"90",
            strict:true
        },
        {
            googlePlacesFilter:"Himachal Pradesh, India",
            id:2,
            lat:31.968213,
            lng:77.306771,
            name:"Himachal",
            radius:"360",
            strict:true
        }
    ]
  }).then(()=>{
    console.log(`keys boostFeatures , boostPlans , listTribes added`)
  }).catch(err=>{
      console.log(`error ocurred as ${err}`)
  });
}