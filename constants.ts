
import { LocationType, Avatar, PointOfInterest, ShopItem, Job, InsurancePlan } from './types';

export const INITIAL_BUDGET = 5000;
export const MAX_HEALTH = 100;
export const XP_PER_QUEST_STEP = 150; 
export const XP_PER_LEVEL = 1000; 

export const MAX_DAILY_HOURS = 24;

export const AVATARS: Avatar[] = [
  { id: '1', name: 'Agent Alpha', image: 'https://api.dicebear.com/7.x/bottts/svg?seed=Alpha&backgroundColor=b6e3f4' },
  { id: '2', name: 'Agent Delta', image: 'https://api.dicebear.com/7.x/bottts/svg?seed=Delta&backgroundColor=ffdfbf' },
  { id: '3', name: 'Agent Sigma', image: 'https://api.dicebear.com/7.x/bottts/svg?seed=Sigma&backgroundColor=d1d4f9' },
  { id: '4', name: 'Agent Omega', image: 'https://api.dicebear.com/7.x/bottts/svg?seed=Omega&backgroundColor=ffd5dc' }
];

export const SHOP_ITEMS: ShopItem[] = [
  { id: 's1', name: 'Millet Recovery Thali', icon: '🍱', description: 'Low-glycemic operative fuel for steady field endurance.', cost: 450, healthBenefit: 15, type: 'food' },
  { id: 's2', name: 'Jan Aushadhi Med-Pack', icon: '💊', description: 'Certified high-quality generic meds at 70% lower cost.', cost: 200, healthBenefit: 20, type: 'medicine' },
  { id: 's3', name: 'N95 Bio-Shield', icon: '😷', description: 'Critical filtration gear for high-AQI urban grids.', cost: 600, healthBenefit: 10, type: 'gear' },
  { id: 's4', name: 'Electrolyte Refuel', icon: '🥤', description: 'Advanced WHO-spec ORS solution for rapid rehydration.', cost: 120, healthBenefit: 25, type: 'medicine' },
  { id: 's5', name: 'Pulse Energy-Bar', icon: '🍫', description: 'Compact protein and fiber for rapid metabolic recovery.', cost: 300, healthBenefit: 8, type: 'food' },
  { id: 's7', name: 'Anti-Pathogen Mesh', icon: '🕸️', description: 'Long-lasting insecticide net (LLIN) for vector defense.', cost: 500, healthBenefit: 18, type: 'gear' },
  { id: 's8', name: 'UV Sterilization Wand', icon: '🔦', description: 'Portable UV-C module to clean contaminated water sources.', cost: 1200, healthBenefit: 30, type: 'gear' },
  { id: 's9', name: 'Amla Bio-Booster', icon: '🍶', description: 'Concentrated natural Vitamin C for systemic immunity.', cost: 350, healthBenefit: 12, type: 'medicine' },
  { id: 's10', name: 'Cognitive Omega-3', icon: '🐟', description: 'Essential fatty acids for high-stress decision making.', cost: 1500, healthBenefit: 40, type: 'food' },
  { id: 's11', name: 'Trauma Field-Kit', icon: '🎒', description: 'Emergency surgical dressings and tactical antiseptic.', cost: 2000, healthBenefit: 50, type: 'medicine' },
  { id: 's12', name: 'Ayurvedic Vitality Tonic', icon: '🍶', description: 'Traditional adaptogens to reduce operative stress and boost baseline immunity.', cost: 400, healthBenefit: 10, type: 'medicine' },
  { id: 's13', name: 'Smart Water Filter', icon: '🚰', description: 'Multi-stage filtration for high-risk rural water grids.', cost: 1800, healthBenefit: 35, type: 'gear' },
  { id: 's14', name: 'Protein-Rich Dal Khichdi', icon: '🍛', description: 'Balanced macro-nutrients for post-mission metabolic repair.', cost: 350, healthBenefit: 12, type: 'food' },
  { id: 's15', name: 'Tactical First-Aid Kit', icon: '🩹', description: 'Essential trauma supplies for field injuries and infections.', cost: 850, healthBenefit: 22, type: 'medicine' },
  { id: 's16', name: 'Air-Purifying Respirator', icon: '🎭', description: 'Advanced HEPA filtration for extreme urban smog scenarios.', cost: 2500, healthBenefit: 45, type: 'gear' },
  { id: 's17', name: 'Probiotic Curd Bowl', icon: '🥣', description: 'Gut-health synchronization to prevent enteric infiltration.', cost: 150, healthBenefit: 8, type: 'food' },
  { id: 's18', name: 'Zinc & Vitamin D Tabs', icon: '💊', description: 'Critical micronutrients for maintaining a robust bio-firewall.', cost: 250, healthBenefit: 15, type: 'medicine' }
];

// Added missing INSURANCE_PLANS export to fix App.tsx compilation error
export const INSURANCE_PLANS: InsurancePlan[] = [
  {
    id: 'p1',
    name: 'Jan Aushadhi Shield',
    dailyPremium: 15,
    coveragePercent: 60,
    maxBenefit: 50000,
    description: 'Basic coverage focused on generic medicines and primary care nodes.',
    icon: '🛡️',
    coverage: ['Generic Meds', 'PHC Consultations'],
    exclusions: ['Private Tertiary Care']
  },
  {
    id: 'p2',
    name: 'PM-JAY Sync Plus',
    dailyPremium: 45,
    coveragePercent: 90,
    maxBenefit: 500000,
    description: 'Comprehensive coverage for secondary and tertiary care synchronization.',
    icon: '⚕️',
    coverage: ['In-patient Care', 'Diagnostics', 'Surgeries'],
    exclusions: ['Experimental Procedures']
  },
  {
    id: 'p3',
    name: 'Elite Operative Health',
    dailyPremium: 120,
    coveragePercent: 100,
    maxBenefit: 1500000,
    description: 'Top-tier coverage including private global nodes and mental health synchronization.',
    icon: '💎',
    coverage: ['Private Hospitals', 'Mental Health', 'Global Transit Care', 'Critical Illness'],
    exclusions: ['None']
  }
];

export const HEALTH_TIPS = [
  { category: 'Rural', title: "🛡️ PHC Protocol", tip: "Your local Primary Health Center (PHC) is the frontline for free diagnostics. Early intervention prevents debt-causing ER visits." },
  { category: 'Rural', title: "🦟 Vector Stealth", tip: "Dengue vectors breed in clean stagnant water. Disabling their breeding nodes weekly is a key bio-security task." },
  { category: 'Rural', title: "🚜 Field Sanitation", tip: "Soil-transmitted helminths cause chronic operative fatigue (Anemia). Footwear is a mandatory bio-defense." },
  { category: 'Rural', title: "🤱 Nutritional Sync", tip: "The Anganwadi system provides supplementary nutrition. Synchronizing with these nodes reduces childhood metabolic failure." },
  { category: 'Urban', title: "🧬 Generic Intelligence", tip: "Jan Aushadhi stores distribute meds at 50-90% lower prices. Brand names are often just marketing 'noise'." },
  { category: 'Urban', title: "🌫️ PM2.5 Infiltration", tip: "Particulate matter enters the bloodstream via the lungs. N95 filters are the only effective tactical shield." },
  { category: 'Urban', title: "🏢 Sedentary Risk", tip: "Modern grid-work leads to Non-Communicable Diseases (NCDs). Use 15 mins of mobility to reset metabolic sync." },
  { category: 'Urban', title: "💧 Hydration Audit", tip: "Urban water grids can have localized contamination. UV-C sterilization or boiling is the primary defense against enteric pathogens." },
  { category: 'Universal', title: "🌡️ Heat Extraction", tip: "Heatstroke is a system failure. If sweating stops, apply cooling packs to the neck and groin nodes immediately." },
  { category: 'Universal', title: "💉 Vaccine Firewall", tip: "Completing your immunization schedule creates a community defense grid against localized outbreaks." },
  { category: 'Universal', title: "🦷 Oral Bio-Security", tip: "Systemic health is linked to oral hygiene. Neglecting dental nodes can trigger cardiovascular infiltration." }
];

export const FINANCIAL_PRACTICES = [
  { category: 'Rural', title: "💰 PM-JAY Coverage", tip: "Ayushman Bharat covers ₹5 Lakh/family/year for secondary/tertiary care. Ensure your UID is synchronized." },
  { category: 'Rural', title: "🌾 Harvest Insurance", tip: "Link your health and crop insurance. A biological shock at harvest can crash your entire financial ledger." },
  { category: 'Rural', title: "🤝 SHG Liquidity", tip: "Self-Help Groups (SHGs) provide low-interest tactical loans. Avoid high-interest informal lenders to prevent debt-traps." },
  { category: 'Urban', title: "📉 The 18% GST Hit", tip: "Health insurance premiums in India carry 18% GST. Factor this into your tactical reserve planning." },
  { category: 'Urban', title: "📜 Section 80D Shield", tip: "Operatives can claim tax deductions up to ₹25,000 for health premiums. This is 'Recaptured Capital' for your savings." },
  { category: 'Urban', title: "🏥 Medical Inflation", tip: "In India, medical costs rise by ~14% annually—double the general inflation. Your reserves must outpace this." },
  { category: 'Urban', title: "💳 Corporate Buffer", tip: "Many urban jobs offer Group Health Insurance. Audit these benefits before acquiring private secondary coverage." },
  { category: 'Universal', title: "⚖️ The 3-Month Buffer", tip: "Maintain a 'Resilience Fund' equal to 3 months of sector costs to survive an unexpected medical infiltration." },
  { category: 'Universal', title: "💳 Cashless Protocol", tip: "Network hospitals allow 'Cashless' entry. Paying upfront (OOPE) can trigger a 'Debt Trap' cycle if liquidity is low." },
  { category: 'Universal', title: "📈 Compound Resilience", tip: "Starting a health savings node early utilizes compound interest to build a massive bio-economic shield over decades." }
];

export const SECTOR_INTEL: Record<string, string> = {
  'Mumbai': 'Healthcare: Managed by MCGM. Use Aapli Chikitsa for free diagnostics. Warning: High private reliance causes OOPE leaks.',
  'BENGALURU': 'Healthcare: Tech-hub for private wellness. High rates of stress-related NCDs. PM-JAY adoption is critical for gig-operatives.',
  'DELHI': 'Healthcare: Mohalla Clinics provide excellent neighborhood intelligence. Danger: Respiratory hazard PM2.5 is at Critical levels.',
  'CHENNAI': 'Healthcare: Public health powerhouse with 100% PHC coverage. Focus on heat-related cardiovascular triage.',
  'HYDERABAD': 'Healthcare: Global Generic Hub. Source medical supplies here for maximum reserve efficiency.',
  'RAJASTHAN': 'Healthcare: Mobile PHC units are active. Intelligence focus: Arid-zone water-borne pathogen defense.',
  'ANANTAPUR': 'Healthcare: Drought resilience nodes. Focus on Jal Jeevan mission protocols for safe hydration.',
  'WAYANAD': 'Healthcare: High primary care literacy. Focus on monsoon-borne pathogen defense and sanitary buffer zones.',
  'SUNDARBANS': 'Healthcare: Marine-based boat clinics. Critical: Cholera defense during saline flooding infiltrations.',
  'MAJULI': 'Healthcare: Island tele-health grid. Focus on digital bio-monitoring when flood stages block physical node access.'
};

export const JOBS: Job[] = [
  {
    id: 'rural_health_asst',
    title: 'ASHA Field Guardian',
    company: 'Rural Health Mission',
    description: 'Provide community health intel and maternal care support. Low intensity, reliable yield.',
    dailySalary: 850,
    hoursRequired: 5,
    requiredTopic: 'Rural Sanitation',
    locationCategory: 'Rural',
    passingScore: 70,
    questions: [
      { type: 'mcq', question: "Which mosquito is the primary vector for Dengue?", options: ["Anopheles", "Culex", "Aedes aegypti"], correct: 2 },
      { type: 'mcq', question: "What level of care does a PHC provide?", options: ["Primary", "Tertiary", "Specialized"], correct: 0 },
      { type: 'mcq', question: "What is the primary purpose of ORS?", options: ["Pain relief", "Rehydration", "Antibiotic"], correct: 1 },
      { type: 'mcq', question: "Which vaccine is given at birth to prevent Tuberculosis?", options: ["DPT", "Polio", "BCG"], correct: 2 },
      { type: 'mcq', question: "What does 'ASHA' stand for in the Indian health context?", options: ["Associate Social Health Agent", "Accredited Social Health Activist", "Area Senior Health Assistant"], correct: 1 },
      { type: 'mcq', question: "Which of these is a water-borne disease?", options: ["Cholera", "Malaria", "Tuberculosis"], correct: 0 },
      { type: 'mcq', question: "What is the recommended duration for exclusive breastfeeding?", options: ["3 months", "12 months", "6 months"], correct: 2 },
      { type: 'text', question: "Why is 'Generic Medicine' a vital tool for improving rural healthcare affordability?" },
      { type: 'text', question: "Explain the importance of institutional delivery over home delivery for maternal safety." },
      { type: 'text', question: "How does proper waste management at the village level prevent disease outbreaks?" }
    ]
  },
  {
    id: 'urban_pharma_mgr',
    title: 'Jan-Aushadhi Hub Lead',
    company: 'Generic Pharma Grid',
    description: 'Logistics lead for low-cost generic drug nodes. Requires high technical and fiscal literacy.',
    dailySalary: 1650,
    hoursRequired: 6,
    requiredTopic: 'Urban Economics',
    locationCategory: 'Urban',
    passingScore: 80,
    questions: [
      { type: 'mcq', question: "Generic drugs are cheaper because:", options: ["Zero marketing and R&D overheads", "Lower quality", "Near expiry"], correct: 0 },
      { type: 'mcq', question: "What is the standard price reduction for Jan Aushadhi generic drugs?", options: ["10%", "0%", "50-90%"], correct: 2 },
      { type: 'mcq', question: "Which organization regulates drug quality in India?", options: ["ICMR", "CDSCO", "NITI Aayog"], correct: 1 },
      { type: 'mcq', question: "What is the GST rate on most health insurance premiums in India?", options: ["18%", "12%", "5%"], correct: 0 },
      { type: 'mcq', question: "Under Section 80D, what is the max tax deduction for self-health insurance?", options: ["₹10,000", "₹25,000", "₹50,000"], correct: 1 },
      { type: 'mcq', question: "What does 'OOPE' stand for in healthcare economics?", options: ["Over-the-Counter Price Entry", "Official Operative Price Estimate", "Out-of-Pocket Expenditure"], correct: 2 },
      { type: 'mcq', question: "Which scheme provides ₹5 Lakh health cover per family in India?", options: ["PM-JAY", "PM-Kisan", "PM-Awas"], correct: 0 },
      { type: 'text', question: "Explain the economic advantage of risk-pooling through health insurance." },
      { type: 'text', question: "How do Jan Aushadhi stores contribute to reducing the 'Debt Trap' caused by medical expenses?" },
      { type: 'text', question: "Describe the impact of medical inflation on long-term financial planning for an urban family." }
    ]
  },
  {
    id: 'data_bio_analyst',
    title: 'Bio-Intelligence Analyst',
    company: 'City Health Grid',
    description: 'Map epidemic patterns and optimize medical reserve allocation. High-yield elite role.',
    dailySalary: 2800,
    hoursRequired: 7,
    requiredTopic: 'Data Analysis',
    locationCategory: 'Urban',
    passingScore: 85,
    questions: [
      { type: 'mcq', question: "Which index measures survival without a steady salary yield?", options: ["BPM Index", "Resilience Score", "Goal ETA"], correct: 1 },
      { type: 'mcq', question: "What does Goal ETA represent in your tactical ledger?", options: ["Ambulance arrival time", "Disease incubation", "Cycles to reach wealth target"], correct: 2 },
      { type: 'mcq', question: "What is the primary cause of high PM2.5 levels in Delhi during winter?", options: ["Stubble burning and vehicular emissions", "Industrial waste", "Natural dust storms"], correct: 0 },
      { type: 'mcq', question: "Which data visualization is best for tracking disease spread over time?", options: ["Pie Chart", "Heat Map / Time-series", "Scatter Plot"], correct: 1 },
      { type: 'mcq', question: "What is 'Medical Inflation' currently estimated at in India?", options: ["~5%", "~25%", "~14%"], correct: 2 },
      { type: 'mcq', question: "Which of these is a 'Non-Communicable Disease' (NCD)?", options: ["Diabetes", "Malaria", "Typhoid"], correct: 0 },
      { type: 'mcq', question: "What is the primary goal of the 'Jal Jeevan Mission'?", options: ["Electricity for all", "Piped water to every rural home", "Building highways"], correct: 1 },
      { type: 'text', question: "How does high data granularity improve health outcomes in dense urban grids like Mumbai?" },
      { type: 'text', question: "Analyze the correlation between air quality (AQI) and long-term respiratory healthcare costs." },
      { type: 'text', question: "Discuss how digital health IDs (ABHA) can streamline emergency medical response and data tracking." }
    ]
  }
];

export const LOCATIONS_DATA: Record<string, any> = {
  [LocationType.MUMBAI]: { name: 'Mumbai Sector', category: 'Urban', description: 'Financial Core. High private grid density. Intelligence suggests checking for Generic Hubs.', image: 'https://images.unsplash.com/photo-1566552881560-0be862a7c445?auto=format&fit=crop&q=80&w=1200', dailyCost: 1200, healthImpact: -8, travelCost: 4500 },
  [LocationType.BENGALURU]: { name: 'Bengaluru Grid', category: 'Urban', description: 'Tech Biosphere. High rates of lifestyle infiltration. Resilience strategy: ergonomic reset.', image: 'https://images.unsplash.com/photo-1596760405807-16d76636831a?auto=format&fit=crop&q=80&w=1200', dailyCost: 1100, healthImpact: -6, travelCost: 4200 },
  [LocationType.DELHI]: { name: 'Delhi Sector', category: 'Urban', description: 'National Grid. Respiratory hazard PM2.5 is at critical levels. N95 shielding mandatory.', image: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&q=80&w=1200', dailyCost: 1050, healthImpact: -12, travelCost: 4800 },
  [LocationType.CHENNAI]: { name: 'Chennai Port', category: 'Urban', description: 'Coastal Sector. High focus on maternal health nodes and heatwave triage protocols.', image: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&q=80&w=1200', dailyCost: 950, healthImpact: -7, travelCost: 4000 },
  [LocationType.HYDERABAD]: { name: 'Hyderabad Core', category: 'Urban', description: 'The Pharmacy Grid. Major logistics node for generic drug exports and vaccine storage.', image: 'https://images.unsplash.com/photo-1605377349974-946766468603?auto=format&fit=crop&q=80&w=1200', dailyCost: 900, healthImpact: -5, travelCost: 4100 },
  [LocationType.RAJASTHAN]: { name: 'Rajasthan Outpost', category: 'Rural', description: 'Arid Grid. Focus on safe water nodes and maternal health in remote village clusters.', image: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&q=80&w=1200', dailyCost: 450, healthImpact: 2, travelCost: 2500 },
  [LocationType.ANANTAPUR]: { name: 'Anantapur Node', category: 'Rural', description: 'Drought Resilience Zone. Mission: Nutritional security and millet-based metabolic recovery.', image: 'https://images.unsplash.com/photo-1542614391-44755106606f?auto=format&fit=crop&q=80&w=1200', dailyCost: 400, healthImpact: 3, travelCost: 2200 },
  [LocationType.WAYANAD]: { name: 'Wayanad Highlands', category: 'Rural', description: 'Primary Care Haven. Mission: Vector-borne defense and sanitary buffer zones.', image: 'https://images.unsplash.com/photo-1590424578505-f938a4d40237?auto=format&fit=crop&q=80&w=1200', dailyCost: 550, healthImpact: 5, travelCost: 2400 },
  [LocationType.SUNDARBANS]: { name: 'Sundarbans Delta', category: 'Rural', description: 'Mangrove Grid. Logistics: Boat-based clinics. Focus: Water-borne cholera defense.', image: 'https://images.unsplash.com/photo-1632738734346-6b2c86c18f0c?auto=format&fit=crop&q=80&w=1200', dailyCost: 350, healthImpact: 4, travelCost: 2000 },
  [LocationType.MAJULI]: { name: 'Majuli Island', category: 'Rural', description: 'Riverine Node. Mission: Tele-health synchronization when river stages block nodes.', image: 'https://images.unsplash.com/photo-1541415715525-2a4f4d7b270a?auto=format&fit=crop&q=80&w=1200', dailyCost: 300, healthImpact: 2, travelCost: 1800 }
};

export const CITY_POIS: Record<string, PointOfInterest[]> = {
  [LocationType.MUMBAI]: [
    { id: 'm1', name: 'Generic Med Hub', icon: '💊', description: 'Analyze Jan Aushadhi savings protocols.', type: 'health', image: 'https://images.unsplash.com/photo-1587854692152-cbe660dbbb88?auto=format&fit=crop&q=80&w=400' },
    { id: 'm2', name: 'MCGM Hospital', icon: '🏥', description: 'Tertiary public sector care audit.', type: 'health', image: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=400' }
  ],
  [LocationType.BENGALURU]: [
    { id: 'b1', name: 'NCD Wellness Hub', icon: '🏢', description: 'Lifestyle infiltration defense center.', type: 'health', image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=400' },
    { id: 'b2', name: 'Public PHC Grid', icon: '🩺', description: 'Primary care diagnostic synchronization.', type: 'health', image: 'https://images.unsplash.com/photo-1505751172107-573225a91200?auto=format&fit=crop&q=80&w=400' }
  ],
  [LocationType.DELHI]: [
    { id: 'd1', name: 'Mohalla Clinic', icon: '🩺', description: 'Local primary intelligence gatherer.', type: 'health', image: 'https://images.unsplash.com/photo-1538108197017-c1b4628493d7?auto=format&fit=crop&q=80&w=400' },
    { id: 'd2', name: 'AQI Station', icon: '🏭', description: 'Respiratory defense monitoring.', type: 'hazard', image: 'https://images.unsplash.com/photo-1521510895919-46920266ddb3?auto=format&fit=crop&q=80&w=400' }
  ],
  [LocationType.CHENNAI]: [
    { id: 'c1', name: 'Water Guard', icon: '💧', description: 'Sanitation and hydration monitor.', type: 'health', image: 'https://images.unsplash.com/photo-1516934024742-b461fba47600?auto=format&fit=crop&q=80&w=400' },
    { id: 'c2', name: 'Operative PHC', icon: '🏥', description: 'Secondary care audit point.', type: 'health', image: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&q=80&w=400' }
  ],
  [LocationType.HYDERABAD]: [
    { id: 'h1', name: 'Vaccine Depot', icon: '💉', description: 'Immunization schedule firewall.', type: 'health', image: 'https://images.unsplash.com/photo-1584036561566-baf8f5f1b144?auto=format&fit=crop&q=80&w=400' },
    { id: 'h2', name: 'Pharma Lab', icon: '🔬', description: 'Generic R&D economic analysis.', type: 'market', image: 'https://images.unsplash.com/photo-1532187863486-abf9d3c3c956?auto=format&fit=crop&q=80&w=400' }
  ],
  [LocationType.RAJASTHAN]: [
    { id: 'r1', name: 'Arid Node Well', icon: '💧', description: 'Safe water collection protocol.', type: 'market', image: 'https://images.unsplash.com/photo-1547523680-0550a1173ae6?auto=format&fit=crop&q=80&w=400' },
    { id: 'r2', name: 'Outpost PHC', icon: '🏠', description: 'Rural frontline bio-defense.', type: 'health', image: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&q=80&w=400' }
  ],
  [LocationType.ANANTAPUR]: [
    { id: 'a1', name: 'Millet Recovery Node', icon: '🌾', description: 'Strategic nutritional supply.', type: 'market', image: 'https://images.unsplash.com/photo-1501265976582-c1e1b0bbaf63?auto=format&fit=crop&q=80&w=400' },
    { id: 'a2', name: 'ASHA Outpost', icon: '🛖', description: 'Frontline community intelligence.', type: 'health', image: 'https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?auto=format&fit=crop&q=80&w=400' }
  ],
  [LocationType.WAYANAD]: [
    { id: 'w1', name: 'Highland PHC', icon: '🏥', description: 'Monsoon-borne defense audit.', type: 'health', image: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&q=80&w=400' },
    { id: 'w2', name: 'Pathogen Board', icon: '🦟', description: 'Vector surveillance command center.', type: 'hazard', image: 'https://images.unsplash.com/photo-1576089172869-4f5f6f315620?auto=format&fit=crop&q=80&w=400' }
  ],
  [LocationType.SUNDARBANS]: [
    { id: 's1', name: 'Marine Clinic', icon: '🚤', description: 'Water-borne response boat audit.', type: 'health', image: 'https://images.unsplash.com/photo-1559839734-2b71f1e3c770?auto=format&fit=crop&q=80&w=400' },
    { id: 's2', name: 'Sanitation Post', icon: '🚽', description: 'Open-defecation defense node.', type: 'health', image: 'https://images.unsplash.com/photo-1584362946045-121f8496912f?auto=format&fit=crop&q=80&w=400' }
  ],
  [LocationType.MAJULI]: [
    { id: 'mj1', name: 'Tele-Health Depo', icon: '🛶', description: 'Digital health synchronization.', type: 'health', image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=400' },
    { id: 'mj2', name: 'Hygiene Satara', icon: '🏛️', description: 'Cultural health literacy center.', type: 'health', image: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=400' }
  ]
};
