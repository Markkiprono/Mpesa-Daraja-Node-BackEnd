const url =
  "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials";
const ConsumerKey = "YOUR_CONSUMER_KEY";
const consumerSecret = "YOUR_CONSUMER_SECRET";
const axios = require("axios");

const createToken = async (req, res, next) => {
  const buffer = new Buffer.from(`${ConsumerKey}:${consumerSecret}`).toString(
    "base64"
  );
  console.log(buffer);
  await axios
    .get(url, {
      headers: {
        authorization: `Basic ${buffer}`,
      },
    })
    .then((data) => {
      token = data.data.access_token;
      next();
    })
    .catch((err) => {
      res.status(400).json(err.message);
    });
};
const postStk = async (req, res, next) => {
  const shortCode = 174379;
  const phone = req.body.phone.substring(1);
  const amount = req.body.amount;
  //PassKey is common if you are in Sandbox but in Production you will have to generate your own
  const passKey =
    "bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919";
  const url = "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest";

  const date = new Date();
  const timestamp =
    date.getFullYear() +
    ("0" + (date.getMonth() + 1)).slice(-2) +
    ("0" + date.getDate()).slice(-2) +
    ("0" + date.getHours()).slice(-2) +
    ("0" + date.getMinutes()).slice(-2) +
    ("0" + date.getSeconds()).slice(-2);
  const password = new Buffer.from(shortCode + passKey + timestamp).toString(
    "base64"
  );
  const data = {
    BusinessShortCode: shortCode,
    Password: password,
    Timestamp: timestamp,
    TransactionType: "CustomerPayBillOnline",
    Amount: amount,
    PartyA: `254${phone}`,
    PartyB: 174379,
    PhoneNumber: `254${phone}`,
    CallBackURL: "https://f37e-41-60-236-254.in.ngrok.io/token/call_back",
    AccountReference: "Mpesa Test",
    TransactionDesc: "Testing stk push",
  };
  await axios
    .post(url, data, {
      headers: {
        authorization: `Bearer ${token}`,
      },
    })
    .then((data) => {
      checkoutRequestID = data.data.CheckoutRequestID;
      res.status(200).json(data.data);
      next();
    })
    .catch((err) => {
      console.log(err);
      res.status(400).json(err.message);
    });
};

//This post request is only sent by safaricom so you don't have to worry about it
const userCallback = async (req, res) => {
  if (!req.body.Body.stkCallback.CallbackMetadata) {
    console.log(req.body.Body.stkCallback.ResultDesc);
    res.status(200).json("ok");
    return;
  }

  const amount = req.body.Body.stkCallback.CallbackMetadata.Item[0].Value;
  const code = req.body.Body.stkCallback.CallbackMetadata.Item[1].Value;
  const phone1 =
    req.body.Body.stkCallback.CallbackMetadata.Item[4].Value.toString().substring(
      3
    );
  const phone = `0${phone1}`;
  // saving the transaction to db
  console.log({
    phone,
    code,
    amount,
  });
  res.status(200).json("ok");
};

const userResponse = async (req, res) => {
  const url = " https://sandbox.safaricom.co.ke/mpesa/stkpushquery/v1/query";
  const shortCode = 174379;
  const passKey =
    "bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919";
  const date = new Date();
  const timestamp =
    date.getFullYear() +
    ("0" + (date.getMonth() + 1)).slice(-2) +
    ("0" + date.getDate()).slice(-2) +
    ("0" + date.getHours()).slice(-2) +
    ("0" + date.getMinutes()).slice(-2) +
    ("0" + date.getSeconds()).slice(-2);
  const password = new Buffer.from(shortCode + passKey + timestamp).toString(
    "base64"
  );
  const data = {
    BusinessShortCode: shortCode,
    Password: password,
    Timestamp: timestamp,
    CheckoutRequestID: checkoutRequestID,
  };
  await axios
    .post(url, data, {
      headers: {
        authorization: `Bearer ${token}`,
      },
    })
    .then((data) => {
      console.log(data);
      res.status(200).json(data.data);
    })
    .catch((err) => {
      console.log(err);
      res.status(400).json(err.message);
    });
};
module.exports = { createToken, postStk, userResponse, userCallback };
