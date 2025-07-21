"use strict";
// import Razorpay from 'razorpay'
// const rzp = new Razorpay({
//   key_id: process.env.KEY_ID, // your `KEY_ID`
//   key_secret: process.env.KEY_SECRET // your `KEY_SECRET`
// })
// // --------------------
// // Payments
// // --------------------
// // Fetches all payments
// rzp.payments.all({
//   from: 'Aug 25, 2016',
//   to: 'Aug 30, 2016'
// }).then((_data: any) => {
//   // console.log(data)
// }).catch((_error: any) => {
//   // console.error(error)
// })
// // Fetch a particular payment
// rzp.payments.fetch('pay_6CnVGA5eq4D7Ce').then((_data: any) => {
//   // success
// }).catch((_error: any) => {
//   // failure
// })
// // Capture a particular payment
// rzp.payments.capture('pay_6CnVGA5eq4D7Ce', 1000).then((_data: any) => {
//   // success
// }).catch((_error: any) => {
//   // error
// })
// // Full refund for a payment
// rzp.payments.refund('pay_6CnTwKKUY8iKCU').then((_data: any) => {
//   // success
// }).catch((_error: any) => {
//   // error
// })
// // Partial refund for a payment
// rzp.payments.refund('pay_6CnVGA5eq4D7Ce', {
//   amount: 500,
//   notes: {
//     note1: 'This is a test refund',
//     note2: 'This is a test note'
//   }
// }).then((_data: any) => {
//   // success
// }).catch((error: any) => {
//   console.error(error)
//   // error
// })
// // -------------------------
// // Customers
// // -------------------------
// rzp.customers.create({
//   name: 'selvagsz',
//   email: 'test@razorpay.com',
//   contact: '123456789'
// }).then((_data: any) => {
//   // console.log(data)
// }).catch((_error: any) => {
//   // error
// })
// rzp.customers.edit('cust_6fpspJYDovP0Tg', {
//   name: 'selvagsz',
//   email: 'test@razorpay.com',
//   contact: '987654321'
// }).then((_data: any) => {
//   // console.log(data)
// }).catch((_error: any) => {
//   // error
// })
// rzp.customers.fetch('cust_6fpspJYDovP0Tg').then((_data: any) => {
//   // console.log(data)
// }).catch((_error: any) => {
//   // error
// })
// rzp.customers.fetchTokens('cust_6fpspJYDovP0Tg').then((_data: any) => {
//   // console.log(data)
// }).catch((_error: any) => {
//   // error
// })
// rzp.customers.fetchToken('cust_6fpspJYDovP0Tg', 'tkn_YDovP0Tg6fpsp').then((_data: any) => {
//   // console.log(data)
// }).catch((_error: any) => {
//   // error
// })
// rzp.customers.deleteToken('cust_6fpspJYDovP0Tg', 'tkn_YDovP0Tg6fpsp').then((_data: any) => {
//   // console.log(data)
// }).catch((_error: any) => {
//   // error
// })
// // -------------------------
// // Orders
// // -------------------------
// rzp.orders.all({
//   from: 'Aug 25, 2016',
//   to: 'Dec 30, 2016',
//   count: 25
// }).then((_data: any) => {
//   // console.log(data)
// }).catch((_error: any) => {
//   // console.error(error)
// })
// rzp.orders.fetchPayments('order_6kWIxkrdH3hJWM').then((_data: any) => {
//   // console.log(data)
// }).catch((_error: any) => {
//   // error
// })
// // -------------------------
// // Transfers
// // -------------------------
// // Fetch all transfers
// rzp.transfers.all({
//   from: 'Aug 25, 2016',
//   to: 'Dec 30, 2016',
//   count: 25
// }).then((_data: any) => {
//   // console.log(data)
// }).catch((_error: any) => {
//   // console.error(error)
// })
// // Fetch all transfers made on a specific payment
// rzp.transfers.all({
//   from: 'Aug 25, 2016',
//   to: 'Dec 30, 2016',
//   count: 25,
//   payment_id: 'pay_6CnVGA5eq4D7Ce'
// }).then((_data: any) => {
//   // console.log(data)
// }).catch((_error: any) => {
//   // console.error(error)
// })
// // Fetch a particular transfer by ID
// rzp.transfers.fetch('trf_714iNLGsd7k36a').then((_data: any) => {
//   // console.log(data)
// }).catch((_error: any) => {
//   // console.error(error)
// })
// // Edit transfer
// rzp.transfers.edit('trf_714iNLGsd7k36a', {
//   notes: {
//     note1: 'This is a test note'
//   }
// }).then((_data: any) => {
//   // console.log(data)
// }).catch((_error: any) => {
//   // console.error(error)
// })
// // Create a transfer reversal
// rzp.transfers.reverse('trf_714iNLGsd7k36a', {
//   amount: 200,
//   currency: 'INR',
//   notes: {
//     note1: 'This is a test note'
//   }
// }).then((_data: any) => {
//   // console.log(data)
// }).catch((_error: any) => {
//   // console.error(error)
// })
// // Create direct transfers
// rzp.transfers.create({
//   account: 'acc_7HGyrafdeQDGfX',
//   amount: 100,
//   currency: 'INR'
// }).then((_data: any) => {
//   // console.log(data)
// }).catch((_error: any) => {
//   // console.error(error)
// })
// // Create transfers on a payment
// rzp.payments.transfer('pay_6CnVGA5eq4D7Ce', {
//   transfers: [
//     {
//       account: 'acc_7HGyrafdeQDGfX',
//       amount: 100,
//       currency: 'INR'
//     }
//   ]
// }).then((_data: any) => {
//   // console.log(data)
// }).catch((_error: any) => {
//   // console.error(error)
// }) 
//# sourceMappingURL=RazorpayTriggers.js.map