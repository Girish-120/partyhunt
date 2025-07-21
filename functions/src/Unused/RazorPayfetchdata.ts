// 1.Fetch Data from razorpay api .
// 2.Write email and phonenumber in excel

// fetch data from razorpay api

import axios from 'axios';
import fs from 'fs';
import papa from "papaparse";

async function fetchRazorpayData() {
    // API call axios
    try{
        const iterables = Array.from(Array(97).keys());
        let jsonResponse:  any[] = [];
        let skip = 0;
        for await (const _ of iterables){
            const url = 'https://api.razorpay.com/v1/payments?from=le&to=1682042394&count=100&skip='+skip;
            const config = {
                method: 'get',
                url: url,
                headers: { 
                'Authorization': ''
                }
            };
            const response =await axios(config);
            jsonResponse=jsonResponse.concat(response.data.items);
            skip=skip+100;
            console.log(`skip : ${skip} successfull with email ${response.data.items[0]["email"]}`);
         }
         return jsonResponse;
        }
        catch(err){
            throw err;
        }
}

async function WriteFile(data:any){
    const razorpayData :any[] = [];
    for (const item of data){
        razorpayData.push({
            "id": item.id,
            "entity": item["entity"],
            "amount": item["amount"],
            "currency": item["currency"],
            "status": item["status"],
            "order_id": item["order_id"],
            "invoice_id": item["invoice_id"],
            "international": item["international"],
            "method": item["method"],
            "amount_refunded": item["amount_refunded"],
            "refund_status": item["refund_status"],
            "captured": item["captured"],
            "description": item["description"],
            "email": item["email"],
            "contact":item["contact"],
            "user_name":item["notes"]["userName"],
            "user_id":item["notes"]["userId"],
            "created_at":item["created_at"]
        });
       
    }
    const csvData = papa.unparse(razorpayData);
    fs.writeFile('paymwntData.csv',csvData,(err)=>{
        if (err)
        throw err;
        return "file written successfully";
    });
}

fetchRazorpayData().then((data)=>{
    WriteFile(data).then(out=>{
        console.log(out);
    }).catch(err=>{
        console.log(`error caught in Write file ${err}`);
    });
    console.log(`fetch data`);
}).catch(err=>{
    console.log(`error caught in fetch function ${err}`);
});