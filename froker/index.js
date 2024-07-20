const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());

mongoose
  .connect("mongodb://127.0.0.1:27017/money")
  .then(() => console.log("MongoDB connected"))
  .catch(() => console.log("Error connecting to server"));

// Import routes
const userRoutes = require("./routes/userRoutes");
app.use("/api", userRoutes);

const PORT = 8000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
