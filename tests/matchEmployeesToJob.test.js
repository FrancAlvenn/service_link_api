import { computeMatches } from "../controllers/employee.js";

const employees = [
  {
    reference_number: "EMP-001",
    first_name: "Alice",
    last_name: "Plumb",
    email: "alice@dyci.edu.ph",
    department: "GSO",
    experience_level: "Senior",
    availability_status: "Available",
    qualifications: ["Plumbing", "Certified"],
    specializations: ["bathroom", "pipes"],
  },
  {
    reference_number: "EMP-002",
    first_name: "Bob",
    last_name: "Spark",
    email: "bob@dyci.edu.ph",
    department: "Engineering",
    experience_level: "Mid",
    availability_status: "Available",
    qualifications: ["Electrical"],
    specializations: ["wiring", "outlet"],
  },
  {
    reference_number: "EMP-003",
    first_name: "Cara",
    last_name: "Clean",
    email: "cara@dyci.edu.ph",
    department: "Maintenance",
    experience_level: "Junior",
    availability_status: "Available",
    qualifications: ["Cleaning"],
    specializations: ["sanitize"],
  },
];

const assert = (cond, msg) => { if (!cond) { throw new Error(msg); } };

// Scenario 1: Plumbing with certification and Senior requirement
const scenario1 = () => {
  const payload = {
    title: "Urgent bathroom leak",
    description: "Major leak in bathroom, requires certified plumber",
    details: [{ particulars: "Pipes", description: "Replace broken pipe" }],
    job_category: "Plumbing",
    required_experience: "Senior",
    certifications_required: ["Certified"],
    location_preference: "GSO",
  };
  const res = computeMatches(payload, employees);
  assert(res.top_candidate?.reference_number === "EMP-001", "Scenario1: Expected EMP-001 as top candidate");
  assert(res.top_candidate?.fallback_used === false, "Scenario1: Should not use fallback");
};

// Scenario 2: Electrical mid-level, department Engineering
const scenario2 = () => {
  const payload = {
    title: "Outlet repair",
    description: "Routine maintenance to fix outlets",
    job_category: "Electrical",
    required_experience: "Mid",
    location_preference: "Engineering",
  };
  const res = computeMatches(payload, employees);
  assert(res.top_candidate?.reference_number === "EMP-002", "Scenario2: Expected EMP-002 as top candidate");
};

// Scenario 3: No exact matches, fallback to best skill match
const scenario3 = () => {
  const payload = {
    title: "Deep cleaning",
    description: "Certified cleaning technician required",
    job_category: "Cleaning",
    certifications_required: ["TESDA"],
  };
  const res = computeMatches(payload, employees);
  assert(res.top_candidate?.reference_number === "EMP-003", "Scenario3: Expected EMP-003 as top candidate via fallback");
  assert(res.top_candidate?.fallback_used === true, "Scenario3: Should use fallback");
};

// Run
try {
  scenario1();
  scenario2();
  scenario3();
  console.log("All matching tests passed.");
  process.exit(0);
} catch (e) {
  console.error(e.message);
  process.exit(1);
}

