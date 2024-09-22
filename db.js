const mongoose = require("mongoose");
const connectionString = process.env.MONGO_URI;

const connectToMongo = () => {
  mongoose
    .connect(connectionString)
    .then(() => {
      console.log("Connected to MongoDB");
      // Handle connection closure
      mongoose.connection.on("close", () => {
        console.log("Connection to MongoDB closed");
      });
    })
    .catch((error) => console.error("Connection error", error));
};

module.exports = connectToMongo;
