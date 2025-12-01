import sequelize from "../database.js";
import VehicleModel from "../models/VehicleModel.js";
import VehicleUnavailabilityModel from "../models/VehicleUnavailabilityModel.js";
import VehicleBookingsModel from "../models/VehicleBookingsModel.js";
import { Op } from "sequelize";
import { createLog } from "./system_logs.js";

// Generate a unique reference number for the vehicle (e.g., VEH-2025-00001)
function generateVehicleReferenceNumber(lastVehicleId) {
  const year = new Date().getFullYear();
  const uniqueNumber = String(lastVehicleId + 1).padStart(5, "0");
  return `VEH-${year}-${uniqueNumber}`;
}

// Generate a unique reference number for the booking (e.g., VHB-2025-00001)
function generateBookingReferenceNumber(lastBookingId) {
  const year = new Date().getFullYear();
  const uniqueNumber = String(lastBookingId + 1).padStart(5, "0");
  return `VHB-${year}-${uniqueNumber}`;
}

// ============================================
// Vehicle CRUD Operations
// ============================================

export async function createVehicle(req, res) {
  let transaction;
  try {
    transaction = await sequelize.transaction();

    // Generate unique reference number
    const lastVehicle = await VehicleModel.findOne({
      order: [["vehicle_id", "DESC"]],
    });
    const referenceNumber = generateVehicleReferenceNumber(
      lastVehicle ? lastVehicle.vehicle_id : 0
    );

    const additionalDetails = Array.isArray(req.body.additional_details)
      ? req.body.additional_details
      : {};

    const newVehicle = await VehicleModel.create(
      {
        reference_number: referenceNumber,
        name: req.body.name,
        description: req.body.description,
        vehicle_type: req.body.vehicle_type,
        license_plate: req.body.license_plate,
        make: req.body.make,
        model: req.body.model,
        year: req.body.year,
        capacity: req.body.capacity,
        fuel_type: req.body.fuel_type,
        status: req.body.status || "Available",
        assigned_department: req.body.assigned_department,
        assigned_driver: req.body.assigned_driver,
        last_maintenance: req.body.last_maintenance || new Date().toISOString().split("T")[0],
        next_maintenance: req.body.next_maintenance || null,
        booking_advance_days: req.body.booking_advance_days || 7,
        requires_approval: req.body.requires_approval !== undefined ? req.body.requires_approval : true,
        additional_details: additionalDetails,
      },
      { transaction }
    );

    await transaction.commit();

    createLog({
      action: "create",
      target: referenceNumber,
      performed_by: req.body.user || "system",
      title: "Vehicle Created",
      details: `Vehicle with reference number ${referenceNumber} created successfully!`,
    });

    res.status(201).json({ message: "Vehicle created successfully!", newVehicle });
  } catch (error) {
    if (transaction) await transaction.rollback();
    console.error(error);
    res.status(500).json({ message: "Error creating vehicle", error: error.message });
  }
}

// Get all Vehicles
export async function getAllVehicles(req, res) {
  try {
    const vehicles = await VehicleModel.findAll({
      where: { status: { [Op.ne]: "Archived" } },
    });

    if (!vehicles.length) {
      return res.status(204).json({ message: "No vehicles found." });
    }

    res.status(200).json(vehicles);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Error fetching vehicles", error: error.message });
  }
}

// Get Vehicle by Reference Number
export async function getVehicleById(req, res) {
  try {
    const vehicle = await VehicleModel.findOne({
      where: { reference_number: req.params.reference_number },
    });

    if (!vehicle) {
      return res.status(404).json({ message: "Vehicle not found." });
    }

    res.status(200).json(vehicle);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Error fetching vehicle", error: error.message });
  }
}

export async function updateVehicle(req, res) {
  let transaction;
  try {
    transaction = await sequelize.transaction();

    const vehicle = await VehicleModel.findOne({
      where: { reference_number: req.params.reference_number },
    });

    if (!vehicle) {
      return res.status(404).json({ message: "Vehicle not found." });
    }

    const updatedAdditionalDetails = Array.isArray(req.body.additional_details)
      ? req.body.additional_details
      : vehicle.additional_details;

    await vehicle.update(
      {
        name: req.body.name,
        description: req.body.description,
        vehicle_type: req.body.vehicle_type,
        license_plate: req.body.license_plate,
        make: req.body.make,
        model: req.body.model,
        year: req.body.year,
        capacity: req.body.capacity,
        fuel_type: req.body.fuel_type,
        status: req.body.status,
        assigned_department: req.body.assigned_department,
        assigned_driver: req.body.assigned_driver,
        last_maintenance: req.body.last_maintenance,
        next_maintenance: req.body.next_maintenance,
        booking_advance_days: req.body.booking_advance_days,
        requires_approval: req.body.requires_approval,
        additional_details: updatedAdditionalDetails,
      },
      { transaction }
    );

    await transaction.commit();

    createLog({
      action: "update",
      target: req.params.reference_number,
      performed_by: req.body.user || "system",
      title: "Vehicle Updated",
      details: `Vehicle with reference number ${req.params.reference_number} updated successfully.`,
    });

    res.status(200).json({ message: "Vehicle updated successfully!" });
  } catch (error) {
    if (transaction) await transaction.rollback();
    console.error(error);
    res.status(500).json({ message: "Error updating vehicle", error: error.message });
  }
}

// Archive a Vehicle
export async function deleteVehicle(req, res) {
  try {
    const [updatedRows] = await VehicleModel.update(
      { status: "Archived" },
      { where: { reference_number: req.params.reference_number } }
    );

    if (updatedRows === 0) {
      return res
        .status(404)
        .json({ message: "Vehicle not found or already archived." });
    }

    createLog({
      action: "archive",
      target: req.params.reference_number,
      performed_by: req.body.user || "system",
      title: "Vehicle Archived",
      details: `Vehicle with reference number ${req.params.reference_number} archived successfully.`,
    });

    res.status(200).json({ message: "Vehicle archived successfully!" });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Error archiving vehicle", error: error.message });
  }
}

// Get Vehicles by Status
export async function getVehiclesByStatus(req, res) {
  try {
    const vehicles = await VehicleModel.findAll({
      where: { status: req.params.status },
    });

    if (!vehicles.length) {
      return res
        .status(404)
        .json({ message: `No vehicles with status ${req.params.status}` });
    }

    res.status(200).json(vehicles);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error fetching vehicles by status",
      error: error.message,
    });
  }
}

// ============================================
// Vehicle Unavailability Operations
// ============================================

export async function createVehicleUnavailability(req, res) {
  let transaction;
  try {
    transaction = await sequelize.transaction();

    // Validate vehicle exists
    const vehicle = await VehicleModel.findByPk(req.body.vehicle_id);
    if (!vehicle) {
      return res.status(404).json({ message: "Vehicle not found." });
    }

    // Validate dates
    if (new Date(req.body.start_date) >= new Date(req.body.end_date)) {
      return res.status(400).json({
        message: "End date must be after start date.",
      });
    }

    const newUnavailability = await VehicleUnavailabilityModel.create(
      {
        vehicle_id: req.body.vehicle_id,
        start_date: req.body.start_date,
        end_date: req.body.end_date,
        reason: req.body.reason,
        description: req.body.description,
        is_recurring: req.body.is_recurring || false,
        recurrence_pattern: req.body.recurrence_pattern || null,
        created_by: req.body.created_by || req.body.user || "system",
        status: req.body.status || "Active",
      },
      { transaction }
    );

    await transaction.commit();

    createLog({
      action: "create",
      target: `Vehicle ${req.body.vehicle_id} Unavailability`,
      performed_by: req.body.user || "system",
      title: "Vehicle Unavailability Created",
      details: `Unavailability period created for vehicle ID ${req.body.vehicle_id}.`,
    });

    res.status(201).json({
      message: "Vehicle unavailability created successfully!",
      data: newUnavailability,
    });
  } catch (error) {
    if (transaction) await transaction.rollback();
    console.error(error);
    res.status(500).json({
      message: "Error creating vehicle unavailability",
      error: error.message,
    });
  }
}

export async function getAllVehicleUnavailability(req, res) {
  try {
    const unavailability = await VehicleUnavailabilityModel.findAll({
      where: { status: { [Op.ne]: "Cancelled" } },
      include: [
        {
          model: VehicleModel,
          as: "vehicle",
          attributes: ["name", "reference_number", "vehicle_type", "license_plate"],
        },
      ],
    });

    if (!unavailability.length) {
      return res.status(204).json({ message: "No unavailability records found." });
    }

    res.status(200).json(unavailability);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error fetching vehicle unavailability",
      error: error.message,
    });
  }
}

export async function getVehicleUnavailabilityById(req, res) {
  try {
    const unavailability = await VehicleUnavailabilityModel.findByPk(
      req.params.unavailability_id,
      {
        include: [
          {
            model: VehicleModel,
            as: "vehicle",
            attributes: ["name", "reference_number", "vehicle_type", "license_plate"],
          },
        ],
      }
    );

    if (!unavailability) {
      return res.status(404).json({ message: "Unavailability record not found." });
    }

    res.status(200).json(unavailability);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error fetching vehicle unavailability",
      error: error.message,
    });
  }
}

export async function getVehicleUnavailabilityByVehicle(req, res) {
  try {
    const unavailability = await VehicleUnavailabilityModel.findAll({
      where: {
        vehicle_id: req.params.vehicle_id,
        status: { [Op.ne]: "Cancelled" },
      },
      include: [
        {
          model: VehicleModel,
          as: "vehicle",
          attributes: ["name", "reference_number", "vehicle_type", "license_plate"],
        },
      ],
    });

    res.status(200).json(unavailability || []);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error fetching vehicle unavailability",
      error: error.message,
    });
  }
}

export async function updateVehicleUnavailability(req, res) {
  let transaction;
  try {
    transaction = await sequelize.transaction();

    const unavailability = await VehicleUnavailabilityModel.findByPk(
      req.params.unavailability_id
    );

    if (!unavailability) {
      return res.status(404).json({ message: "Unavailability record not found." });
    }

    // Validate dates if provided
    if (req.body.start_date && req.body.end_date) {
      if (new Date(req.body.start_date) >= new Date(req.body.end_date)) {
        return res.status(400).json({
          message: "End date must be after start date.",
        });
      }
    }

    await unavailability.update(
      {
        start_date: req.body.start_date,
        end_date: req.body.end_date,
        start_time: req.body.start_time,
        end_time: req.body.end_time,
        reason: req.body.reason,
        description: req.body.description,
        is_recurring: req.body.is_recurring,
        recurrence_pattern: req.body.recurrence_pattern,
        status: req.body.status,
      },
      { transaction }
    );

    await transaction.commit();

    createLog({
      action: "update",
      target: `Unavailability ${req.params.unavailability_id}`,
      performed_by: req.body.user || "system",
      title: "Vehicle Unavailability Updated",
      details: `Unavailability record ${req.params.unavailability_id} updated successfully.`,
    });

    res.status(200).json({
      message: "Vehicle unavailability updated successfully!",
      data: unavailability,
    });
  } catch (error) {
    if (transaction) await transaction.rollback();
    console.error(error);
    res.status(500).json({
      message: "Error updating vehicle unavailability",
      error: error.message,
    });
  }
}

export async function deleteVehicleUnavailability(req, res) {
  try {
    const unavailability = await VehicleUnavailabilityModel.findByPk(
      req.params.unavailability_id
    );

    if (!unavailability) {
      return res.status(404).json({ message: "Unavailability record not found." });
    }

    // Soft delete by setting status to Cancelled
    await unavailability.update({ status: "Cancelled" });

    createLog({
      action: "delete",
      target: `Unavailability ${req.params.unavailability_id}`,
      performed_by: req.body.user || "system",
      title: "Vehicle Unavailability Cancelled",
      details: `Unavailability record ${req.params.unavailability_id} cancelled successfully.`,
    });

    res.status(200).json({
      message: "Vehicle unavailability cancelled successfully!",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error cancelling vehicle unavailability",
      error: error.message,
    });
  }
}

// ============================================
// Vehicle Bookings Operations
// ============================================

export async function createVehicleBooking(req, res) {
  let transaction;
  try {
    transaction = await sequelize.transaction();

    // Validate vehicle exists
    const vehicle = await VehicleModel.findByPk(req.body.vehicle_id);
    if (!vehicle) {
      return res.status(404).json({ message: "Vehicle not found." });
    }

    // Check if vehicle is available
    if (vehicle.status !== "Available") {
      return res.status(400).json({
        message: `Vehicle is not available. Current status: ${vehicle.status}`,
      });
    }

    // Generate unique reference number
    const lastBooking = await VehicleBookingsModel.findOne({
      order: [["booking_id", "DESC"]],
    });
    const referenceNumber = generateBookingReferenceNumber(
      lastBooking ? lastBooking.booking_id : 0
    );

    // Validate time
    if (req.body.start_time && req.body.end_time && req.body.start_time >= req.body.end_time) {
      return res.status(400).json({
        message: "End time must be after start time.",
      });
    }

    // Check for conflicts with existing bookings
    const conflictingBooking = await VehicleBookingsModel.findOne({
      where: {
        vehicle_id: req.body.vehicle_id,
        booking_date: req.body.booking_date,
        status: { [Op.in]: ["Confirmed", "Pending"] },
        [Op.or]: [
          {
            start_time: { [Op.between]: [req.body.start_time, req.body.end_time] },
          },
          {
            end_time: { [Op.between]: [req.body.start_time, req.body.end_time] },
          },
          {
            [Op.and]: [
              { start_time: { [Op.lte]: req.body.start_time } },
              { end_time: { [Op.gte]: req.body.end_time } },
            ],
          },
        ],
      },
    });

    if (conflictingBooking) {
      return res.status(409).json({
        message: "Vehicle is already booked for this date and time.",
      });
    }

    // Check for conflicts with unavailability
    const conflictingUnavailability = await VehicleUnavailabilityModel.findOne({
      where: {
        vehicle_id: req.body.vehicle_id,
        status: "Active",
        start_date: { [Op.lte]: req.body.booking_date },
        end_date: { [Op.gte]: req.body.booking_date },
      },
    });

    if (conflictingUnavailability) {
      return res.status(409).json({
        message: "Vehicle is unavailable for this date.",
      });
    }

    const additionalRequirements = Array.isArray(req.body.additional_requirements)
      ? req.body.additional_requirements
      : [];

    const newBooking = await VehicleBookingsModel.create(
      {
        reference_number: referenceNumber,
        vehicle_id: req.body.vehicle_id,
        vehicle_request_id: req.body.vehicle_request_id || null,
        requester: req.body.requester,
        organization: req.body.organization,
        event_title: req.body.event_title,
        event_description: req.body.event_description,
        booking_date: req.body.booking_date,
        start_time: req.body.start_time,
        end_time: req.body.end_time,
        destination: req.body.destination,
        destination_coordinates: req.body.destination_coordinates,
        participants: req.body.participants,
        pax_estimation: req.body.pax_estimation,
        status: req.body.status || "Confirmed",
        confirmed_by: req.body.confirmed_by || req.body.user || null,
        confirmed_at: req.body.status === "Confirmed" ? new Date() : null,
        remarks: req.body.remarks,
        additional_requirements: additionalRequirements,
      },
      { transaction }
    );

    await transaction.commit();

    createLog({
      action: "create",
      target: referenceNumber,
      performed_by: req.body.user || "system",
      title: "Vehicle Booking Created",
      details: `Vehicle booking with reference number ${referenceNumber} created successfully.`,
    });

    res.status(201).json({
      message: "Vehicle booking created successfully!",
      data: newBooking,
    });
  } catch (error) {
    if (transaction) await transaction.rollback();
    console.error(error);
    res.status(500).json({
      message: "Error creating vehicle booking",
      error: error.message,
    });
  }
}

export async function getAllVehicleBookings(req, res) {
  try {
    const bookings = await VehicleBookingsModel.findAll({
      where: { status: { [Op.ne]: "Cancelled" } },
      include: [
        {
          model: VehicleModel,
          as: "vehicle",
          attributes: ["name", "reference_number", "vehicle_type", "license_plate", "capacity"],
        },
      ],
      order: [["booking_date", "ASC"], ["start_time", "ASC"]],
    });

    if (!bookings.length) {
      return res.status(204).json({ message: "No bookings found." });
    }

    res.status(200).json(bookings);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error fetching vehicle bookings",
      error: error.message,
    });
  }
}

export async function getVehicleBookingById(req, res) {
  try {
    const booking = await VehicleBookingsModel.findByPk(req.params.booking_id, {
      include: [
        {
          model: VehicleModel,
          as: "vehicle",
          attributes: ["name", "reference_number", "vehicle_type", "license_plate", "capacity"],
        },
      ],
    });

    if (!booking) {
      return res.status(404).json({ message: "Booking not found." });
    }

    res.status(200).json(booking);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error fetching vehicle booking",
      error: error.message,
    });
  }
}

export async function getVehicleBookingsByVehicle(req, res) {
  try {
    const bookings = await VehicleBookingsModel.findAll({
      where: {
        vehicle_id: req.params.vehicle_id,
        status: { [Op.ne]: "Cancelled" },
      },
      include: [
        {
          model: VehicleModel,
          as: "vehicle",
          attributes: ["name", "reference_number", "vehicle_type", "license_plate"],
        },
      ],
      order: [["booking_date", "ASC"], ["start_time", "ASC"]],
    });

    res.status(200).json(bookings || []);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error fetching vehicle bookings",
      error: error.message,
    });
  }
}

export async function getVehicleBookingsByDate(req, res) {
  try {
    const bookings = await VehicleBookingsModel.findAll({
      where: {
        booking_date: req.params.date,
        status: { [Op.ne]: "Cancelled" },
      },
      include: [
        {
          model: VehicleModel,
          as: "vehicle",
          attributes: ["name", "reference_number", "vehicle_type", "license_plate"],
        },
      ],
      order: [["start_time", "ASC"]],
    });

    res.status(200).json(bookings);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error fetching vehicle bookings",
      error: error.message,
    });
  }
}

export async function updateVehicleBooking(req, res) {
  let transaction;
  try {
    transaction = await sequelize.transaction();

    const booking = await VehicleBookingsModel.findByPk(req.params.booking_id);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found." });
    }

    // If updating date/time, check for conflicts
    if (req.body.booking_date || req.body.start_time || req.body.end_time) {
      const bookingDate = req.body.booking_date || booking.booking_date;
      const startTime = req.body.start_time || booking.start_time;
      const endTime = req.body.end_time || booking.end_time;

      if (startTime && endTime && startTime >= endTime) {
        return res.status(400).json({
          message: "End time must be after start time.",
        });
      }

      const conflictingBooking = await VehicleBookingsModel.findOne({
        where: {
          vehicle_id: booking.vehicle_id,
          booking_id: { [Op.ne]: req.params.booking_id },
          booking_date: bookingDate,
          status: { [Op.in]: ["Confirmed", "Pending"] },
          [Op.or]: [
            {
              start_time: { [Op.between]: [startTime, endTime] },
            },
            {
              end_time: { [Op.between]: [startTime, endTime] },
            },
            {
              [Op.and]: [
                { start_time: { [Op.lte]: startTime } },
                { end_time: { [Op.gte]: endTime } },
              ],
            },
          ],
        },
      });

      if (conflictingBooking) {
        return res.status(409).json({
          message: "Vehicle is already booked for this date and time.",
        });
      }
    }

    const updateData = {
      vehicle_request_id: req.body.vehicle_request_id,
      organization: req.body.organization,
      event_title: req.body.event_title,
      event_description: req.body.event_description,
      booking_date: req.body.booking_date,
      start_time: req.body.start_time,
      end_time: req.body.end_time,
      destination: req.body.destination,
      destination_coordinates: req.body.destination_coordinates,
      participants: req.body.participants,
      pax_estimation: req.body.pax_estimation,
      status: req.body.status,
      remarks: req.body.remarks,
      additional_requirements: Array.isArray(req.body.additional_requirements)
        ? req.body.additional_requirements
        : booking.additional_requirements,
    };

    // Handle status changes
    if (req.body.status === "Confirmed" && booking.status !== "Confirmed") {
      updateData.confirmed_by = req.body.confirmed_by || req.body.user || null;
      updateData.confirmed_at = new Date();
    }

    if (req.body.status === "Cancelled" && booking.status !== "Cancelled") {
      updateData.cancelled_at = new Date();
      updateData.cancellation_reason = req.body.cancellation_reason || null;
    }

    if (req.body.check_in_time) {
      updateData.check_in_time = req.body.check_in_time;
    }

    if (req.body.check_out_time) {
      updateData.check_out_time = req.body.check_out_time;
    }

    await booking.update(updateData, { transaction });

    await transaction.commit();

    createLog({
      action: "update",
      target: booking.reference_number,
      performed_by: req.body.user || "system",
      title: "Vehicle Booking Updated",
      details: `Vehicle booking ${booking.reference_number} updated successfully.`,
    });

    res.status(200).json({
      message: "Vehicle booking updated successfully!",
      data: booking,
    });
  } catch (error) {
    if (transaction) await transaction.rollback();
    console.error(error);
    res.status(500).json({
      message: "Error updating vehicle booking",
      error: error.message,
    });
  }
}

export async function deleteVehicleBooking(req, res) {
  try {
    const booking = await VehicleBookingsModel.findByPk(req.params.booking_id);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found." });
    }

    // Soft delete by setting status to Cancelled
    await booking.update({
      status: "Cancelled",
      cancelled_at: new Date(),
      cancellation_reason: req.body.cancellation_reason || "Cancelled by user",
    });

    createLog({
      action: "delete",
      target: booking.reference_number,
      performed_by: req.body.user || "system",
      title: "Vehicle Booking Cancelled",
      details: `Vehicle booking ${booking.reference_number} cancelled successfully.`,
    });

    res.status(200).json({
      message: "Vehicle booking cancelled successfully!",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error cancelling vehicle booking",
      error: error.message,
    });
  }
}

// ============================================
// Vehicle Availability Check
// ============================================

export async function checkVehicleAvailability(req, res) {
  try {
    const { vehicle_id, date, start_time, end_time } = req.query;

    if (!vehicle_id || !date) {
      return res.status(400).json({
        message: "Missing required parameters: vehicle_id, date",
      });
    }

    // Check if vehicle exists and is available
    const vehicle = await VehicleModel.findByPk(vehicle_id);
    if (!vehicle) {
      return res.status(404).json({ message: "Vehicle not found." });
    }

    if (vehicle.status !== "Available") {
      return res.status(200).json({
        available: false,
        reason: `Vehicle is ${vehicle.status}`,
      });
    }

    // Check for conflicting bookings if time is provided
    if (start_time && end_time) {
      const conflictingBooking = await VehicleBookingsModel.findOne({
        where: {
          vehicle_id: vehicle_id,
          booking_date: date,
          status: { [Op.in]: ["Confirmed", "Pending"] },
          [Op.or]: [
            {
              start_time: { [Op.between]: [start_time, end_time] },
            },
            {
              end_time: { [Op.between]: [start_time, end_time] },
            },
            {
              [Op.and]: [
                { start_time: { [Op.lte]: start_time } },
                { end_time: { [Op.gte]: end_time } },
              ],
            },
          ],
        },
      });

      if (conflictingBooking) {
        return res.status(200).json({
          available: false,
          reason: "Vehicle is already booked for this time slot",
          conflicting_booking: {
            reference_number: conflictingBooking.reference_number,
            event_title: conflictingBooking.event_title,
          },
        });
      }
    }

    // Check for unavailability periods
    const conflictingUnavailability = await VehicleUnavailabilityModel.findOne({
      where: {
        vehicle_id: vehicle_id,
        status: "Active",
        start_date: { [Op.lte]: date },
        end_date: { [Op.gte]: date },
      },
    });

    if (conflictingUnavailability) {
      return res.status(200).json({
        available: false,
        reason: conflictingUnavailability.reason || "Vehicle is unavailable",
        unavailability: {
          reason: conflictingUnavailability.reason,
          description: conflictingUnavailability.description,
        },
      });
    }

    res.status(200).json({
      available: true,
      vehicle: {
        name: vehicle.name,
        reference_number: vehicle.reference_number,
        capacity: vehicle.capacity,
        vehicle_type: vehicle.vehicle_type,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error checking vehicle availability",
      error: error.message,
    });
  }
}

