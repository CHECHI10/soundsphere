const userModel = require("../models/user.model");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { serializeUser } = require('../utils/serializers');

const roles = ["user", "artist"];


function createToken(user) {
  return jwt.sign(
    {
      id: user._id,
      role: user.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
}

function setAuthCookie(res, token) {
  res.cookie("token", token, {
    httpOnly: true,
    sameSite: "none",
    secure: true,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: "/",
  });
}

async function registerUser(req, res) {
  const username = String(req.body.username || "").trim();
  const email = String(req.body.email || "").trim().toLowerCase();
  const password = String(req.body.password || "");
  const role = req.body.role || "user";

  if (!username || !email || !password) {
    return res.status(400).json({
      message: "Username, email, and password are required",
    });
  }

  if (!roles.includes(role)) {
    return res.status(400).json({
      message: "Invalid role",
    });
  }
 
  const isUserAlreadyExists = await userModel.findOne({
    $or: [
      {username},
      {email}
    ]
  })

  if(isUserAlreadyExists) {
    return res.status(409).json({
      message: "User already exists"
    })
  }

  const hash = await bcrypt.hash(password, 10);

  const newUser = await userModel.create({
    username,
    email,
    password: hash,
    role
  })

  const token = createToken(newUser);
  setAuthCookie(res, token);

  res.status(201).json({
    message: "User registered successfully",
    user: serializeUser(newUser),
  })


}

async function loginUser(req, res) {
  const username = req.body.username ? String(req.body.username).trim() : "";
  const email = req.body.email ? String(req.body.email).trim().toLowerCase() : "";
  const password = String(req.body.password || "");

  if ((!username && !email) || !password) {
    return res.status(400).json({
      message: "Username or email and password are required",
    });
  }

  const user = await userModel.findOne({
    $or: [
      {username},
      {email}
    ]
  })

  if(!user) {
    return res.status(401).json({
      message: "invalid credentials"
    })
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if(!isPasswordValid) {
    return res.status(401).json({
      message: "invalid credentials"
    })
  }

  const token = createToken(user);
  
  setAuthCookie(res, token);

  res.status(200).json({
    message: "User logged in successfully",
    user: serializeUser(user),
  })
}

async function logoutUser(req, res) {
  res.clearCookie("token", {
    httpOnly: true,
    sameSite: "none",
    secure: true,
    path: "/",
  });
  res.status(200).json({
    message: "User logged out successfully",
  });
}

async function getCurrentUser(req, res) {
  const token = (req.cookies && req.cookies.token) || (req.headers.authorization && req.headers.authorization.split(' ')[1]);

  if (!token) return res.status(401).json({ error: 'Authentication required' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await userModel.findById(decoded.id);

    if (!user) return res.status(401).json({ error: 'User not found' });

    return res.status(200).json({ user: serializeUser(user) });
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

module.exports = {registerUser, loginUser, logoutUser, getCurrentUser};
