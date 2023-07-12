// in terminal at netlify-express level, do 'netlify dev' to start
const express = require("express");
const serverless = require("serverless-http");
const nodemailer = require("nodemailer");
// const { EMAIL, PASSWORD } = require('./env.js')

const app = express();
const router = express.Router();

app.use(express.json())

router.get("/", (req, res) => {
  res.json({
    hello: "world",
    page: "homepage from functions folder"
  });
});

router.post("/", (req, res) => {
  const { userName, userEmail, userMessage } = req.body;

  let config = {
    service: "gmail",
    auth: {
      user: process.env.EMAIL,
      pass: process.env.PASSWORD,
    },
  };

  let transporter = nodemailer.createTransport(config);

  transporter
  .sendMail({
    from: process.env.EMAIL,
    to: process.env.EMAIL,
    subject: `Message from ${userName} (${userEmail})`,
    text: userMessage
  })
  .then(() => {
    return res.status(201).json({
        msg: "Nodemailer has sent the message"
    })
  })
  .catch((err) => {
    return res.status(500).json({
        msg: "Nodemailer FAILED to send the message",
        err: err
    })
  })

//   res.status(200).json({
//     success: true,
//     msg: 'You have submitted some data',
//     // config: config,
//     userName: userName,
//     userEmail: userEmail,
//     userMessage: userMessage
//   });
});

app.use("/.netlify/functions/api", router);

// for the lambda to run, we need to export a handler function
module.exports.handler = serverless(app);

// "start": "netlify-lambda serve src",
// "build": "netlify-lambda build src"
