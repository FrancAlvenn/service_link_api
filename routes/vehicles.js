import express from "express";
import {
  createVehicle,
  deleteVehicle,
  getAllVehicles,
  getVehicleById,
  updateVehicle,
  getVehiclesByStatus,
  // Vehicle Unavailability routes
  createVehicleUnavailability,
  getAllVehicleUnavailability,
  getVehicleUnavailabilityById,
  updateVehicleUnavailability,
  deleteVehicleUnavailability,
  getVehicleUnavailabilityByVehicle,
  // Vehicle Bookings routes
  createVehicleBooking,
  getAllVehicleBookings,
  getVehicleBookingById,
  updateVehicleBooking,
  deleteVehicleBooking,
  getVehicleBookingsByVehicle,
  getVehicleBookingsByDate,
  checkVehicleAvailability,
} from "../controllers/vehicles.js";

const router = express.Router();

// ============================================
// Vehicle Routes
// ============================================

// Route to create a new vehicle (POST)
router.post("/", createVehicle);

// Route to get all vehicles (GET)
router.get("/", getAllVehicles);

// Route to get vehicles by status (GET)
router.get("/status/:status", getVehiclesByStatus);

// Route to check vehicle availability (GET)
router.get("/availability", checkVehicleAvailability);

// Route to get a vehicle by ID (GET)
router.get("/:reference_number", getVehicleById);

// Route to update a vehicle (PUT)
router.put("/:reference_number", updateVehicle);

// Route to delete/archive a vehicle (DELETE)
router.delete("/:reference_number", deleteVehicle);

// ============================================
// Vehicle Unavailability Routes
// ============================================

// Route to get all vehicle unavailability records (GET)
router.get("/unavailability", getAllVehicleUnavailability);

// Route to create a new vehicle unavailability (POST)
router.post("/unavailability", createVehicleUnavailability);

// Route to get unavailability by vehicle (GET)
router.get("/unavailability/vehicle/:vehicle_id", getVehicleUnavailabilityByVehicle);

// Route to get a vehicle unavailability by ID (GET)
router.get("/unavailability/:unavailability_id", getVehicleUnavailabilityById);

// Route to update a vehicle unavailability (PUT)
router.put("/unavailability/:unavailability_id", updateVehicleUnavailability);

// Route to delete a vehicle unavailability (DELETE)
router.delete("/unavailability/:unavailability_id", deleteVehicleUnavailability);

// ============================================
// Vehicle Bookings Routes
// ============================================

// Route to create a new vehicle booking (POST)
router.post("/bookings", createVehicleBooking);

// Route to get all vehicle bookings (GET)
router.get("/bookings", getAllVehicleBookings);

// Route to get bookings by vehicle (GET)
router.get("/bookings/vehicle/:vehicle_id", getVehicleBookingsByVehicle);

// Route to get bookings by date (GET)
router.get("/bookings/date/:date", getVehicleBookingsByDate);

// Route to get a vehicle booking by ID (GET)
router.get("/bookings/:booking_id", getVehicleBookingById);

// Route to update a vehicle booking (PUT)
router.put("/bookings/:booking_id", updateVehicleBooking);

// Route to delete/cancel a vehicle booking (DELETE)
router.delete("/bookings/:booking_id", deleteVehicleBooking);

export default router;

