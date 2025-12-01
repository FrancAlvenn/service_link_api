import { DataTypes } from "sequelize";
import sequelize from "../database.js";

const VehicleUnavailabilityModel = sequelize.define(
  "VehicleUnavailabilityModel",
  {
    unavailability_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
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
    start_date: {
      type: DataTypes.DATE,           // now full datetime (like venue)
      allowNull: false,
      comment: "Start date and time of unavailability",
    },
    end_date: {
      type: DataTypes.DATE,           // now full datetime (like venue)
      allowNull: false,
      comment: "End date and time of unavailability",
    },
    reason: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "Reason for unavailability (Maintenance, Repair, Reserved, etc.)",
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "Detailed description of the unavailability",
    },
    is_recurring: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
      comment: "Whether this is a recurring unavailability",
    },
    recurrence_pattern: {
      type: DataTypes.JSON,
      allowNull: true,
      comment:
        "Recurrence pattern if is_recurring is true (e.g., daily, weekly, monthly)",
    },
    created_by: {
      type: DataTypes.STRING(100),
      allowNull: true,
      references: {
        model: "users",
        key: "reference_number",
      },
      comment: "Reference number of user who created this unavailability",
    },
    status: {
      type: DataTypes.STRING(50),
      defaultValue: "Active",
      allowNull: false,
      comment: "Active, Cancelled, Expired", // added Expired to match venue
    },
  },
  {
    tableName: "vehicle_unavailability",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

export default VehicleUnavailabilityModel;