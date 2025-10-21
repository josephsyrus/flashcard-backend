import express from "express";
import cors from "cors";
import userRoutes from "./routes/users.js";
import flashcardRoutes from "./routes/flashcards.js";



const app = express();
const PORT = process.env.PORT || 5000;

// --- CORS Configuration ---
// We only need to allow our local React dev server.
// On production, Nginx makes it a same-origin request, so CORS isn't needed.
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
}));
// --- End CORS Configuration ---

app.use(express.json()); // Middleware to parse JSON bodies

// API Routes
app.use("/api/users", userRoutes);
app.use("/api/flashcards", flashcardRoutes);

// Health check route
app.get("/", (req, res) => {
  res.send("Flashcard API is running!");
});

app.listen(PORT, 'localhost', () => {
  // We listen on 'localhost' so the app only accepts connections
  // from the machine itself (i.e., from Nginx).
  console.log(`Server running on http://localhost:${PORT}`);
});