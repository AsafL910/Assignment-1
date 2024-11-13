app = require("../..");

app.get("/", (req, res) => {
  res.send("Hello World!");
});

console.log("hi test");
