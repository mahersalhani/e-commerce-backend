const express = require("express");
const path = require("path");
const cors = require("cors");
const dotenv = require("dotenv");
const morgan = require("morgan");
const compression = require("compression");
const rateLimit = require("express-rate-limit");
const hpp = require("hpp");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");

const dbConnection = require("./config/database");

//  Routes
const mountRoutes = require("./routes");

const ApiError = require("./utils/apiError");
const globalError = require("./middlewares/errorMiddlewares");
const { webhookCheckOut } = require("./controllers/orderController");

const app = express();

// Enable other to access routes
app.use(cors());
app.options("*", cors());

//compress all response
app.use(compression());

// // allows to access routes
// app.use((req, res, next) => {
//   res.setHeader("Access-Control-Allow-Origin", "*");
//   res.setHeader("Access-Control-Allow-Methods", "OPTIONS, GET, POST, PUT, PATCH, DELETE");
//   res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
//   if (req.method === "OPTIONS") {
//     return res.sendStatus(200);
//   }

//   next();
// });

//check out webhook
app.post("/webhook", express.raw({ type: "application/json" }), webhookCheckOut);

dotenv.config({ path: "./config.env" });

//connect with db
dbConnection();

// Middlewares
// to parse comming req
app.use(express.json({ limit: "30kb" }));

// Middlewares to protect against HTTP Parameter Pollution attacks
app.use(hpp({ whitelist: ["price", "sold", "quantity", "ratingsQuantity", "ratingsAverage"] }));

app.use(express.static(path.join(__dirname, "uploads")));

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// To remove data using these defaults:
app.use(mongoSanitize());
/* make sure this comes before any routes */
app.use(xss());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 250, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  message: "Too many accounts created from this IP, please try again after an 15 minutes",
  // standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  // legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Apply the rate limiting middleware to all requests
app.use("/api", limiter);

// Routes
mountRoutes(app);

app.use("*", (req, res, next) => {
  // Creat error

  next(new ApiError(`Can't find this route: ${req.originalUrl}`, 400));
});

// Global error handler
app.use(globalError);

const PORT = process.env.PORT || 8000;

const server = app.listen(PORT, () => {
  console.log("App running");
});

//  // // // // // // // // // // // //

// Handel rejection outside express
process.on("unhandledRejection", (err) => {
  console.log(`UnhandledRejection Error: ${err.name} | ${err.message}`);
  server.close(() => {
    console.log(`Shutting down.....`);
    process.exit(1);
  });
});
