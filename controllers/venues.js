import sequelize from "../database.js";
import VenueModel from "../models/VenueModel.js";
import VenueUnavailabilityModel from "../models/VenueUnavailabilityModel.js";
import VenueBookingsModel from "../models/VenueBookingsModel.js";
import { Op } from "sequelize";
import { createLog } from "./system_logs.js";

// Generate a unique reference number for the venue (e.g., VEN-2025-00001)
function generateVenueReferenceNumber(lastVenueId) {
  const year = new Date().getFullYear();
  const uniqueNumber = String(lastVenueId + 1).padStart(5, "0");
  return `VEN-${year}-${uniqueNumber}`;
}

// Generate a unique reference number for the booking (e.g., VNB-2025-00001)
function generateBookingReferenceNumber(lastBookingId) {
  const year = new Date().getFullYear();
  const uniqueNumber = String(lastBookingId + 1).padStart(5, "0");
  return `VNB-${year}-${uniqueNumber}`;
}

// ============================================
// Venue CRUD Operations
// ============================================

export async function createVenue(req, res) {
  let transaction;
  try {
    transaction = await sequelize.transaction();

    // Generate unique reference number
    const lastVenue = await VenueModel.findOne({
      order: [["venue_id", "DESC"]],
    });
    const referenceNumber = generateVenueReferenceNumber(
      lastVenue ? lastVenue.venue_id : 0
    );

    // Ensure amenities and additional_details are arrays
    const amenities = Array.isArray(req.body.amenities)
      ? req.body.amenities
      : [];
    const additionalDetails = Array.isArray(req.body.additional_details)
      ? req.body.additional_details
      : [];

    const newVenue = await VenueModel.create(
      {
        reference_number: referenceNumber,
        name: req.body.name,
        description: req.body.description,
        location: req.body.location,
        capacity: req.body.capacity,
        amenities: amenities,
        hourly_rate: req.body.hourly_rate,
        status: req.body.status || "Available",
        operating_hours_start: req.body.operating_hours_start,
        operating_hours_end: req.body.operating_hours_end,
        booking_advance_days: req.body.booking_advance_days || 7,
        requires_approval: req.body.requires_approval !== undefined ? req.body.requires_approval : true,
        assigned_department: req.body.assigned_department,
        last_maintenance: req.body.last_maintenance || new Date().toISOString().split("T")[0],
        next_maintenance: req.body.next_maintenance || null,
        additional_details: additionalDetails,
      },
      { transaction }
    );

    await transaction.commit();

    createLog({
      action: "create",
      target: referenceNumber,
      performed_by: req.body.user || "system",
      title: "Venue Created",
      details: `Venue with reference number ${referenceNumber} created successfully!`,
    });

    res.status(201).json({ message: "Venue created successfully!", newVenue });
  } catch (error) {
    if (transaction) await transaction.rollback();
    console.error(error);
    res.status(500).json({ message: "Error creating venue", error: error.message });
  }
}

// Get all Venues
export async function getAllVenues(req, res) {
  try {
    const venues = await VenueModel.findAll({
      where: { status: { [Op.ne]: "Archived" } },
    });

    if (!venues.length) {
      return res.status(204).json({ message: "No venues found." });
    }

    res.status(200).json(venues);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Error fetching venues", error: error.message });
  }
}

// Get Venue by Reference Number
export async function getVenueById(req, res) {
  try {
    const venue = await VenueModel.findOne({
      where: { reference_number: req.params.reference_number },
    });

    if (!venue) {
      return res.status(404).json({ message: "Venue not found." });
    }

    res.status(200).json(venue);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Error fetching venue", error: error.message });
  }
}

export async function updateVenue(req, res) {
  let transaction;
  try {
    transaction = await sequelize.transaction();

    const venue = await VenueModel.findOne({
      where: { reference_number: req.params.reference_number },
    });

    if (!venue) {
      return res.status(404).json({ message: "Venue not found." });
    }

    // Ensure amenities and additional_details are arrays
    const updatedAmenities = Array.isArray(req.body.amenities)
      ? req.body.amenities
      : venue.amenities;
    const updatedAdditionalDetails = Array.isArray(req.body.additional_details)
      ? req.body.additional_details
      : venue.additional_details;

    await venue.update(
      {
        name: req.body.name,
        description: req.body.description,
        location: req.body.location,
        capacity: req.body.capacity,
        amenities: updatedAmenities,
        hourly_rate: req.body.hourly_rate,
        status: req.body.status,
        operating_hours_start: req.body.operating_hours_start,
        operating_hours_end: req.body.operating_hours_end,
        booking_advance_days: req.body.booking_advance_days,
        requires_approval: req.body.requires_approval,
        assigned_department: req.body.assigned_department,
        last_maintenance: req.body.last_maintenance,
        next_maintenance: req.body.next_maintenance,
        additional_details: updatedAdditionalDetails,
      },
      { transaction }
    );

    await transaction.commit();

    createLog({
      action: "update",
      target: req.params.reference_number,
      performed_by: req.body.user || "system",
      title: "Venue Updated",
      details: `Venue with reference number ${req.params.reference_number} updated successfully.`,
    });

    res.status(200).json({ message: "Venue updated successfully!" });
  } catch (error) {
    if (transaction) await transaction.rollback();
    console.error(error);
    res.status(500).json({ message: "Error updating venue", error: error.message });
  }
}

// Archive a Venue
export async function deleteVenue(req, res) {
  try {
    const [updatedRows] = await VenueModel.update(
      { status: "Archived" },
      { where: { reference_number: req.params.reference_number } }
    );

    if (updatedRows === 0) {
      return res
        .status(404)
        .json({ message: "Venue not found or already archived." });
    }

    createLog({
      action: "archive",
      target: req.params.reference_number,
      performed_by: req.body.user || "system",
      title: "Venue Archived",
      details: `Venue with reference number ${req.params.reference_number} archived successfully.`,
    });

    res.status(200).json({ message: "Venue archived successfully!" });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Error archiving venue", error: error.message });
  }
}

// Get Venues by Status
export async function getVenuesByStatus(req, res) {
  try {
    const venues = await VenueModel.findAll({
      where: { status: req.params.status },
    });

    if (!venues.length) {
      return res
        .status(404)
        .json({ message: `No venues with status ${req.params.status}` });
    }

    res.status(200).json(venues);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error fetching venues by status",
      error: error.message,
    });
  }
}

// ============================================
// Venue Unavailability Operations
// ============================================

export async function createVenueUnavailability(req, res) {
  let transaction;
  try {
    transaction = await sequelize.transaction();

    // Validate venue exists
    const venue = await VenueModel.findByPk(req.body.venue_id);
    if (!venue) {
      return res.status(404).json({ message: "Venue not found." });
    }

    // Validate dates
    if (new Date(req.body.start_date) >= new Date(req.body.end_date)) {
      return res.status(400).json({
        message: "End date must be after start date.",
      });
    }

    const newUnavailability = await VenueUnavailabilityModel.create(
      {
        venue_id: req.body.venue_id,
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
      target: `Venue ${req.body.venue_id} Unavailability`,
      performed_by: req.body.user || "system",
      title: "Venue Unavailability Created",
      details: `Unavailability period created for venue ID ${req.body.venue_id}.`,
    });

    res.status(201).json({
      message: "Venue unavailability created successfully!",
      data: newUnavailability,
    });
  } catch (error) {
    if (transaction) await transaction.rollback();
    console.error(error);
    res.status(500).json({
      message: "Error creating venue unavailability",
      error: error.message,
    });
  }
}

export async function getAllVenueUnavailability(req, res) {
  try {
    const unavailability = await VenueUnavailabilityModel.findAll({
      where: { status: { [Op.ne]: "Cancelled" } },
      include: [
        {
          model: VenueModel,
          as: "venue",
          attributes: ["name", "reference_number", "location"],
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
      message: "Error fetching venue unavailability",
      error: error.message,
    });
  }
}

export async function getVenueUnavailabilityById(req, res) {
  try {
    const unavailability = await VenueUnavailabilityModel.findByPk(
      req.params.unavailability_id,
      {
        include: [
          {
            model: VenueModel,
            as: "venue",
            attributes: ["name", "reference_number", "location"],
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
      message: "Error fetching venue unavailability",
      error: error.message,
    });
  }
}

export async function getVenueUnavailabilityByVenue(req, res) {
  try {
    const unavailability = await VenueUnavailabilityModel.findAll({
      where: {
        venue_id: req.params.venue_id,
        status: { [Op.ne]: "Cancelled" },
      },
      include: [
        {
          model: VenueModel,
          as: "venue",
          attributes: ["name", "reference_number", "location"],
        },
      ],
    });

    res.status(200).json(unavailability);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error fetching venue unavailability",
      error: error.message,
    });
  }
}

export async function updateVenueUnavailability(req, res) {
  let transaction;
  try {
    transaction = await sequelize.transaction();

    const unavailability = await VenueUnavailabilityModel.findByPk(
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
      title: "Venue Unavailability Updated",
      details: `Unavailability record ${req.params.unavailability_id} updated successfully.`,
    });

    res.status(200).json({
      message: "Venue unavailability updated successfully!",
      data: unavailability,
    });
  } catch (error) {
    if (transaction) await transaction.rollback();
    console.error(error);
    res.status(500).json({
      message: "Error updating venue unavailability",
      error: error.message,
    });
  }
}

export async function deleteVenueUnavailability(req, res) {
  try {
    const unavailability = await VenueUnavailabilityModel.findByPk(
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
      title: "Venue Unavailability Cancelled",
      details: `Unavailability record ${req.params.unavailability_id} cancelled successfully.`,
    });

    res.status(200).json({
      message: "Venue unavailability cancelled successfully!",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error cancelling venue unavailability",
      error: error.message,
    });
  }
}

// ============================================
// Venue Bookings Operations
// ============================================

export async function createVenueBooking(req, res) {
  let transaction;
  try {
    transaction = await sequelize.transaction();

    // Validate venue exists
    const venue = await VenueModel.findByPk(req.body.venue_id);
    if (!venue) {
      return res.status(404).json({ message: "Venue not found." });
    }

    // Check if venue is available
    if (venue.status !== "Available") {
      return res.status(400).json({
        message: `Venue is not available. Current status: ${venue.status}`,
      });
    }

    // Generate unique reference number
    const lastBooking = await VenueBookingsModel.findOne({
      order: [["booking_id", "DESC"]],
    });
    const referenceNumber = generateBookingReferenceNumber(
      lastBooking ? lastBooking.booking_id : 0
    );

    // Validate time
    if (req.body.start_time >= req.body.end_time) {
      return res.status(400).json({
        message: "End time must be after start time.",
      });
    }

    // Check for conflicts with existing bookings
    const conflictingBooking = await VenueBookingsModel.findOne({
      where: {
        venue_id: req.body.venue_id,
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
        message: "Venue is already booked for this date and time.",
      });
    }

    // Check for conflicts with unavailability
    const conflictingUnavailability = await VenueUnavailabilityModel.findOne({
      where: {
        venue_id: req.body.venue_id,
        status: "Active",
        start_date: { [Op.lte]: new Date(`${req.body.booking_date}T${req.body.end_time}`) },
        end_date: { [Op.gte]: new Date(`${req.body.booking_date}T${req.body.start_time}`) },
      },
    });

    if (conflictingUnavailability) {
      return res.status(409).json({
        message: "Venue is unavailable for this date and time.",
      });
    }

    const additionalRequirements = Array.isArray(req.body.additional_requirements)
      ? req.body.additional_requirements
      : [];

    const newBooking = await VenueBookingsModel.create(
      {
        reference_number: referenceNumber,
        venue_id: req.body.venue_id,
        venue_request_id: req.body.venue_request_id || null,
        requester: req.body.requester,
        organization: req.body.organization,
        event_title: req.body.event_title,
        event_description: req.body.event_description,
        booking_date: req.body.booking_date,
        start_time: req.body.start_time,
        end_time: req.body.end_time,
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
      title: "Venue Booking Created",
      details: `Venue booking with reference number ${referenceNumber} created successfully.`,
    });

    res.status(201).json({
      message: "Venue booking created successfully!",
      data: newBooking,
    });
  } catch (error) {
    if (transaction) await transaction.rollback();
    console.error(error);
    res.status(500).json({
      message: "Error creating venue booking",
      error: error.message,
    });
  }
}

export async function getAllVenueBookings(req, res) {
  try {
    const bookings = await VenueBookingsModel.findAll({
      where: { status: { [Op.ne]: "Cancelled" } },
      include: [
        {
          model: VenueModel,
          as: "venue",
          attributes: ["name", "reference_number", "location", "capacity"],
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
      message: "Error fetching venue bookings",
      error: error.message,
    });
  }
}

export async function getVenueBookingById(req, res) {
  try {
    const booking = await VenueBookingsModel.findByPk(req.params.booking_id, {
      include: [
        {
          model: VenueModel,
          as: "venue",
          attributes: ["name", "reference_number", "location", "capacity"],
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
      message: "Error fetching venue booking",
      error: error.message,
    });
  }
}

export async function getVenueBookingsByVenue(req, res) {
  try {
    const bookings = await VenueBookingsModel.findAll({
      where: {
        venue_id: req.params.venue_id,
        status: { [Op.ne]: "Cancelled" },
      },
      include: [
        {
          model: VenueModel,
          as: "venue",
          attributes: ["name", "reference_number", "location"],
        },
      ],
      order: [["booking_date", "ASC"], ["start_time", "ASC"]],
    });

    res.status(200).json(bookings || []);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error fetching venue bookings",
      error: error.message,
    });
  }
}

export async function getVenueBookingsByDate(req, res) {
  try {
    const bookings = await VenueBookingsModel.findAll({
      where: {
        booking_date: req.params.date,
        status: { [Op.ne]: "Cancelled" },
      },
      include: [
        {
          model: VenueModel,
          as: "venue",
          attributes: ["name", "reference_number", "location"],
        },
      ],
      order: [["start_time", "ASC"]],
    });

    res.status(200).json(bookings);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error fetching venue bookings",
      error: error.message,
    });
  }
}

export async function updateVenueBooking(req, res) {
  let transaction;
  try {
    transaction = await sequelize.transaction();

    const booking = await VenueBookingsModel.findByPk(req.params.booking_id);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found." });
    }

    // If updating date/time, check for conflicts
    if (req.body.booking_date || req.body.start_time || req.body.end_time) {
      const bookingDate = req.body.booking_date || booking.booking_date;
      const startTime = req.body.start_time || booking.start_time;
      const endTime = req.body.end_time || booking.end_time;

      if (startTime >= endTime) {
        return res.status(400).json({
          message: "End time must be after start time.",
        });
      }

      const conflictingBooking = await VenueBookingsModel.findOne({
        where: {
          venue_id: booking.venue_id,
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
          message: "Venue is already booked for this date and time.",
        });
      }
    }

    const updateData = {
      venue_request_id: req.body.venue_request_id,
      organization: req.body.organization,
      event_title: req.body.event_title,
      event_description: req.body.event_description,
      booking_date: req.body.booking_date,
      start_time: req.body.start_time,
      end_time: req.body.end_time,
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
      title: "Venue Booking Updated",
      details: `Venue booking ${booking.reference_number} updated successfully.`,
    });

    res.status(200).json({
      message: "Venue booking updated successfully!",
      data: booking,
    });
  } catch (error) {
    if (transaction) await transaction.rollback();
    console.error(error);
    res.status(500).json({
      message: "Error updating venue booking",
      error: error.message,
    });
  }
}

export async function deleteVenueBooking(req, res) {
  try {
    const booking = await VenueBookingsModel.findByPk(req.params.booking_id);

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
      title: "Venue Booking Cancelled",
      details: `Venue booking ${booking.reference_number} cancelled successfully.`,
    });

    res.status(200).json({
      message: "Venue booking cancelled successfully!",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error cancelling venue booking",
      error: error.message,
    });
  }
}

// ============================================
// Venue Availability Check
// ============================================

export async function checkVenueAvailability(req, res) {
  try {
    const { venue_id, date, start_time, end_time } = req.query;

    if (!venue_id || !date || !start_time || !end_time) {
      return res.status(400).json({
        message: "Missing required parameters: venue_id, date, start_time, end_time",
      });
    }

    // Check if venue exists and is available
    const venue = await VenueModel.findByPk(venue_id);
    if (!venue) {
      return res.status(404).json({ message: "Venue not found." });
    }

    if (venue.status !== "Available") {
      return res.status(200).json({
        available: false,
        reason: `Venue is ${venue.status}`,
      });
    }

    // Check for conflicting bookings
    const conflictingBooking = await VenueBookingsModel.findOne({
      where: {
        venue_id: venue_id,
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
        reason: "Venue is already booked for this time slot",
        conflicting_booking: {
          reference_number: conflictingBooking.reference_number,
          event_title: conflictingBooking.event_title,
        },
      });
    }

    // Check for unavailability periods
    const conflictingUnavailability = await VenueUnavailabilityModel.findOne({
      where: {
        venue_id: venue_id,
        status: "Active",
        start_date: { [Op.lte]: new Date(`${date}T${end_time}`) },
        end_date: { [Op.gte]: new Date(`${date}T${start_time}`) },
      },
    });

    if (conflictingUnavailability) {
      return res.status(200).json({
        available: false,
        reason: conflictingUnavailability.reason || "Venue is unavailable",
        unavailability: {
          reason: conflictingUnavailability.reason,
          description: conflictingUnavailability.description,
        },
      });
    }

    res.status(200).json({
      available: true,
      venue: {
        name: venue.name,
        reference_number: venue.reference_number,
        capacity: venue.capacity,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error checking venue availability",
      error: error.message,
    });
  }
}

