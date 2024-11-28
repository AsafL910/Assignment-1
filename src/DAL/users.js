const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const { User } = require("../db/schemas");

const createUser = async (username, email, password) => {
  console.log({ username, email, password });

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, email, password: hashedPassword });
    newUser.save();
    return newUser;
  } catch (error) {
    console.log(error);
  }
};

const getAllUsers = () => {
  try {
    const users = User.find();
    return users;
  } catch (error) {
    console.log(error);
  }
};

const getUserById = (userId) => {
  try {
    return User.findById(userId);
  } catch (error) {
    console.log(error);
  }
};

const updateUserById = (userId, username, email, password) => {
  try {
    return User.findByIdAndUpdate(
      userId,
      { username, email, password },
      { new: true }
    );
  } catch (error) {
    console.log(error);
  }
};

const deleteUserById = (userId) => {
  try {
    return User.findByIdAndDelete(userId);
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  createUser,
  getAllUsers,
  getUserById,
  updateUserById,
  deleteUserById,
};
