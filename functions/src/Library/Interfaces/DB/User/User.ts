interface IUser {
  GetUserById: (userId: string) => Promise<any>;
  UpdateUser: (userId: string, data: any) => Promise<any>;
}
export default IUser;
