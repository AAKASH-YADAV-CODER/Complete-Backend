import Express from "express";
// require("dotenv").config();
import dotenv from "dotenv";
dotenv.config();
const port = process.env.PORT || 4000;
const app = Express();
app.get("/api/movies", (req, res) => {
  const movies = [
    {
      id: 1,
      title: "First movie",
      description: "This is first movie of this collection",
    },
    {
      id: 2,
      title: "second movie",
      description: "This is second movie of this collection",
    },
    {
      id: 3,
      title: "third movie",
      description: "This is third movie of this collection",
    },
  ];
  res.send(movies);
});

app.listen(port, () => {
  console.log(`this app listening on port:${port}`);
});
