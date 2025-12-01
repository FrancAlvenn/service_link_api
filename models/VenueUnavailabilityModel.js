import { DataTypes } from "sequelize";
import sequelize from "../database.js";

const VenueUnavailabilityModel = sequelize.define(
  "VenueUnavailabilityModel",
  {
    unavailability_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
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
    start_date: {
      type: DataTypes.DATE,
      allowNull: false,
      comment: "Start date and time of unavailability",
    },
    end_date: {
      type: DataTypes.DATE,
      allowNull: false,
      comment: "End date and time of unavailability",
    },
    reason: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "Reason for unavailability (Maintenance, Holiday, etc.)",
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
      comment: "Recurrence pattern if is_recurring is true (e.g., daily, weekly, monthly)",
    },
    created_by: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: "Reference number of user who created this unavailability",
    },
    status: {
      type: DataTypes.STRING(50),
      defaultValue: "Active",
      allowNull: false,
      comment: "Active, Cancelled, Expired",
    },
  },
  {
    tableName: "venue_unavailability",
    timestamps: true,
  }
);

export default VenueUnavailabilityModel;

