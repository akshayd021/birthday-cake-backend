const crypto = require("crypto");
const axios = require("axios");
// const { , merchant_id } = require("./secret");
const salt_key = "099eb0cd-02cf-4e2a-8aca-3e6c6aff0399";

// const newPayment = async (req, res) => {
//   try {
//     console.log("Calling req");
//     const merchantTransactionId = Date.now();
//     const data = {
//         "merchantId": "PGTESTPAYUAT",
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
  console.log("Calling payment... ");
  const merchantTransactionId = "T" + Date.now();
  const data = {
    merchantId: "PGTESTPAYUAT",
    merchantTransactionId: merchantTransactionId,
    merchantUserId: "MUID" + Date.now(),
    name: "utsav",
    amount: 100,
    redirectUrl: `http://localhost:5050/api/status/${merchantTransactionId}`,
    redirectMode: "POST",
    mobileNumber: "6353839209",
    paymentInstrument: {
      type: "PAY_PAGE",
    },
  };

  const payload = JSON.stringify(data);
  const payloadMain = Buffer.from(payload).toString("base64");
  const keyIndex = 1;
  const string = payloadMain + "/pg/v1/pay" + salt_key;
  const sha256 = crypto.createHash("sha256").update(string).digest("hex");
  const checksum = sha256 + "###" + keyIndex;

  const prod_URL = "https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/pay";

  const options = {
    method: "POST",
    url: prod_URL,
    headers: {
      accept: "application/json",
      "Content-Type": "application/json",
      "X-VERIFY": checksum,
    },
    data: {
      request: payloadMain,
    },
  };

  axios
    .request(options)
    .then(function (response) {
      console.log(response?.data?.data?.instrumentResponse?.redirectInfo?.url);
      return res.redirect(
        response.data.data.instrumentResponse.redirectInfo.url
      );
    })
    .catch(function (error) {
      console.error(error);
    });
};

const checkStatus = async (req, res) => {
  const merchantTransactionId = res.req.body.transactionId;
  const merchantId = res.req.body.merchantId;

  const keyIndex = 1;
  const string =
    `/pg/v1/status/${merchantId}/${merchantTransactionId}` + salt_key;
  const sha256 = crypto.createHash("sha256").update(string).digest("hex");
  const checksum = sha256 + "###" + keyIndex;

  const options = {
    method: "GET",
    url: `https://api.phonepe.com/apis/hermes/pg/v1/status/${merchantId}/${merchantTransactionId}`,
    headers: {
      accept: "application/json",
      "Content-Type": "application/json",
      "X-VERIFY": checksum,
      "X-MERCHANT-ID": `${merchantId}`,
    },
  };

  axios
    .request(options)
    .then(async (response) => {
      if (response.data.success === true) {
        const url = `http://localhost:3000/success`;
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
