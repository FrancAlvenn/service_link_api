import { DataTypes } from "sequelize";
import sequelize from "../database.js";

const EmployeeModel = sequelize.define(
  "EmployeeModel",
  {
    employee_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    reference_number: {
      type: DataTypes.STRING(255),
      allowNull: true,
      unique: true,
      comment: "Unique reference number for employee tracking",
    },
    first_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    last_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    middle_name: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING(255),
      unique: true,
      allowNull: false,
      validate: {
        isEmail: true,
      },
    },
    phone_number: {
      type: DataTypes.STRING(15),
      allowNull: true,
    },
    position: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    department: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    expertise: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment:
        "Specialization or designation (e.g., Driver, Technician, Electrician)",
    },
    hire_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  employment_status: {
      type: DataTypes.STRING(50),
      defaultValue: "Active",
      allowNull: true,
    },
    availability_status: {
      type: DataTypes.STRING(50),
      allowNull: true,
      defaultValue: "Available",
      validate: {
        isIn: {
          args: [["Available", "Unavailable", "On Leave", "Busy"]],
          msg: "availability_status must be one of: Available, Unavailable, On Leave, Busy",
        },
      },
      comment: "Current availability of the employee",
    },
    experience_level: {
      type: DataTypes.STRING(20),
      allowNull: true,
      defaultValue: "Mid",
      validate: {
        isIn: {
          args: [["Junior", "Mid", "Senior"]],
          msg: "experience_level must be one of: Junior, Mid, Senior",
        },
      },
      comment: "Seniority level of the employee",
    },
    qualifications: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: [],
      validate: {
        isValidArray(value) {
          if (value == null) return;
          if (!Array.isArray(value)) {
            throw new Error("qualifications must be an array");
          }
          const allowed = [
            "Plumbing",
            "Electrical",
            "Carpentry",
            "HVAC",
            "Welding",
            "Painting",
            "Masonry",
            "IT Support",
            "Cleaning",
            "General Maintenance",
          ];
          for (const v of value) {
            if (typeof v !== "string") {
              throw new Error("each qualification must be a string");
            }
            if (!allowed.includes(v)) {
              throw new Error(`qualification '${v}' is not allowed`);
            }
          }
        },
      },
      comment: "Array of skills/certifications",
    },
    specializations: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: [],
      validate: {
        isValidArray(value) {
          if (value == null) return;
          if (!Array.isArray(value)) throw new Error("specializations must be an array");
          for (const v of value) {
            if (typeof v !== "string") throw new Error("each specialization must be a string");
          }
        },
      },
      comment: "Detailed areas of expertise",
    },
    supervisor_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    birth_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    emergency_contact: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    emergency_phone: {
      type: DataTypes.STRING(15),
      allowNull: true,
    },
    salary: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
  },
  {
    tableName: "employees",
    timestamps: true,
  }
);

export default EmployeeModel;
