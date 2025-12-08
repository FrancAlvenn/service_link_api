const allowedAvailability = ["Available", "Unavailable", "On Leave", "Busy"];
const allowedExperience = ["Junior", "Mid", "Senior"];
const allowedQualifications = [
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

export function validateEmployeePayload(req, res, next) {
  try {
    const {
      availability_status,
      experience_level,
      qualifications,
      specializations,
    } = req.body || {};

    if (availability_status && !allowedAvailability.includes(availability_status)) {
      return res.status(400).json({
        message: `Invalid availability_status. Allowed: ${allowedAvailability.join(", ")}`,
      });
    }

    if (experience_level && !allowedExperience.includes(experience_level)) {
      return res.status(400).json({
        message: `Invalid experience_level. Allowed: ${allowedExperience.join(", ")}`,
      });
    }

    if (qualifications) {
      if (!Array.isArray(qualifications)) {
        return res.status(400).json({ message: "qualifications must be an array" });
      }
      for (const q of qualifications) {
        if (typeof q !== "string") {
          return res.status(400).json({ message: "each qualification must be a string" });
        }
        if (!allowedQualifications.includes(q)) {
          return res.status(400).json({ message: `qualification '${q}' is not allowed` });
        }
      }
    }

    if (specializations) {
      if (!Array.isArray(specializations)) {
        return res.status(400).json({ message: "specializations must be an array" });
      }
      for (const s of specializations) {
        if (typeof s !== "string") {
          return res.status(400).json({ message: "each specialization must be a string" });
        }
      }
    }

    next();
  } catch (err) {
    console.error("Validation error:", err);
    res.status(500).json({ message: "Validation middleware error", error: err.message });
  }
}

export function validateMatchRequest(req, res, next) {
  const { title, description, details } = req.body || {};
  if (!title && !description && !Array.isArray(details)) {
    return res.status(400).json({ message: "Provide at least title, description, or details" });
  }
  next();
}

export const constants = {
  allowedAvailability,
  allowedExperience,
  allowedQualifications,
};

