interface ICheckins {
  UpdateCheckins: (data: {
    objectId: string;
    userId: string;
    eventId: string;
    placeId: string;
  }) => Promise<any>;
}
export default ICheckins;
