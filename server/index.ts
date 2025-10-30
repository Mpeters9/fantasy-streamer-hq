import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import oddsRouter from "./routes/odds";
import weatherRouter from "./routes/weather";
import rankingsRouter from "./routes/rankings";
import playersRouter from "./routes/players";
import streamersRouter from "./routes/streamers";

dotenv.config({ path: ".env.local" });

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Health check
app.get("/", (_, res) => {
  res.send({ message: "Fantasy Streamer HQ API is running 🚀" });
});

// Routes
app.use("/api/cron/odds", oddsRouter);
app.use("/api/cron/weather", weatherRouter);
app.use("/api/cron/rankings", rankingsRouter);
app.use("/api/cron/players", playersRouter);
app.use("/api/cron/streamers", streamersRouter);

// Start the server
app.listen(PORT, () => {
  console.log(`✅ API server running on http://localhost:${PORT}`);
});
