import mongoose from "mongoose";

const { Schema, model } = mongoose;

const weatherDataSchema = Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  data: {
    type: Object,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const WeatherDataModel = model("WeatherData", weatherDataSchema);

export default WeatherDataModel;
