const express = require("express");
const bcrypt = require("bcrypt");
const router = express.Router();
const { User } = require("../db/schemas");
const authenticate = require("../Middlewares/authMiddleware");
const {createUser} = require('../DAL/users')
const jwt = require('jsonwebtoken');
const sendError = (res, errorMessage = '') => res.status(400).json(errorMessage); 
router.post("/register", async (req, res, next) => {
  // check if user is valid
  const email = req.body.email;
  const password = req.body.password;
  const username = req.body.username;

  if (email === null || password === null) {
    return sendError(res);
  }

  // check if it is not already registered
  try {
    const user = await User.findOne({ 'email': email });
    if (user !== null) {
      return sendError(res, 'user already registered');
    }
  } catch (err) {
    return sendError(res);
  }

  const newUser = await createUser(username, email, String(password));
    return res.status(200).json({email: newUser.email, password: password});
  
});

router.post("/login", async (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  if (email == null || password == null)
    return sendError(res, "bad email or password");

  try {
    const user = await User.findOne({ email: email });
    if (user == null) return sendError(res, "bad email or password");
    const match = await bcrypt.compare(String(password),user.password);
    if (!match) return sendError(res, "bad email or password");
  
    const accessToken = await jwt.sign(
      { _id: user._id },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: process.env.JWT_TOKEN_EXPIRATION }
    );
    const refreshToken = await jwt.sign(
      { _id: user._id },
      process.env.REFRESH_TOKEN_SECRET
    );
    
    if (user.tokens === null) {
      user.tokens = [refreshToken];
    } else {
      user.tokens.push(refreshToken);
    }
    
    await user.save();

    res.status(200).send({
      accessToken: accessToken,
      refreshToken: refreshToken,
    });
  } catch (err) {
    return sendError(res, err);
  }
});

router.post("logout", async (req, res, next) => {
  const authHeaders = req.headers["authorization"];
  const token = authHeaders && authHeaders.split(" ")[1];

  if (token === null) return res.sendStatus(401);

  jwt.verify(token, process.env.REFRESH_TOKEN_SECRET, async (err, userInfo) => {
    if (err) return res.status(403).send(err.message);

    const userId = userInfo._id;
    try {
      const user = await User.findById(userId);
      if (user === null) return res.status(403).send("invalid request");

      if (!user.tokens.includes(token)) {
        user.tokens = []; // Invalidate all user tokens
        await user.save();
        return res.status(403).send("invalid request");
      }

      user.tokens.splice(user.tokens.indexOf(token), 1);
      await user.save();

      res.status(200).send();
    } catch (err) {
      res.status(403).send(err.message);
    }
  });
});

router.post("/refreshToken", async (req, res, next) => {
  const authHeaders = req.headers["authorization"];
  const token = authHeaders && authHeaders.split(" ")[1];

  if (token === null) return res.sendStatus(401);

  jwt.verify(token, process.env.REFRESH_TOKEN_SECRET, async (err, userInfo) => {
    if (err) return res.status(403).send(err.message);

    const userId = userInfo._id;
    try {
      const user = await User.findById(userId);
      if (user === null) return res.status(403).send("invalid request");

      if (!user.tokens.includes(token)) {
        user.tokens = []; // Invalidate all user tokens
        await user.save();
        return res.status(403).send("invalid request");
      }

      const accessToken = await jwt.sign(
        {
          _id: user._id,
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
          expiresIn: process.env.JWT_TOKEN_EXPIRATION,
        }
      );

      const refreshToken = await jwt.sign(
        {
          _id: user._id,
        },
        process.env.REFRESH_TOKEN_SECRET
      );

      user.tokens[user.tokens.indexOf(token)] = refreshToken;
      await user.save();

      res.status(200).send({
        accessToken: accessToken,
        refreshToken: refreshToken,
      });
    } catch (err) {
      res.status(403).send(err.message);
    }
  });
});

module.exports = router;
