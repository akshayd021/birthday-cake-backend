const crypto = require("crypto");
const axios = require("axios");
const sha256 = require("sha256");
// const { , merchant_id } = require("./secret");

// Testing enviroment
// const salt_key = "96434309-7796-489d-8924-ab56988a6076";
// const merchant_id = "PGTESTPAYUAT86";
// const salt_index = 1;
// const prod_URL = "https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/pay";
// const status_URL = "https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/status";
// const backend_URL = "http://localhost:8000";
// const frontend_URL = "https://www.waiwishes.com";

// Producttions
const salt_key = "386318c5-8294-4517-83ae-ebcb2cf18877";
const merchant_id = "WAIWIONLINE";
const salt_index = 2;
const prod_URL = "https://api.phonepe.com/apis/hermes/pg/v1/pay";
const status_URL = "https://api.phonepe.com/apis/hermes/pg/v1/status";
const backend_URL = "https://birthday-cake-backend-1.onrender.com";
const frontend_URL = "https://www.waiwishes.com";

const newPayment = async (req, res) => {
  const name = req?.body?.name;
  const msg = req?.body?.msg;
  const age = req?.body?.age;
  const customUrl = req?.body?.customUrl;

  // console.log("Calling payment... ", name, msg, age, customUrl);
  // console.log({salt_key, salt_index, merchant_id});

  const merchantTransactionId = "T" + Date.now();
  const data = {
    merchantId: merchant_id,
    merchantTransactionId: merchantTransactionId,
    merchantUserId: "MUID" + Date.now(),
    name: req?.body?.name,
    amount: 900,
    redirectUrl: `${backend_URL}/api/status/${merchantTransactionId}/${name}/${msg}/${age}/${customUrl}`,
    redirectMode: "REDIRECT",
    // callbackUrl: `${backend_URL}/api/status/${merchantTransactionId}/${name}/${msg}/${age}/${customUrl}`,
    mobileNumber: "6353839209",
    paymentInstrument: {
      type: "PAY_PAGE",
    },
  };

  // const payload = JSON.stringify(data);
  // const payloadMain = Buffer.from(payload).toString("base64");
  // const keyIndex = 1;
  // const string = payloadMain + "/pg/v1/pay" + salt_key;
  // const sha256 = crypto.createHash("sha256").update(string).digest("hex");
  // const checksum = sha256 + "###" + keyIndex;

  const bufferObj = Buffer.from(JSON.stringify(data), "utf8");
  const encodedPayload = bufferObj.toString("base64");
  console.log("Base 64: ", encodedPayload);
  const xVerify = sha256(encodedPayload + "/pg/v1/pay" + salt_key) + "###" + salt_index;

  console.log("Payment x verify: ", xVerify);

  const options = {
    method: "POST",
    url: prod_URL,
    headers: {
      accept: "application/json",
      "Content-Type": "application/json",
      "X-VERIFY": xVerify,
    },
    data: {
      request: encodedPayload,
    },
  };

  axios
    .request(options)
    .then(function (response) {
      // Extract the URL from the response
      const redirectUrl =
        response?.data?.data?.instrumentResponse?.redirectInfo?.url;

      if (redirectUrl) {
        // Send the URL to the frontend
        return res.status(200).json({ redirectUrl });
      } else {
        // Handle case where URL is not found
        return res.status(400).json({ message: "Redirect URL not found" });
      }
    })
    .catch(function (error) {
      console.error(error);
      res.status(500).json({ message: "Payment processing failed", error });
    });
};

const checkStatus = async (req, res) => {
  const { txnId, name, msg, age, customUrl } = req.params;

  console.log({ txnId, name, msg, age, customUrl });
  if (txnId) {
    const xVerify = sha256(`/pg/v1/status/${merchant_id}/${txnId}` + salt_key) + "###" + salt_index;
    const options = {
      method: "get",
      url: `${status_URL}/${merchant_id}/${txnId}`,
      headers: {
        accept: "application/json",
        "Content-Type": "application/json",
        "X-MERCHANT-ID": merchant_id,
        "X-VERIFY": xVerify,
      },
    };

    console.log("Constructed URL:", `${status_URL}/${merchant_id}/${txnId}`);
    console.log("X verify for status: ", xVerify);
    console.log("Mercent transaction id: ", txnId);
    console.log("Headers:", options);

    axios
    .request(options)
    .then(async (response) => {
      console.log("Response123: ", response?.data);
      if (response?.data?.success === true) {
        const url = `${frontend_URL}/${name}/${msg}/${age}/${customUrl}`;
        const response = await axios.post(
          `${backend_URL}/api/create-user`,
          { name, message: msg, age, customUrl }
        );
        return res.redirect(url);
      } else {
        const url = `${frontend_URL}`;
        return res.redirect(url);
      }
    })
    .catch((error) => {
      console.log("error getting...");
      console.error(error);
    });

    // try {
    //   const response = await axios.request(options);
    //   console.log("Response123: ", response?.data);
    // } catch (error) {
    //   console.log("error getting...");
    //   console.error(error);
    // }
  }

  
};

const checkStat = async (req, res) => {
  const { txnId } = req.params;
  const xVerify = sha256(`/pg/v1/status/${merchant_id}/${txnId}` + salt_key) + "###" + salt_index;
    const options = {
      method: "get",
      url: `${status_URL}/${merchant_id}/${txnId}`,
      headers: {
        accept: "application/json",
        "Content-Type": "application/json",
        "X-MERCHANT-ID": txnId,
        "X-VERIFY": xVerify,
      },
    };

    console.log("Constructed URL:", `${status_URL}/${merchant_id}/${txnId}`);
    console.log("X verify for status: ", xVerify);
    console.log("Mercent transaction id: ", txnId);
    console.log("Headers:", options);

    try {
      const response = await axios.request(options);
      console.log("Response123: ", response?.data);
    } catch (error) {
      console.log("error getting...");
      console.error(error);
    }
}

module.exports = {
  newPayment,
  checkStatus,
  checkStat
};
