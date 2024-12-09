const express = require("express");
const router = express.Router();

const {
  createUser,
  getAllUsers,
  deleteUserById,
  getUserById,
  updateUserById,
} = require("../DAL/users");
const mongoose = require("mongoose");
const authenticate = require("../Middlewares/authMiddleware");

const extractUserProps = (user) => ({
  id: user.id,
  username: user.username,
  email: user.email,
});

//TODO: validate user not empty
// Create a new user
router.post("/", authenticate, async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password)
      return res.status(400).json({ error: "Missing required fields" });

    const newUser = await createUser(username, email, password);
    return res.status(201).json(extractUserProps(newUser));
  } catch (error) {
    error.message === "Username already exists" ||
    error.message === "Email already exists"
      ? res.status(400)
      : res.status(500);
    return res.json({ error: error.message });
  }
});

// Get all users
router.get("/", authenticate, async (req, res) => {
  try {
    const users = await getAllUsers();
    return res.json(users.map(extractUserProps));
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
});

// Get a specific user by ID
router.get("/:id", authenticate, async (req, res) => {
  try {
    if (!req.params.id)
      return res.status(400).json({ error: "Missing required fields" });

    const user = await getUserById(req.params.id);

    if (!user) {
      return res.status(404).json({
        error: "User not found",
      });
    }
    return res.json(extractUserProps(user));
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Server Error" });
  }
});

//TODO: validate data not empty
// Update a user by ID
router.put("/:id", authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { username, email, password } = req.body;

    if (!id) {
      return res.status(400).json({ error: "Missing required field: id" });
    }

    const updatedUser = await updateUserById(id, username, email, password);
    if (!updatedUser) {
      return res.status(400).json({ error: "user Not Found" });
    }
    return res.json(extractUserProps(updatedUser));
  } catch (error) {
    error.message === "Username already exists" ||
    error.message === "Email already exists"
      ? res.status(400)
      : res.status(500);
    return res.json({ error: error.message });
  }
});

// Delete a user by ID
router.delete("/:id", authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: "Missing required field: id" });
    }
    if (typeof id !== "string" || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "incorrect id format" });
    }
    const user = await deleteUserById(id);

    if (!user) {
      return res.status(404).json({
        error: "User not found",
      });
    }
    return res.json({
      message: "User deleted successfully",
      user: extractUserProps(user),
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

module.exports = router;
