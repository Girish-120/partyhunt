import admin from "firebase-admin";
import IPayment from "../../Interfaces/DB/Payments/payments";
class Payment implements IPayment {
  private db: admin.firestore.Firestore;
  constructor(db: admin.firestore.Firestore) {
    this.db = db;
  }
  CreatePaymentUser = async (data: {
    userId: any;
    razorPayEventId: any;
    razorPayStatus: any;
    dateExpiry: any;
    datePaid: any;
    dateStart: any;
    orderId: any;
    paymentId: any;
    pricePaid: any;
    updatedBy: any;
    validDays: any;
    tribe: any;
    notesArray: any;
    isInvoice: any;
    invoice: any;
  }) => {
    try {
      const ugPaymentUserDoc = {
        dateExpiry: data.dateExpiry,
        datePaid: data.datePaid,
        dateStart: data.dateStart,
        orderId: data.orderId,
        pricePaid: data.pricePaid,
        updatedBy: data.updatedBy,
        validDays: data.validDays
      };
      let invoice = {};
      if (data.invoice) {
        invoice = {
          date: data.invoice["zoho.invoice.date"],
          gstNo: data.invoice["zoho.invoice.gstNo"],
          gstTreatment: data.invoice["zoho.invoice.gstTreatment"],
          invoiceId: data.invoice["zoho.invoice.invoiceId"],
          invoiceNumber: data.invoice["zoho.invoice.invoiceNumber"],
          placeOfSupply: data.invoice["zoho.invoice.placeOfSupply"],
          subTotal: data.invoice["zoho.invoice.subTotal"],
          taxSpecification: data.invoice["zoho.invoice.taxSpecification"],
          taxTotal: data.invoice["zoho.invoice.taxTotal"],
          total: data.invoice["zoho.invoice.total"]
        };
      }
      await this.db
        .collection("payments")
        .doc(data.userId + data.razorPayEventId)
        .create({
          pId: data.userId + data.razorPayEventId,
          userId: data.userId,
          isUG: true,
          paymentId: data.paymentId,
          isEvent: false,
          razorPayEventId: data.razorPayEventId,
          razorPayStatus: data.razorPayStatus,
          eventId: "",
          createdAt: new Date(),
          tribe: data.tribe,
          ugPaymentInfo: ugPaymentUserDoc,
          eventBoost: {},
          notesArray: data.notesArray,
          isInvoice: data.isInvoice,
          invoice: invoice
        });
      return {
        success: true,
        data: data,
        message: `payment record created for user id  :${data.userId}`
      };
    } catch (err) {
      console.log(
        `thrown error create user payment for user id  :${data.userId} : ${err}`
      );
      throw err;
    }
  };

  GetPaymentUser = async (data: { userId: any; razorPayEventId: any }) => {
    try {
      const dbResponse = await this.db
        .collection("payments")
        .doc(data.userId + data.razorPayEventId)
        .get();
      // Collection doesnt exist can be treated as success ==true
      if (dbResponse === undefined) {
        return {
          isExist: false,
          data: {},
          message: "ug payments not created"
        };
      }
      if (dbResponse.exists) {
        const response = dbResponse.data()!;
        return {
          isExist: true,
          data: response,
          message: "ug payments already exist"
        };
      } else {
        return {
          isExist: false,
          data: {},
          message: "ug payments do not exist"
        };
      }
    } catch (err) {
      console.log(
        `thrown error get user payment for user id  :${data.userId} : ${err}`
      );
      throw err;
    }
  };

  CreatePaymentEvent = async (data: {
    userId: any;
    eventId: any;
    razorPayEventId: any;
    razorPayStatus: any;
    promotionPackage: any;
    pricePaid: any;
    paymentId: any;
    updatedBy: any;
    tribe: any;
    notesArray: any;
    isInvoice: any;
    invoice: any;
  }) => {
    try {
      const paymentEventDoc = {
        promotionPackage: data.promotionPackage,
        updatedBy: data.updatedBy,
        pricePaid: data.pricePaid
      };
      let invoice = {};
      if (data.invoice) {
        invoice = {
          date: data.invoice["zoho.invoice.date"],
          gstNo: data.invoice["zoho.invoice.gstNo"],
          gstTreatment: data.invoice["zoho.invoice.gstTreatment"],
          invoiceId: data.invoice["zoho.invoice.invoiceId"],
          invoiceNumber: data.invoice["zoho.invoice.invoiceNumber"],
          placeOfSupply: data.invoice["zoho.invoice.placeOfSupply"],
          subTotal: data.invoice["zoho.invoice.subTotal"],
          taxSpecification: data.invoice["zoho.invoice.taxSpecification"],
          taxTotal: data.invoice["zoho.invoice.taxTotal"],
          total: data.invoice["zoho.invoice.total"]
        };
      }

      await this.db
        .collection("payments")
        .doc(data.userId + data.razorPayEventId)
        .create({
          pId: data.userId + data.razorPayEventId,
          userId: data.userId,
          paymentId: data.paymentId,
          isUG: false,
          isEvent: true,
          razorPayEventId: data.razorPayEventId,
          razorPayStatus: data.razorPayStatus,
          eventId: data.eventId,
          createdAt: new Date(),
          ugPaymentInfo: {},
          tribe: data.tribe,
          eventBoost: paymentEventDoc,
          notesArray: data.notesArray,
          isInvoice: data.isInvoice,
          invoice: invoice
        });
      return {
        success: true,
        data: data,
        message: `payment record created for event id  :${data.eventId}`
      };
    } catch (err) {
      console.log(
        `thrown error create event payment for event id  :${data.eventId} : ${err}`
      );
      throw err;
    }
  };

  GetPaymentEvent = async (data: {
    userId: any;
    eventId: any;
    razorPayEventId: any;
  }) => {
    try {
      const dbResponse = await this.db
        .collection("payments")
        .doc(data.userId + data.razorPayEventId)
        .get();

      // Collection doesnt exist can be treated as success ==true
      if (dbResponse === undefined) {
        return {
          isExist: false,
          data: {},
          message: "events payments not created"
        };
      }
      if (dbResponse.exists) {
        const response = dbResponse.data()!;
        return {
          isExist: true,
          data: response,
          message: "events payments already exist"
        };
      } else {
        return {
          isExist: false,
          data: {},
          message: "events payments do not exist"
        };
      }
    } catch (err) {
      console.log(
        `thrown error get event payment for event id  :${data.eventId} : ${err}`
      );
      throw err;
    }
  };

  UpdatePayment = async (pId: string, data: any) => {
    await this.db.collection("payments").doc(pId).update(data);
  };
}

export default Payment;
