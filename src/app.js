require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const config = require("./config/env");

const app = express();
const corsOptions = {
  origin: config.FRONTEND_URL,
  credentials: true,
};

// Middleware
app.use(express.json()); // to read JSON-data
app.use(cookieParser()); // to read cookies from req(frontend)
app.use(cors(corsOptions));

// Import Router Files
const authRouter = require("./routes/auth.route");
const albumRouter = require("./routes/album.route");
const albumImageRouter = require("./routes/albumImage.route");
const imageRouter = require("./routes/image.route");

// Use Router Files
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/albums", albumRouter);
app.use("/api/v1/albums/:albumId/images", albumImageRouter);
app.use("/api/v1/images", imageRouter);

module.exports = app;
