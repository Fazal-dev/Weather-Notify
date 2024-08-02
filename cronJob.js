import nodemailer from "nodemailer";
import cron from "node-cron";
import userModel from "./models/userModel.js";
import WeatherDataModel from "./models/weatherData.js";
import "dotenv/config";
import axios from "axios";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Function to fetch weather data
const fetchWeatherData = async (location) => {
  const url = `http://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${process.env.OPENWEATHERMAP_API_KEY}`;
  const response = await axios.get(url);
  return response.data;
};

// Function to format temperature from Kelvin to Celsius
const formatTemperature = (kelvin) => (kelvin - 273.15).toFixed(1);

// Function to convert Unix timestamp to human-readable time
const formatTime = (timestamp) =>
  new Date(timestamp * 1000).toLocaleTimeString();

// Function to generate a prompt for Gemini AI
const createPrompt = (
  name,
  weatherDescription,
  temperature,
  feelsLike,
  tempMin,
  tempMax,
  humidity,
  windSpeed,
  cloudCoverage,
  sunrise,
  sunset
) => `
  Create a detailed and engaging weather report for the following weather data:
  - Location: ${name}
  - Weather: ${weatherDescription}
  - Temperature: ${temperature}°C
  - Feels Like: ${feelsLike}°C
  - Min Temperature: ${tempMin}°C
  - Max Temperature: ${tempMax}°C
  - Humidity: ${humidity}%
  - Wind Speed: ${windSpeed} m/s
  - Cloud Coverage: ${cloudCoverage}%
  - Sunrise: ${sunrise}
  - Sunset: ${sunset}

  Format the report in a user-friendly and informative way.
`;

// Function to generate a weather report using Gemini AI
const generateWeatherReport = async (weatherData) => {
  const { name, weather, main, wind, clouds, sys } = weatherData;
  const weatherDescription =
    weather[0]?.description || "No description available";
  const temperature = formatTemperature(main.temp);
  const feelsLike = formatTemperature(main.feels_like);
  const tempMin = formatTemperature(main.temp_min);
  const tempMax = formatTemperature(main.temp_max);
  const humidity = main.humidity;
  const windSpeed = wind.speed;
  const cloudCoverage = clouds.all;
  const sunrise = formatTime(sys.sunrise);
  const sunset = formatTime(sys.sunset);

  const prompt = createPrompt(
    name,
    weatherDescription,
    temperature,
    feelsLike,
    tempMin,
    tempMax,
    humidity,
    windSpeed,
    cloudCoverage,
    sunrise,
    sunset
  );

  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  const result = await model.generateContent(prompt);
  const response = await result.response;
  const report = response.text();

  return report;
};

// Create a transporter object
const transporter = nodemailer.createTransport({
  host: process.env.MAILTRAP_HOST,
  port: process.env.MAILTRAP_PORT,
  auth: {
    user: process.env.MAILTRAP_USER,
    pass: process.env.MAILTRAP_PASS,
  },
});
// Function to send email
const sendEmail = async (email, weatherData) => {
  // genarate weather report
  const weatherReport = await generateWeatherReport(weatherData);

  const mailOptions = {
    from: "hi@demomailtrap.com",
    to: email,
    subject: "Weather Report",
    text: weatherReport,
  };

  await transporter.sendMail(mailOptions);
};

// Function to get or fetch weather data
const getOrFetchWeatherData = async (userId, location) => {
  try {
    // get most recent weather data
    let weatherData = await WeatherDataModel.findOne({ userId }).sort({
      createdAt: -1,
    });

    if (!weatherData) {
      // fetch new weather data
      weatherData = await fetchWeatherData(location);
      const newWeatherData = new WeatherDataModel({
        userId,
        data: weatherData,
      });
      await newWeatherData.save();
    } else {
      weatherData = weatherData.data;
    }

    return weatherData;
  } catch (error) {
    console.error(`Error fetching weather data for user ${userId}:`, error);
    throw error;
  }
};

// Function to process each user
const processUser = async (user) => {
  if (!user.location) {
    console.error(`User ${user._id} does not have a location set.`);
    return;
  }

  try {
    const weatherData = await getOrFetchWeatherData(user._id, user.location);
    await sendEmail(user.email, weatherData);
  } catch (error) {
    console.error(`Error processing user ${user._id}:`, error);
  }
};

// Function to run scheduled task
const runScheduledTask = async () => {
  console.log("Running a task every 30 seconds");
  try {
    const users = await userModel.find();
    for (const user of users) {
      await processUser(user);
    }
  } catch (error) {
    console.error("Error during scheduled task:", error);
  }
};

// Schedule the email to be sent every 30 seconds
cron.schedule("*/30 * * * * *", runScheduledTask);
