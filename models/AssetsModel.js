import { DataTypes } from "sequelize";
import sequelize from "../database.js";

const AssetModel = sequelize.define(
  "AssetModel",
  {
    asset_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    reference_number: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    item_code: {
      type: DataTypes.STRING(100),
      allowNull: true,
      unique: true,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    category: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    location: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    acquisition_value: {
      type: DataTypes.DECIMAL(15, 2), // e.g., ₱1000.00
      allowNull: true,
    },
    assigned_department: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    assigned_personnel: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    date_of_issuance: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    depreciation_period: {
      type: DataTypes.INTEGER, // lifespan in years
      allowNull: true,
    },
    status: {
      type: DataTypes.STRING(50),
      defaultValue: "Available",
      allowNull: true,
    },
    last_maintenance: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    warranty_expiry: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    // Flexible field for storing extra attributes like model, serial number, etc.
    additional_details: {
      type: DataTypes.JSON,
      allowNull: true,
    },
  },
  {
    tableName: "assets",
    timestamps: true,
  }
);

export default AssetModel;
