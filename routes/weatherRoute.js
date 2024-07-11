import express from "express";
import axios from "axios";
import userModel from "../models/userModel.js";
import WeatherDataModel from "../models/weatherData.js";

const weatherRouter = express.Router();

// Route to get weather data for user for a given day
weatherRouter.get("/:id/weather/:date", async (req, res) => {
  const { id, date } = req.params;
  try {
    const user = await userModel.findById(id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const weatherData = await WeatherDataModel.findOne({
      userId: id,
      createdAt: {
        $gte: new Date(date),
        $lt: new Date(new Date(date).getTime() + 24 * 60 * 60 * 1000),
      },
    });

    if (!weatherData) {
      const response = await axios.get(
        `http://api.openweathermap.org/data/2.5/weather?q=${user.location}&appid=${process.env.OPENWEATHERMAP_API_KEY}`
      );

      const newWeatherData = new WeatherDataModel({
        userId: user._id,
        data: response.data,
      });

      await newWeatherData.save();
      res.json(newWeatherData);
    } else {
      res.json(weatherData);
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});
export default weatherRouter;
