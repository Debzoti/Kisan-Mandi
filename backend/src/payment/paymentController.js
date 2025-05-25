import axios from "axios";
import crypto from "crypto";
import { v4 as uuidv4 } from "uuid";
import { Buffer } from "buffer";

const MERCHANT_KEY = "96434309-7796-489d-8924-ab56988a6076";
const MERCHANT_ID = "PGTESTPAYUAT86";

// const prod_URL = "https://api.phonepe.com/apis/hermes/pg/v1/pay"
// const prod_URL = "https://api.phonepe.com/apis/hermes/pg/v1/status"

const MERCHANT_BASE_URL =
  "https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/pay";
const MERCHANT_STATUS_URL =
  "https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/status";

const redirectUrl = "http://localhost:5000/api/payment/status";

const successUrl = "http://localhost:5173/profile";
const failureUrl = "http://localhost:5173/profile";

const createOrder = async (req, res) => {
  const { name, mobileNumber, amount } = req.body;
  
  // Validate input parameters
  if (!name || !mobileNumber || !amount) {
    return res.status(400).json({ error: "Name, mobile number, and amount are required" });
  }
  
  // Validate amount is a positive number
  if (typeof amount !== 'number' || amount <= 0) {
    return res.status(400).json({ error: "Amount must be a positive number" });
  }
  
  // Validate mobile number format (basic validation)
  const mobileRegex = /^[6-9]\d{9}$/;
  if (!mobileRegex.test(mobileNumber)) {
    return res.status(400).json({ error: "Invalid mobile number format" });
  }
  
  const transactionId = uuidv4();

  //payment
  const paymentPayload = {
    merchantId: MERCHANT_ID,
    merchantUserId: name,
    mobileNumber: mobileNumber,
    amount: amount * 100,
    merchantTransactionId: transactionId,
    redirectUrl: `${redirectUrl}/?id=${transactionId}`,
    redirectMode: "POST",
    paymentInstrument: {
      type: "PAY_PAGE",
    },
  };

  const payload = Buffer.from(JSON.stringify(paymentPayload)).toString(
    "base64"
  );
  const keyIndex = 1;
  const string = payload + "/pg/v1/pay" + MERCHANT_KEY;
  const sha256 = crypto.createHash("sha256").update(string).digest("hex");
  const checksum = sha256 + "###" + keyIndex;

  const option = {
    method: "POST",
    url: MERCHANT_BASE_URL,
    headers: {
      accept: "application/json",
      "Content-Type": "application/json",
      "X-VERIFY": checksum,
    },
    data: {
      request: payload,
    },
  };
  try {
    const response = await axios.request(option);
    console.log(response.data.data.instrumentResponse.redirectInfo.url);
    res.status(200).json({
      msg: "OK",
      url: response.data.data.instrumentResponse.redirectInfo.url,
    });
  } catch (error) {
    console.log("error in payment", error);
    res.status(500).json({ error: "Failed to initiate payment" });
  }
};

// trans id
// amount
// productId
// userId
// status
// date

// const status = async (req, res) => {
//     const merchantTransactionId = req.query.id;

//     const keyIndex = 1;
//     const string = `/pg/v1/status/${MERCHANT_ID}/${merchantTransactionId}` + MERCHANT_KEY;
//     const sha256 = crypto.createHash('sha256').update(string).digest('hex');
//     const checksum = sha256 + '###' + keyIndex;

//     const option = {
//         method: 'GET',
//         url: `${MERCHANT_STATUS_URL}/${MERCHANT_ID}/${merchantTransactionId}`,
//         headers: {
//             accept: 'application/json',
//             'Content-Type': 'application/json',
//             'X-VERIFY': checksum,
//             'X-MERCHANT-ID': MERCHANT_ID
//         },
//     };

//     try {
//         const response = await axios.request(option);
//         if (response.data.success === true) {
//             const paymentDetails = response.data.data;

//             // Extract necessary details

//             if(paymentDetails.status !== "SUCCESS"||paymentDetails.amount <= 0||!paymentDetails.userId) {
//                 return res.redirect(failureUrl);
//             }

//             const orderData = {
//                 transactionId: merchantTransactionId,
//                 amount: paymentDetails.amount / 100,  // Convert to normal currency
//                 productId: req.query.productId || "N/A", // Get from frontend
//                 userId: req.query.userId || "N/A",       // Get from frontend
//                 status: "SUCCESS",
//                 date: new Date()
//             };

//             // Save order details in MongoDB
//             const newOrder = new orderModel(orderData);
//             await newOrder.save();

//             return res.redirect(successUrl);
//         } else {
//             return res.redirect(failureUrl);
//         }
//     } catch (error) {
//         console.error("Error in payment status check:", error);
//         return res.status(500).json({ error: "Failed to fetch payment status" });
//     }
// };

const status = async (req, res) => {
  const merchantTransactionId = req.query.id;
  console.log("Merchant Transaction ID:" + merchantTransactionId);

  // Validate merchantTransactionId format (UUID v4)
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!merchantTransactionId || !uuidRegex.test(merchantTransactionId)) {
    return res.status(400).json({ error: "Invalid transaction ID format" });
  }

  const keyIndex = 1;
  const string =
    `/pg/v1/status/${MERCHANT_ID}/${merchantTransactionId}` + MERCHANT_KEY;
  console.log("String:" + string);
  const sha256 = crypto.createHash("sha256").update(string).digest("hex");
  const checksum = sha256 + "###" + keyIndex;
  const option = {
    method: "GET",
    url: `${MERCHANT_STATUS_URL}/${MERCHANT_ID}/${merchantTransactionId}`,
    headers: {
      accept: "application/json",
      "Content-Type": "application/json",
      "X-VERIFY": checksum,
      "X-MERCHANT-ID": MERCHANT_ID,
    },
  };

  try {
    const response = await axios.request(option);
    // console.log("Status Response" + response);
    if (response.data.success === true) {
      console.log(response.data);

      return res.redirect(successUrl);
    } else {
      return res.redirect(failureUrl);
    }
  } catch (error) {
    console.error("Error in payment status check:", error);
    return res.status(500).json({ error: "Failed to fetch payment status" });
  }
};

export { createOrder, status };
