import type { Plant, Activity, RedTag, AuditRun, DashboardStats, Profile, UserPersona } from '../types';

export const USER_PERSONAS: UserPersona[] = [
  {
    id: "user-vishal",
    name: "Vishal",
    email: "vishal@enertechups.com",
    role: "supervisor",
    roleTitle: "Operations Supervisor",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
    canApproveKaizen: true,
    canExecuteAudit: true,
    canDisposeRedTag: true,
    canViewAllZones: true,
    description: "Enertech Operations Supervisor. Full plant oversight, manages Zonal Leaders, assigns tasks, reviews & approves completion reports."
  },
  {
    id: "user-admin",
    name: "Plant Management",
    email: "management@enertechups.com",
    role: "management",
    roleTitle: "Enertech Executive Management",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
    canApproveKaizen: true,
    canExecuteAudit: true,
    canDisposeRedTag: true,
    canViewAllZones: true,
    description: "Executive Management. Full facility oversight and policy authorization."
  },
  {
    id: "user-auditor",
    name: "Quality Auditor",
    email: "audit@enertechups.com",
    role: "auditor",
    roleTitle: "Lead 5S & Quality Auditor",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150",
    canApproveKaizen: false,
    canExecuteAudit: true,
    canDisposeRedTag: false,
    canViewAllZones: true,
    description: "Plant-wide independent inspector. Conducts 5S pillar rubric scoring across factory zones."
  }
];

export const INITIAL_PLANTS: Plant[] = [
  {
    id: "plant-enertech-01",
    org_id: "org-enertech",
    name: "Enertech Manufacturing Facility - Unit 1",
    code: "ET-01",
    location: "Enertech Industrial Complex",
    is_active: true,
    departments: [
      {
        id: "dept-cnc",
        plant_id: "plant-austin-04",
        name: "CNC Machining & Tooling",
        code: "CNC",
        zones: [
          {
            id: "zone-cnc-a",
            dept_id: "dept-cnc",
            name: "CNC Machining Floor - Zone A",
            code: "CNC-ZA",
            description: "Heavy milling, Haas VF-4 vertical centers",
            target_score: 95.0,
            current_score: 94.5,
            owner_name: "Mark Davis (Sr. Machinist)",
            supervisor_name: "Dave Vance"
          },
          {
            id: "zone-cnc-b",
            dept_id: "dept-cnc",
            name: "CNC Machining Floor - Zone B",
            code: "CNC-ZB",
            description: "5-Axis Turning, Lathes & Workstation 14",
            target_score: 90.0,
            current_score: 88.2,
            owner_name: "Alex Chen (Operator)",
            owner_id: "user-op1",
            supervisor_name: "Dave Vance"
          },
          {
            id: "zone-tool-crib",
            dept_id: "dept-cnc",
            name: "Central Tool Crib",
            code: "CNC-TC",
            description: "Shared cutting tools, inserts, torque wrenches",
            target_score: 95.0,
            current_score: 92.0,
            owner_name: "Sam Miller (Tooling Tech)",
            supervisor_name: "Dave Vance"
          }
        ]
      },
      {
        id: "dept-smt",
        plant_id: "plant-austin-04",
        name: "Surface Mount Technology (SMT)",
        code: "SMT",
        zones: [
          {
            id: "zone-smt-1",
            dept_id: "dept-smt",
            name: "SMT High-Speed Line 1",
            code: "SMT-L1",
            description: "Fuji NXT pick-and-place component cells",
            target_score: 95.0,
            current_score: 96.0,
            owner_name: "Raj Patel (SMT Operator)",
            owner_id: "user-op2",
            supervisor_name: "Sarah Jenkins"
          },
          {
            id: "zone-smt-2",
            dept_id: "dept-smt",
            name: "SMT Line 2 & Inspection",
            code: "SMT-L2",
            description: "Koh Young 3D AOI and solder paste inspection",
            target_score: 92.0,
            current_score: 91.4,
            owner_name: "Elena Rostova",
            supervisor_name: "Sarah Jenkins"
          }
        ]
      },
      {
        id: "dept-cln",
        plant_id: "plant-austin-04",
        name: "Cleanroom Assembly & Pack",
        code: "CLN",
        zones: [
          {
            id: "zone-cln-1",
            dept_id: "dept-cln",
            name: "Class 10,000 Gowning & Assembly",
            code: "CLN-01",
            description: "Electrostatic protected cleanroom area",
            target_score: 98.0,
            current_score: 97.8,
            owner_name: "Lisa Wong",
            supervisor_name: "Kevin Hart"
          }
        ]
      }
    ]
  },
  {
    id: "plant-dell-smt",
    org_id: "org-titan",
    name: "Dell High-Volume SMT Facility",
    code: "DH-01",
    location: "Round Rock, Texas, USA",
    is_active: true,
    departments: [
      {
        id: "dept-pcb",
        plant_id: "plant-dell-smt",
        name: "PCB Sub-Assembly Line",
        code: "PCB",
        zones: [
          {
            id: "zone-pcb-1",
            dept_id: "dept-pcb",
            name: "Main Feeder Array - Line Alpha",
            code: "PCB-A",
            description: "High speed component placement",
            target_score: 92.0,
            current_score: 93.0,
            owner_name: "Carlos Mendez",
            supervisor_name: "Dave Vance"
          }
        ]
      }
    ]
  }
];

export const INITIAL_PROFILES: Profile[] = [
  {
    id: "user-admin",
    email: "alex.thompson@digi5s.com",
    first_name: "Alex",
    last_name: "Thompson",
    role: "plant_manager",
    plant_id: "plant-austin-04",
    avatar_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"
  },
  {
    id: "user-sup",
    email: "dave.vance@digi5s.com",
    first_name: "Dave",
    last_name: "Vance",
    role: "supervisor",
    plant_id: "plant-austin-04",
    dept_id: "dept-cnc",
    avatar_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150"
  },
  {
    id: "user-auditor",
    email: "maria.gomez@digi5s.com",
    first_name: "Maria",
    last_name: "Gomez",
    role: "auditor",
    plant_id: "plant-austin-04",
    avatar_url: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150"
  },
  {
    id: "user-op1",
    email: "alex.chen@digi5s.com",
    first_name: "Alex",
    last_name: "Chen",
    role: "operator",
    plant_id: "plant-austin-04",
    dept_id: "dept-cnc",
    avatar_url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150"
  },
  {
    id: "user-op2",
    email: "raj.patel@digi5s.com",
    first_name: "Raj",
    last_name: "Patel",
    role: "operator",
    plant_id: "plant-austin-04",
    dept_id: "dept-smt",
    avatar_url: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150"
  }
];

export const INITIAL_ACTIVITIES: Activity[] = [
  {
    id: "act-148",
    activity_number: "WO-0148",
    plant_id: "plant-austin-04",
    zone_id: "zone-cnc-b",
    category: "shine_seiso",
    title: "G4002 Lathe Weekly Lubrication PM",
    problem_description: "⚠️ WARNING ⚠️\nALWAYS disconnect the electric power to the machine before servicing.\nNEVER lubricate your lathe while it is running.",
    corrective_action: "Perform ISO 68 spindle gear oil lubrication. Inspect feed gearbox sight glass. Apply Mobil Vactra No. 2 way oil on cross slide dovetails.",
    outcome_description: "Completed weekly PM checklist. All oil points replenished and spindle backlash measured within 0.0005 in.",
    priority: "medium",
    status: "assigned",
    assigned_to: "user-op1",
    assignee_name: "Ryan Jensen",
    supervisor_id: "user-sup",
    supervisor_name: "Dave Vance",
    asset_name: "GEAR HEAD METAL LATHE MODEL G4002",
    location_name: "Production Line 1 • Factory Floor",
    due_date: new Date().toISOString(),
    submitted_at: null,
    reviewed_at: null,
    rejection_reason: null,
    benefits_safety: true,
    benefits_space_sqft: 0,
    benefits_time_seconds: 180,
    benefits_cost_savings: 4200.0,
    benefits_summary: "Prevented gearbox seizure and excessive carriage friction.",
    created_at: new Date(Date.now() - 86400000).toISOString(),
    evidence: [
      {
        id: "ev-148-1",
        activity_id: "act-148",
        media_type: "before_photo",
        file_name: "g4002_lathe_front.jpg",
        file_url: "https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?w=800",
        file_size_bytes: 450000,
        mime_type: "image/jpeg",
        created_at: new Date(Date.now() - 86400000).toISOString()
      },
      {
        id: "ev-148-2",
        activity_id: "act-148",
        media_type: "action_step",
        file_name: "lathe_gearbox_sight_glass.jpg",
        file_url: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800",
        file_size_bytes: 380000,
        mime_type: "image/jpeg",
        created_at: new Date(Date.now() - 86400000).toISOString()
      },
      {
        id: "ev-148-3",
        activity_id: "act-148",
        media_type: "after_photo",
        file_name: "lathe_spindle_serviced.jpg",
        file_url: "https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=800",
        file_size_bytes: 410000,
        mime_type: "image/jpeg",
        created_at: new Date(Date.now() - 86400000).toISOString()
      }
    ],
    history: [
      {
        id: "h-148-1",
        activity_id: "act-148",
        actor_name: "Ryan Jensen",
        from_status: null,
        to_status: "assigned",
        action_note: "Created recurring PM schedule.",
        created_at: new Date(Date.now() - 86400000).toISOString()
      }
    ],
    comments: [
      {
        id: "c-148-1",
        activity_id: "act-148",
        author_name: "Devin White",
        comment: "Checked the spindle sight glass. Oil level was at lower mark, refilled with Mobil DTE 24.",
        created_at: new Date(Date.now() - 3600000).toISOString()
      },
      {
        id: "c-148-2",
        activity_id: "act-148",
        author_name: "Tom Brady",
        comment: "Ensure power lockout tagout (LOTO) is verified before opening the end cover.",
        created_at: new Date(Date.now() - 1800000).toISOString()
      }
    ]
  },
  {
    id: "act-1",
    activity_number: "5S-2026-0842",
    plant_id: "plant-austin-04",
    zone_id: "zone-cnc-b",
    category: "shine_seiso",
    title: "Sort & Deep Clean CNC Machining Workstation #14",
    problem_description: "Excess cutting fluid, accumulated brass chips, and unorganized manual wrenches scattered on the secondary workbench creating slip and pinch hazards.",
    corrective_action: "Removed all obsolete fixtures. Cleaned workbench surfaces with degreaser. Installed shadow-board foam cutouts for all 12 wrenches and collet chuck keys. Relocated chip scrap bin under chute.",
    outcome_description: "Workstation is fully standardized with 100% visible tool placement. Chip collection tray cleared every shift.",
    priority: "high",
    status: "submitted_for_review",
    assigned_to: "user-op1",
    assignee_name: "Alex Chen (Zone Owner)",
    supervisor_id: "user-sup",
    supervisor_name: "Dave Vance",
    due_date: new Date(Date.now() + 86400000).toISOString(),
    submitted_at: new Date(Date.now() - 7200000).toISOString(),
    reviewed_at: null,
    rejection_reason: null,
    benefits_safety: true,
    benefits_space_sqft: 14.5,
    benefits_time_seconds: 45.0,
    benefits_cost_savings: 1250.0,
    benefits_summary: "Eliminated tool retrieval delays during workpiece changes. Mitigated trip hazard from stray coolant hose.",
    created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
    evidence: [
      {
        id: "ev-1-before",
        activity_id: "act-1",
        media_type: "before_photo",
        file_name: "cnc_bench_cluttered_before.jpg",
        file_url: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800",
        file_size_bytes: 420000,
        mime_type: "image/jpeg",
        created_at: new Date(Date.now() - 86400000 * 3).toISOString()
      },
      {
        id: "ev-1-after",
        activity_id: "act-1",
        media_type: "after_photo",
        file_name: "cnc_bench_clean_foam_after.jpg",
        file_url: "https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=800",
        file_size_bytes: 390000,
        mime_type: "image/jpeg",
        created_at: new Date(Date.now() - 7200000).toISOString()
      }
    ],
    history: [
      {
        id: "h-1-1",
        activity_id: "act-1",
        actor_name: "Dave Vance (Supervisor)",
        from_status: null,
        to_status: "assigned",
        action_note: "Task assigned to Alex Chen.",
        created_at: new Date(Date.now() - 86400000 * 3).toISOString()
      },
      {
        id: "h-1-2",
        activity_id: "act-1",
        actor_name: "Alex Chen (Zone Owner)",
        from_status: "assigned",
        to_status: "in_progress",
        action_note: "Started degreasing and tool layout.",
        created_at: new Date(Date.now() - 86400000).toISOString()
      },
      {
        id: "h-1-3",
        activity_id: "act-1",
        actor_name: "Alex Chen (Zone Owner)",
        from_status: "in_progress",
        to_status: "submitted_for_review",
        action_note: "Completed shadow foam install and submitted before/after photos.",
        created_at: new Date(Date.now() - 7200000).toISOString()
      }
    ],
    comments: [
      {
        id: "c-1-1",
        activity_id: "act-1",
        author_name: "Alex Chen",
        comment: "All wrenches are now color-coded and organized in high-density foam.",
        created_at: new Date(Date.now() - 7100000).toISOString()
      },
      {
        id: "c-1-2",
        activity_id: "act-1",
        author_name: "Dave Vance",
        comment: "Looking great Alex. Reviewing the coolant drainage clearance now.",
        created_at: new Date(Date.now() - 3600000).toISOString()
      }
    ]
  },
  {
    id: "act-2",
    activity_number: "5S-2026-0819",
    plant_id: "plant-austin-04",
    zone_id: "zone-smt-1",
    category: "standardize_seiketsu",
    title: "Standardize SMT Feeder Reel Staging Cart",
    problem_description: "Operator reels stored haphazardly on floor dollies causing incorrect component loads and reels falling.",
    corrective_action: "Implemented 8mm and 12mm reel divider slots with visual component numbering and ESD grounding wire.",
    outcome_description: "Reel replenishment cycle reduced by 40%. Zero dropped component reels recorded this week.",
    priority: "medium",
    status: "completed",
    assigned_to: "user-op2",
    assignee_name: "Raj Patel (Zone Owner)",
    supervisor_id: "user-sup",
    supervisor_name: "Dave Vance",
    due_date: new Date(Date.now() - 86400000 * 2).toISOString(),
    submitted_at: new Date(Date.now() - 86400000 * 3).toISOString(),
    reviewed_at: new Date(Date.now() - 86400000).toISOString(),
    rejection_reason: null,
    benefits_safety: true,
    benefits_space_sqft: 22.0,
    benefits_time_seconds: 90.0,
    benefits_cost_savings: 4500.0,
    benefits_summary: "Prevented component reel cross-contamination and saved 90 seconds per setup.",
    created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
    evidence: [
      {
        id: "ev-2-before",
        activity_id: "act-2",
        media_type: "before_photo",
        file_name: "smt_cart_mess.jpg",
        file_url: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800",
        created_at: new Date(Date.now() - 86400000 * 5).toISOString()
      },
      {
        id: "ev-2-after",
        activity_id: "act-2",
        media_type: "after_photo",
        file_name: "smt_cart_standardized.jpg",
        file_url: "https://images.unsplash.com/photo-1581092162384-8987c1d64718?w=800",
        created_at: new Date(Date.now() - 86400000 * 3).toISOString()
      }
    ],
    history: [
      {
        id: "h-2-1",
        activity_id: "act-2",
        actor_name: "Dave Vance (Supervisor)",
        from_status: "submitted_for_review",
        to_status: "approved",
        action_note: "Signoff completed. Audit verified.",
        created_at: new Date(Date.now() - 86400000).toISOString()
      }
    ],
    comments: []
  },
  {
    id: "act-3",
    activity_number: "5S-2026-0901",
    plant_id: "plant-austin-04",
    zone_id: "zone-cnc-b",
    category: "set_in_order_seiton",
    title: "Flammable Chemical Storage Relocation & Secondary Containment",
    problem_description: "Solvent bottles sitting on open shelves without secondary spill containment pallet.",
    corrective_action: "Install yellow OSHA-compliant secondary spill tub and flammable liquid cabinet locks.",
    outcome_description: null,
    priority: "critical",
    status: "assigned",
    assigned_to: "user-op1",
    assignee_name: "Alex Chen (Zone Owner)",
    supervisor_id: "user-sup",
    supervisor_name: "Dave Vance",
    due_date: new Date(Date.now() + 21600000).toISOString(),
    submitted_at: null,
    reviewed_at: null,
    rejection_reason: null,
    benefits_safety: true,
    benefits_space_sqft: 8.0,
    benefits_time_seconds: 0,
    benefits_cost_savings: 800.0,
    benefits_summary: "Mitigates OSHA spill hazard and environmental fine liability.",
    created_at: new Date(Date.now() - 86400000).toISOString(),
    evidence: [
      {
        id: "ev-3-before",
        activity_id: "act-3",
        media_type: "before_photo",
        file_name: "solvents_open.jpg",
        file_url: "https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=800",
        created_at: new Date(Date.now() - 86400000).toISOString()
      }
    ],
    history: [],
    comments: []
  },
  {
    id: "act-4",
    activity_number: "5S-2026-0880",
    plant_id: "plant-austin-04",
    zone_id: "zone-tool-crib",
    category: "set_in_order_seiton",
    title: "Tool Calibration Cabinet Shadow Foam & Labeling",
    problem_description: "Precision torque wrenches and dial indicators mixed together in unpadded metal drawers.",
    corrective_action: "Cut out foam inserts for top 2 drawers.",
    outcome_description: "Partial foam layout completed.",
    priority: "medium",
    status: "rejected",
    assigned_to: "user-op1",
    assignee_name: "Alex Chen (Zone Owner)",
    supervisor_id: "user-sup",
    supervisor_name: "Dave Vance",
    due_date: new Date(Date.now() + 86400000 * 2).toISOString(),
    submitted_at: new Date(Date.now() - 86400000).toISOString(),
    reviewed_at: new Date(Date.now() - 43200000).toISOString(),
    rejection_reason: "Foam cutouts require engraved torque rating labels and calibration expiration date tags before final sign-off.",
    benefits_safety: false,
    benefits_space_sqft: 6.0,
    benefits_time_seconds: 20.0,
    benefits_cost_savings: 400.0,
    benefits_summary: "Prevents micrometer shock damage and calibration drift.",
    created_at: new Date(Date.now() - 86400000 * 4).toISOString(),
    evidence: [
      {
        id: "ev-4-before",
        activity_id: "act-4",
        media_type: "before_photo",
        file_name: "tool_drawer_mess.jpg",
        file_url: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800",
        created_at: new Date(Date.now() - 86400000 * 4).toISOString()
      }
    ],
    history: [
      {
        id: "h-4-1",
        activity_id: "act-4",
        actor_name: "Dave Vance (Supervisor)",
        from_status: "submitted_for_review",
        to_status: "rejected",
        action_note: "Rejected: Foam cutouts require engraved torque rating labels and calibration expiration date tags before final sign-off.",
        created_at: new Date(Date.now() - 43200000).toISOString()
      }
    ],
    comments: []
  },
  {
    id: "act-5",
    activity_number: "5S-2026-0925",
    plant_id: "plant-austin-04",
    zone_id: "zone-cln-1",
    category: "sort_seiri",
    title: "Cleanroom Gowning Station Redundant Glove Box Removal",
    problem_description: "Four duplicate boxes of Size-M nitrile gloves crowding entry airlock passage.",
    corrective_action: "Removed surplus stock back to inventory and marked designated dispenser rack.",
    outcome_description: null,
    priority: "low",
    status: "in_progress",
    assigned_to: "user-op2",
    assignee_name: "Raj Patel (Zone Owner)",
    supervisor_id: "user-sup",
    supervisor_name: "Dave Vance",
    due_date: new Date(Date.now() + 86400000 * 4).toISOString(),
    submitted_at: null,
    reviewed_at: null,
    rejection_reason: null,
    benefits_safety: false,
    benefits_space_sqft: 4.0,
    benefits_time_seconds: 15.0,
    benefits_cost_savings: 150.0,
    benefits_summary: "Maintains clear gowning passage complying with cleanroom particulate standards.",
    created_at: new Date(Date.now() - 86400000).toISOString(),
    evidence: [],
    history: [],
    comments: []
  }
];

export const INITIAL_RED_TAGS: RedTag[] = [
  {
    id: "rt-1",
    tag_number: "RT-2026-0129",
    plant_id: "plant-austin-04",
    zone_id: "zone-cnc-b",
    logged_by_name: "Alex Chen (Zone Owner)",
    item_name: "Uncalibrated Mitutoyo Micrometers (Set of 3)",
    item_category: "Measuring Equipment",
    quantity: 3,
    reason: "Calibration certificate expired on 2026-01-15. Displaced from Metrology lab.",
    photo_url: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800",
    disposition: "pending",
    disposition_notes: undefined,
    is_closed: false,
    created_at: new Date(Date.now() - 86400000 * 14).toISOString(),
    aging_days: 14
  },
  {
    id: "rt-2",
    tag_number: "RT-2026-0118",
    plant_id: "plant-austin-04",
    zone_id: "zone-smt-1",
    logged_by_name: "Raj Patel (Zone Owner)",
    item_name: "Cracked ESD Plastic Tote Bins",
    item_category: "Material Handling",
    quantity: 12,
    reason: "Structural fatigue and cracked handles. Non-compliant with clean handling.",
    photo_url: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800",
    disposition: "scrap",
    disposition_notes: "Approved for recycling bin #3.",
    is_closed: true,
    created_at: new Date(Date.now() - 86400000 * 22).toISOString(),
    closed_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    aging_days: 20
  },
  {
    id: "rt-3",
    tag_number: "RT-2026-0134",
    plant_id: "plant-austin-04",
    zone_id: "zone-tool-crib",
    logged_by_name: "Dave Vance (Supervisor)",
    item_name: "Obsolete Festo Pneumatic Actuators",
    item_category: "Pneumatics / Spare Parts",
    quantity: 4,
    reason: "Replaced by SMC standardized cylinders in Q1 retrofit.",
    photo_url: "https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=800",
    disposition: "relocate",
    disposition_notes: "Relocated to central warehouse spare pool.",
    is_closed: false,
    created_at: new Date(Date.now() - 86400000 * 8).toISOString(),
    aging_days: 8
  }
];

export const INITIAL_AUDITS: AuditRun[] = [
  {
    id: "audit-1",
    plant_id: "plant-austin-04",
    zone_id: "zone-cnc-b",
    zone_name: "CNC Machining Floor - Zone B",
    auditor_name: "Maria Gomez (Lead Auditor)",
    score_percentage: 88.2,
    sort_score: 92.0,
    set_in_order_score: 85.0,
    shine_score: 96.0,
    standardize_score: 88.0,
    sustain_score: 80.0,
    total_score: 441.0,
    max_score: 500.0,
    notes: "Outstanding Shine and cleaning improvements noted on Workstation 14. Sustain routine needs follow-up.",
    status: "completed",
    conducted_at: new Date(Date.now() - 86400000 * 5).toISOString()
  },
  {
    id: "audit-2",
    plant_id: "plant-austin-04",
    zone_id: "zone-smt-1",
    zone_name: "SMT High-Speed Line 1",
    auditor_name: "Maria Gomez (Lead Auditor)",
    score_percentage: 96.0,
    sort_score: 97.0,
    set_in_order_score: 95.0,
    shine_score: 98.0,
    standardize_score: 96.0,
    sustain_score: 94.0,
    total_score: 480.0,
    max_score: 500.0,
    notes: "Benchmark performance for SMT division. Feeder staging cart is exemplary.",
    status: "completed",
    conducted_at: new Date(Date.now() - 86400000 * 12).toISOString()
  }
];

export const INITIAL_DASHBOARD_STATS: DashboardStats = {
  plant_id: "plant-austin-04",
  plant_name: "Austin Gigafactory - Plant 04",
  total_activities: 5,
  open_activities: 1,
  in_progress_activities: 1,
  submitted_activities: 1,
  approved_activities: 1,
  overdue_activities: 0,
  monthly_audit_score: 93.3,
  red_tag_count: 2,
  avg_red_tag_age_days: 11.0,
  zones: [
    {
      zone_id: "zone-cnc-a",
      zone_name: "CNC Machining Floor - Zone A",
      dept_name: "CNC Machining & Tooling",
      score: 94.5,
      active_tasks: 0,
      overdue_tasks: 0,
      status: "excellent"
    },
    {
      zone_id: "zone-cnc-b",
      zone_name: "CNC Machining Floor - Zone B",
      dept_name: "CNC Machining & Tooling",
      score: 88.2,
      active_tasks: 2,
      overdue_tasks: 0,
      status: "good"
    },
    {
      zone_id: "zone-tool-crib",
      zone_name: "Central Tool Crib",
      dept_name: "CNC Machining & Tooling",
      score: 92.0,
      active_tasks: 1,
      overdue_tasks: 0,
      status: "excellent"
    },
    {
      zone_id: "zone-smt-1",
      zone_name: "SMT High-Speed Line 1",
      dept_name: "Surface Mount Technology (SMT)",
      score: 96.0,
      active_tasks: 0,
      overdue_tasks: 0,
      status: "excellent"
    },
    {
      zone_id: "zone-smt-2",
      zone_name: "SMT Line 2 & Inspection",
      dept_name: "Surface Mount Technology (SMT)",
      score: 91.4,
      active_tasks: 0,
      overdue_tasks: 0,
      status: "excellent"
    },
    {
      zone_id: "zone-cln-1",
      zone_name: "Class 10,000 Gowning & Assembly",
      dept_name: "Cleanroom Assembly & Pack",
      score: 97.8,
      active_tasks: 1,
      overdue_tasks: 0,
      status: "excellent"
    }
  ],
  category_counts: {
    "sort_seiri": 1,
    "set_in_order_seiton": 2,
    "shine_seiso": 1,
    "standardize_seiketsu": 1,
    "sustain_shitsuke": 0
  },
  completion_trend: [
    { month: "Jan", completion_rate: 89.2, score: 88.4 },
    { month: "Feb", completion_rate: 90.8, score: 89.7 },
    { month: "Mar", completion_rate: 91.5, score: 90.2 },
    { month: "Apr", completion_rate: 92.4, score: 91.8 },
    { month: "May", completion_rate: 93.6, score: 93.1 },
    { month: "Jun", completion_rate: 94.8, score: 93.3 }
  ]
};
