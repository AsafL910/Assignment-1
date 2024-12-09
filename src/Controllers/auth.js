const express = require("express");
const router = express.Router();
const authenticate = require("../Middlewares/authMiddleware");

router.post("/register", async (req, res, next) => {
  console.log("register");
  res.status(400).send({
    status: "fail",
    message: "not implemented",
  });
});

router.post("/login", async (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  if (email == null || password == null)
    return sendError(res, "bad email or password");

  try {
    const user = await User.findOne({ email: email });
    if (user == null) return sendError(res, "bad email or password");

    const match = await bcrypt.compare(password, user.password);
    if (!match) return sendError(res, "bad email or password");

    res.status(200).send("login success");
  } catch (err) {
    return sendError(res, err);
  }
});

router.post("/logout", authenticate, async (req, res, next) => {
  console.log("logout");
  res.status(400).send({
    status: "fail",
    message: "not implemented",
  });
});

module.exports = router;
