import express from "express";
import {
  createVehicleBooking,
  getAllVehicleBookings,
  getVehicleBookingById,
  updateVehicleBooking,
  deleteVehicleBooking,
  getVehicleBookingsByVehicle,
  getVehicleBookingsByDate,
} from "../controllers/vehicles.js";

const router = express.Router();

router.post("/", createVehicleBooking);
router.get("/", getAllVehicleBookings);
router.get("/vehicle/:vehicle_id", getVehicleBookingsByVehicle);
router.get("/date/:date", getVehicleBookingsByDate);
router.get("/:booking_id", getVehicleBookingById);
router.put("/:booking_id", updateVehicleBooking);
router.delete("/:booking_id", deleteVehicleBooking);

export default router;

