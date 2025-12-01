import { DataTypes } from "sequelize";
import sequelize from "../database.js";

const VehicleModel = sequelize.define(
  "VehicleModel",
  {
    vehicle_id: {
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
    vehicle_type: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: "Van, SUV, Bus, Car, etc.",
    },
    license_plate: {
      type: DataTypes.STRING(50),
      allowNull: true,
      unique: true,
    },
    make: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    model: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    year: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    capacity: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: "Maximum passenger capacity",
    },
    fuel_type: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: "Gasoline, Diesel, Electric, Hybrid",
    },
    status: {
      type: DataTypes.STRING(50),
      defaultValue: "Available",
      allowNull: true,
      comment: "Available, Unavailable, Under Maintenance, In Use, etc.",
    },
    assigned_department: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    assigned_driver: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "Default assigned driver reference number",
    },
    last_maintenance: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    next_maintenance: {
      type: DataTypes.DATE,
      allowNull: true,
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
    // Flexible field for storing extra attributes
    additional_details: {
      type: DataTypes.JSON,
      allowNull: true,
    },
  },
  {
    tableName: "vehicles",
    timestamps: true,
  }
);

export default VehicleModel;

