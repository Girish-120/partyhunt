import * as functions from "firebase-functions";
import express, { Request, Response } from 'express';
import * as bodyParser from "body-parser";
import { db } from "../..";
import IEventService from "../Interfaces/EventInterfaces/EventService";
import EventService from "../Services/EventService/EventService";
import SecretVariables from "../Helpers/SecretVariables";

const app = express();
const main = express();

main.use("/api/v1", app);
main.use(bodyParser.json());

export const webApi = functions.https.onRequest(main);

app.use((req, res, next) => {
  const bearerHeader = req.headers["authorization"];
  if (bearerHeader) {
    const bearer = bearerHeader.split(" ");
    const bearerToken = bearer[1];
    if (bearerToken === SecretVariables.apiBearerToken) {
      next();
    } else {
      res.sendStatus(401);
    }
  } else {
    // Forbidden
    res.sendStatus(403);
  }
});

app.post("/eventListHomeToday", 
  async (req: Request, res: Response): Promise<Response> => {
  const tribe = req.body.tribe;
  const selectedDate = req.body.selectedDate;
  const isAdmin = req.body.isAdmin;
  console.log(`isAdmin :${isAdmin}`);
  try {
    if (!selectedDate) {
      return res
        .status(400)
        .json({ data: null, error: "selectedDate is required" });
    }

    // Parse the ISO string to a JavaScript Date object
    const date = new Date(selectedDate);

    if (isNaN(date.getTime())) {
      return res
        .status(400)
        .json({ data: null, error: "Invalid selectedDate forma" });
      // return res.status(400).send('Invalid selectedDate format');
    }
    console.log(`tribe :${tribe}, selectedDate :${date}`);
    if (tribe !== undefined && tribe !== "") {
      const iEventService: IEventService = new EventService(db);
      const eventData = await iEventService.GetHomeEvents(tribe, date, isAdmin);
      const diamondData = await iEventService.GetDiamondEvents(tribe);
      console.log(`event Data :${eventData.length}`);
      return res.json({
        data: {
          diamondEvents: diamondData,
          homeEvent: eventData,
          homeEventLength: eventData.length
        },
        error: null
      });
    }
    return res.status(404).json({ data: null, error: "No Data" });
  } catch (err: any) {
    res.status(500);
    return res.json({ error: err.toString() });
  }
});
