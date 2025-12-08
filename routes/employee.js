import express from "express";
import {getAllEmployees, getEmployeeById, createEmployee, updateEmployee, deleteEmployee, updateEmployeeQualifications, searchEmployees, matchEmployeesToJob, } from "../controllers/employee.js";
import { validateEmployeePayload, validateMatchRequest } from "../middleware/employeeValidation.js";

const router = express.Router();

// Employee CRUD Routes
router.get("/", getAllEmployees);

router.get("/:reference_number", getEmployeeById);

router.post("/", validateEmployeePayload, createEmployee);

router.put("/:reference_number", validateEmployeePayload, updateEmployee);

// Qualifications & search endpoints
router.put("/:reference_number/qualifications", validateEmployeePayload, updateEmployeeQualifications);
router.get("/search", searchEmployees);

// Matching endpoint
router.post("/match", validateMatchRequest, matchEmployeesToJob);

router.delete("/:reference_number", deleteEmployee);

export default router;
