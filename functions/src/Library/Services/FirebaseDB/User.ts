import admin from "firebase-admin";
import IUser from "../../Interfaces/DB/User/User";
class User implements IUser {
  private db: admin.firestore.Firestore;
  constructor(db: admin.firestore.Firestore) {
    this.db = db;
  }
  GetUserById = async (userId: string) => {
    const user = await this.db.collection("users").doc(userId).get();
    return user;
  };
  UpdateUser = async (userId: string, data: any) => {
    await this.db.collection("users").doc(userId).update(data);
  };
}
export default User;
