const axios = require("axios");
const PORT = process.env.PORT || 3000;
const User = require("../models/user.model");
const { v4: uuidv4 } = require("uuid");
const jwt = require("jsonwebtoken");
const successResponse = require("../utils/successResponse");
const errorResponse = require("../utils/errorResponse");

const googleAuthRedirect = async (req, res) => {
  const { redirect } = req.query;

  const googleAuthUrl = `https://accounts.google.com/o/oauth2/auth?client_id=${process.env.GOOGLE_CLIENT_ID}&redirect_uri=http://localhost:${PORT}/api/v1/auth/google/callback&response_type=code&scope=profile email&state=${redirect || "/"}`;

  res.redirect(googleAuthUrl);
};

const googleAuthCallback = async (req, res) => {
  const { code, state } = req.query;
  if (!code) {
    return res.status(400).send("Authorization code not provided.");
  }

  // (1) Exchange code for Google-Access-Token
  let accessToken;
  try {
    const tokenResponse = await axios.post(
      "https://oauth2.googleapis.com/token",
      {
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        code,
        grant_type: "authorization_code",
        redirect_uri: `${process.env.FRONTEND_URL}/api/v1/auth/google/callback`,
      },
      {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      },
    );

    accessToken = tokenResponse.data.access_token;

    // (2) Fetch Google-UserData
    const googleUserDataResponse = await axios.get(
      "https://www.googleapis.com/oauth2/v2/userinfo",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );
    const googleUser = googleUserDataResponse.data;

    // (3) Find & Save User
    let user = await User.findOne({ email: googleUser.email });
    if (!user) {
      user = await User.create({
        userId: uuidv4(),
        name: googleUser.name,
        email: googleUser.email,
        avtar: googleUser.picture,
      });

      await user.save();
    }

    // (4) Create JWT
    const jwtToken = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1d" },
    );

    // (5) Secure Cookie
    res.cookie("access_token", jwtToken, {
      httpOnly: true,
      secure: false, // Local: false  // Production: true
      sameSite: "lax", // Local: "lax"    // Production: "none"
      maxAge: 1 * 24 * 60 * 60 * 1000,
    });

    const redirectUrl = state || "/";

    return res.redirect(`${process.env.FRONTEND_URL}${redirectUrl}`);
  } catch (error) {
    console.error(error);
  }
};

const getUserDetails = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.user.email });

    res.status(200).json({ message: "User Authenticated", user });
  } catch (err) {
    res.status(err.statusCode || 500).json({ err: err.message });
  }
};

const verifySession = (req, res) => {
  successResponse(res, 200, "Authenticated user");
};

const logoutUser = async (req, res) => {
  try {
    // 0. accessToken cookie delete
    res.clearCookie("access_token", {
      httpOnly: true,
      secure: true, // production me true
      sameSite: "none", // agar cross-origin hai
    });

    return successResponse(res, 200, "Logged out successfully.");
  } catch (err) {
    return errorResponse(
      res,
      err.statusCode || 500,
      err.message || "Internal server error",
      err.errors,
    );
  }
};

module.exports = {
  googleAuthRedirect,
  googleAuthCallback,
  getUserDetails,
  verifySession,
  logoutUser,
};
