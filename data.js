// Discipline-specific Clinical Competency Review Checklist items
// (Section A) — transcribed from Compassus Home Health Clinical Onboarding Guides

const DISCIPLINES = {
  PT: {
    label: "PT",
    fullName: "Physical Therapist",
    items: [
      "Utilizes liquid hand sanitizer before and after patient contact or washes hands with soap/water if visibly soiled",
      "Donning/Doffing appropriate PPE for: Contact Precautions, Droplet Precautions",
      "Bag Protocol",
      "Trunk Protocol",
      "Explains patient/client rights, advance directives, hotline, and other agency requirements",
      "Conducts a physical assessment, vital signs including correct measurement of apical, radial, and pedal pulses",
      "Performs Medication Reconciliation accurately",
      "Verbalizes understanding of emergency plan",
      "Develops Plan of Care to meet patient needs/goals while supporting eligibility criteria, skilled need and medical necessity",
      "Documents according to Plan of Care and communications and coordinates with interdisciplinary team",
      "Establishes and revises patient specific goals and documents discharge planning",
      "Develops reasonable, measurable, patient specific interventions/goals",
      "Documents patient's progress towards goals",
      "HEP instruction documentation",
      "Has fundamental knowledge of home safety and safety precautions",
      "Able to determine the learning needs of patient/caregiver",
      "Able to effectively teach adult learners",
      "Able to evaluate effectiveness of teaching",
      "Utilizes appropriate teaching material as determined by patient needs",
      "Understands/implements specific protocols for hip surgeries",
      "Understands/implements specific protocols for knee surgeries",
      "Understands/implements specific protocols for shoulder surgeries",
      "Understands/implements specific protocols for spinal surgeries",
      "Understands/implements specific protocols for ORIF surgeries",
      "Understands/implements specific protocols for other surgery (specify): ______________",
      "Utilizes appropriate standardized assessments and interprets results",
      "Knowledge of and demonstrates basic techniques of home PT/INR, including verbalization of the purpose of the test, proper specimen collection and preservation",
      "Properly disposes of lancet in a puncture proof container",
      "Other: ______________",
      "Other: ______________",
      "Other: ______________"
    ]
  },
  OT: {
    label: "OT",
    fullName: "Occupational Therapist",
    items: [
      "Utilizes liquid hand sanitizer before and after patient contact or washes hands with soap/water if visibly soiled",
      "Donning/Doffing appropriate PPE for: Contact Precautions, Droplet Precautions",
      "Bag Protocol",
      "Trunk Protocol",
      "Explains patient/client rights, advance directives, hotline, and other agency requirements",
      "Conducts a physical assessment, vital signs including correct measurement of apical, radial, and pedal pulses",
      "Performs Medication Reconciliation accurately",
      "Verbalizes understanding of emergency plan",
      "Completes Plan of Care with knowledge to meet patient needs/goals while supporting homebound status, eligibility criteria, skilled need and medical necessity",
      "Documents according to Plan of Care and communications and coordinates with interdisciplinary team",
      "Establishes and revises patient specific goals and documents discharge planning",
      "Develops reasonable, measurable, patient specific interventions/goals",
      "Documents patient's progress towards goals",
      "Determines learning needs of patient/caregiver and evaluates effectiveness of teaching and teach back responses",
      "HEP instruction documentation",
      "Has fundamental knowledge of home safety and safety precautions",
      "Able to determine the learning needs of patient/caregiver",
      "Able to effectively teach adult learners",
      "Able to evaluate effectiveness of teaching",
      "Utilizes appropriate teaching material as determined by patient needs",
      "Understands/implements specific protocols for hip surgeries",
      "Understands/implements specific protocols for knee surgeries",
      "Understands/implements specific protocols for shoulder surgeries",
      "Understands/implements specific protocols for spinal surgeries",
      "Understands/implements specific protocols for ORIF surgeries",
      "Understands/implements specific protocols for other surgery (specify): ______________",
      "Utilizes appropriate standardized assessments and interprets results",
      "Teaches ADLs/IADLs to patient/caregiver",
      "Other: ______________"
    ]
  },
  COTA: {
    label: "COTA",
    fullName: "Certified Occupational Therapy Assistant",
    items: [
      "Utilizes liquid hand sanitizer before and after patient contact or washes hands with soap/water if visibly soiled",
      "Donning/Doffing appropriate PPE for: Contact Precautions, Droplet Precautions",
      "Bag Protocol",
      "Trunk Protocol",
      "Explains patient/client rights, advance directives, hotline, and other agency requirements",
      "Conducts a physical assessment, vital signs including correct measurement of apical, radial, and pedal pulses",
      "Performs Medication Reconciliation accurately",
      "Verbalizes understanding of emergency plan",
      "Follows Plan of Care to meet patient needs/goals while supporting eligibility criteria",
      "Documents according to Plan of Care addressing all needs, communicating and coordinating with interdisciplinary team including supervising therapist",
      "Communicates with OT to revise patient specific goals as necessary and documents discharge planning",
      "Documents patient's progress towards goals",
      "HEP instruction documentation",
      "Has fundamental knowledge of home safety and safety precautions",
      "Able to determine the learning needs of patient/caregiver",
      "Able to effectively teach adult learners",
      "Able to evaluate effectiveness of teaching and teach back response",
      "Utilizes appropriate teaching material as determined by patient needs",
      "Understands/implements specific protocols for hip surgeries",
      "Understands/implements specific protocols for knee surgeries",
      "Understands/implements specific protocols for shoulder surgeries",
      "Understands/implements specific protocols for spinal surgeries",
      "Understands/implements specific protocols for ORIF surgeries",
      "Understands/implements specific protocols for other surgery (specify): ______________",
      "Utilizes appropriate standardized assessments and interprets results",
      "Teaches ADLs/IADLs for patient/caregiver",
      "Other: ______________",
      "Other: ______________",
      "Other: ______________",
      "Other: ______________",
      "Other: ______________"
    ]
  },
  PTA: {
    label: "PTA",
    fullName: "Physical Therapist Assistant",
    items: [
      "Utilizes liquid hand sanitizer before and after patient contact or washes hands with soap/water if visibly soiled",
      "Donning/Doffing appropriate PPE for: Contact Precautions, Droplet Precautions",
      "Bag Protocol",
      "Trunk Protocol",
      "Explains patient/client rights, advance directives, hotline, and other agency requirements",
      "Conducts a physical assessment, vital signs including correct measurement of apical, radial, and pedal pulses",
      "Performs Medication Reconciliation accurately",
      "Verbalizes understanding of emergency plan",
      "Follows Plan of Care to meet patient needs/goals while supporting eligibility criteria",
      "Documents according to Plan of Care addressing all needs, communicating and coordinating with interdisciplinary team including supervising therapist",
      "Communicates with PT to revise patient specific goals as necessary and documents discharge planning",
      "Documents patient's progress towards goals",
      "HEP instruction documentation",
      "Has fundamental knowledge of home safety and safety precautions",
      "Able to determine the learning needs of patient/caregiver",
      "Able to effectively teach adult learners",
      "Able to evaluate effectiveness of teaching and teach back response",
      "Utilizes appropriate teaching material as determined by patient needs",
      "Understands/implements specific protocols for hip surgeries",
      "Understands/implements specific protocols for knee surgeries",
      "Understands/implements specific protocols for shoulder surgeries",
      "Understands/implements specific protocols for spinal surgeries",
      "Understands/implements specific protocols for ORIF surgeries",
      "Understands/implements specific protocols for other surgery (specify): ______________",
      "Utilizes appropriate standardized assessments and interprets results",
      "Other: ______________",
      "Other: ______________",
      "Other: ______________",
      "Other: ______________"
    ]
  }
};

// Shared: Clinical Observation Visit Checklist (Section B) - performance areas
const OBSERVATION_ITEMS = [
  "Maintains professional appearance/demeanor",
  "Wears name badge at all times",
  "Performs comprehensive medication reconciliation as part of each scheduled visit",
  "Ethical behavior: Demonstrates understanding of professional boundaries",
  "Clinical Excellence/Safety: Demonstrates knowledge of basic safety precautions for self and for patient",
  "Demonstrates effective infection control techniques",
  "Is organized and productive",
  "Maintains patient privacy during care delivery",
  "Demonstrates effective teaching/instruction with patient/family",
  "Reviews/follows plan of care in the delivery of services",
  "Updates plan of care based on assessment findings",
  "Effectively communicates with physicians, facility staff and caregivers regarding patient status, needs and plan of care revisions",
  "Demonstrates compassion and caring in interactions with patient, family and team members",
  "Exhibits skill proficiency in clinical assessment and clinical process",
  "Exhibits skill proficiency in clinical procedures and can verbalize where to locate procedural support/reference"
];

// Shared: Car Inspection / Stock Checklist (Section B, part 2)
const CAR_STOCK_ITEMS = [
  "Car Clean Area/Car Stock Box - Demonstrates maintenance of clean and organized car area, ensuring all required supplies are available and appropriately stored",
  "Clinician's Bag – placed on leak proof barrier",
  "Face Shield/Goggles/Glasses",
  "Biohazard Bag",
  "Clinician's Bag - remains stocked with required equipment and supplies; supplies are not expired and follows appropriate infection control procedure",
  "Alcohol Pads",
  "Hand Sanitizer (70%) - Placed in outside pocket",
  "Sani Wipes - OR approved cleaning wipe",
  "Liquid Soap & Paper Towels",
  "Barriers",
  "Thermometer & covers",
  "BP Cuff",
  "SAT Monitor",
  "Stethoscope",
  "Gown/Mask/Gloves",
  "Biohazard Bags & Specimen bags",
  "Trash Bags - Minimum of 4",
  "Optional - Zip Lock Bags - Gallon size",
  "Expired Supplies",
  "Car Dirty Area - Maintains a designated dirty area ensuring proper containment, disposal, and compliance with infection control protocols",
  "Sharps Container - Do Not exceed 3/4 full",
  "Insulated Specimen Container w/ Biohazard Labels & Ice Pack (soft container must have hard/leak-proof insert with lid)",
  "Other: ______________",
  "Other: ______________"
];

// Shared: PPE Competency (Section C)
const PPE_ITEMS = [
  "Expected Outcomes: Infection prevention practices followed; staff competent with PPE and protocols; staff perform hand hygiene per policy before/after PPE use",
  "Standard, Contact, Droplet, and Airborne Infection Isolation precautions and appropriate PPE selection",
  "Extended Use of PPE (same mask/gown for repeated close contact with several patients without removing between encounters)",
  "Limited Reuse of PPE (same mask for multiple encounters with a single patient, removed and stored between encounters)",
  "Sequencing for Donning PPE: Gown",
  "Sequencing for Donning PPE: Surgical Mask or N-95",
  "Sequencing for Donning PPE: Goggles, Safety Glasses and Face Shield",
  "Sequencing for Donning PPE: Gloves",
  "Sequence for Doffing PPE: Gloves",
  "Sequence for Doffing PPE: Goggles, Safety Glasses and Face Shield",
  "Sequence for Doffing PPE: Gown",
  "Sequence for Doffing PPE: Mask or N-95",
  "Wash hands or use alcohol-based hand sanitizer after doffing",
  "Train-the-Trainer Validation (if applicable): Team member approved to validate PPE competency"
];

// Shared: Hand Hygiene and Bag Technique (Section D)
const HAND_HYGIENE_ITEMS = [
  "Hand Hygiene: Apply hand sanitizer at start of visit, place bottle on designated dry barrier",
  "Hand Hygiene: Rub/scrub hands and wrists, between fingers and nails, minimum 20 seconds",
  "Hand Hygiene: Ensure all surfaces of both hands covered with sanitizer",
  "Hand Hygiene: Continue rubbing until hands completely dry",
  "Hand Hygiene: Place sanitizer on designated dirty barrier for easy access during visit",
  "Hand Hygiene: Repeat process before/after patient contact, before/after entering bag, before/after gloves, before/after procedures or contact with inanimate objects",
  "Soap and Water: Wet hands completely, fingers pointed downward",
  "Soap and Water: Apply soap to cover all surfaces",
  "Soap and Water: Rub/scrub vigorously, between fingers and around nails, minimum 20 seconds",
  "Soap and Water: Rinse well, water running wrist to fingertips",
  "Soap and Water: Dry hands/wrists with clean paper towel; use towel to turn off faucet",
  "Soap and Water: Repeat process at appropriate times (as above)",
  "Clinical Bag Technique: Place hand-carried bags on a barrier or hang on a doorknob; not on furnishings or floor",
  "Clinical Bag Technique: Perform hand hygiene before and after entering the bag",
  "Clinical Bag Technique: Remove supplies using at least 2 barriers (clean/dirty); discard barrier after use",
  "Clinical Bag Technique: Do not reach into bag without performing hand hygiene once patient care has started",
  "Clinical Bag Technique: Clean/wipe reusable supplies, air dry, sanitize hands before returning to bag"
];

// Shared: Filtering Face Mask / Particulate Respirator (Section E)
const RESPIRATOR_ITEMS = [
  "Demonstrates competency with donning and doffing disposable particulate respirator (N-95 or equivalent)",
  "Verbalizes description of respirator selection, use, visual inspection, and care",
  "Airborne Precautions: understands when a particulate respirator is required (e.g. TB, measles, droplet-precaution patients)",
  "Extended Use and Limited Reuse of respirator: understands definitions and 5-use/8-hour reuse limits",
  "Donning fit-tested particulate respirator: hand hygiene, visual inspection, secure bands, fit to nose/chin",
  "Performing User Seal Check per training video/guide",
  "Doffing fit-tested particulate respirator: remove without touching front, hand hygiene before/after",
  "Wash hands or use alcohol-based hand sanitizer when mask is stored",
  "Reviewed Respiratory Protection Plan procedure and had opportunity to ask questions"
];

const RESULT_OPTIONS_CNMT = ["C", "NMT"];
const RESULT_OPTIONS_MET = ["Met", "Unmet", "N/A"];
const RESULT_OPTIONS_DRD = ["D", "R/D", "N/A"];
const RESULT_OPTIONS_OV = ["O", "V", "N/A"];
