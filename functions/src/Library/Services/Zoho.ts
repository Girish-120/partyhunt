import Http from "./HTTP";
import admin, { firestore } from "firebase-admin";
import { v4 as uuidv4 } from "uuid";
import ITransaction from "../Interfaces/DB/Transactions/transaction";
import SecretVariables from "../Helpers/SecretVariables";

class ZohoInvoice implements ITransaction {
  private accessToken: String | undefined;
  private db: admin.firestore.Firestore;
  private userRef: firestore.DocumentReference<firestore.DocumentData>;
  remoteConstants: any;
  Http: Http;
  constructor(
    remoteConstants: any,
    db: admin.firestore.Firestore,
    userRef: firestore.DocumentReference<firestore.DocumentData>
  ) {
    this.remoteConstants = remoteConstants;
    this.Http = new Http();
    this.db = db;
    this.userRef = userRef;
  }
  private CreateAccessToken = async () => {
    const url = `${this.remoteConstants.zoho.authUrl}/oauth/v2/token?refresh_token=${SecretVariables.zohoRefreshToken}&client_id=${SecretVariables.zohoClientId}&client_secret=${SecretVariables.zohoClientSecret}&redirect_uri=${this.remoteConstants.zoho.redirectUri}&grant_type=refresh_token`;
    const response = await this.Http.PostRequest(url, {}, {});
    console.log(`create access token; - ,${url} , ${response.data}`);
    if (response.status === 200) {
      this.accessToken = response.data.access_token;
      console.log(
        `created access token ${response.data.access_token} , ${this.accessToken}`
      );
    } else {
      console.log(`response ${response.data}`);
      this.accessToken = "";
    }
  };

  // Step Mark invoice as sent

  private MarkInvoiceAsSent = async (invoiceId: string) => {
    try {
      const url = `${this.remoteConstants.zoho.url}/books/v3/invoices/${invoiceId}/status/sent?organization_id=${this.remoteConstants.zoho.organisationId}`;
      let response = await this.Http.PostRequest(
        url,
        {},
        {
          headers: {
            "Content-type": "application/json",
            Authorization: `Zoho-oauthtoken ${this.accessToken}`
          }
        }
      );
      if (response.status === 403) {
        await this.CreateAccessToken();
        response = await this.Http.PostRequest(
          url,
          {},
          {
            headers: {
              "Content-type": "application/json",
              Authorization: `Zoho-oauthtoken ${this.accessToken}`
            }
          }
        );
      }
      if (response.status === 200) {
        return {
          success: true,
          data: invoiceId,
          message: "invoice marked as sent"
        };
      } else {
        return undefined;
      }
    } catch (err) {
      console.log(`error in marking as sent`);
      throw err;
    }
  };

  // Step 4
  private CreateInvoice = async (
    transaction: firestore.Transaction,
    data: {
      customerId: any;
      placeOfSupply: undefined;
      gstNo: undefined;
      itemId: any;
      projectId: any;
      lineItemName: any;
      amount: any;
      taxId: any;
    }
  ) => {
    try {
      // Create invoice
      console.log("Create invoice ");
      const url = `${this.remoteConstants.zoho.url}/books/v3/invoices?organization_id=${this.remoteConstants.zoho.organisationId}`;
      // Get all invoices and take the latest
      console.log("Get all invoices and take the latest");
      let response = await this.Http.GetRequest(url, {
        headers: {
          Authorization: `Zoho-oauthtoken ${this.accessToken}`
        }
      });
      if (response.status === 403) {
        await this.CreateAccessToken();
        response = await this.Http.GetRequest(url, {
          headers: {
            "Content-type": "application/json",
            Authorization: `Zoho-oauthtoken ${this.accessToken}`
          }
        });
      }
      let invoiceNumber: any;
      if (response.status === 200) {
        if (response.data.invoices.length > 0) {
          // check invoice number doesnt contains b2binvoice number
          const b2bRegexFormat = /^INV\/\d{2}-\d{2}\/[A-Z]-\d{3,4}$/;
          for (const invoice of response.data.invoices) {
            if (!b2bRegexFormat.test(invoice.invoice_number)) {
              invoiceNumber = invoice.invoice_number;
              break;
            }
          }
          console.log(`b2c latest invoice number : ${invoiceNumber}`);

          //const latestInvoice = response.data.invoices[0]
          //invoiceNumber = latestInvoice.invoice_number
          const invoiceArray = invoiceNumber.split("-");
          const incrementedInvoiceNum = String(
            parseInt(invoiceArray[1]) + 1
          ).padStart(invoiceArray[1].length, "0");
          invoiceNumber = `${invoiceArray[0]}-${incrementedInvoiceNum}`;
        } else {
          invoiceNumber = "INV23-000001";
        }
        const today = new Date();
        const day = today.getDate();
        const month = today.getMonth() + 1; // Months are zero-indexed, so add 1
        const year = today.getFullYear();
        const date = `${year}-${month < 10 ? "0" : ""}${month}-${
          day < 10 ? "0" : ""
        }${day}`;
        // calculate rate for gst treating gst as 18 %:

        const amount = this.CalculateGST(data.amount, 18);
        const payload = {
          customer_id: data.customerId,
          currency_id: this.remoteConstants.zoho.currencyId,
          invoice_number: invoiceNumber,
          place_of_supply:
            data.placeOfSupply !== undefined ? data.placeOfSupply : "GA",
          gst_no: data.gstNo !== undefined ? data.gstNo : "",
          gst_treatment: data.gstNo !== undefined ? "business_gst" : "consumer",
          date: date,
          payment_terms_label: "Due on reciept",
          due_date: date,
          is_inclusive_tax: false,
          exchange_rate: 1,
          line_items: [
            {
              item_id: data.itemId,
              project_id: data.projectId,
              time_entry_ids: [],
              product_type: "service",
              hsn_or_sac: this.remoteConstants.zoho.hsnOrSac,
              expense_id: " ",
              expense_receipt_name: " ",
              name: data.lineItemName,
              rate: amount,
              discount: 0,
              tax_id: data.taxId,
              tax_name: "GST",
              tax_type: "tax",
              tax_percentage: 18,
              header_name: "Software"
            }
          ],
          payment_options: {
            payment_gateways: [
              {
                configured: true,
                additional_field1: "standard",
                gateway_name: "razorpay"
              }
            ]
          },
          notes: "Thank you for your payment. Happy Hunting !",
          terms: "Terms & Conditions apply"
        };
        console.log("creating the invoice", JSON.stringify(payload));
        response = await this.Http.PostRequest(url, payload, {
          headers: {
            "Content-type": "application/json",
            Authorization: `Zoho-oauthtoken ${this.accessToken}`
          }
        });
        if (response.status === 403) {
          await this.CreateAccessToken();
          response = await this.Http.PostRequest(url, payload, {
            headers: {
              "Content-type": "application/json",
              Authorization: `Zoho-oauthtoken ${this.accessToken}`
            }
          });
        }
        if (response.status === 201) {
          // Save Invoice to user
          // Update User
          console.log("invoice created");
          const userUpdateData = {
            "zoho.invoice.invoiceId": response.data.invoice.invoice_id,
            "zoho.invoice.invoiceNumber": response.data.invoice.invoice_number,
            "zoho.invoice.date": response.data.invoice.date,
            "zoho.invoice.placeOfSupply": response.data.invoice.place_of_supply,
            "zoho.invoice.subTotal": response.data.invoice.sub_total,
            "zoho.invoice.taxTotal": response.data.invoice.tax_total,
            "zoho.invoice.total": response.data.invoice.total,
            "zoho.invoice.taxSpecification":
              response.data.invoice.tax_specification,
            "zoho.invoice.gstNo": response.data.invoice.gst_no,
            "zoho.invoice.gstTreatment": response.data.invoice.gst_treatment
          };
          transaction.update(this.userRef, userUpdateData);
          console.log("invoice returned");
          return {
            success: true,
            data: userUpdateData,
            message: "user is updated with zoho invoice"
          };
        } else {
          return undefined;
        }
      } else {
        return undefined;
      }
    } catch (err) {
      throw err;
    }
  };

  // Step 3 Create Line Items if Not exist

  private CreateLineItems = async (amount: number, name: string) => {
    try {
      // Check the line and see the it matches with razorpay payload
      // Get Line items
      let url = `${this.remoteConstants.zoho.url}/books/v3/items?organization_id=${this.remoteConstants.zoho.organisationId}`;
      let response = await this.Http.GetRequest(url, {
        headers: {
          Authorization: `Zoho-oauthtoken ${this.accessToken}`
        }
      });
      if (response.status === 403) {
        await this.CreateAccessToken();
        response = await this.Http.GetRequest(url, {
          headers: {
            Authorization: `Zoho-oauthtoken ${this.accessToken}`
          }
        });
      }
      if (response.status === 200) {
        // Check that response for existing line items
        const matchLineItems = response.data.items.filter(
          (f: { name: string }) => {
            return f.name === name;
          }
        );
        // Create line item if matchLineItems is empty
        if (matchLineItems.length === 0) {
          const payload = {
            name: name,
            rate: amount,
            description: `line item for ${name}`,
            product_type: "service",
            hsn_or_sac: this.remoteConstants.zoho.hsnOrSac,
            is_taxable: true,
            item_type: "sales",
            sku: name
          };
          response = await this.Http.PostRequest(url, payload, {
            headers: {
              Authorization: `Zoho-oauthtoken ${this.accessToken}`
            }
          });
          if (response.status === 403) {
            await this.CreateAccessToken();
            response = await this.Http.PostRequest(url, payload, {
              headers: {
                Authorization: `Zoho-oauthtoken ${this.accessToken}`
              }
            });
          }
          if (response.status === 200) {
            return {
              success: true,
              data: response.data.item,
              message: "line amount is updated"
            };
          } else if (response.status === 201) {
            return {
              success: true,
              data: response.data.item,
              message: "line amount is added"
            };
          } else {
            return undefined;
          }
        } else {
          // Check if amount is same if not Change the amount in line items
          const matchedItem = matchLineItems[0];
          if (matchedItem.rate !== amount) {
            const payload = {
              name: matchedItem.name,
              rate: amount
            };
            // update line item
            url = `${this.remoteConstants.zoho.url}/books/v3/items/${matchedItem.item_id}?organization_id=${this.remoteConstants.zoho.organisationId}`;
            response = await this.Http.PutRequest(url, payload, {
              headers: {
                Authorization: `Zoho-oauthtoken ${this.accessToken}`
              }
            });
            if (response.status === 403) {
              await this.CreateAccessToken();
              response = await this.Http.PutRequest(url, payload, {
                headers: {
                  Authorization: `Zoho-oauthtoken ${this.accessToken}`
                }
              });
            }
            if (response.status === 200) {
              return {
                success: true,
                data: response.data.item,
                message: "line amount is updated"
              };
            } else if (response.status === 201) {
              return {
                success: true,
                data: response.data.item,
                message: "line amount is added"
              };
            } else {
              return undefined;
            }
          } else {
            return {
              success: true,
              data: matchedItem,
              message: "line amount is fetched"
            };
          }
        }
      } else {
        return undefined;
      }
    } catch (err) {
      throw err;
    }
  };
  // // Step 2 Create Project
  private CreateProject = async (
    transaction: firestore.Transaction,
    userUpdateData: any
  ) => {
    try {
      console.log("create zoho project payload");
      const url = `${this.remoteConstants.zoho.url}/books/v3/projects?organization_id=${this.remoteConstants.zoho.organisationId}`;
      const payloadData = {
        project_name:
          "PH Invoice user " +
          userUpdateData["zoho.customer.customerId"] +
          uuidv4(),
        customer_id: userUpdateData["zoho.customer.customerId"],
        currency_id: this.remoteConstants.zoho.currencyId,
        description: "ph invoice project",
        billing_type: "based_on_task_hours",
        rate: " ",
        budget_type: " ",
        budget_hours: " ",
        budget_amount: " ",
        user_id: this.remoteConstants.zoho.admin.userId,
        tasks: [
          {
            task_name: "invoice create",
            description: "create invoice"
          }
        ],
        users: [
          {
            user_id: this.remoteConstants.zoho.admin.userId,
            is_current_user: true,
            user_name: this.remoteConstants.zoho.admin.userName,
            email: this.remoteConstants.zoho.admin.email,
            user_role: this.remoteConstants.zoho.admin.role,
            status: "active"
          }
        ]
      };
      console.log(`zoho project creation`);
      let response = await this.Http.PostRequest(url, payloadData, {
        headers: {
          "Content-type": "application/json",
          Authorization: `Zoho-oauthtoken ${this.accessToken}`
        }
      });
      if (response.status === 403) {
        // access token is expired retrying it
        await this.CreateAccessToken();
        response = await this.Http.PostRequest(url, payloadData, {
          headers: {
            "Content-type": "application/json",
            Authorization: `Zoho-oauthtoken ${this.accessToken}`
          }
        });
      }
      if (response.status === 400) {
        //access token is expired retrying it
        //await this.CreateAccessToken()
        console.log(
          `error response for project ${JSON.stringify(response.data)}`
        );
        return undefined;
      }
      if (response.status === 201) {
        transaction.update(this.userRef, {
          "zoho.customer.projectId": response.data.project["project_id"],
          "zoho.customer.projectName": response.data.project["project_name"]
        });
        userUpdateData["zoho.customer.projectId"] =
          response.data.project["project_id"];
        userUpdateData["zoho.customer.projectName"] =
          response.data.project["project_name"];
        return {
          success: true,
          data: userUpdateData,
          message: "user is updated for project with zoho customer"
        };
      } else {
        return undefined;
      }
    } catch (err) {
      throw err;
    }
  };

  // Step 1 Create Zoho User
  private CreateZohoUser = async (
    transaction: firestore.Transaction,
    name: string,
    gstNo?: string,
    placeOfcontact?: string
  ) => {
    try {
      const url = `${this.remoteConstants.zoho.url}/books/v3/contacts?organization_id=${this.remoteConstants.zoho.organisationId}`;
      const payloadData = {
        contact_name: name,
        company_name: "partyhunt",
        website: "https://partyhunt.com",
        language_code: "en",
        contact_type: "customer",
        customer_sub_type: "business",
        payment_terms_label: "Due on Receipt",
        notes: "Payment option : Online",
        place_of_contact: gstNo !== undefined ? placeOfcontact : "GA",
        gst_no: gstNo !== undefined ? gstNo : "",
        gst_treatment: gstNo !== undefined ? "business_gst" : "consumer",
        currency_id: this.remoteConstants.zoho.currencyId
      };
      //console.log("payload data : ",userData.name)
      // create access token
      //console.log("error to point in axios ",url,this.accessToken,JSON.stringify(payloadData))
      console.log("creating zoho user ");

      let response = await this.Http.PostRequest(url, payloadData, {
        headers: {
          "Content-type": "application/json",
          Authorization: `Zoho-oauthtoken ${this.accessToken}`
        }
      });
      if (response.status === 403) {
        // access token is expired retrying it
        await this.CreateAccessToken();
        response = await this.Http.PostRequest(url, payloadData, {
          headers: {
            "Content-type": "application/json",
            Authorization: `Zoho-oauthtoken ${this.accessToken}`
          }
        });
      }
      if (response.status === 201) {
        // entity created
        // Update User
        console.log("3. created customer");
        const userUpdateData = {
          "zoho.customer.customerId": response.data.contact.contact_id,
          "zoho.customer.paymentTermsLabel": payloadData.payment_terms_label,
          "zoho.customer.placeOfContact": payloadData.place_of_contact,
          "zoho.customer.gstNo": payloadData.gst_no,
          "zoho.customer.gstTreatment": payloadData.gst_treatment,
          "zoho.customer.taxId": response.data.contact.tax_id,
          "zoho.customer.taxName": response.data.contact.tax_name,
          "zoho.customer.taxPercentage": response.data.contact.tax_percentage,
          "zoho.customer.createdTime": response.data.contact.created_time
        };
        transaction.update(this.userRef, userUpdateData);
        return {
          success: true,
          data: userUpdateData,
          message: "user is updated with zoho customer"
        };
      } else {
        console.log(
          "customer creation response other than 201 ",
          JSON.stringify(response.data)
        );
        return undefined;
      }
    } catch (err) {
      console.log(`exception error ${err}`);
      throw err;
    }
  };
  Transaction = async (data: { amountINR: number; notesArray: any }) => {
    // Create Invoice
    // instaniating Zoho
    try {
      console.log(
        `payload for zoho : ${data.amountINR} - ${data.notesArray.paid_for}`
      );
      const response = await this.db.runTransaction(async (t) => {
        const userData = (await this.userRef.get()).data();
        console.log(`creating invoice for user ${userData?.userId}`);
        // creating access token in the class instantiated
        console.log(`environmnt is ${process.env.GCLOUD_PROJECT}`);
        // console.log(`environmnt zoho client Id is ${SecretVariables.zohoClientId}`)
        // console.log(`environmnt zoho secret is ${SecretVariables.zohoClientSecret}`)
        // console.log(`environmnt zoho refreshToken is ${SecretVariables.zohoRefreshToken}`)
        // console.log(`environmnt razorpayLiveKey is ${SecretVariables.razorpayLiveKey}`)
        // console.log(`environmnt razorpayLiveSecret is ${SecretVariables.razorpayLiveSecret}`)
        // console.log(`environmnt watiAuthorizationKey is ${SecretVariables.watiAuthorizationKey}`)
        // const zSecret  =await this.googleSecrets.AccessSecret("zohoClientId")
        // console.log(`google secrets : ${JSON.stringify(zSecret)}`)
        if (process.env.GCLOUD_PROJECT === "party-hunt") {
          return undefined;
        }
        console.log(`creating access token`);
        await this.CreateAccessToken();
        let zohoCust: any | undefined;
        let zohoProject: any | undefined;
        if (userData?.zoho === undefined) {
          // Create Zoho Customer and project
          console.log(`Create Zoho Customer and project`);
          const zohoCustResponse = await this.CreateZohoUser(
            t,
            userData?.name !== "" ? userData?.name : "Party Hunter"
          );
          if (zohoCustResponse?.success === true) {
            zohoCust = zohoCustResponse.data;
            const zohoProjectResponse = await this.CreateProject(t, zohoCust);
            console.log(
              `zoho project response ${JSON.stringify(zohoProjectResponse)}`
            );
            if (zohoProjectResponse?.success === true) {
              zohoProject = zohoProjectResponse.data;
            } else {
              console.log(
                `zoho project not created due to ${zohoCustResponse.message} and error ${zohoCustResponse.data}`
              );
              return zohoProjectResponse;
            }
          } else {
            // error in creating zoho customer
            console.log(
              `zoho customer not created due to ${zohoCustResponse?.message} and error ${zohoCustResponse?.data}`
            );
            return zohoCustResponse;
          }
        } else {
          // zoho customer and project already present
          console.log(`zoho customer and project already present`);
        }
        //check line item
        console.log(`check line item`);
        const lineItemResponse = await this.CreateLineItems(
          data.amountINR,
          data.notesArray.paid_for
        );
        if (lineItemResponse?.success === true) {
          // create zoho invoice
          console.log(
            `: - create zoho invoice : ${JSON.stringify(lineItemResponse.data)}`
          );
          const zohoInvoiceresponse = await this.CreateInvoice(t, {
            customerId:
              zohoCust === undefined
                ? userData?.zoho.customer.customerId
                : zohoCust["zoho.customer.customerId"],
            itemId: lineItemResponse.data.item_id,
            projectId:
              zohoProject === undefined
                ? userData?.zoho.customer.projectId
                : zohoCust["zoho.customer.projectId"],
            lineItemName: lineItemResponse.data.item_name,
            amount: data.amountINR,
            taxId: lineItemResponse.data.item_tax_preferences[1].tax_id,
            placeOfSupply: undefined,
            gstNo: undefined
          });
          console.log(
            `invoice created with Id ${JSON.stringify(
              zohoInvoiceresponse?.data
            )}`
          );
          if (zohoInvoiceresponse?.success) {
            console.log(
              `marking zoho invoice as sent transaction will not stop from its failure`
            );
            this.MarkInvoiceAsSent(
              zohoInvoiceresponse.data["zoho.invoice.invoiceId"]
            )
              .then((markSentRepsone) => {
                if (markSentRepsone?.success) {
                  console.log(`zoho invoice is marked as sent`);
                } else {
                  console.log(
                    `zoho invoice not marked as ${zohoInvoiceresponse?.data}`
                  );
                }
              })
              .catch((err) => {
                console.log(`cannot marked as sent with error : ${err}`);
              });
            return zohoInvoiceresponse;
          } else {
            console.log(
              `zoho invoice not created due to ${zohoInvoiceresponse?.data}`
            );
            return undefined;
          }
        } else {
          console.log(
            `line item checking error ${JSON.stringify(lineItemResponse?.data)}`
          );
          return undefined;
        }
      });
      return response;
    } catch (err) {
      console.log(`error in zon function ${err}`);
      console.log("transaction failed");
      throw err;
    }
  };
  private CalculateGST(amount: number, gst: number) {
    const gstFactor = 1 + gst / 100;
    return amount / gstFactor;
  }
}

export default ZohoInvoice;
