import dotenv from "dotenv";
dotenv.config();
import "express-async-errors";
import express from "express";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import rateLimiter from "express-rate-limit";
import cors from "cors";

import { prismaClient } from "./db";
// Routers
import authRouter from "./routes/auth.routes";
import userRouter from "./routes/user.routes";
import zapRouter from "./routes/zap.routes";
import triggerRouter from "./routes/trigger.routes";
import actionRouter from "./routes/action.routes";

// Middleware
import notFoundMiddleware from "./middlewares/not-found";
import errorHandlerMiddleware from "./middlewares/error-handler";

// const __dirname = dirname(fileURLToPath(import.meta.url)); // Uncomment if you have a frontend

// Initialize Express app
const app = express();

// Middleware setup
app.use(express.json());

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

app.use(cookieParser(process.env.COOKIE_SECRET));

// app.use(express.static(resolve(__dirname, "./client/dist"))); // Uncomment if you have a frontend

// Security
// app.set("trust proxy", 1);
// app.use(
//   rateLimiter({
//     windowMs: 15 * 60 * 1000,
//     max: 60,
//   })
// );
app.use(helmet());
app.use(cors());

// Routes
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/zaps", zapRouter);
app.use("/api/v1/triggers", triggerRouter);
app.use("/api/v1/actions", actionRouter);

// Serve static files in production
// Uncomment the below line if you have a frontend to serve in production
// app.get("*", (req: Request, res: Response) => {
//     res.sendFile(resolve(__dirname, "./client/dist", "index.html"));
// });

// Error handling
app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

// Port
const port = process.env.PORT || 3002;

// Start the server
const startServer = async () => {
  try {
    await prismaClient.$connect();
    app.listen(port, () => {
      console.log(`Server is listening on http://localhost:${port}/...`);
    });
  } catch (error) {
    console.error(error);
  }
};

startServer();
