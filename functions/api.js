// in terminal at netlify-express level, do 'netlify dev' to start
const express = require("express");
const serverless = require("serverless-http");
const nodemailer = require("nodemailer");
const cors = require('cors')
// const { EMAIL, PASSWORD } = require('./env.js')

const app = express();
const router = express.Router();

app.use(cors({
  origin: function (origin, callback) {
    // Check if the origin starts with "https://maria-panagos.netlify.app/"
    if (origin.startsWith("https://maria-panagos.netlify.app")) {
      callback(null, true); // Allow the request
    } else {
      callback(new Error("Not allowed by CORS")); // Reject the request
    }
  }
}))

app.use(express.json())

router.get("/", (req, res) => {
  res.json({
    hello: "world",
    page: "homepage from functions folder"
  });
});

router.get(`/${process.env.API_KEY}`, (req, res) => {
  res.json({
    page: "Your API Key worked."
  })
})

router.post(`/${process.env.API_KEY}`, (req, res) => {
  const { userName, userEmail, userMessage } = req.body;

  let config = {
    service: "gmail",
    auth: {
      user: process.env.EMAIL,
      pass: process.env.PASSWORD,
    },
  };

  let transporter = nodemailer.createTransport(config);

  let message = {
    from: process.env.EMAIL,
    to: `${userEmail}`,
    bcc: process.env.EMAIL,
    subject: `Thank you for your message via my portfolio site`,
    text: `
    Hi ${userName},
    
    This is an automated message from Maria Panagos just letting you know I have recieved your message via my portfolio site! Here's what you wrote:

        "${userMessage}"

    I usually reply within 1-2 business days. Looking forward to connecting!

    Thank you,
    Maria
    `,
    html: `
      <p>
        Hi ${userName},
        <br />
        <br />
        This is an automated message from Maria Panagos just letting you know I
        have recieved your message via my portfolio site! Here's what you wrote:
        <br />
        <br />
        "${userMessage}"
        <br />
        <br />
        I usually reply within 1-2 business days. Looking forward to connecting!
        <br />
        Thank you, Maria
      </p>
    `
  };

  transporter
  .sendMail(message)
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
});

app.use(`/.netlify/functions/api`, router);

// for the lambda to run, we need to export a handler function
module.exports.handler = serverless(app);