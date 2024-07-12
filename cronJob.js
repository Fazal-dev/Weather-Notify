import nodemailer from "nodemailer";
import cron from "node-cron";
import userModel from "./models/userModel.js";
import WeatherDataModel from "./models/weatherData.js";
import "dotenv/config";
import axios from "axios";

// Function to fetch weather data
const fetchWeatherData = async (location) => {
  const url = `http://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${process.env.OPENWEATHERMAP_API_KEY}`;
  const response = await axios.get(url);
  return response.data;
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
const genarateWeatherReport = (weatherData) => {
  // Extract weather information from the weatherData object
  const { name, weather, main, wind, clouds, sys } = weatherData;
  const weatherDescription =
    weather[0]?.description || "No description available";
  const temperature = (main.temp - 273.15).toFixed(1);
  const feelsLike = (main.feels_like - 273.15).toFixed(1);
  const tempMin = (main.temp_min - 273.15).toFixed(1);
  const tempMax = (main.temp_max - 273.15).toFixed(1);
  const humidity = main.humidity;
  const windSpeed = wind.speed;
  const cloudCoverage = clouds.all;
  const sunrise = new Date(sys.sunrise * 1000).toLocaleTimeString();
  const sunset = new Date(sys.sunset * 1000).toLocaleTimeString();

  return `
           Weather Report for ${name}:

              Weather: ${weatherDescription}
              Temperature: ${temperature}°C
              Feels Like: ${feelsLike}°C
              Min Temperature: ${tempMin}°C
              Max Temperature: ${tempMax}°C
              Humidity: ${humidity}%
              Wind Speed: ${windSpeed} m/s
              Cloud Coverage: ${cloudCoverage}%
              Sunrise: ${sunrise}
              Sunset: ${sunset}

              Have a great day!
              `;
};

// Function to send email
const sendEmail = async (email, weatherData) => {
  const mailOptions = {
    from: "hi@demomailtrap.com",
    to: email,
    subject: "Weather Report",
    text: genarateWeatherReport(weatherData),
  };

  await transporter.sendMail(mailOptions);
};

// Schedule the email to be sent every 30 seconds
cron.schedule("*/30 * * * * *", async () => {
  console.log("Running a task every 30 seconds");
  try {
    const users = await userModel.find();
    for (const user of users) {
      // Check if weather data already exists
      let weatherData = await WeatherDataModel.findOne({
        userId: user._id,
      }).sort({
        createdAt: -1,
      });

      if (!weatherData) {
        // Fetch new weather data
        weatherData = await fetchWeatherData(user.location);

        // Save new weather data to the database
        const newWeatherData = new WeatherDataModel({
          userId: user._id,
          data: weatherData,
        });
        await newWeatherData.save();
      } else {
        weatherData = weatherData.data;
      }

      // Send email with weather data
      await sendEmail(user.email, weatherData);
    }
  } catch (error) {
    console.error("Error during scheduled task", error);
  }
});
