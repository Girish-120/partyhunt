import * as Constants from "./Constants";
import { google } from "googleapis";

// Google Sheet
// Todo - Service Account is also used in index. Refactor it.
const serviceAccount1 = require("../../../src/JSONs/serviceAccountKey_" +
  Constants.projectKey +
  ".json");

// Function used to export data to spreadsheet
export async function export_to_spreadsheet(
  finalData: any[],
  sheetName: string
) {
  const jwtClient = new google.auth.JWT({
    email: serviceAccount1.client_email,
    key: serviceAccount1.private_key,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"]
  });

  await jwtClient.authorize(); //jwtAuthPromise = jwtClient.authorize()
  await google.sheets("v4").spreadsheets.values.append({
    // sheets = google.sheets("v4")
    auth: jwtClient,
    spreadsheetId: Constants.spreadsheetId, //MOVED to ENV - "1UWe7-BwCQGkFwCk239vd65FsyGsMNMLLuidiZ0gFics"
    range: sheetName + `!A2`, //:E2 (Not necessary to mention the end range cell)
    valueInputOption: "RAW",
    requestBody: { values: [finalData], majorDimension: "ROWS" }
  });
  console.log("Successfully Exported to Sheet - " + sheetName);
}
