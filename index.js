import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.js";
import jobRequestRoutes from "./routes/job_request.js";
import venueRequestRoutes from "./routes/venue_request.js";
import vehicleRequestRoutes from "./routes/vehicle_request.js";
import settingsRoutes from "./routes/settings.js";
import ticketRoutes from "./routes/ticketing.js";
import userRoutes from "./routes/user_management.js";
import purchasingRequestRoutes from "./routes/purchasing_request.js";
import requestActivityRoutes from "./routes/request_activity.js";
import assetRoutes from "./routes/assets.js";
import assetAssignmentRoutes from "./routes/asset_assignment.js";
import employeeRoutes from "./routes/employee.js";

import sequelize from "./database.js";
import { syncModels } from "./models/syncModels.js";

import { verifyToken } from "./middleware/authMiddleware.js";
import cookieParser from "cookie-parser";

const app = express();

var whitelist = ['http://localhost:3000', 'https://61e8d2928f21.ngrok-free.app', 'https://service-link.up.railway.app', 'https://service-link-lake.vercel.app']
var corsOptions = {
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
}

// Allow all origins and credentials

app.use(cors(corsOptions));

app.use(cookieParser());

app.use(express.json());

//Routes for api requests -- connected to routes/ directory

//Auth Route
app.use("/auth", authRoutes);

//Job_Request Route
app.use("/job_request",  verifyToken, jobRequestRoutes);

//Venue Request Route
app.use("/venue_request", verifyToken, venueRequestRoutes);

//Vehicle Request Route
app.use("/vehicle_request", verifyToken, vehicleRequestRoutes);

//Purchasing Request Route
app.use(
  "/purchasing_request",
  verifyToken,
  purchasingRequestRoutes
);

//Settings Route
app.use("/settings", verifyToken, settingsRoutes);

//Ticket Route
app.use("/ticket", verifyToken, ticketRoutes);

//User Management
app.use("/users", verifyToken, userRoutes);

//Request Activity
app.use(
  "/request_activity",
  
  verifyToken,
  requestActivityRoutes
);

//Asset Management
app.use("/assets", verifyToken, assetRoutes);

//Asset Assignment Logs
app.use(
  "/asset_assignment",
  verifyToken,
  assetAssignmentRoutes
);

//Employee Management
app.use("/employees", verifyToken, employeeRoutes);

const PORT = process.env.PORT || 8080;

app.listen(8080, async () => {
  console.log("✅ Connected");
  // await syncModels(sequelize); // Sync all models
});
