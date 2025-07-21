import DepartmentsModel from "./SettingsModels/DeparmentsModel.js";
import Designation from "./SettingsModels/DesignationModel.js";
import Organization from "./SettingsModels/OrganizationModel.js";
import Priority from "./SettingsModels/PriorityModel.js";
import Status from "./SettingsModels/StatusModel.js";

import AssetsModel from "./AssetsModel.js";
import ImageModel from "./ImageModel.js";
import {
  JobRequestModel,
  JobRequestDetails,
  PurchasingRequestModel,
  PurchasingRequestDetails,
  VenueRequests,
  VenueRequestDetail,
  VehicleRequestModel,
  UserModel,
} from "./index.js";
import SystemLogsModel from "./SystemLogs.js";
import Ticket from "./TicketModel.js";
import RequestActivity from "./RequestActivity.js";
import AssetAssignmentLogModel from "./AssetAssignmentLog.js";
import UserPreferenceModel from "./SettingsModels/UserPreferenceModel.js";
import ManualApprovalRule from "./SettingsModels/ManualApprovalRuleModel.js";
import {
  ApprovalRuleByDepartment,
  ApprovalRuleByDesignation,
  ApprovalRuleByRequestType,
  Approvers,
} from "./SettingsModels/index.js";
import Position from "./SettingsModels/PositionModel.js";
import EmployeeModel from "./EmployeeModel.js";

const models = [
  EmployeeModel,
  DepartmentsModel,
  Designation,
  Organization,
  Position,
  Priority,
  Status,
  AssetsModel,
  AssetAssignmentLogModel,
  ImageModel,
  JobRequestModel,
  JobRequestDetails,
  PurchasingRequestModel,
  PurchasingRequestDetails,
  VenueRequests,
  VenueRequestDetail,
  RequestActivity,
  SystemLogsModel,
  Ticket,
  UserModel,
  VehicleRequestModel,
  UserPreferenceModel,
  Approvers,
  ManualApprovalRule,
  ApprovalRuleByDepartment,
  ApprovalRuleByRequestType,
  ApprovalRuleByDesignation,
]; // Add all models to this array

const syncModels = async (sequelizeInstance) => {
  try {
    // 1. Sync independent models first
    await DepartmentsModel.sync({ force: true });
    await Designation.sync({ force: true });
    await Organization.sync({ force: true });
    await Position.sync({ force: true });
    await Priority.sync({ force: true });
    await Status.sync({ force: true });
    await EmployeeModel.sync({ force: true });

    // 2. Then sync models that depend on those
    await UserModel.sync({ force: true }); // if it references department, designation, etc.
    await Approvers.sync({ force: true });

    // 3. Then sync JobRequest and others
    await JobRequestModel.sync({ force: true });
    await JobRequestDetails.sync({ force: true });

    await PurchasingRequestModel.sync({ force: true });
    await PurchasingRequestDetails.sync({ force: true });

    await AssetsModel.sync({ force: true });
    await AssetAssignmentLogModel.sync({ force: true });

    await VenueRequests.sync({ force: true });
    await VenueRequestDetail.sync({ force: true });

    await VehicleRequestModel.sync({ force: true });
    await Ticket.sync({ force: true });

    await RequestActivity.sync({ force: true });
    await ImageModel.sync({ force: true });
    await UserPreferenceModel.sync({ force: true });
    await SystemLogsModel.sync({ force: true });

    await ManualApprovalRule.sync({ force: true });
    await ApprovalRuleByDepartment.sync({ force: true });
    await ApprovalRuleByRequestType.sync({ force: true });
    await ApprovalRuleByDesignation.sync({ force: true });

    console.log("✅ All models synchronized successfully.");

    // Optional: Seed after sync
    await seedData();
  } catch (error) {
    console.error("❌ Error synchronizing models:", error);
  }
};

// Function to seed default data (if not already present)
const seedData = async () => {
  await seedStatuses();
  await seedPriorities();
  await seedDepartments();
  await seedDesignation();
  await seedOrganization();
  await seedPosition();
  await seedUsers();
  // await seedJobRequests();
  // await seedPurchasingRequests();
  // await seedVenueRequests();
  // await seedVehicleRequests();
  await seedUserPreferences();
  console.log("✅ Default data seeded.");
};

const seedUsers = async () => {
  const defaultUsers = [
    {
      reference_number: "DYCI-2025-00001",
      google_id: "",
      first_name: "ServiceLink",
      last_name: "Support",
      username: "support.servicelink@dyci.edu.ph",
      password: "$2a$10$6cl.36kDK/EV/EJ64qn3/uLj35PnIGMEzWyGah.hx6UYfGHDLVub.", // hashed
      email: "support.servicelink@dyci.edu.ph",
      access_level: "admin",
      status: "active",
      immediate_head: "",
      organization: "",
      department: "",
      designation: "",
      archived: false,
      created_at: new Date("2025-05-17T19:48:00"),
      updated_at: new Date("2025-05-17T19:48:00"),
    },
    {
      reference_number: "DYCI-2025-00002",
      google_id: "108410569826211977045",
      first_name: "Franc Alvenn",
      last_name: "Dela Cruz",
      username: "delacruz.falvenn00665@dyci.edu.ph",
      password: "$2a$10$xjcf4lCf0ReoQL4U1lV8SOGEcsYdWOEh3VmhgCRVdj1qKDlMRP4KW", // hashed
      email: "delacruz.falvenn00665@dyci.edu.ph",
      access_level: "user",
      status: "active",
      immediate_head: "",
      organization: "",
      department_id: 1,
      designation_id: null,
      archived: false,
      created_at: new Date("2025-05-17T19:48:00"),
      updated_at: new Date("2025-05-17T19:48:00"),
    },
  ];

  for (const user of defaultUsers) {
    await UserModel.findOrCreate({
      where: { reference_number: user.reference_number },
      defaults: user,
    });
  }
};

// Seed User Preferences
const seedUserPreferences = async () => {
  const defaultUserPreferences = [
    {
      user_id: "DYCI-2025-00001",
      kanban_config: {
        columns: [
          { id: 1, name: "Pending" },
          { id: 2, name: "In Progress" },
          { id: 3, name: "Completed" },
        ],
      },
      theme: "0",
      notifications_enabled: true,
      email_notifications_enabled: true,
      sms_notifications_enabled: true,
      language: "en",
    },
    {
      user_id: "DYCI-2025-00002",
      kanban_config: {
        columns: [
          { id: 1, name: "Pending" },
          { id: 2, name: "In Progress" },
          { id: 3, name: "Completed" },
        ],
      },
      theme: "0",
      notifications_enabled: true,
      email_notifications_enabled: true,
      sms_notifications_enabled: true,
      language: "en",
    },
  ];

  for (const preference of defaultUserPreferences) {
    await UserPreferenceModel.findOrCreate({
      where: { user_id: preference.user_id },
      defaults: preference,
    });
  }
};

// Seed Statuses
const seedStatuses = async () => {
  const defaultStatuses = [
    {
      status: "Approved",
      color: "green",
      description: "Request has been approved",
      archived: false,
    },
    {
      status: "Rejected",
      color: "red",
      description: "Request has been rejected",
      archived: false,
    },
    {
      status: "Approved w/ Condition",
      color: "orange",
      description: "Request approved with conditions",
      archived: false,
    },
    {
      status: "Pending",
      color: "yellow  ",
      description: "Request is currently under review",
      archived: false,
    },
    {
      status: "In Progress",
      color: "blue",
      description: "Request is being processed",
      archived: false,
    },
    {
      status: "On Hold",
      color: "gray",
      description: "Request is on hold due to some reasons",
      archived: false,
    },
    {
      status: "Completed",
      color: "green",
      description: "Request has been completed",
      archived: false,
    },
    {
      status: "Canceled",
      color: "pink",
      description: "Request has been canceled",
      archived: false,
    },
  ];

  for (const status of defaultStatuses) {
    await Status.findOrCreate({
      where: { status: status.status },
      defaults: status, // Only inserts if status does not exist
    });
  }
};

// Seed Priorities
const seedPriorities = async () => {
  const defaultPriorities = [
    { priority: "Low", description: "Non-urgent requests" },
    { priority: "Medium", description: "Important but not urgent" },
    { priority: "High", description: "Urgent requests" },
  ];

  for (const priority of defaultPriorities) {
    await Priority.findOrCreate({
      where: { priority: priority.priority },
      defaults: priority,
    });
  }
};

//Seed Position: Immediate Head, College Dean, GSO Officer, Finance
const seedPosition = async () => {
  const defaultPositions = [
    {
      position: "Immediate Head",
      approval_level: 1,
      description: "Immediate Head",
    },
    {
      position: "College Dean",
      approval_level: 2,
      description: "College Dean",
    },
    { position: "GSO Officer", approval_level: 3, description: "GSO Officer" },
    { position: "Finance", approval_level: 4, description: "Finance" },
  ];

  for (const position of defaultPositions) {
    await Position.findOrCreate({
      where: { position: position.position },
      defaults: position,
    });
  }
};

// Seed Departments
const seedDepartments = async () => {
  const defaultDepartments = [
    {
      name: "College of Accountancy",
      description: "Department for Accounting and Finance",
    },
    {
      name: "College of Arts and Sciences",
      description: "Department for Academic Programs",
    },
    {
      name: "College of Business Administration",
      description: "Department for Business and Management",
    },
    {
      name: "College of Computer Studies",
      description: "Department for IT and CS programs",
    },
    {
      name: "College of Education",
      description: "Department for Teacher Education",
    },
    {
      name: "College of Health Science",
      description: "Department for Nursing and Allied Health",
    },
    {
      name: "College of Hospitality Management and Tourism",
      description: "Department for Hospitality and Tourism",
    },
    {
      name: "College of Maritime Engineering",
      description: "Department for Marine Engineering",
    },
    {
      name: "School of Mechanical Engineering",
      description: "Department for Mechanical Engineering",
    },
    {
      name: "School of Psychology",
      description: "Department for Psychology programs",
    },
  ];

  for (const department of defaultDepartments) {
    await DepartmentsModel.findOrCreate({
      where: { name: department.name },
      defaults: department,
    });
  }
};

//Seed Designation: Student, Faculty, Dean
const seedDesignation = async () => {
  const defaultDesignation = [
    { designation: "Student", description: "Student" },
    { designation: "Faculty", description: "Faculty" },
    { designation: "Dean", description: "Dean" },
  ];

  for (const designation of defaultDesignation) {
    await Designation.findOrCreate({
      where: { designation: designation.designation },
      defaults: designation,
    });
  }
};

//Seed Organization DYCI - Faculty
const seedOrganization = async () => {
  const defaultOrganization = [
    {
      organization: "Alliance of Liberal Arts Students",
      description: "CAS - Student Government",
    },
    {
      organization:
        "Young Managers Professional Alliance for Corporate Triumph",
      description: "CBA - Student Government",
    },
    {
      organization: "Erudites of the Nightingale Society",
      description: "CHS - Student Government",
    },
    {
      organization: "Association of Hospitality and Restaurant Management",
      description: "CHMT - Student Government",
    },
    {
      organization: "League of Young Tourism Students",
      description: "CHMT - Student Government",
    },
    {
      organization: "Association of Computer Enthusiast Students",
      description: "CCS - Student Government",
    },
    {
      organization: "Junior Philippine Institute of Accountants",
      description: "COA - Student Government",
    },
    {
      organization: "College of Education Student Organization",
      description: "COED - Student Government",
    },
    {
      organization: "Council of Psyche",
      description: "SOP - Student Government",
    },
    {
      organization: "Pambansang Samahan ng Inhinyerong Mekanikal",
      description: "SME - Student Government",
    },
    {
      organization: "Maritime Council Officer",
      description: "CME - Student Government",
    },
    {
      organization: "Corps of Midshipman",
      description: "CME - Student Government",
    },
    {
      organization: "College Peer Facilitator's Circle",
      description: "DYCI - Student Government",
    },
    { organization: "Vox Nostra", description: "DYCI - Student Government" },
    { organization: "Himig DYCIan", description: "DYCI - Student Government" },
    {
      organization: "MATTEmaticians",
      description: "DYCI - Student Government",
    },
  ];

  for (const organization of defaultOrganization) {
    await Organization.findOrCreate({
      where: { organization: organization.organization },
      defaults: organization,
    });
  }
};

//Seed Assets

// Seed Job Requests
const seedJobRequests = async () => {
  const jobRequests = [
    {
      reference_number: "JR-2025-00001",
      title: "Electrical Wiring Maintenance",
      date_required: "2024-11-30",
      department: "College of Engineering",
      purpose: "Routine electrical inspection and wiring maintenance",
      requester: "DYCI-2025-00001",
      status: "Pending",
      immediate_head_approval: "Pending",
      gso_director_approval: "Pending",
      operations_director_approval: "Pending",
      archived: false,
      authorized_access: ["DYCI-2025-00001"],
      details: [
        {
          quantity: "3",
          particulars: "Circuit Breakers",
          description: "Replace faulty circuit breakers",
          remarks: "Essential for safety compliance",
        },
        {
          quantity: "5",
          particulars: "Electrical Wires",
          description: "Replace worn-out wires in classrooms",
          remarks: "To prevent short circuits",
        },
      ],
    },
    {
      reference_number: "JR-2025-00002",
      title: "Air Conditioning Unit Maintenance",
      date_required: "2024-12-08",
      department: "College of Health Science",
      purpose: "Routine maintenance and cleaning",
      requester: "DYCI-2025-00002",
      status: "Pending",
      immediate_head_approval: "Pending",
      gso_director_approval: "Pending",
      operations_director_approval: "Pending",
      archived: false,
      authorized_access: ["DYCI-2025-00002"],
      details: [
        {
          quantity: "2",
          particulars: "Air Conditioning Unit",
          description: "Clean and replace filters",
          remarks: "Scheduled maintenance",
        },
        {
          quantity: "1",
          particulars: "Refrigerant",
          description: "Refill refrigerant for cooling efficiency",
          remarks: "Standard procedure",
        },
      ],
    },
    {
      reference_number: "JR-2025-00003",
      title: "Projector Bulb Replacement",
      date_required: "2024-12-10",
      department: "College of Business Administration",
      purpose: "Replace defective projector bulbs",
      requester: "DYCI-2025-00002",
      status: "Pending",
      immediate_head_approval: "Pending",
      gso_director_approval: "Pending",
      operations_director_approval: "Pending",
      archived: false,
      authorized_access: ["DYCI-2025-00002"],
      details: [
        {
          quantity: "3",
          particulars: "Projector Bulb",
          description: "Replace old and damaged bulbs",
          remarks: "Urgent for lectures",
        },
        {
          quantity: "1",
          particulars: "Projector Lens",
          description: "Check and clean for clarity",
          remarks: "Preventive maintenance",
        },
      ],
    },
  ];

  for (const request of jobRequests) {
    const jobRequest = await JobRequestModel.create(request);
    for (const detail of request.details) {
      await JobRequestDetails.create({
        ...detail,
        job_request_id: jobRequest.reference_number,
      });
    }
  }
};

// Seed Purchasing Requests
const seedPurchasingRequests = async () => {
  const purchasingRequests = [
    {
      reference_number: "PR-2025-00001",
      title: "Office Supply for CCS Office",
      date_required: "2024-12-10",
      supply_category: "Office Supplies",
      purpose: "Purchase office supplies",
      department: "College of Engineering",
      requester: "DYCI-2025-00002",
      status: "Pending",
      immediate_head_approval: "Pending",
      gso_director_approval: "Pending",
      operations_director_approval: "Pending",
      archived: false,
      remarks: "",
      authorized_access: ["DYCI-2025-00001"],
      details: [
        {
          quantity: 6,
          particulars: "Printer Ink",
          description: "Black ink cartridge",
          remarks: "Urgent",
        },
        {
          quantity: 10,
          particulars: "Notebooks",
          description: "A5 notebooks",
          remarks: "For meetings",
        },
      ],
    },
    {
      reference_number: "PR-2025-00002",
      title: "Laboratory Equipment Purchase",
      date_required: "2024-12-15",
      supply_category: "Lab Equipment",
      purpose: "Procurement of essential lab tools",
      department: "College of Engineering",
      requester: "DYCI-2025-00002",
      status: "Pending",
      immediate_head_approval: "Pending",
      gso_director_approval: "Pending",
      operations_director_approval: "Pending",
      archived: false,
      remarks: "",
      authorized_access: ["DYCI-2025-00002"],
      details: [
        {
          quantity: 2,
          particulars: "Microscopes",
          description: "Advanced optical microscopes",
          remarks: "For biology lab",
        },
        {
          quantity: 5,
          particulars: "Glass Beakers",
          description: "500ml capacity beakers",
          remarks: "Chemistry experiments",
        },
      ],
    },
    {
      reference_number: "PR-2025-00003",
      title: "Computer Accessories Purchase",
      date_required: "2024-12-20",
      supply_category: "IT Equipment",
      purpose: "Upgrade and replacement of accessories",
      department: "College of Engineering",
      requester: "DYCI-2025-00002",
      status: "Pending",
      immediate_head_approval: "Pending",
      gso_director_approval: "Pending",
      operations_director_approval: "Pending",
      archived: false,
      remarks: "",
      authorized_access: ["DYCI-2025-00002"],
      details: [
        {
          quantity: 3,
          particulars: "Wireless Keyboards",
          description: "Mechanical wireless keyboards",
          remarks: "For faculty use",
        },
        {
          quantity: 4,
          particulars: "Computer Mouse",
          description: "Ergonomic wireless mouse",
          remarks: "Office and lab use",
        },
      ],
    },
  ];

  for (const request of purchasingRequests) {
    const purchasingRequest = await PurchasingRequestModel.create(request);
    for (const detail of request.details) {
      await PurchasingRequestDetails.create({
        ...detail,
        purchasing_request_id: purchasingRequest.reference_number,
      });
    }
  }
};

const seedVenueRequests = async () => {
  const venueRequests = [
    {
      reference_number: "VR-2025-00001",
      venue_requested: "Elida Court",
      title: "Annual Coding Bootcamp Request",
      requester: "DYCI-2025-00001",
      department: "College of Computer Studies",
      organization: "Association of Computer Enthusiasts",
      event_title: "Annual Coding Bootcamp",
      purpose: "To educate students on advanced coding techniques",
      event_nature: "Educational",
      event_dates: "2024-12-15",
      event_start_time: "08:00",
      event_end_time: "17:00",
      participants: "Students, Faculty",
      pax_estimation: 150,
      equipment_materials: "Projector, PA System, Laptops",
      status: "Pending",
      remarks: "Need to arrange tables and chairs",
      immediate_head_approval: "Pending",
      gso_director_approval: "Pending",
      operations_director_approval: "Pending",
      authorized_access: ["DYCI-2025-00001"],
      details: [
        {
          quantity: "2",
          particulars: "Extension Cords",
          description: "For laptop power supply",
          remarks: "Essential for the event",
        },
        {
          quantity: "1",
          particulars: "Whiteboard",
          description: "For lecture explanations",
          remarks: "Standard requirement",
        },
      ],
    },
    {
      reference_number: "VR-2025-00002",
      venue_requested: "Elida Court",
      title: "Leadership Training Seminar Request",
      requester: "DYCI-2025-00002",
      department: "College of Business Administration",
      organization: "Future Business Leaders Club",
      event_title: "Leadership Training Seminar",
      purpose: "Develop leadership and management skills",
      event_nature: "Workshop",
      event_dates: "2024-12-18",
      event_start_time: "09:00",
      event_end_time: "16:00",
      participants: "Students, Guest Speakers",
      pax_estimation: 80,
      equipment_materials: "Microphones, Speakers, Projector",
      status: "Pending",
      remarks: "Need podium and extra chairs",
      immediate_head_approval: "Pending",
      gso_director_approval: "Pending",
      operations_director_approval: "Pending",
      authorized_access: ["DYCI-2025-00002"],
      details: [
        {
          quantity: "3",
          particulars: "Microphones",
          description: "Wireless microphones for speakers",
          remarks: "Ensure good audio coverage",
        },
        {
          quantity: "1",
          particulars: "Podium",
          description: "For speaker presentations",
          remarks: "Requested by event host",
        },
      ],
    },
    {
      reference_number: "VR-2025-00003",
      venue_requested: "Elida Court",
      title: "Cultural Night Venue Request",
      requester: "DYCI-2025-00002",
      department: "College of Arts and Sciences",
      organization: "Cultural Arts Society",
      event_title: "Cultural Night",
      purpose: "Showcase various cultural performances",
      event_nature: "Cultural Event",
      event_dates: "2024-12-22",
      event_start_time: "18:00",
      event_end_time: "22:00",
      participants: "Students, Faculty, Guests",
      pax_estimation: 300,
      equipment_materials: "Stage Lighting, Sound System, Backdrop",
      status: "Pending",
      remarks: "Need stage setup and decorations",
      immediate_head_approval: "Pending",
      gso_director_approval: "Pending",
      operations_director_approval: "Pending",
      authorized_access: ["DYCI-2025-00002"],
      details: [
        {
          quantity: "4",
          particulars: "Stage Lights",
          description: "Colored stage lighting for performances",
          remarks: "To enhance stage ambiance",
        },
        {
          quantity: "2",
          particulars: "Speakers",
          description: "High-powered speakers for performances",
          remarks: "For quality sound output",
        },
      ],
    },
  ];

  for (const request of venueRequests) {
    const venueRequest = await VenueRequests.create(request);
    for (const detail of request.details) {
      await VenueRequestDetail.create({
        ...detail,
        venue_request_id: venueRequest.reference_number,
      });
    }
  }
};

const seedVehicleRequests = async () => {
  const vehicleRequests = [
    {
      reference_number: "SV-2025-00001",
      title: "Web Development Field Trip",
      vehicle_requested: "Van",
      date_filled: "2024-11-14",
      date_of_trip: "2024-11-20",
      time_of_departure: "09:00:00",
      time_of_arrival: "17:00:00",
      number_of_passengers: 5,
      destination: "Manila",
      department: "College of Arts and Sciences",
      purpose: "Field trip for Web Development students",
      requester: "DYCI-2025-00001",
      designation: "Student",
      status: "Pending",
      vehicle_id: 1,
      remarks: "Ensure the vehicle is available for the entire day.",
      immediate_head_approval: "Pending",
      gso_director_approval: "Pending",
      operations_director_approval: "Pending",
      authorized_access: ["DYCI-2025-00001"],
      created_at: "2024-11-14T10:00:00.000Z",
      updated_at: "2024-11-14T10:00:00.000Z",
    },
    {
      reference_number: "SV-2025-00002",
      title: "Business Conference Travel",
      vehicle_requested: "Coaster Bus",
      date_filled: "2024-11-10",
      date_of_trip: "2024-11-18",
      time_of_departure: "07:30:00",
      time_of_arrival: "19:00:00",
      number_of_passengers: 20,
      destination: "Clark, Pampanga",
      department: "College of Arts and Sciences",
      purpose: "Attend annual business conference",
      requester: "DYCI-2025-00002",
      designation: "Faculty",
      status: "Pending",
      vehicle_id: 2,
      remarks: "Ensure the bus is cleaned and stocked with water.",
      immediate_head_approval: "Pending",
      gso_director_approval: "Pending",
      operations_director_approval: "Pending",
      authorized_access: ["DYCI-2025-00002"],
      created_at: "2024-11-10T09:00:00.000Z",
      updated_at: "2024-11-10T09:00:00.000Z",
    },
    {
      reference_number: "SV-2025-00003",
      title: "Cultural Exchange Program Travel",
      vehicle_requested: "SUV",
      date_filled: "2024-12-01",
      date_of_trip: "2024-12-10",
      time_of_departure: "06:00:00",
      time_of_arrival: "21:00:00",
      number_of_passengers: 4,
      destination: "Tagaytay",
      department: "College of Arts and Sciences",
      purpose: "University representatives attending cultural event",
      requester: "DYCI-2025-00002",
      designation: "Admin Staff",
      status: "Pending",
      vehicle_id: 3,
      remarks: "Ensure driver availability and fuel up before departure.",
      immediate_head_approval: "Pending",
      gso_director_approval: "Pending",
      operations_director_approval: "Pending",
      authorized_access: ["DYCI-2025-00002"],
      created_at: "2024-12-01T08:30:00.000Z",
      updated_at: "2024-12-01T08:30:00.000Z",
    },
  ];

  for (const request of vehicleRequests) {
    await VehicleRequestModel.create(request);
  }
};

export { syncModels };
