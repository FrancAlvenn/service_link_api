import sequelize from "../database.js";
import VenueRequestModel from "../models/VenueRequestModel.js";
import { Op } from "sequelize";
import { createLog } from "./system_logs.js";
import VenueRequestDetails from "../models/VenueRequestDetails.js";
import User from "../models/UserModel.js";
import AssetModel from "../models/AssetsModel.js";

// Generate a unique reference number (e.g., DYCI-2024-0001)
function generateReferenceNumber(lastRequestId) {
  const year = new Date().getFullYear();
  const uniqueNumber = String(lastRequestId + 1).padStart(5, "0");
  return `VR-${year}-${uniqueNumber}`;
}

// Create Venue Requests
export async function createVenueRequest(req, res) {
  try {
    // Generate a unique reference number
    const lastRequest = await VenueRequestModel.findOne({
      order: [["id", "DESC"]],
    });
    const referenceNumber = generateReferenceNumber(
      lastRequest ? lastRequest.id : 0
    );

    // Create the venue requisition entry in the database
    const newVenueRequisition = await VenueRequestModel.create({
      reference_number: referenceNumber,
      title: req.body.title,
      venue_id: req.body.venue_id,
      requester: req.body.requester,
      organization: req.body.organization || null,
      event_title: req.body.event_title,
      purpose: req.body.purpose,
      event_nature: req.body.event_nature || null,
      event_dates: req.body.event_dates,
      event_start_time: req.body.event_start_time,
      event_end_time: req.body.event_end_time,
      participants: req.body.participants,
      pax_estimation: req.body.pax_estimation || 0,
      status: "Pending",
      remarks: req.body.remarks || null,
      immediate_head_approval: "Pending",
      gso_director_approval: "Pending",
      operations_director_approval: "Pending",
      archived: req.body.archived || false,
      authorized_access: [req.body.requester],
      approvers: [req.body.approvers],
    });

    const detailsData = req.body.details.map((detail) => ({
      venue_request_id: newVenueRequisition.reference_number,
      quantity: detail.quantity || null,
      particulars: detail.particulars,
      description: detail.description,
      remarks: detail.remarks || null,
    }));

    await sequelize.models.VenueRequestDetail.bulkCreate(detailsData);

    res.status(201).json({ message: `Request created successfully!` });

    //Log the request
    createLog({
      action: "create",
      performed_by: req.body.requester,
      target: referenceNumber,
      title: "Request Submitted",
      details: `Venue Requisition ${referenceNumber} created successfully!`,
    });
  } catch (error) {
    res.status(500).json({ message: `Encountered an internal error ${error}` });
  }
}

// Get All Venue Requests with Details
export async function getAllVenueRequest(req, res) {
  try {
    const requisitions = await VenueRequestModel.findAll({
      where: { archived: false },
      include: [
        {
          model: VenueRequestDetails,
          as: "details",
        },
        {
          model: User,
          as: "requester_details",
        },
        {
          model: AssetModel,
          as: "venue_details",
        },
      ],
    });
    if (!requisitions || requisitions.length === 0) {
      res.status(200).json({ message: "No venue requests found!" });
    } else {
      res.status(200).json(requisitions);
    }
  } catch (error) {
    res
      .status(500)
      .json({ message: `Error fetching venue requisitions`, error });
  }
}

// Get All Venue Requests with Details
export async function getAllArchivedVenueRequest(req, res) {
  try {
    const requisitions = await VenueRequestModel.findAll({
      where: { archived: true },
      include: [
        {
          model: VenueRequestDetails,
          as: "details",
        },
        {
          model: User,
          as: "requester_details",
        },
        {
          model: AssetModel,
          as: "venue_details",
        },
      ],
    });
    if (!requisitions || requisitions.length === 0) {
      res.status(200).json({ message: "No venue requests found!" });
    } else {
      res.status(200).json(requisitions);
    }
  } catch (error) {
    res
      .status(500)
      .json({ message: `Error fetching venue requisitions`, error });
  }
}

// Get Venue Request by ID with Details
export async function getVenueRequestById(req, res) {
  try {
    const requisition = await VenueRequestModel.findOne({
      where: { reference_number: req.params.reference_number, archived: false },
      include: [
        {
          model: VenueRequestDetails,
          as: "details",
        },
        {
          model: User,
          as: "requester_details",
        },
        {
          model: AssetModel,
          as: "venue_details",
        },
      ],
    });

    if (!requisition) {
      return res.status(404).json({ message: "Request not found!" });
    }

    res.status(200).json(requisition);
  } catch (error) {
    res
      .status(500)
      .json({ message: `Error fetching venue requisition`, error });
  }
}

// Update Venue Request with Details
export async function updateVenueRequest(req, res) {
  try {
    const { details, ...updateData } = req.body;

    const [updatedRows] = await VenueRequestModel.update(updateData, {
      where: { reference_number: req.params.reference_number },
    });

    if (updatedRows === 0) {
      return res.status(404).json({
        message: `No requisition found with reference number ${req.params.reference_number}`,
      });
    }

    if (details && Array.isArray(details)) {
      // Delete old details
      await VenueRequestDetails.destroy({
        where: { venue_request_id: req.params.reference_number },
      });

      // Insert new details
      const detailsData = details.map((detail) => ({
        venue_request_id: req.params.reference_number,
        quantity: detail.quantity || null,
        particulars: detail.particulars,
        description: detail.description,
        remarks: detail.remarks || null,
      }));

      await VenueRequestDetails.bulkCreate(detailsData);
    }

    res.status(200).json({ message: `Request updated successfully!` });

    createLog({
      action: "update",
      performed_by: req.body.requester,
      target: req.params.reference_number,
      title: "Request Updated",
      details: `Venue Requisition ${req.params.reference_number} updated successfully!`,
    });
  } catch (error) {
    res.status(500).json({ message: `Encountered an internal error ${error}` });
  }
}

// Update Request Status
export async function updateRequestStatus(req, res) {
  try {
    const { status } = req.body; // Get the new status from the request body

    // Check if status is provided
    if (!status) {
      return res.status(400).json({ message: "Status is required." });
    }

    // Update the job request status
    const [updatedRow] = await VenueRequestModel.update(
      { status }, // Only update the status field
      {
        where: {
          reference_number: req.params.reference_number,
        },
      }
    );

    // If no rows were updated, it means the reference number didn't match any job request
    if (updatedRow === 0) {
      return res.status(404).json({
        message: `No job request found with reference number ${req.params.reference_number}`,
      });
    }

    // Return success response
    res.status(200).json({
      message: `Request status updated to "${status}" successfully!`,
    });

    // Log the status update action
    createLog({
      action: "update",
      performed_by: req.body.requester,
      target: req.params.reference_number,
      title: "Request Status Updated",
      details: `Request ${req.params.reference_number} status updated to "${status}"`,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: `Error updating job request status`, error });
  }
}

// Delete / Archive Request
export async function archiveById(req, res) {
  try {
    const [updatedRows] = await VenueRequestModel.update(
      {
        archived: req.params.archive,
      },
      {
        where: {
          reference_number: req.params.reference_number,
        },
      }
    );

    // If no rows were updated, it means the reference number didn't match any requisition
    if (updatedRows === 0) {
      return res.status(404).json({
        message: `No requisition found with reference number ${req.body.reference_number}`,
      });
    }

    console.log(req.body.venue_requested);
    res.status(200).json({
      message:
        req.params.archive === "0"
          ? "Request removed from archive!"
          : "Request added to archive!",
    });

    //Log the request
    createLog({
      action: "archive",
      performed_by: req.body.requester,
      target: req.params.reference_number,
      title: "Request Archived",
      details: `Venue Requisition ${req.params.reference_number} archived successfully!`,
    });
  } catch (error) {
    res.status(500).json({
      message: `Encountered an internal error ${error}`,
      error: error,
    });
  }
}

// Approval of Immediate Head
export async function immediateHeadApproval(req, res) {
  try {
    const [updatedRow] = await VenueRequestModel.update(
      {
        immediate_head_approval: req.params.approval_flag,
      },
      {
        where: {
          reference_number: req.params.reference_number,
        },
      }
    );

    // If no rows were updated, it means the reference number didn't match any requisition
    if (updatedRow === 0) {
      return res.status(404).json({
        message: `No requisition found with reference number ${req.params.reference_number}`,
      });
    }

    res.status(200).json({ message: `Request updated successfully!!` });

    //Log the request
    createLog({
      action: "update",
      performed_by: req.body.requester,
      target: req.params.reference_number,
      title: "Request Approved by Immediate Head",
      details: `Venue Requisition ${req.params.reference_number} ${req.params.approval_flag} by immediate head!`,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: `Encountered an internal error ${error}`, error });
  }
}

// Approval of GSO Director
export async function gsoDirectorApproval(req, res) {
  try {
    const [updatedRow] = await VenueRequestModel.update(
      {
        gso_director_approval: req.params.approval_flag,
      },
      {
        where: {
          reference_number: req.params.reference_number,
        },
      }
    );

    // If no rows were updated, it means the reference number didn't match any requisition
    if (updatedRow === 0) {
      return res.status(404).json({
        message: `No requisition found with reference number ${req.body.reference_number}`,
      });
    }

    console.log(req.body.venue_requested);
    res.status(200).json({ message: `Request updated successfully!` });

    //Log the request
    createLog({
      action: "update",
      performed_by: req.body.requester,
      target: req.params.reference_number,
      title: "Request Approved by GSO Director",
      details: `Venue Requisition ${req.params.reference_number} ${req.params.approval_flag} by GSO Director!`,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: `Encountered an internal error ${error}`, error });
  }
}

// Approval of Operations Director
export async function operationsDirectorApproval(req, res) {
  try {
    const [updatedRow] = await VenueRequestModel.update(
      {
        operations_director_approval: req.params.approval_flag,
      },
      {
        where: {
          reference_number: req.params.reference_number,
        },
      }
    );

    // If no rows were updated, it means the reference number didn't match any requisition
    if (updatedRow === 0) {
      return res.status(404).json({
        message: `No requisition found with reference number ${req.body.reference_number}`,
      });
    }

    console.log(req.body.venue_requested);
    res.status(200).json({ message: `Request updated successfully!` });

    //Log the request
    createLog({
      action: "update",
      performed_by: req.body.requester,
      target: req.params.reference_number,
      title: "Request Approved by Operations Director",
      details: `Venue Requisition ${req.params.reference_number} ${req.params.approval_flag} by operations head!`,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: `Encountered an internal error ${error}`, error });
  }
}

// Get Venue Request by Status
export async function getAllVenueRequestByStatus(req, res) {
  try {
    const requisitions = await VenueRequestModel.findAll({
      where: {
        status: req.params.status,
      },
      archived: {
        [Op.eq]: false, // Get all that is not archived
      },
    });
    console.log(req.params.status);
    if (requisitions === null) {
      res.status(404).json({
        message: `No request with the status - ${req.params.status}!`,
      });
    } else {
      res.status(200).json({ message: requisitions });
    }
  } catch (error) {
    res
      .status(500)
      .json({ message: `Error fetching venue requisitions`, error });
  }
}
