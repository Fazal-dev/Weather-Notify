import express from "express";
import userModel from "../models/userModel.js";

const UserRouter = express.Router();

// create new user
UserRouter.post("/", async (req, res) => {
  const { email, location } = req.body;
  try {
    const user = new userModel({ email, location });
    await user.save();
    res.status(201).json(user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});
// update user location
UserRouter.patch("/:id/location", async (req, res) => {
  const { id } = req.params;
  const { location } = req.body;
  try {
    const user = await userModel.findByIdAndUpdate(
      id,
      { location },
      { new: true }
    );
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

export default UserRouter;
