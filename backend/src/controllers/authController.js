const User = require('../models/User');
const generateToken = require('../utils/generateToken');

async function register(req, res, next) {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'name, email, and password are required' });
    }
    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) {
      return res.status(409).json({ message: 'Email already registered' });
    }
    const allowedRoles = ['buyer', 'seller', 'admin'];
    const user = await User.create({
      name,
      email,
      password,
      role: allowedRoles.includes(role) ? role : 'buyer',
    });
    const token = generateToken(user);
    res.status(201).json({ user, token });
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'email and password are required' });
    }
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const token = generateToken(user);
    res.json({ user, token });
  } catch (err) {
    next(err);
  }
}

module.exports = { register, login };
