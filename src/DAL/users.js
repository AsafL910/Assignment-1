const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const { User } = require("../db/schemas");

const createUser = async (username, email, password) => {
  const existingUser = await User.findOne({ username });
  if (existingUser) {
    throw new Error("Username already exists");
  }

  const existingEmail = await User.findOne({ email });
  if (existingEmail) {
    throw new Error("Email already exists");
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = new User({ username, email, password: hashedPassword });
  return newUser.save();
};

const getAllUsers = () => {
  return User.find();
};

const getUserById = (userId) => {
  return User.findById(userId);
};
const getUserByEmail = (email) => {
  return User.findOne({ email: email })
}

const updateUserById = async (userId, username, email, password) => {
  if (username) {
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      throw new Error("Username already exists");
    }
  }

  if (email) {
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      throw new Error("Email already exists");
    }
  }

  return User.findByIdAndUpdate(
    userId,
    { username, email, password },
    { new: true },
  );
};

const deleteUserById = (userId) => {
  return User.findByIdAndDelete(userId);
};

module.exports = {
  createUser,
  getAllUsers,
  getUserById,
  getUserByEmail,
  updateUserById,
  deleteUserById,
};
