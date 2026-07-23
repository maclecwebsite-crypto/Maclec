require("dotenv").config();

const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

const connectDB = require("./config/db");
const { notFound, errorHandler } = require("./middleware/errorHandler");

const careerRoutes = require("./routes/careerRoutes");
const applicationRoutes = require("./routes/applicationRoutes");
const contactRoutes = require("./routes/contactRoutes");

// Connect to MongoDB
connectDB();

const app = express();

// ---- Core middleware ----
app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN ? process.env.CLIENT_ORIGIN.split(",") : "*",
  })
);
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}

// ---- Health check ----
app.get("/api/health", (req, res) => {
  res.status(200).json({ success: true, message: "API is up and running" });
});

// ---- Routes ----
app.use("/api/careers", careerRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/contact-queries", contactRoutes);

// ---- 404 + error handling (must be last) ----
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || "development"} mode on port ${PORT}`);
});

module.exports = app;
