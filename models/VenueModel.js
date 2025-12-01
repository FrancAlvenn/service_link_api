import { DataTypes } from "sequelize";
import sequelize from "../database.js";

const VenueModel = sequelize.define(
  "VenueModel",
  {
    venue_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    reference_number: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    location: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    capacity: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: "Maximum capacity of the venue",
    },
    amenities: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: "Array of amenities available at the venue",
    },
    hourly_rate: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
      comment: "Hourly rental rate if applicable",
    },
    status: {
      type: DataTypes.STRING(50),
      defaultValue: "Available",
      allowNull: true,
      comment: "Available, Unavailable, Under Maintenance, etc.",
    },
    operating_hours_start: {
      type: DataTypes.TIME,
      allowNull: true,
      comment: "Default operating hours start time",
    },
    operating_hours_end: {
      type: DataTypes.TIME,
      allowNull: true,
      comment: "Default operating hours end time",
    },
    booking_advance_days: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 7,
      comment: "Minimum days in advance for booking",
    },
    requires_approval: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: false,
      comment: "Whether booking requires approval",
    },
    assigned_department: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    last_maintenance: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    next_maintenance: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    // Flexible field for storing extra attributes
    additional_details: {
      type: DataTypes.JSON,
      allowNull: true,
    },
  },
  {
    tableName: "venues",
    timestamps: true,
  }
);

export default VenueModel;

