// Create Interfaces for abstraction and using DI (Dependency Injection)
interface IPaymentResponse {
  success: boolean;
  data: any;
  message: string;
}
interface IPaymentGetData {
  isExist: boolean;
  data: any;
  message: string;
}
interface IPayments {
  CreatePaymentUser: (data: {
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
  }) => Promise<IPaymentResponse>;

  GetPaymentUser: (data: {
    userId: any;
    razorPayEventId: any;
  }) => Promise<IPaymentGetData>;

  CreatePaymentEvent: (data: {
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
  }) => Promise<IPaymentResponse>;

  GetPaymentEvent: (data: {
    userId: any;
    eventId: any;
    razorPayEventId: any;
  }) => Promise<IPaymentGetData>;
  UpdatePayment: (pId: string, data: any) => Promise<any>;
}

export default IPayments;
