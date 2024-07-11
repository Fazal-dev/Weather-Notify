import mongoose from "mongoose";

const { Schema, model } = mongoose;

const UserSchema = Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  location: {
    type: String,
    required: true,
  },
  createdAt: { type: Date, default: Date.now },
});

const userModel = model("User", UserSchema);

export default userModel;
