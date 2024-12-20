require("dotenv").config();
const myApp = require("./app.js");

const port = process.env.PORT;
myApp.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
