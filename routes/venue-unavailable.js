import express from "express";
import {
  createVenueUnavailability,
  getAllVenueUnavailability,
  getVenueUnavailabilityById,
  updateVenueUnavailability,
  deleteVenueUnavailability,
  getVenueUnavailabilityByVenue,
} from "../controllers/venues.js";

const router = express.Router();

router.post("/", createVenueUnavailability);
router.get("/", getAllVenueUnavailability);
router.get("/venue/:venue_id", getVenueUnavailabilityByVenue);
router.get("/:unavailability_id", getVenueUnavailabilityById);
router.put("/:unavailability_id", updateVenueUnavailability);
router.delete("/:unavailability_id", deleteVenueUnavailability);

export default router;

