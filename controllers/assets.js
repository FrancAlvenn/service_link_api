import sequelize from "../database.js";
import AssetModel from "../models/AssetsModel.js";
import { Op } from "sequelize";
import { createLog } from "./system_logs.js";
import AssetAssignmentLogModel from "../models/AssetAssignmentLog.js";

// Generate a unique reference number for the asset (e.g., AST-2025-00001)
function generateAssetReferenceNumber(lastAssetId) {
  const year = new Date().getFullYear();
  const uniqueNumber = String(lastAssetId + 1).padStart(5, "0");
  return `AST-${year}-${uniqueNumber}`;
}

export async function createAsset(req, res) {
  let transaction;
  try {
    transaction = await sequelize.transaction();

    // Generate unique reference number
    const lastAsset = await AssetModel.findOne({
      order: [["asset_id", "DESC"]],
    });
    const referenceNumber = generateAssetReferenceNumber(
      lastAsset ? lastAsset.asset_id : 0
    );

    // Ensure additional_details is always an array
    const additionalDetails = Array.isArray(req.body.additional_details)
      ? req.body.additional_details
      : [];

    const newAsset = await AssetModel.create(
      {
        reference_number: referenceNumber,
        item_code: req.body.item_code,
        name: req.body.name,
        category: req.body.category,
        acquisition_value: req.body.acquisition_value,
        depreciation_period: req.body.depreciation_period,
        assigned_department: req.body.assigned_department,
        assigned_personnel: req.body.assigned_personnel,
        location: req.body.location,
        date_of_issuance: req.body.date_of_issuance,
        description: req.body.description,
        status: req.body.status || "Available",
        last_maintenance: req.body.last_maintenance || new Date().toISOString().split("T")[0],
        warranty_expiry: req.body.warranty_expiry || null,
        additional_details: additionalDetails, // Store as array of objects
      },
      { transaction }
    );

    await transaction.commit();

    createLog({
      action: "create",
      target: referenceNumber,
      performed_by: req.body.user || "system",
      title: "Asset Created",
      details: `Asset with reference number ${referenceNumber} created successfully!`,
    });

    res.status(201).json({ message: "Asset created successfully!", newAsset });
  } catch (error) {
    if (transaction) await transaction.rollback();
    console.error(error);
    res.status(500).json({ message: "Error creating asset", error: error.message });
  }
}


// Get all Assets
export async function getAllAssets(req, res) {
  try {
    const assets = await AssetModel.findAll({
      where: { status: { [Op.ne]: "Archived" } },
    });

    if (!assets.length) {
      return res.status(204).json({ message: "No assets found." });
    }

    res.status(200).json(assets);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Error fetching assets", error: error.message });
  }
}

// Get Asset by Reference Number
export async function getAssetById(req, res) {
  try {
    const asset = await AssetModel.findOne({
      where: { reference_number: req.params.reference_number },
    });

    if (!asset) {
      return res.status(404).json({ message: "Asset not found." });
    }

    res.status(200).json(asset);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Error fetching asset", error: error.message });
  }
}

export async function updateAsset(req, res) {
  let transaction;
  try {
    transaction = await sequelize.transaction();

    const asset = await AssetModel.findOne({
      where: { reference_number: req.params.reference_number },
    });

    if (!asset) {
      return res.status(404).json({ message: "Asset not found." });
    }

    // Ensure additional_details is an array
    const updatedAdditionalDetails = Array.isArray(req.body.additional_details)
      ? req.body.additional_details
      : asset.additional_details;

    await asset.update(
      {
        item_code: req.body.item_code,
        name: req.body.name,
        category: req.body.category,
        acquisition_value: req.body.acquisition_value,
        depreciation_period: req.body.depreciation_period,
        assigned_department: req.body.assigned_department,
        assigned_personnel: req.body.assigned_personnel,
        location: req.body.location,
        date_of_issuance: req.body.date_of_issuance,
        description: req.body.description,
        status: req.body.status,
        last_maintenance: req.body.last_maintenance,
        additional_details: updatedAdditionalDetails,
      },
      { transaction }
    );

    await transaction.commit();

    createLog({
      action: "update",
      target: req.params.reference_number,
      performed_by: req.body.user || "system",
      title: "Asset Updated",
      details: `Asset with reference number ${req.params.reference_number} updated successfully.`,
    });

    res.status(200).json({ message: "Asset updated successfully!" });
  } catch (error) {
    if (transaction) await transaction.rollback();
    console.error(error);
    res.status(500).json({ message: "Error updating asset", error: error.message });
  }
}


// Archive an Asset
export async function deleteAsset(req, res) {
  try {
    const [updatedRows] = await AssetModel.update(
      { status: "Archived" },
      { where: { reference_number: req.params.reference_number } }
    );

    if (updatedRows === 0) {
      return res
        .status(404)
        .json({ message: "Asset not found or already archived." });
    }

    createLog({
      action: "archive",
      target: req.params.reference_number,
      performed_by: req.body.user || "system",
      title: "Asset Archived",
      details: `Asset with reference number ${req.params.reference_number} archived successfully.`,
    });

    res.status(200).json({ message: "Asset archived successfully!" });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Error archiving asset", error: error.message });
  }
}

// Get Assets by Status
export async function getAssetsByStatus(req, res) {
  try {
    const assets = await AssetModel.findAll({
      where: { status: req.params.status },
    });

    if (!assets.length) {
      return res
        .status(404)
        .json({ message: `No assets with status ${req.params.status}` });
    }

    res.status(200).json(assets);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error fetching assets by status",
      error: error.message,
    });
  }
}

// Asset Assignment Logs

// Get Asset Assignment Logs
export async function getAllAssetAssignmentLogs(req, res) {
  try {
    const assetAssignmentLogs = await AssetAssignmentLogModel.findAll();
    res.status(200).json(assetAssignmentLogs);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error fetching asset assignment logs",
      error: error.message,
    });
  }
}

// Get Asset Assignment Log by ID
export async function getAssetAssignmentLogById(req, res) {
  try {
    const assetAssignmentLog = await AssetAssignmentLogModel.findOne({
      where: { log_id: req.params.log_id },
    });

    if (!assetAssignmentLog) {
      return res
        .status(404)
        .json({ message: "Asset assignment log not found" });
    }

    res.status(200).json(assetAssignmentLog);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error fetching asset assignment log by ID",
      error: error.message,
    });
  }
}

// Create a new Asset Assignment Log
export async function createAssetAssignmentLog(req, res) {
  let transaction;
  try {
    transaction = await sequelize.transaction();

    const assetAssignmentLog = await AssetAssignmentLogModel.create(
      {
        asset_id: req.body.asset_id,
        asset_name: req.body.asset_name,
        assigned_to: req.body.assigned_to,
        assigned_by: req.body.assigned_by,
        // location: req.body.location,
        // remarks: req.body.remarks,
      },
      { transaction }
    );

    await transaction.commit();

    createLog({
      action: "create",
      target: assetAssignmentLog.log_id,
      performed_by: req.body.user || "system",
      title: "Asset Assignment Log Created",
      details: `Asset assignment log with ID ${assetAssignmentLog.log_id} created successfully.`,
    });

    res
      .status(201)
      .json({ message: "Asset assignment log created successfully!" });
  } catch (error) {
    if (transaction) await transaction.rollback();
    console.error(error);
    res.status(500).json({
      message: "Error creating asset assignment log",
      error: error.message,
    });
  }
}

// Update an Asset Assignment Log
export async function updateAssetAssignmentLog(req, res) {
  let transaction;
  try {
    transaction = await sequelize.transaction();

    const assetAssignmentLog = await AssetAssignmentLogModel.findOne({
      where: { log_id: req.params.log_id },
    });

    if (!assetAssignmentLog) {
      return res
        .status(404)
        .json({ message: "Asset assignment log not found" });
    }

    // Build an object of only allowed updatable fields from req.body
    const allowedFields = [
      "asset_id",
      "assigned_to",
      "assigned_by",
      "assignment_date",
      "return_date",
      "location",
      "remarks",
    ];

    const updateData = {};
    for (const key of allowedFields) {
      if (key in req.body) {
        updateData[key] = req.body[key];
      }
    }

    // Perform the update with only the fields present
    await assetAssignmentLog.update(updateData, { transaction });

    await transaction.commit();

    createLog({
      action: "update",
      target: assetAssignmentLog.log_id,
      performed_by: req.body.user || "system",
      title: "Asset Assignment Log Updated",
      details: `Asset assignment log with ID ${assetAssignmentLog.log_id} updated successfully.`,
    });

    res.status(200).json({
      message: "Asset assignment log updated successfully!",
      data: assetAssignmentLog,
    });
  } catch (error) {
    if (transaction) await transaction.rollback();
    console.error(error);
    res.status(500).json({
      message: "Error updating asset assignment log",
      error: error.message,
    });
  }
}

// Delete an Asset Assignment Log
export async function deleteAssetAssignmentLog(req, res) {
  try {
    const deletedRows = await AssetAssignmentLogModel.destroy({
      where: { log_id: req.params.log_id },
    });

    if (deletedRows === 0) {
      return res
        .status(404)
        .json({ message: "Asset assignment log not found" });
    }

    createLog({
      action: "delete",
      target: req.params.log_id,
      performed_by: req.body.user || "system",
      title: "Asset Assignment Log Deleted",
      details: `Asset assignment log with ID ${req.params.log_id} deleted successfully.`,
    });

    res
      .status(200)
      .json({ message: "Asset assignment log deleted successfully!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error deleting asset assignment log",
      error: error.message,
    });
  }
}
