const mongoose = require("mongoose");
const MONGO_URI = process.env.MONGO_URI;

function db() {
  mongoose
    .connect(MONGO_URI)
    .then(() => {
      console.log("Connected to MongoDB");
    })
    .catch((err) => {
      console.log("Error Connecting to MongoDb" + err.message);
    });
}

module.exports = db