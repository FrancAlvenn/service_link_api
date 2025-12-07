import express from "express";
import {
  createVenue,
  deleteVenue,
  getAllVenues,
  getVenueById,
  updateVenue,
  getVenuesByStatus,
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


export default router;

