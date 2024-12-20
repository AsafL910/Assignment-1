const express = require("express");
const router = express.Router();
const { User } = require("../db/schemas");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { createUser, getUserByEmail } = require("../DAL/users");
import { Response, Request, NextFunction } from "express";
import { VerifyErrors } from "jsonwebtoken";

interface UserProps {
  _id: string;
  username: string;
  email: string;
  tokens: string[];
}

interface JwtPayload {
  _id: string;
}

const extractUserProps = (user: any): UserProps => ({
  _id: user._id,
  username: user.username,
  email: user.email,
  tokens: user.tokens,
});

const sendError = (res: Response, errorMessage = "") =>
  res.status(400).json({ error: errorMessage });

router.post("/register", async (req: Request, res: Response) : Promise<void> => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      res.status(400).json({ error: "Missing required fields" });
    }

    const user = await createUser(username, email, password);

    res.status(201).json(extractUserProps(user));
  } catch (error: any) {
    console.log("registration returned error:", error.message);
    sendError(res, error.message);
  }
});

router.post("/login", async (req: Request, res: Response) : Promise<void> => {
  const { email, password } = req.body;

  if (!email || !password) {
    sendError(res, "Bad email or password");
  }

  try {
    const user = await getUserByEmail(email);
    if (!user) sendError(res, "Bad email or password");

    const match = await bcrypt.compare(String(password), user.password);
    if (!match) sendError(res, "Bad email or password");

    const accessToken = jwt.sign(
      { _id: user._id },
      process.env.ACCESS_TOKEN_SECRET!,
      { expiresIn: process.env.JWT_TOKEN_EXPIRATION! }
    );

    const refreshToken = jwt.sign(
      { _id: user._id },
      process.env.REFRESH_TOKEN_SECRET!
    );

    if (!user.tokens) {
      user.tokens = [refreshToken];
    } else {
      user.tokens.push(refreshToken);
    }

    await user.save();

    res.status(200).send({
      id: user._id,
      username: user.username,
      email: user.email,
      accessToken,
      refreshToken,
    });
  } catch (err: any) {
    sendError(res, err.message);
  }
});

router.post("/logout", async (req: Request, res: Response,next: NextFunction) : Promise<void> => {
  const authHeaders = req.headers["authorization"];
  const token = authHeaders && authHeaders.split(" ")[1];

  if (!token) res.sendStatus(401);

  jwt.verify(token as string, process.env.REFRESH_TOKEN_SECRET!, async (err: VerifyErrors | null, userInfo: any) => {
    if (err) res.status(403).send(err.message);

    const userId = (userInfo as JwtPayload)._id;
    try {
      const user = await User.findById(userId);
      if (!user) return res.status(403).send("Invalid request");

      if (!user.tokens.includes(token)) {
        user.tokens = [];
        await user.save();
        return res.status(403).send("Invalid request");
      }

      user.tokens.splice(user.tokens.indexOf(token), 1);
      await user.save();

      res.status(200).send();
    } catch (err: any) {
      res.status(403).send({ message: err.message });
    }
  });
});

router.post("/refreshToken", async (req: Request, res: Response): Promise<void> => {
  const authHeaders = req.headers["authorization"];
  const token = authHeaders && authHeaders.split(" ")[1];

  if (!token) res.sendStatus(401);

  jwt.verify(token as string, process.env.REFRESH_TOKEN_SECRET!, async (err: VerifyErrors | null, userInfo: any) => {
    if (err) return res.status(403).send(err.message);

    const userId = (userInfo as JwtPayload)._id;
    try {
      const user = await User.findById(userId);
      if (!user) return res.status(403).send("Invalid request");

      if (!user.tokens.includes(token)) {
        user.tokens = [];
        await user.save();
        return res.status(403).send("Invalid request");
      }

      const accessToken = jwt.sign(
        { _id: user._id },
        process.env.ACCESS_TOKEN_SECRET!,
        { expiresIn: process.env.JWT_TOKEN_EXPIRATION! }
      );

      const refreshToken = jwt.sign(
        { _id: user._id },
        process.env.REFRESH_TOKEN_SECRET!
      );

      user.tokens[user.tokens.indexOf(token)] = refreshToken;
      await user.save();

      res.status(200).send({
        accessToken,
        refreshToken,
      });
    } catch (err: any) {
      res.status(403).send(err.message);
    }
  });
});

export default router;
