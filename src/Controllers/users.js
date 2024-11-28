const express = require("express");
const router = express.Router();

const {
  createUser,
  getAllUsers,
  deleteUserById,
  getUserById,
  updateUserById,
} = require("../DAL/users");

// Create a new user
// TODO: user already exists 
router.post("/", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password)
      return res.status(400).json({ error: "Missing required fields" });

    const newUser = await createUser(username, email, password);
    return res.status(201).json(newUser);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
});

// Get all users
router.get("/", async (req, res) => {
  try {
    const users = await getAllUsers();
    return res.json(users);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
});

// Get a specific user by ID
router.get("/:id", async (req, res) => {
  try {
    if (!req.params.id)
      return res.status(400).json({ error: "Missing required fields" });

    const user = await getUserById(req.params.id);

    if (!user) {
      return res.status(404).json({
        error: "User not found",
      });
    }
    return res.json(user);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Server Error" });
  }
});

// Update a user by ID
// TODO: user already exists 
router.put("/:id", async (req, res) => { 
  try {
    const { id } = req.params;
    const { username, email, password } = req.body;

    if (!id) {
      return res.status(400).json({ error: "Missing required field: id" });
    }

    const updatedUser = await updateUserById(id, username, email, password);
    return res.json(updatedUser);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
});

// Delete a user by ID
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: "Missing required field: id" });
    }

    const user = await deleteUserById(id);

    if (!user) {
      return res.status(404).json({
        error: "User not found",
      });
    }
    return res.json({ message: "User deleted successfully" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

module.exports = router;
