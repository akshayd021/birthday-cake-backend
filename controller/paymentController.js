const crypto = require("crypto");
const axios = require("axios");
const sha256 = require("sha256");
// const { , merchant_id } = require("./secret");
const salt_key = "96434309-7796-489d-8924-ab56988a6076";
const merchant_id = "PGTESTPAYUAT86";
const salt_index = 1;

// const newPayment = async (req, res) => {
//   try {
//     console.log("Calling req");
//     const merchantTransactionId = Date.now();
//     const data = {
//         "merchantId": "PGTESTPAYUAT86",
//         "merchantTransactionId": "MT7850590068188104",
//         "merchantUserId": "MUID123",
//         "amount": 10000,
//         "redirectUrl": "https://webhook.site/redirect-url",
//         "redirectMode": "REDIRECT",
//         "callbackUrl": "https://webhook.site/callback-url",
//         "mobileNumber": "9999999999",
//         "paymentInstrument": {
//           "type": "PAY_PAGE"
//         }
//       }
//       ;
//     const payload = JSON.stringify(data);
//     const payloadMain = Buffer.from(payload).toString("base64");
//     const keyIndex = 1;
//     const string = payloadMain + "/pg/v1/pay" + salt_key;
//     const sha256 = crypto.createHash("sha256").update(string).digest("hex");
//     const checksum = sha256 + "###" + keyIndex;

//     // const prod_URL = "https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/pay";
//     const prod_URL = "https://api-preprod.phonepe.com/apis/hermes/pg/v1/pay";
//     // const prod_URL = "https://api.phonepe.com/apis/hermes/pg/v1/pay";

//     console.log("Checksum: ", checksum);
//     console.log("Payload: ", payloadMain);
//     const options = {
//       method: "POST",
//       url: prod_URL,
//       headers: {
//         accept: "application/json",
//         "Content-Type": "application/json",
//         "X-VERIFY": checksum,
//       },
//       data: {
//         request: payloadMain,
//       },
//     };

//     axios
//       .request(options)
//       .then(function (response) {
//         console.log(response.data);
//         return res.status(200);
//         // return res.redirect(
//         //   response.data.data.instrumentResponse.redirectInfo.url
//         // );
//       })
//       .catch(function (error) {
//         console.error(error);
//       });
//   } catch (error) {
//     res.status(500)
//     // res.status(500).send({
//     //   message: error.message,
//     //   success: false,
//     // });
//   }
// };

const newPayment = async (req, res) => {
  const name = req?.body?.name;
  const msg = req?.body?.msg;
  const age = req?.body?.age;
  const customUrl = req?.body?.customUrl;

  console.log("Calling payment... ", name, msg, age, customUrl);

  const merchantTransactionId = "T" + Date.now();
  const data = {
    merchantId: merchant_id,
    merchantTransactionId: merchantTransactionId,
    merchantUserId: "MUID" + Date.now(),
    name: req?.body?.name,
    amount: 100,
    redirectUrl: `http://localhost:8000/api/status/${merchantTransactionId}/${name}/${msg}/${age}/${customUrl}`,
    redirectMode: "POST",
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
  const xVerify = sha256(encodedPayload + "/pg/v1/pay" + salt_key) + "###1";

  const prod_URL = "https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/pay";

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

  const xVerify =
    sha256(`/pg/v1/status/${merchant_id}/${txnId}` + salt_key) +
    "###" +
    salt_index;
  const options = {
    method: "get",
    url: `https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/status/${merchant_id}/${txnId}`,
    headers: {
      accept: "application/json",
      "Content-Type": "application/json",
      "X-MERCHANT-ID": txnId,
      "X-VERIFY": xVerify,
    },
  };

  axios
    .request(options)
    .then(async (response) => {
      if (response.data.success === true) {
        const url = `http://localhost:3000/${name}/${msg}/${age}/${customUrl}`;
        const response = await axios.post(
          "http://localhost:8000/api/create-user",
          {name, message: msg, age, customUrl}
        );
        return res.redirect(url);
      } else {
        const url = `http://localhost:3000/failure`;
        return res.redirect(url);
      }
    })
    .catch((error) => {
      console.error(error);
    });
};

module.exports = {
  newPayment,
  checkStatus,
};
