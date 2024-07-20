const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../model/User");

const JWT_SECRET = "jwt_secret";

// Approve Application During Signup
router.post("/signup", async (req, res) => {
  const { phoneNumber, email, name, dob, monthlySalary, password } = req.body;

  // Validate age and monthly salary
  const age = new Date().getFullYear() - new Date(dob).getFullYear();
  if (age < 20 || monthlySalary < 25000) {
    return res
      .status(400)
      .json({ message: "User does not meet age or salary requirements" });
  }

  // Check if user already exists
  const oldUser = await User.findOne({ email });
  if (oldUser) {
    return res.status(400).json({ message: "User already exists" });
  }

  // Create and save new user
  const newUser = new User({
    phoneNumber,
    email,
    name,
    dob,
    monthlySalary,
    password,
    applicationStatus: "approved",
  });

  await newUser.save();
  res.status(201).json({ message: "User registered successfully" });
});

// Login API
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  // Find user by email
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(400).json({ message: "Invalid email or password" });
  }

  // Check password
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(400).json({ message: "Invalid email or password" });
  }

  // Generate JWT
  const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: "1h" });
  res.json({ token });
});

// Middleware
const authenticate = (req, res, next) => {
  const token = req.header("x-auth-token");
  if (!token) {
    return res.status(401).json({ message: "No token, authorization denied" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded.userId;
    next();
  } catch (err) {
    res.status(401).json({ message: "Token is not valid" });
  }
};

// Show User Data
router.get("/user", authenticate, async (req, res) => {
  const user = await User.findById(req.user).select("-password");
  res.json(user);
});

// Borrow Money API
router.post("/borrow", authenticate, async (req, res) => {
  const { amount } = req.body;

  // Find user
  const user = await User.findById(req.user);

  // Update Purchase Power
  user.purchasePower += amount;

  // Calculate repayments
  const interestRate = 0.08;
  const tenure = 12; // 12 months
  const monthlyRepayment = (amount * (1 + interestRate)) / tenure;

  await user.save();
  res.json({
    purchasePower: user.purchasePower,
    monthlyRepayment: monthlyRepayment.toFixed(2),
  });
});

module.exports = router;
