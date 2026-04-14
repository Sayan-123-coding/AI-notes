import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import noteRoutes from "./routes/noteRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import shareRoutes from "./routes/shareRoutes.js";
import tagRoutes from "./routes/tagRoutes.js";
import exportRoutes from "./routes/exportRoutes.js";
import { writeLimiter, readLimiter, authLimiter } from "./middleware/rateLimit.js";
import User from "./models/User.js"; // Import to register model

dotenv.config();
connectDB();

const app = express();

// CORS configuration
const corsOptions = {
    origin: [
        process.env.FRONTEND_URL || "http://localhost:5173",
        "https://ai-notes-orpin.vercel.app",
        "http://localhost:5173",
        "http://localhost:3000"
    ],
    credentials: true,
    optionsSuccessStatus: 200,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(express.json());

// Apply rate limiting
app.use("/api/auth", authLimiter);
app.use("/api/", writeLimiter);
app.use("/api/", readLimiter);

app.use("/api/auth", authRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/shares", shareRoutes);
app.use("/api/notes", noteRoutes);
app.use("/api/tags", tagRoutes);
app.use("/api/export", exportRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
