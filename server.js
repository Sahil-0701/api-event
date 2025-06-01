import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config(); 
import connectDB from "./config/mongodb.js";
import connectCloudinary from "./config/cloudinary.js";
import userRouter from "./routes/userRoute.js";
import eventRouter from "./routes/eventRoute.js";
import adminRouter from "./routes/adminRoute.js";
import ticketRouter from "./routes/ticketRoute.js";
import bookingRoutes from "./routes/bookingRoutes.js";

const app = express();
const port = process.env.PORT || 5000;

connectDB(); 
connectCloudinary();

app.use(express.json());

const allowedOrigins = [
  process.env.WEB_URL,
  process.env.ADMIN_URL,
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      return callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
}));


app.use("/api/user", userRouter);
app.use("/api/event", eventRouter);
app.use("/api/admin", adminRouter);
app.use("/api/ticket", ticketRouter);
app.use("/api/bookings", bookingRoutes);

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
