const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const env = require("./config/env");
const { sequelize } = require("./models");
const authRoutes = require("./routes/authRoutes");
const trainRoutes = require("./routes/trainRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const pnrRoutes = require("./routes/pnrRoutes");
const { authLimiter, bookingLimiter, publicApiLimiter } = require("./middleware/rateLimitMiddleware");
const { notFoundHandler, errorHandler } = require("./middleware/errorMiddleware");
const { seedDemoData } = require("./services/seedService");

const app = express();

app.use(
  cors({
    origin: env.clientOrigin,
    credentials: true
  })
);
app.use(helmet());
app.use(morgan(env.nodeEnv === "production" ? "combined" : "dev"));
app.use(express.json({ limit: "1mb" }));

app.get("/health", (_req, res) => {
  res.json({
    success: true,
    service: "bharatrail-backend",
    environment: env.nodeEnv
  });
});

app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/trains", publicApiLimiter, trainRoutes);
app.use("/api/bookings", bookingLimiter, bookingRoutes);
app.use("/api/pnr", publicApiLimiter, pnrRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

async function bootstrap() {
  await sequelize.authenticate();

  if (env.syncDb) {
    await sequelize.sync();
  }

  if (env.seedDemoData) {
    await seedDemoData();
  }

  app.listen(env.port, () => {
    console.log(`BharatRail backend running on http://localhost:${env.port}`);
  });
}

bootstrap().catch((error) => {
  console.error("Failed to start BharatRail backend:", error);
  process.exit(1);
});
