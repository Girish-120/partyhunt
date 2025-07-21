interface ITransaction {
  Transaction: (data: any) => Promise<any>;
}

export default ITransaction;
