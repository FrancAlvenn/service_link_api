import express from "express";
import {
  createVenue,
  deleteVenue,
  getAllVenues,
  getVenueById,
  updateVenue,
  getVenuesByStatus,
  // Venue Unavailability routes
  createVenueUnavailability,
  getAllVenueUnavailability,
  getVenueUnavailabilityById,
  updateVenueUnavailability,
  deleteVenueUnavailability,
  getVenueUnavailabilityByVenue,
  // Venue Bookings routes
  createVenueBooking,
  getAllVenueBookings,
  getVenueBookingById,
  updateVenueBooking,
  deleteVenueBooking,
  getVenueBookingsByVenue,
  getVenueBookingsByDate,
  checkVenueAvailability,
} from "../controllers/venues.js";

const router = express.Router();

// ============================================
// Venue Routes
// ============================================

// Route to create a new venue (POST)
router.post("/", createVenue);

// Route to get all venues (GET)
router.get("/", getAllVenues);

// Route to get venues by status (GET)
router.get("/status/:status", getVenuesByStatus);

// Route to check venue availability (GET)
router.get("/availability", checkVenueAvailability);

// Route to get a venue by ID (GET)
router.get("/:reference_number", getVenueById);

// Route to update a venue (PUT)
router.put("/:reference_number", updateVenue);

// Route to delete/archive a venue (DELETE)
router.delete("/:reference_number", deleteVenue);

// ============================================
// Venue Unavailability Routes
// ============================================

// Route to create a new venue unavailability (POST)
router.post("/unavailability", createVenueUnavailability);

// Route to get all venue unavailability records (GET)
router.get("/unavailability", getAllVenueUnavailability);

// Route to get unavailability by venue (GET)
router.get("/unavailability/venue/:venue_id", getVenueUnavailabilityByVenue);

// Route to get a venue unavailability by ID (GET)
router.get("/unavailability/:unavailability_id", getVenueUnavailabilityById);

// Route to update a venue unavailability (PUT)
router.put("/unavailability/:unavailability_id", updateVenueUnavailability);

// Route to delete a venue unavailability (DELETE)
router.delete("/unavailability/:unavailability_id", deleteVenueUnavailability);

// ============================================
// Venue Bookings Routes
// ============================================

// Route to create a new venue booking (POST)
router.post("/bookings", createVenueBooking);

// Route to get all venue bookings (GET)
router.get("/bookings", getAllVenueBookings);

// Route to get bookings by venue (GET)
router.get("/bookings/venue/:venue_id", getVenueBookingsByVenue);

// Route to get bookings by date (GET)
router.get("/bookings/date/:date", getVenueBookingsByDate);

// Route to get a venue booking by ID (GET)
router.get("/bookings/:booking_id", getVenueBookingById);

// Route to update a venue booking (PUT)
router.put("/bookings/:booking_id", updateVenueBooking);

// Route to delete/cancel a venue booking (DELETE)
router.delete("/bookings/:booking_id", deleteVenueBooking);

export default router;

