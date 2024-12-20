import express, { Request, Response } from "express";
import mongoose from "mongoose";
import authenticate from "../Middlewares/authMiddleware";
import {
  getAllUsers,
  deleteUserById,
  getUserById,
  updateUserById,
  getUserByEmail,
} from "../DAL/users";

const router = express.Router();

interface User {
  _id: mongoose.Types.ObjectId;
  username: string;
  email: string;
  tokens: string[];
}

const extractUserProps = (user: User) => ({
  _id: user._id,
  username: user.username,
  email: user.email,
  tokens: user.tokens,
});

router.get("/", authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const users = await getAllUsers();
    res.json(users.map(extractUserProps));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Get a specific user by ID
router.get("/:id", authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id;
    if (!id) res.status(400).json({ error: "Missing required fields" });

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ error: "incorrect id format" });
    }
    const user = await getUserById(id);

    if (!user) {
      res.status(404).json({
        error: "User not found",
      });
    }
    res.json(extractUserProps(user));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server Error" });
  }
});

// Update a user by ID
router.put("/:id", authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { username, email, password } = req.body;

    if (username === "" || email === "" || password === "")
      res.status(400).json({ error: "cannot update to empty fields" });

    if (!id) {
      res.status(400).json({ error: "Missing required field: id" });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ error: "incorrect id format" });
    }
    const updatedUser = await updateUserById(id, username, email, password);
    if (!updatedUser) {
      res.status(400).json({ error: "user Not Found" });
    }
    res.json(extractUserProps(updatedUser));
  } catch (error: any) {
    const statusCode = error.message === "Username already exists" || error.message === "Email already exists" ? 400 : 500;
    res.status(statusCode).json({ error: error.message });
  }
});

// Delete a user by ID
router.delete("/:id", authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!id) {
      res.status(400).json({ error: "Missing required field: id" });
    }
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ error: "incorrect id format" });
    }
    const user = await deleteUserById(id);

    if (!user) {
      res.status(404).json({
        error: "User not found",
      });
    }
    res.json({
      message: "User deleted successfully",
      user: extractUserProps(user),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
