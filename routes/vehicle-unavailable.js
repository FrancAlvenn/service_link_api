import express from "express";
import {
  createVehicleUnavailability,
  getAllVehicleUnavailability,
  getVehicleUnavailabilityById,
  updateVehicleUnavailability,
  deleteVehicleUnavailability,
  getVehicleUnavailabilityByVehicle,
} from "../controllers/vehicles.js";

const router = express.Router();

router.post("/", createVehicleUnavailability);
router.get("/", getAllVehicleUnavailability);
router.get("/vehicle/:vehicle_id", getVehicleUnavailabilityByVehicle);
router.get("/:unavailability_id", getVehicleUnavailabilityById);
router.put("/:unavailability_id", updateVehicleUnavailability);
router.delete("/:unavailability_id", deleteVehicleUnavailability);

export default router;

