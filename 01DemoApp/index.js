require("dotenv").config();
const express = require("express");
const app = express();
const port = 4000;

app.get("/", (req, res) => {
  res.send("This is Home page");
});

app.get("/Mynewpage", (req, res) => {
  res.send("This is Another page of my new page");
});

app.listen(process.env.PORT, () => {
  console.log(`This is example of listening on port ${port}`);
});
