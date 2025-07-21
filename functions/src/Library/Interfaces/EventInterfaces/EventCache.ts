import { EventInterface } from "./EventHome";

interface IEventCache {
  CacheEvents: (data: { eventList: EventInterface[] }) => Promise<any>;
  FlushEvents: () => Promise<any>;
  CreateIndex: () => Promise<any>;
}
export default IEventCache;
