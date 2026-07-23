const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/career_contact_db";

    const conn = await mongoose.connect(uri, {
      // Modern mongoose (6+/8+) no longer needs useNewUrlParser / useUnifiedTopology
      // but they are harmless if left in for older versions.
    });

    console.log(`MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);

    mongoose.connection.on("error", (err) => {
      console.error(`MongoDB connection error: ${err}`);
    });

    mongoose.connection.on("disconnected", () => {
      console.warn("MongoDB disconnected");
    });
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
