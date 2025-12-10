import sequelize from "../database.js";
import EmployeeModel from "../models/EmployeeModel.js";
import { createLog } from "./system_logs.js";
import { Op } from "sequelize";

// Create a new Employee
export const createEmployee = async (req, res) => {
  let transaction;
  try {
    transaction = await sequelize.transaction();

    // Check if email is unique
    const existingEmployee = await EmployeeModel.findOne({
      where: { email: req.body.email },
    });

    if (existingEmployee) {
      await transaction.rollback();
      return res.status(400).json({ message: "Email must be unique." });
    }

    const hireDate =
      req.body.hire_date || new Date().toISOString().split("T")[0];

    const newEmployee = await EmployeeModel.create(
      {
        reference_number: req.body.reference_number,
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        middle_name: req.body.middle_name,
        email: req.body.email,
        phone_number: req.body.phone_number,
        position: req.body.position,
        department: req.body.department,
        expertise: req.body.expertise,
        hire_date: hireDate,
        employment_status: req.body.employment_status || "Active",
        availability_status: req.body.availability_status || "Available",
        experience_level: req.body.experience_level || "Mid",
        qualifications: Array.isArray(req.body.qualifications) ? req.body.qualifications : [],
        specializations: Array.isArray(req.body.specializations) ? req.body.specializations : [],
        supervisor_id: req.body.supervisor_id || null,
        address: req.body.address,
        birth_date: req.body.birth_date,
        emergency_contact: req.body.emergency_contact,
        emergency_phone: req.body.emergency_phone,
        salary: req.body.salary || 0,
      },
      { transaction }
    );

    await transaction.commit();

    createLog({
      action: "create",
      target: req.body.reference_number,
      performed_by: req.body.user || "system",
      title: "Employee Created",
      details: `Employee with reference number ${req.body.reference_number} created successfully!`,
    });

    res
      .status(201)
      .json({ message: "Employee created successfully!", newEmployee });
  } catch (error) {
    if (transaction) await transaction.rollback();
    console.error("Error creating employee:", error);
    res
      .status(500)
      .json({ message: "Error creating employee", error: error.message });
  }
};

// Get all Employees (excluding Archived)
export const getAllEmployees = async (req, res) => {
  try {
    const employees = await EmployeeModel.findAll({
      where: { employment_status: { [Op.ne]: "Archived" } },
    });

    if (!employees.length) {
      return res.status(204).json({ message: "No employees found." });
    }

    res.status(200).json(employees);
  } catch (error) {
    console.error("Error fetching employees:", error);
    res
      .status(500)
      .json({ message: "Error fetching employees", error: error.message });
  }
};

// Get Employee by ID
export const getEmployeeById = async (req, res) => {
  try {
    const employee = await EmployeeModel.findByPk(req.params.reference_number);

    if (!employee) {
      return res.status(404).json({ message: "Employee not found." });
    }

    res.status(200).json(employee);
  } catch (error) {
    console.error("Error fetching employee:", error);
    res
      .status(500)
      .json({ message: "Error fetching employee", error: error.message });
  }
};

// Update an Employee
export const updateEmployee = async (req, res) => {
  let transaction;
  try {
    transaction = await sequelize.transaction();

    const [updatedRows] = await EmployeeModel.update(req.body, {
      where: { reference_number: req.params.reference_number },
      transaction,
    });

    if (updatedRows === 0) {
      await transaction.rollback();
      return res.status(404).json({ message: "Employee not found." });
    }

    await transaction.commit();

    createLog({
      action: "update",
      target: req.params.reference_number,
      performed_by: req.body.user || "system",
      title: "Employee Updated",
      details: `Employee with reference number ${req.params.reference_number} updated successfully.`,
    });

    res.status(200).json({ message: "Employee updated successfully!" });
  } catch (error) {
    if (transaction) await transaction.rollback();
    console.error("Error updating employee:", error);
    res
      .status(500)
      .json({ message: "Error updating employee", error: error.message });
  }
};

// Archive (Delete) an Employee
export const deleteEmployee = async (req, res) => {
  try {
    const [updatedRows] = await EmployeeModel.update(
      { employment_status: "Archived" },
      { where: { reference_number: req.params.reference_number } }
    );

    if (updatedRows === 0) {
      return res
        .status(404)
        .json({ message: "Employee not found or already archived." });
    }

    createLog({
      action: "archive",
      target: req.params.reference_number,
      performed_by: req.body.user || "system",
      title: "Employee Archived",
      details: `Employee with reference number ${req.params.reference_number} archived successfully.`,
    });

    res.status(200).json({ message: "Employee archived successfully!" });
  } catch (error) {
    console.error("Error archiving employee:", error);
    res
      .status(500)
      .json({ message: "Error archiving employee", error: error.message });
  }
};

// Get Employees by Status
export const getEmployeesByStatus = async (req, res) => {
  try {
    const employees = await EmployeeModel.findAll({
      where: { employment_status: req.params.status },
    });

    if (!employees.length) {
      return res.status(404).json({
        message: `No employees with status ${req.params.status}`,
      });
    }

    res.status(200).json(employees);
  } catch (error) {
    console.error("Error fetching employees by status:", error);
    res.status(500).json({
      message: "Error fetching employees by status",
      error: error.message,
    });
  }
};

// Update only qualifications
export const updateEmployeeQualifications = async (req, res) => {
  try {
    const { qualifications, specializations, availability_status, experience_level } = req.body;
    const [updatedRows] = await EmployeeModel.update(
      {
        ...(qualifications !== undefined ? { qualifications } : {}),
        ...(specializations !== undefined ? { specializations } : {}),
        ...(availability_status !== undefined ? { availability_status } : {}),
        ...(experience_level !== undefined ? { experience_level } : {}),
      },
      { where: { reference_number: req.params.reference_number } }
    );

    if (updatedRows === 0) {
      return res.status(404).json({ message: "Employee not found." });
    }

    createLog({
      action: "update",
      target: req.params.reference_number,
      performed_by: req.body.user || "system",
      title: "Employee Qualifications Updated",
      details: `Employee ${req.params.reference_number} qualifications updated successfully.`,
    });

    res.status(200).json({ message: "Employee qualifications updated successfully!" });
  } catch (error) {
    console.error("Error updating qualifications:", error);
    res.status(500).json({ message: "Error updating qualifications", error: error.message });
  }
};

// Search employees by qualifications and filters
export const searchEmployees = async (req, res) => {
  try {
    const { skills = [], availability = "Available", experience, department } = req.query;
    const skillArray = Array.isArray(skills) ? skills : typeof skills === "string" ? skills.split(",") : [];

    const where = { employment_status: { [Op.ne]: "Archived" } };
    if (availability) where.availability_status = availability;
    if (experience) where.experience_level = experience;
    if (department) where.department = department;

    const employees = await EmployeeModel.findAll({ where });

    const filtered = employees.filter((emp) => {
      const quals = Array.isArray(emp.qualifications) ? emp.qualifications : [];
      return skillArray.every((s) => quals.includes(s));
    });

    res.status(200).json(filtered);
  } catch (error) {
    console.error("Error searching employees:", error);
    res.status(500).json({ message: "Error searching employees", error: error.message });
  }
};

// Match employees to a job request
// Utility: Levenshtein distance for fuzzy matching
const levenshtein = (a = "", b = "") => {
  const m = Array.from({ length: a.length + 1 }, () => Array(b.length + 1).fill(0));
  for (let i = 0; i <= a.length; i++) m[i][0] = i;
  for (let j = 0; j <= b.length; j++) m[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      m[i][j] = Math.min(m[i - 1][j] + 1, m[i][j - 1] + 1, m[i - 1][j - 1] + cost);
    }
  }
  return m[a.length][b.length];
};

const fuzzyIncludes = (text, kw) => {
  if (text.includes(kw)) return true;
  const tokens = text.split(/[^a-z0-9]+/);
  return tokens.some((t) => t && kw && levenshtein(t, kw) <= 1);
};

export const computeMatches = ({
  title = "",
  description = "",
  details = [],
  department,
  job_category,
  required_skills = [],
  required_experience = null,
  availability_window = null,
  location_preference = null,
  certifications_required = [],
}, employees = []) => {
  const start = Date.now();

  const keywordToSkill = {
    plumbing: "Plumbing",
    pipe: "Plumbing",
    piping: "Plumbing",
    drainage: "Plumbing",
    leak: "Plumbing",
    faucet: "Plumbing",
    toilet: "Plumbing",
    bathroom: "Plumbing",
    sink: "Plumbing",
    electrical: "Electrical",
    electrician: "Electrical",
    wiring: "Electrical",
    outlet: "Electrical",
    socket: "Electrical",
    breaker: "Electrical",
    switchboard: "Electrical",
    light: "Electrical",
    bulb: "Electrical",
    carpentry: "Carpentry",
    wood: "Carpentry",
    door: "Carpentry",
    window: "Carpentry",
    frame: "Carpentry",
    shelving: "Carpentry",
    hvac: "HVAC",
    aircon: "HVAC",
    ac: "HVAC",
    ventilation: "HVAC",
    cooling: "HVAC",
    welding: "Welding",
    metal: "Welding",
    fabricate: "Welding",
    paint: "Painting",
    repaint: "Painting",
    coat: "Painting",
    masonry: "Masonry",
    concrete: "Masonry",
    brick: "Masonry",
    cement: "Masonry",
    computer: "IT Support",
    server: "IT Support",
    printer: "IT Support",
    network: "IT Support",
    it: "IT Support",
    clean: "Cleaning",
    sanitize: "Cleaning",
    maintenance: "General Maintenance",
    repair: "General Maintenance",
    fix: "General Maintenance",
    service: "General Maintenance",
  };

  const text = `${title} ${description} ${details.map((d) => `${d.particulars} ${d.description}`).join(" ")}`.toLowerCase();
  const inferredSkills = new Set();
  for (const [kw, skill] of Object.entries(keywordToSkill)) {
    if (fuzzyIncludes(text, kw)) inferredSkills.add(skill);
  }
  if (typeof job_category === "string" && keywordToSkill[job_category.toLowerCase()]) {
    inferredSkills.add(keywordToSkill[job_category.toLowerCase()]);
  }
  const allRequiredSkills = new Set([...(required_skills || []), ...Array.from(inferredSkills)]);

  const rank = { Junior: 1, Mid: 2, Senior: 3 };
  const locationTarget = location_preference || department || null;

  const scored = employees.map((emp) => {
    const quals = Array.isArray(emp.qualifications) ? emp.qualifications : [];
    const specs = Array.isArray(emp.specializations) ? emp.specializations : [];
    const matches = Array.from(allRequiredSkills).filter((s) => quals.includes(s));
    const skillScore = matches.length * 3;
    const expScore = emp.experience_level === "Senior" ? 2 : emp.experience_level === "Mid" ? 1 : 0;
    const specScore = specs.some((s) => text.includes(String(s).toLowerCase())) ? 1 : 0;
    const locScore = locationTarget && emp.department === locationTarget ? 1 : 0;

    const experience_ok = !required_experience || (rank[emp.experience_level] || 0) >= (rank[required_experience] || 0);
    const cert_ok = (certifications_required || []).every((c) => {
      const cLower = String(c).toLowerCase();
      return quals.some((q) => String(q).toLowerCase().includes(cLower)) || specs.some((s) => String(s).toLowerCase().includes(cLower));
    });

    const score = skillScore + expScore + specScore + locScore + ((certifications_required || []).filter((c) => {
      const cLower = String(c).toLowerCase();
      return quals.some((q) => String(q).toLowerCase().includes(cLower)) || specs.some((s) => String(s).toLowerCase().includes(cLower));
    }).length * 2);

    const rationale = `skills(${matches.join(", ")}) exp(${emp.experience_level}${required_experience ? `>=${required_experience}` : ""}) loc(${locScore ? "match" : "diff"}) certs(${cert_ok ? "ok" : "missing"}) specs(${specScore ? "related" : "n/a"})`;

    const mandatory_ok = experience_ok && cert_ok && emp.availability_status === "Available";

    return { employee: emp, score, matchedSkills: matches, rationale, mandatory_ok, score_breakdown: { skillScore, expScore, specScore, locScore } };
  });

  const exact = scored.filter((s) => s.mandatory_ok);
  const fallback = scored.filter((s) => !s.mandatory_ok && s.score_breakdown.skillScore > 0);
  exact.sort((a, b) => b.score - a.score);
  fallback.sort((a, b) => b.score - a.score);

  const elapsed_ms = Date.now() - start;

  return {
    required_skills: Array.from(allRequiredSkills),
    candidates: exact.map(({ employee, score, matchedSkills, rationale, mandatory_ok, score_breakdown }) => ({
      reference_number: employee.reference_number,
      first_name: employee.first_name,
      last_name: employee.last_name,
      email: employee.email,
      department: employee.department,
      experience_level: employee.experience_level,
      availability_status: employee.availability_status,
      qualifications: employee.qualifications,
      specializations: employee.specializations,
      score,
      matchedSkills,
      rationale,
      mandatory_ok,
      score_breakdown,
    })),
    fallback_candidates: fallback.map(({ employee, score, matchedSkills, rationale, mandatory_ok, score_breakdown }) => ({
      reference_number: employee.reference_number,
      first_name: employee.first_name,
      last_name: employee.last_name,
      email: employee.email,
      department: employee.department,
      experience_level: employee.experience_level,
      availability_status: employee.availability_status,
      qualifications: employee.qualifications,
      specializations: employee.specializations,
      score,
      matchedSkills,
      rationale,
      mandatory_ok,
      score_breakdown,
    })),
    top_candidate: (exact[0] || fallback[0]) ? {
      reference_number: (exact[0] || fallback[0]).employee.reference_number,
      first_name: (exact[0] || fallback[0]).employee.first_name,
      last_name: (exact[0] || fallback[0]).employee.last_name,
      email: (exact[0] || fallback[0]).employee.email,
      department: (exact[0] || fallback[0]).employee.department,
      experience_level: (exact[0] || fallback[0]).employee.experience_level,
      availability_status: (exact[0] || fallback[0]).employee.availability_status,
      qualifications: (exact[0] || fallback[0]).employee.qualifications,
      specializations: (exact[0] || fallback[0]).employee.specializations,
      score: (exact[0] || fallback[0]).score,
      matchedSkills: (exact[0] || fallback[0]).matchedSkills,
      rationale: (exact[0] || fallback[0]).rationale,
      fallback_used: !exact.length,
    } : null,
    benchmarks: { elapsed_ms, candidate_count: employees.length },
    mandatory_requirements: { required_experience, certifications_required, location_preference: locationTarget, availability_window },
  };
};

export const matchEmployeesToJob = async (req, res) => {
  try {
    const where = {
      employment_status: { [Op.ne]: "Archived" },
      availability_status: "Available",
      ...(req.body.department ? { department: req.body.department } : {}),
      ...(req.body.location_preference ? { department: req.body.location_preference } : {}),
    };

    const candidates = await EmployeeModel.findAll({ where });
    const result = computeMatches({ ...req.body }, candidates);

    // Log rationale summary
    if (result.top_candidate) {
      createLog({
        action: "match",
        target: result.top_candidate.reference_number,
        performed_by: req.body.requester || "system",
        title: "Auto-assignment",
        details: `Top candidate selected. Rationale: ${result.top_candidate.rationale}`,
      });
    }

    res.status(200).json(result);
  } catch (error) {
    console.error("Error matching employees:", error);
    res.status(500).json({ message: "Error matching employees", error: error.message });
  }
};
