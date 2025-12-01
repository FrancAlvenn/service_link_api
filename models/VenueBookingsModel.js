import { DataTypes } from "sequelize";
import sequelize from "../database.js";

const VenueBookingsModel = sequelize.define(
  "VenueBookingsModel",
  {
    booking_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    reference_number: {
      type: DataTypes.STRING(255),
      allowNull: true,
      unique: true,
    },
    venue_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "venues",
        key: "venue_id",
      },
      onDelete: "CASCADE",
    },
    venue_request_id: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "Reference to venue_request if booking came from a request",
    },
    requester: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: "Reference number of the user who made the booking",
    },
    organization: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    event_title: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    event_description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    booking_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      comment: "Date of the event",
    },
    start_time: {
      type: DataTypes.TIME,
      allowNull: false,
    },
    end_time: {
      type: DataTypes.TIME,
      allowNull: false,
    },
    participants: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    pax_estimation: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    status: {
      type: DataTypes.STRING(50),
      defaultValue: "Confirmed",
      allowNull: false,
      comment: "Confirmed, Cancelled, Completed, No-Show",
    },
    confirmed_by: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: "Reference number of user who confirmed the booking",
    },
    confirmed_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    cancelled_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    cancellation_reason: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    remarks: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    check_in_time: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: "Actual check-in time when event starts",
    },
    check_out_time: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: "Actual check-out time when event ends",
    },
    additional_requirements: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: "Additional requirements or equipment needed",
    },
  },
  {
    tableName: "venue_bookings",
    timestamps: true,
  }
);

export default VenueBookingsModel;

