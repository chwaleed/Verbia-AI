import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import { clerkMiddleware, requireAuth } from "@clerk/express";

dotenv.config();

// Routes
import aiRouter from "./routes/ai.routes.js";
import userRouter from "./routes/user.routes.js";
import connectCloudinary from "./config/Cloudinary.js";

const app = express();
await connectCloudinary();

// Middlewares
// origin: process.env.NODE_ENV === "production"
//     ? process.env.CORS_ORIGIN
//     : "http://localhost:5173",

console.log(
  "here is it ",
  process.env.NODE_ENV === "production"
    ? "https://chwaleed.me"
    : "http://localhost:8080"
);

app.use(express.json());
app.use(clerkMiddleware());
app.use(
  cors({
    origin: true,
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.get("/", (req, res) => {
  res.send("Server is Running");
});

// Test endpoint without auth
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "Server is healthy" });
});

// Apply authentication only to API routes
app.use("/api/ai", requireAuth(), aiRouter);
app.use("/api/user", requireAuth(), userRouter);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is Running on Port ${PORT}`);
});
