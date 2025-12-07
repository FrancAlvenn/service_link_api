import express from "express";
import {
  createVenueBooking,
  getAllVenueBookings,
  getVenueBookingById,
  updateVenueBooking,
  deleteVenueBooking,
  getVenueBookingsByVenue,
  getVenueBookingsByDate,
} from "../controllers/venues.js";

const router = express.Router();

router.post("/", createVenueBooking);
router.get("/", getAllVenueBookings);
router.get("/venue/:venue_id", getVenueBookingsByVenue);
router.get("/date/:date", getVenueBookingsByDate);
router.get("/:booking_id", getVenueBookingById);
router.put("/:booking_id", updateVenueBooking);
router.delete("/:booking_id", deleteVenueBooking);

export default router;

