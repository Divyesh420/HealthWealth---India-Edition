
export enum LocationType {
  MUMBAI = 'Mumbai',
  BENGALURU = 'BENGALURU',
  RAJASTHAN = 'RAJASTHAN',
  DELHI = 'DELHI',
  CHENNAI = 'CHENNAI',
  HYDERABAD = 'HYDERABAD',
  ANANTAPUR = 'ANANTAPUR',
  WAYANAD = 'WAYANAD',
  SUNDARBANS = 'SUNDARBANS',
  MAJULI = 'MAJULI'
}

export interface Avatar {
  id: string;
  name: string;
  image: string;
}

export interface ShopItem {
  id: string;
  name: string;
  icon: string;
  description: string;
  cost: number;
  healthBenefit: number;
  type: 'food' | 'medicine' | 'gear';
}

export interface PointOfInterest {
  id: string;
  name: string;
  icon: string;
  description: string;
  type: 'health' | 'finance' | 'market' | 'hazard';
  image: string;
}

export interface ScenarioOption {
  label: string;
  cost: number;
  healthEffect: number;
  resilienceImpact: number;
  timeCost: number;
  feedback: string;
  stealthImpact?: number;
}

export interface InvestigationPoint {
  id: string;
  subLocation: string; 
  description: string; 
  clueResult: string;  
  requiredTool: 'bio-scan' | 'sig-int' | 'hum-int';
  puzzleType?: 'sequence' | 'match' | 'decryption';
  puzzleCode?: string;
  puzzleClue?: string;
  icon: string;
  x: number; 
  y: number; 
}

export interface Obstacle {
  id: string;
  type: 'hazard' | 'block' | 'slow' | 'time-warp' | 'multi';
  name: string;
  icon: string;
  x: number;
  y: number;
  radius: number;
}

export interface Scenario {
  id: string;
  title: string;
  description: string;
  options: ScenarioOption[];
  healthFact: string;
  synthesisAnalysis?: string;
  investigationPoints: InvestigationPoint[];
  obstacles: Obstacle[];
  missionRisk: 'Low' | 'Moderate' | 'High' | 'Critical';
}

export interface Quest {
  poiId: string;
  title: string;
  scenarios: Scenario[];
  currentStep: number;
  reflection?: string;
  missionCodename: string;
}

export interface DailySummary {
  moneyDelta: number;
  healthDelta: number;
  message: string;
  questExpenses: number;
  livingCosts: number;
  salary: number;
}

export interface ShockEvent {
  id: string;
  title: string;
  description: string;
  baseCost: number;
  healthImpact: number;
  severity: 'Moderate' | 'Severe' | 'Catastrophic';
}

export interface Transaction {
  id: string;
  day: number;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  description: string;
}

export interface ExamQuestion {
  type: 'mcq' | 'text';
  question: string;
  options?: string[];
  correct?: number;
}

export interface Job {
  id: string;
  title: string;
  company: string;
  description: string;
  dailySalary: number;
  hoursRequired: number;
  requiredTopic: string;
  locationCategory: 'Urban' | 'Rural' | 'Universal';
  passingScore: number;
  questions: ExamQuestion[];
}

export interface InsurancePlan {
  id: string;
  name: string;
  dailyPremium: number;
  coveragePercent: number;
  maxBenefit: number;
  description: string;
  icon: string;
  coverage: string[];
  exclusions: string[];
}

export interface BudgetPlan {
  fieldOps: number;
  vitality: number;
  savings: number;
  targetGoal: number;
  adjustments: { id: string; note: string; date: number }[];
}

export interface GameState {
  syncId: string;
  playerName?: string;
  avatar: Avatar | null;
  money: number;
  health: number;
  day: number;
  level: number;
  experience: number;
  resilienceScore: number;
  hoursWorkedToday: number;
  cumulativeHours: number;
  currentLocation: LocationType;
  inventory: string[];
  visitedLocations: LocationType[];
  currentQuest: null | Quest;
  questHistory: { title: string; outcome: string }[];
  dailySummary: null | DailySummary;
  questSummary: { title: string, codename: string, exp: number, resilience: number, stealth: number } | null;
  jobs: string[];
  knowledgePoints: string[];
  transactions: Transaction[];
  insurancePlan: InsurancePlan | null;
  agentRank: string;
  stealthMeter: number;
  budgetPlan: BudgetPlan;
  activeShock: null;
}
