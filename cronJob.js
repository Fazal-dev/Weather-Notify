import cron from "node-cron";
import axios from "axios";
import nodemailer from "nodemailer";
import "dotenv/config";
import UserModel from "./models/userModel.js";
import WeatherDataModel from "./models/weatherData.js";

const fetchWeatherData = async (location) => {
  const url = `http://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${process.env.OPENWEATHER_API_KEY}`;
  const response = await axios.get(url);
  return response.data;
};

const sendEmail = async (email, weatherData) => {
  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Weather Report",
    text: `Here is your weather report: ${JSON.stringify(weatherData)}`,
  };

  await transporter.sendMail(mailOptions);
};

cron.schedule("*/30 * * * * *", async () => {
  console.log("Running a task every seconds");

  const users = await UserModel.find();
  for (const user of users) {
    const weatherData = await fetchWeatherData(user.location);

    const newWeatherData = new WeatherDataModel({
      userId: user._id,
      data: weatherData,
    });
    await newWeatherData.save();

    await sendEmail(user.email, weatherData);
  }
});
