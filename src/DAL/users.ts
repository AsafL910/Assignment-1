import bcrypt from "bcrypt";
import User from "../db/userSchema";

const createUser = async (username: string, email: string, password: string): Promise<any> => {
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
  return await newUser.save();
};

const getAllUsers = async (): Promise<any> => {
  return await User.find();
};

const getUserById = async (userId: string): Promise<any> => {
  return await User.findById(userId);
};

const getUserByEmail = async (email: string): Promise<any> => {
  return await User.findOne({ email });
};

const updateUserById = async (userId: string, username?: string, email?: string, password?: string): Promise<any> => {
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

  return await User.findByIdAndUpdate(
    userId,
    { username, email, password },
    { new: true }
  );
};

const deleteUserById = async (userId: string): Promise<any> => {
  return await User.findByIdAndDelete(userId);
};

export {
  createUser,
  getAllUsers,
  getUserById,
  getUserByEmail,
  updateUserById,
  deleteUserById,
};
