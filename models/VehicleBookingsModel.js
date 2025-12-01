import { DataTypes } from "sequelize";
import sequelize from "../database.js";

const VehicleBookingsModel = sequelize.define(
  "VehicleBookingsModel",
  {
    booking_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    reference_number: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    vehicle_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "vehicles",
        key: "vehicle_id",
      },
      onDelete: "CASCADE",
    },
    vehicle_request_id: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: "Reference to vehicle_request if booking came from a request",
    },
    requester: {
      type: DataTypes.STRING(100),
      allowNull: false,
      references: {
        model: "users",
        key: "reference_number",
      },
    },
    organization: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    event_title: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "Title or name of the event/trip",
    },
    event_description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    booking_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      comment: "Date of the trip/booking",
    },
    start_time: {
      type: DataTypes.TIME,
      allowNull: false,
      comment: "Departure time",
    },
    end_time: {
      type: DataTypes.TIME,
      allowNull: true,
      comment: "Expected arrival time",
    },
    destination: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    destination_coordinates: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    participants: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    pax_estimation: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
    },
    status: {
      type: DataTypes.STRING(50),
      defaultValue: "Pending",
      allowNull: false,
      comment: "Pending, Confirmed, Cancelled, Completed",
    },
    confirmed_by: {
      type: DataTypes.STRING(100),
      allowNull: true,
      references: {
        model: "users",
        key: "reference_number",
      },
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
    check_in_time: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: "Actual departure time",
    },
    check_out_time: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: "Actual return time",
    },
    remarks: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    additional_requirements: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: "Array of additional requirements or special requests",
    },
  },
  {
    tableName: "vehicle_bookings",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

export default VehicleBookingsModel;

