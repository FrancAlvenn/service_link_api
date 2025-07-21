import express from "express";
import {
  archivePurchasingRequest,
  createPurchasingRequest,
  getAllPurchasingRequests,
  getPurchasingRequestById,
  gsoDirectorApproval,
  immediateHeadApproval,
  operationsDirectorApproval,
  updatePurchasingRequest,
  updateRequestStatus,
  getAllArchivedPurchasingRequests,
} from "../controllers/purchasing_request.js";

const router = express.Router();

// Route for POST
router.post("/", createPurchasingRequest);

// Route for GET
router.get("/", getAllPurchasingRequests);

//Get all Archived Requests
router.get("/archived", getAllArchivedPurchasingRequests);

// Route for PATCH
router.get("/:reference_number", getPurchasingRequestById);

// Route for PUT
router.put("/:reference_number", updatePurchasingRequest);

//Update status of a Request
router.patch("/:reference_number/status", updateRequestStatus);

// Route for DELETE
router.delete("/:reference_number/archive/:archive", archivePurchasingRequest);

//Patch Approve/reject by Immediate Head
router.patch(
  "/:reference_number/immediate_head_approval/:approval_flag",
  immediateHeadApproval
);

//Patch Approve/reject by GSO Director
router.patch(
  "/:reference_number/gso_director_approval/:approval_flag",
  gsoDirectorApproval
);

//Patch Approve/reject by Operations Head
router.patch(
  "/:reference_number/operations_director_approval/:approval_flag",
  operationsDirectorApproval
);

export default router;
