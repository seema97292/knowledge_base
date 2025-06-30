import express from "express";
import cors from "cors";
import path from "path";
import dotenv from "dotenv";
import connectDB from "./config/database";

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Serve static files from React build
app.use(express.static(path.join(__dirname, "../public")));

// API Routes
import authRoutes from "./routes/auth";
import documentRoutes from "./routes/documents";

app.use("/api/auth", authRoutes);
app.use("/api/documents", documentRoutes);

// Error handling middleware
app.use(
  "/api/*",
  (
    err: any,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction,
  ) => {
    console.error(err.stack);
    res.status(500).json({ message: "Something went wrong!" });
  },
);

// Catch all handler: send back React's index.html file for any non-API routes
app.get("*", (req: express.Request, res: express.Response) => {
  if (req.path.startsWith("/api")) {
    res.status(404).json({ message: "API route not found" });
  } else {
    res.sendFile(path.join(__dirname, "../public", "index.html"));
  }
});

const PORT = parseInt(process.env.PORT || "5101");

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
