const express = require("express");
const path = require("path");
const app = express();
const cors = require("cors");
const router = require("./routes/routes.js");
const authRoutes = require("./routes/auth.js");

require("dotenv").config();
const connectToMongo = require("./db.js");
connectToMongo();

const port = process.env.PORT || 8080;

app.use(
  cors({
    origin: "*",
  })
);

app.use(express.static(path.join(__dirname, "Public")));
app.use(express.json())

app.use("/", router);
app.use("/auth", authRoutes);

app.listen(port, () => {
  console.log("Server Started at http://localhost:" + port);
});
