interface IBatchUpdate {
  BatchUpdate: (data: {
    payload: any;
    chunk: number;
    collectionName: string;
    objectId: string;
  }) => Promise<any>;
}

export default IBatchUpdate;
