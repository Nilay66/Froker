const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  phoneNumber: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  dateOfRegistration: { type: Date, default: Date.now },
  dob: { type: Date, required: true },
  monthlySalary: { type: Number, required: true },
  password: { type: String, required: true },
  purchasePower: { type: Number, default: 0 },
  applicationStatus: { type: String, default: "pending" },
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

const User = mongoose.model("User", userSchema);

module.exports = User;
