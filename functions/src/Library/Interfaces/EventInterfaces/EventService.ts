import { EventInterface } from "./EventHome";

interface IEventService {
  GetDiamondEvents: (tribe: String) => Promise<EventInterface[]>;
  GetHomeEvents: (
    tribe: String,
    selectedDate: Date,
    isAdmin: boolean
  ) => Promise<EventInterface[]>;
}

export default IEventService;
