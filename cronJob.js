import nodemailer from "nodemailer";
import "dotenv/config";

// Create a transporter object
const transporter = nodemailer.createTransport({
  host: process.env.MAILTRAP_HOST,
  port: process.env.MAILTRAP_PORT,
  auth: {
    user: process.env.MAILTRAP_USER,
    pass: process.env.MAILTRAP_PASS,
  },
});

// Configure the mailoptions object
const mailOptions = {
  from: "hi@demomailtrap.com",
  to: "mhdm8675@gmail.com",
  subject: "Sending Email using Node.js",
  text: "That was easy!",
};

// Send the email
transporter.sendMail(mailOptions, function (error, info) {
  if (error) {
    console.log(error);
  } else {
    console.log("Email sent: " + info.response);
  }
});
