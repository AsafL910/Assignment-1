const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const { User } = require('../db/schemas');

const createUser = async (username, email, password) => {
  try {

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, email, password: hashedPassword });
    await newUser.save();
    return newUser;   

  } catch (error) {
    throw error;
  }
}

 const getAllUsers = async () => {
  try {
    const users = await User.find();
    return users;
  } catch (error) {
    throw error;
  }
}

const getUserById = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  } catch (error)   
 {
    throw error;
  }
}

const updateUserById = async (userId, username, email, password) => {
  try {
    const user = await User.findByIdAndUpdate(userId, { username, email, password }, { new: true });
    
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  } catch (error) {
    throw error;
  }
}

const deleteUserById = async (userId) => {
  try {
    const user = await User.findByIdAndDelete(userId);
    if (!user) {
      throw new Error('User not found');
    }
    return { message: 'User deleted successfully' };
  } catch (error) {
    throw error;
  }
}

module.exports = {
  createUser,
  getAllUsers,
  getUserById,
  updateUserById,
  deleteUserById
};