
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from "motion/react";
import { GameState, LocationType, Quest, Avatar, PointOfInterest, ScenarioOption, DailySummary, Job, Transaction, InsurancePlan, ShopItem, BudgetPlan, ShockEvent } from './types';
import { INITIAL_BUDGET, MAX_HEALTH, LOCATIONS_DATA, AVATARS, CITY_POIS, JOBS, HEALTH_TIPS, FINANCIAL_PRACTICES, MAX_DAILY_HOURS, INSURANCE_PLANS, SHOP_ITEMS, XP_PER_QUEST_STEP, XP_PER_LEVEL, SECTOR_INTEL } from './constants';
import GameHeader from './components/GameHeader';
import ScenarioCard from './components/ScenarioCard';
import SearchBar from './components/SearchBar';
import { generateQuest, gradeMultipleFreeResponses } from './services/geminiService';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { 
  Search, 
  Filter, 
  TrendingUp, 
  Shield, 
  Map as MapIcon, 
  ShoppingBag, 
  BookOpen, 
  Briefcase, 
  CreditCard, 
  Activity, 
  ArrowRight, 
  Info, 
  AlertTriangle,
  Heart,
  Plus,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { cn } from './utils';

const generateSyncId = () => 'HW-' + Math.random().toString(36).substr(2, 6).toUpperCase();

interface ExamResult {
  score: number;
  mcqScore: number;
  frqScore: number;
  passed: boolean;
  advice: string;
  feedback?: string;
}

const ViewContainer: React.FC<{ children: React.ReactNode, title: string, subtitle?: string }> = ({ children, title, subtitle }) => (
  <div className="bg-white rounded-[3.5rem] p-6 flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-6 duration-500 shadow-2xl border-[12px] border-slate-50 mb-32 relative overflow-hidden">
    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-transparent to-emerald-500 opacity-30" />
    <div className="flex flex-col gap-1 px-8 py-4 flex-shrink-0 text-left border-l-8 border-blue-500 bg-slate-50 rounded-r-2xl">
      <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase leading-none">{title}</h2>
      {subtitle && <p className="text-sm font-bold text-slate-400 italic tracking-wider mt-1">"{subtitle}"</p>}
    </div>
    <div className="flex-1 overflow-y-auto custom-scrollbar px-4 py-4 bg-slate-50/50 rounded-[2.5rem] border border-slate-100">
      {children}
    </div>
  </div>
);

const FlightAnimation: React.FC = () => (
  <div className="fixed inset-0 z-[6000] bg-sky-500 flex flex-col items-center justify-center overflow-hidden">
    <div className="absolute inset-0">
      {[...Array(30)].map((_, i) => (
        <div key={i} className="absolute bg-white/30 rounded-full animate-pulse" 
             style={{ 
               width: Math.random() * 250 + 100, 
               height: Math.random() * 40 + 10, 
               left: `${Math.random() * 100}%`, 
               top: `${Math.random() * 100}%`,
               animationDuration: `${Math.random() * 2 + 0.5}s`,
               transform: `rotate(${Math.random() * 10 - 5}deg)`
             }} />
      ))}
    </div>
    <div className="relative animate-bounce scale-[2]">
      <span className="text-9xl drop-shadow-2xl">✈️</span>
    </div>
    <div className="mt-20 text-white text-6xl font-black uppercase tracking-[0.4em] animate-pulse drop-shadow-lg text-center">
      Cross-Sector Transit
    </div>
    <div className="mt-6 text-sky-100 text-2xl font-bold italic bg-black/20 px-8 py-3 rounded-full backdrop-blur-md">
      Updating Field Operative Geolocation...
    </div>
  </div>
);

const BMICalculator: React.FC = () => {
  const [weight, setWeight] = useState<string>('');
  const [height, setHeight] = useState<string>('');
  const [result, setResult] = useState<{ bmi: number, category: string } | null>(null);

  const calculate = () => {
    const w = parseFloat(weight);
    const h = parseFloat(height) / 100;
    if (w > 0 && h > 0) {
      const bmi = parseFloat((w / (h * h)).toFixed(1));
      let category = 'Normal';
      if (bmi < 18.5) category = 'Underweight';
      else if (bmi >= 25 && bmi < 30) category = 'Overweight';
      else if (bmi >= 30) category = 'Obese';
      setResult({ bmi, category });
    }
  };

  return (
    <div className="bg-white p-8 rounded-[3rem] border-4 border-slate-50 shadow-xl space-y-6">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-500"><Activity size={24} /></div>
        <h3 className="text-2xl font-black uppercase tracking-tight text-slate-900">Bio-Sync BMI Calculator</h3>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Weight (kg)</p>
          <input type="number" value={weight} onChange={e => setWeight(e.target.value)} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-3 font-black text-slate-900 focus:border-blue-500 outline-none transition-all" placeholder="70" />
        </div>
        <div className="space-y-2">
          <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Height (cm)</p>
          <input type="number" value={height} onChange={e => setHeight(e.target.value)} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-3 font-black text-slate-900 focus:border-blue-500 outline-none transition-all" placeholder="175" />
        </div>
      </div>
      <button onClick={calculate} className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-emerald-500 transition-all shadow-lg active:scale-95">Analyze Bio-Metrics</button>
      {result && (
        <div className="bg-slate-50 p-6 rounded-[2rem] border-2 border-slate-100 animate-in zoom-in-95">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Your BMI</p>
              <p className="text-4xl font-black text-slate-900">{result.bmi}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Category</p>
              <p className={`text-xl font-black uppercase ${result.category === 'Normal' ? 'text-emerald-600' : 'text-rose-600'}`}>{result.category}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const TaxEstimator: React.FC = () => {
  const [premium, setPremium] = useState<string>('');
  const [savings, setSavings] = useState<number | null>(null);

  const estimate = () => {
    const p = parseFloat(premium);
    if (p > 0) {
      // Simple 20% tax slab assumption for demonstration
      setSavings(Math.min(p, 25000) * 0.2);
    }
  };

  return (
    <div className="bg-white p-8 rounded-[3rem] border-4 border-slate-50 shadow-xl space-y-6">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center text-blue-500"><Shield size={24} /></div>
        <h3 className="text-2xl font-black uppercase tracking-tight text-slate-900">Section 80D Tax Shield</h3>
      </div>
      <div className="space-y-2">
        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Annual Health Premium (₹)</p>
        <input type="number" value={premium} onChange={e => setPremium(e.target.value)} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-3 font-black text-slate-900 focus:border-blue-500 outline-none transition-all" placeholder="15000" />
      </div>
      <button onClick={estimate} className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-blue-500 transition-all shadow-lg active:scale-95">Calculate Recaptured Capital</button>
      {savings !== null && (
        <div className="bg-blue-50 p-6 rounded-[2rem] border-2 border-blue-100 animate-in zoom-in-95">
          <p className="text-[10px] font-black uppercase text-blue-600 tracking-widest">Estimated Tax Savings</p>
          <p className="text-4xl font-black text-blue-900">₹{savings.toLocaleString()}</p>
          <p className="text-[10px] font-bold text-blue-400 italic mt-2">"Based on standard 20% tax bracket. Max deduction: ₹25k."</p>
        </div>
      )}
    </div>
  );
};

const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isTransiting, setIsTransiting] = useState(false);
  const [transitSurprise, setTransitSurprise] = useState<{ title: string, msg: string, icon: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'world' | 'healthpedia' | 'jobs' | 'finance' | 'shop' | 'travel' | 'insurance'>('world');
  const [feedback, setFeedback] = useState<string | null>(null);
  const [testAnswers, setTestAnswers] = useState<(number | string)[]>([]);
  const [isGrading, setIsGrading] = useState(false);
  const [examResult, setExamResult] = useState<ExamResult | null>(null);
  const [currentJobTest, setCurrentJobTest] = useState<Job | null>(null);
  const [showIntro, setShowIntro] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [shopFilter, setShopFilter] = useState<'all' | 'food' | 'medicine' | 'gear'>('all');
  const [travelFilter, setTravelFilter] = useState<'All' | 'Urban' | 'Rural'>('All');
  const examScrollRef = useRef<HTMLDivElement>(null);

  const [state, setState] = useState<GameState>({
      syncId: generateSyncId(),
      avatar: null,
      money: INITIAL_BUDGET,
      health: MAX_HEALTH,
      day: 1,
      level: 1,
      experience: 0,
      hoursWorkedToday: 0,
      cumulativeHours: 0,
      currentLocation: LocationType.MUMBAI,
      inventory: ['Tactical Tablet'],
      visitedLocations: [LocationType.MUMBAI],
      currentQuest: null,
      questHistory: [],
      dailySummary: null,
      questSummary: null,
      jobs: [],
      knowledgePoints: ['Basics'],
      resilienceScore: 0,
      transactions: [{ id: 'init', day: 1, type: 'income', amount: INITIAL_BUDGET, category: 'Grant', description: 'Initial Startup Capital' }],
      insurancePlan: null,
      agentRank: 'Novice',
      stealthMeter: 100,
      budgetPlan: { fieldOps: 40, vitality: 30, savings: 30, targetGoal: 25000, adjustments: [] },
      activeShock: null
  });

  const currentLocationData = useMemo(() => LOCATIONS_DATA[state.currentLocation], [state.currentLocation]);
  
  const filteredVault = useMemo(() => {
    const category = currentLocationData.category;
    const q = searchQuery.toLowerCase();
    const health = HEALTH_TIPS.filter(t => (t as any).category === category || (t as any).category === 'Universal');
    const finance = FINANCIAL_PRACTICES.filter(f => (f as any).category === category || (f as any).category === 'Universal');

    return {
      health: health.filter(t => t.title.toLowerCase().includes(q) || t.tip.toLowerCase().includes(q)),
      finance: finance.filter(f => f.title.toLowerCase().includes(q) || f.tip.toLowerCase().includes(q))
    };
  }, [currentLocationData, searchQuery]);

  const filteredJobs = useMemo(() => JOBS.filter(j => j.locationCategory === currentLocationData.category || j.locationCategory === 'Universal'), [currentLocationData]);

  const jobProgress = useMemo(() => {
    const clearedInRegion = filteredJobs.filter(j => state.jobs.includes(j.id)).length;
    return { cleared: clearedInRegion, total: filteredJobs.length };
  }, [filteredJobs, state.jobs]);

  const financialStats = useMemo(() => {
    const jobIncome = state.jobs.reduce((acc, jid) => acc + (JOBS.find(j => j.id === jid)?.dailySalary || 0), 0);
    const lifeCosts = currentLocationData.dailyCost + (state.insurancePlan?.dailyPremium || 0);
    const netDaily = jobIncome - lifeCosts;
    const daysOfSurvival = state.money > 0 ? Math.floor(state.money / Math.max(1, lifeCosts)) : 0;
    const cyclesToGoal = netDaily > 0 ? Math.ceil((state.budgetPlan.targetGoal - state.money) / netDaily) : Infinity;
    
    const savingsRate = jobIncome > 0 ? Math.round((netDaily / jobIncome) * 100) : 0;
    const expenseRatio = jobIncome > 0 ? Math.round((lifeCosts / jobIncome) * 100) : 0;
    const resilienceIndex = Math.round((state.resilienceScore * 0.6) + (Math.min(100, daysOfSurvival) * 0.4));

    return { jobIncome, lifeCosts, netDaily, daysOfSurvival, cyclesToGoal, resilienceScore: state.resilienceScore, savingsRate, expenseRatio, resilienceIndex };
  }, [state.money, state.jobs, currentLocationData, state.insurancePlan, state.budgetPlan.targetGoal, state.resilienceScore]);

  const startQuest = async (poi: PointOfInterest) => {
    setIsLoading(true);
    try {
      const quest = await generateQuest(state.currentLocation, poi, state.day);
      setState(prev => ({ ...prev, currentQuest: quest }));
    } catch (e) { alert("Tactical link severed."); }
    finally { setIsLoading(false); }
  };

  const buyItem = (item: ShopItem) => {
    if (state.money < item.cost) return alert("Insufficient reserves.");
    setState(prev => ({
      ...prev,
      money: prev.money - item.cost,
      health: Math.min(MAX_HEALTH, prev.health + item.healthBenefit),
      inventory: [...prev.inventory, item.name],
      transactions: [{ id: `item-${Date.now()}`, day: prev.day, type: 'expense', amount: item.cost, category: 'Supply', description: item.name }, ...prev.transactions]
    }));
  };

  const buyInsurance = (plan: InsurancePlan) => {
    if (state.money < plan.dailyPremium) return alert("Insufficient reserves for premium.");
    setState(prev => ({
      ...prev,
      insurancePlan: plan,
      transactions: [{ id: `ins-${Date.now()}`, day: prev.day, type: 'expense', amount: plan.dailyPremium, category: 'Bio-Defense', description: plan.name }, ...prev.transactions]
    }));
  };

  const travelTo = (loc: LocationType) => {
    const cost = LOCATIONS_DATA[loc].travelCost;
    if (state.money < cost) return alert("Transit blocked: Insufficient reserves.");
    setIsTransiting(true);
    
    // Surprise feature: Random Sector Event during travel
    const surprises = [
      { title: "Tax Rebate", msg: "You found an unclaimed tax refund in the sector's digital vault!", icon: "💰", bonus: 500 },
      { title: "Bio-Scanner Calibration", msg: "A local technician calibrated your gear for free.", icon: "🔧", bonus: 0 },
      { title: "Metabolic Boost", msg: "You sampled a local nutrient-rich superfood.", icon: "🍎", bonus: 0, health: 10 },
      { title: "Sector Gossip", msg: "You overheard valuable intel about local health trends.", icon: "👂", bonus: 0, xp: 50 }
    ];
    const event = Math.random() > 0.6 ? surprises[Math.floor(Math.random() * surprises.length)] : null;

    setTimeout(() => {
      setState(prev => ({
        ...prev,
        currentLocation: loc,
        money: prev.money - cost + (event?.bonus || 0),
        health: Math.min(MAX_HEALTH, prev.health + (event?.health || 0)),
        experience: prev.experience + (event?.xp || 0),
        visitedLocations: prev.visitedLocations.includes(loc) ? prev.visitedLocations : [...prev.visitedLocations, loc],
        transactions: [
          ...(event ? [{ id: `event-${Date.now()}`, day: prev.day, type: 'income' as const, amount: event.bonus || 0, category: 'Event', description: event.title }] : []),
          { id: `travel-${Date.now()}`, day: prev.day, type: 'expense', amount: cost, category: 'Travel', description: `Infiltration of ${loc}` }, 
          ...prev.transactions
        ]
      }));
      if (event) setTransitSurprise({ title: event.title, msg: event.msg, icon: event.icon });
      setIsTransiting(false);
      setActiveTab('world');
    }, 3000);
  };

  const handleTestSubmit = async () => {
    if (!currentJobTest) return;
    setIsGrading(true);
    
    const mcqQuestions = currentJobTest.questions.filter(q => q.type === 'mcq');
    const frqQuestions = currentJobTest.questions.filter(q => q.type === 'text');
    
    let mcqCorrect = 0;
    mcqQuestions.forEach((q, i) => {
      const realIdx = currentJobTest.questions.indexOf(q);
      if (testAnswers[realIdx] === q.correct) mcqCorrect++;
    });

    const frqPayload = frqQuestions.map(q => {
      const realIdx = currentJobTest.questions.indexOf(q);
      return { question: q.question, answer: testAnswers[realIdx] as string };
    });

    const frqResults = await gradeMultipleFreeResponses(frqPayload);
    const frqScoreSum = frqResults.reduce((sum, res) => sum + (res.score || 0) * 100, 0);
    const aggregatedFeedback = frqResults.map(r => r.feedback).filter(f => f).slice(0, 2).join(" ");

    const mcqPercent = mcqQuestions.length > 0 ? (mcqCorrect / mcqQuestions.length) * 100 : 100;
    const frqPercent = frqQuestions.length > 0 ? Math.round(frqScoreSum / frqQuestions.length) : 100;
    
    const finalScore = Math.round((mcqPercent * 0.65) + (frqPercent * 0.35));
    const passed = finalScore >= currentJobTest.passingScore;
    
    if (passed) {
      setState(prev => ({ 
        ...prev, 
        jobs: [...prev.jobs, currentJobTest.id], 
        experience: prev.experience + 500 
      }));
    }
    
    setExamResult({ 
      score: finalScore, 
      mcqScore: Math.round(mcqPercent),
      frqScore: Math.round(frqPercent),
      passed, 
      advice: passed ? "Tactical Clearance Granted. Infiltration capabilities expanded." : "Insufficient Knowledge Score. Recalibrate via Intel Database.",
      feedback: aggregatedFeedback
    });
    setIsGrading(false);
  };

  if (showIntro) {
    return (
      <div className="fixed inset-0 z-[9999] bg-slate-100 flex items-center justify-center p-6 sm:p-12 overflow-y-auto">
        <div className="bg-white rounded-[4rem] max-w-6xl w-full p-10 sm:p-20 shadow-2xl space-y-12 animate-in slide-in-from-bottom-10 my-auto border-[12px] border-slate-50 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-transparent to-emerald-500 opacity-30" />
          <div className="space-y-4 relative z-10">
            <h2 className="text-6xl sm:text-7xl font-black text-slate-950 uppercase tracking-tighter leading-none">Mission Protocol</h2>
            <p className="text-2xl font-bold text-slate-400 italic">"Bio-Intelligence + Fiscal Mastery = Survival."</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 relative z-10">
            <div className="bg-emerald-50 p-8 rounded-[3rem] border-4 border-emerald-100 space-y-4">
              <span className="text-5xl">🧬 Resilience Score</span>
              <p className="text-lg font-bold text-slate-500 leading-snug">
                Your survival buffer. High scores mean you can survive localized biological or financial shocks without yield collapse.
              </p>
            </div>
            <div className="bg-blue-50 p-8 rounded-[3rem] border-4 border-blue-100 space-y-4">
              <span className="text-5xl">🕵️ HQ Network</span>
              <p className="text-lg font-bold text-slate-500 leading-snug">
                Use the Comms Terminal during missions to Interrogate HQ AI. Get real-time intel on AQI, PM-JAY, and Generic efficacy.
              </p>
            </div>
          </div>
          <div className="bg-slate-50 p-8 rounded-[3rem] border-2 border-slate-100 relative z-10">
             <h4 className="font-black text-xl uppercase mb-4 text-slate-950">Infiltration Module Structural Analysis:</h4>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
               <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm"><p className="font-black text-slate-950">🌍 Sector Infiltration</p><p className="text-sm text-slate-400 font-bold">Field missions with 5 audit nodes and complicated informative trade-offs.</p></div>
               <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm"><p className="font-black text-slate-950">🏦 Strategic Ledger</p><p className="text-sm text-slate-400 font-bold">Track Resilience, Goal ETA, and recaptured capital logs (Tax/80D).</p></div>
               <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm"><p className="font-black text-slate-950">✈️ Transit Map</p><p className="text-sm text-slate-400 font-bold">Capital flight transit between 10 Urban and Rural sector nodes.</p></div>
               <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm"><p className="font-black text-slate-950">🛒 Tactical Supply</p><p className="text-sm text-slate-400 font-bold">Acquire unique bio-shielding gear and metabolic recovery fuel.</p></div>
               <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm"><p className="font-black text-slate-950">💼 Operative Clearance</p><p className="text-sm text-slate-400 font-bold">Pass certification exams (MCQ + Reports) to earn realistic daily yields.</p></div>
               <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm"><p className="font-black text-slate-950">📖 Intel Database</p><p className="text-sm text-slate-400 font-bold">Search Sectoral Intel and Fiscal Intelligence on Indian health economics.</p></div>
             </div>
          </div>
          <button onClick={() => setShowIntro(false)} className="w-full bg-blue-600 text-white py-12 rounded-[4rem] font-black text-4xl uppercase tracking-[0.2em] shadow-xl hover:bg-blue-500 transition-all active:scale-95 relative z-10">Authorize Entry</button>
        </div>
      </div>
    );
  }

  if (!state.avatar) {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-8 text-center">
        <div className="max-w-4xl w-full bg-white rounded-[4rem] p-16 shadow-2xl animate-in zoom-in-95 border-[12px] border-slate-50">
          <h1 className="text-8xl font-black uppercase tracking-tighter leading-none mb-4 text-slate-950">HealthWealth</h1>
          <p className="text-2xl font-bold text-slate-400 mb-12 uppercase tracking-widest italic">Operative Synchronization Required</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            {AVATARS.map(av => (
              <button key={av.id} onClick={() => setState({...state, avatar: av})} className="p-4 bg-slate-50 rounded-[3rem] border-4 border-transparent hover:border-blue-500 hover:bg-white hover:scale-105 transition-all shadow-lg">
                <img src={av.image} className="w-full aspect-square object-contain rounded-[2rem]"/>
                <p className="font-black text-xl mt-4 uppercase text-slate-950">{av.name}</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 relative pb-40" style={{ fontFamily: 'Fredoka, sans-serif' }}>
      <GameHeader state={state} onExit={() => setState({...state, avatar: null})} />
      <main className="flex-1 p-4 sm:p-8 max-w-7xl mx-auto w-full">
        {isTransiting && <FlightAnimation />}
        {transitSurprise && (
          <div className="fixed inset-0 z-[7000] bg-black/60 backdrop-blur-sm flex items-center justify-center p-8 animate-in fade-in zoom-in-95">
            <div className="bg-white rounded-[4rem] p-12 max-w-2xl w-full text-center space-y-8 border-[15px] border-blue-50 shadow-6xl">
              <span className="text-9xl block animate-bounce">{transitSurprise.icon}</span>
              <h3 className="text-5xl font-black text-slate-900 uppercase tracking-tighter">{transitSurprise.title}</h3>
              <p className="text-2xl font-bold text-slate-500 italic leading-relaxed">"{transitSurprise.msg}"</p>
              <button 
                onClick={() => setTransitSurprise(null)}
                className="w-full bg-blue-600 text-white py-8 rounded-[3rem] font-black text-3xl uppercase tracking-widest shadow-xl hover:bg-blue-500 transition-all"
              >
                Continue Mission
              </button>
            </div>
          </div>
        )}
        {isLoading && !isTransiting ? ( 
          <div className="fixed inset-0 z-[5000] bg-white flex flex-col items-center justify-center space-y-8">
            <div className="w-32 h-32 border-[12px] border-blue-600 border-t-transparent rounded-full animate-spin"/>
            <h2 className="text-slate-900 text-5xl font-black uppercase tracking-widest animate-pulse">Establishing Tactical Link</h2>
            <p className="text-blue-600 font-bold italic text-xl">Accessing Operative Databases...</p>
          </div> 
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="h-full"
            >
              {activeTab === 'world' && (
              state.currentQuest ? (
                <ScenarioCard 
                  scenario={state.currentQuest.scenarios[state.currentQuest.currentStep]} 
                  currentStep={state.currentQuest.currentStep} 
                  totalSteps={state.currentQuest.scenarios.length} 
                  isLoading={isLoading} 
                  onSelect={e => { 
                    setState(p => {
                      const newResilience = Math.max(0, Math.min(100, p.resilienceScore + (e.resilienceImpact || 0)));
                      const newStealth = Math.max(0, Math.min(100, p.stealthMeter + (e.stealthImpact || 0)));
                      return {
                        ...p, 
                        money: Math.max(0, p.money - e.cost), 
                        health: Math.min(MAX_HEALTH, p.health + e.healthEffect), 
                        resilienceScore: newResilience,
                        stealthMeter: newStealth
                      };
                    }); 
                    setFeedback(e.feedback); 
                  }} 
                  onComplete={(finalStealth) => {
                    if (!state.currentQuest) return;
                    if (state.currentQuest.currentStep + 1 < state.currentQuest.scenarios.length) {
                      setState(p => ({
                        ...p,
                        currentQuest: p.currentQuest ? { ...p.currentQuest, currentStep: p.currentQuest.currentStep + 1 } : null,
                        stealthMeter: finalStealth !== undefined ? finalStealth : p.stealthMeter
                      }));
                    } else {
                      const quest = state.currentQuest;
                      const currentResilience = state.resilienceScore;
                      const fs = finalStealth !== undefined ? finalStealth : state.stealthMeter;
                      
                      setState(p => {
                        const newExp = p.experience + 150;
                        const newLevel = Math.floor(newExp / XP_PER_LEVEL) + 1;
                        const ranks = ['Novice', 'Operative', 'Agent', 'Specialist', 'Elite', 'Master'];
                        const rankIdx = Math.min(ranks.length - 1, Math.floor(newExp / 1000));
                        return {
                          ...p,
                          currentQuest: null,
                          experience: newExp,
                          level: newLevel,
                          agentRank: ranks[rankIdx],
                          questHistory: [...p.questHistory, { title: quest.title, outcome: 'Success' }],
                          stealthMeter: fs,
                          questSummary: {
                            title: quest.title,
                            codename: quest.missionCodename,
                            exp: 150,
                            resilience: currentResilience,
                            stealth: fs
                          }
                        };
                      });
                    }
                  }} 
                  avatar={state.avatar} 
                  location={state.currentLocation} 
                  onHealthChange={d => setState(p => ({...p, health: Math.min(MAX_HEALTH, Math.max(0, p.health + d))}))} 
                />
              ) : state.questSummary ? (
                <ViewContainer title="Mission Debrief">
                  <div className="bg-white p-12 rounded-[4rem] text-center space-y-12 border-[20px] border-slate-50 shadow-6xl relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 to-emerald-500" />
                    <div className="space-y-4">
                       <p className="text-blue-600 font-black text-xs uppercase tracking-[0.6em]">Intelligence Extraction Complete</p>
                       <h3 className="text-6xl font-black text-slate-950 uppercase tracking-tighter leading-none">{state.questSummary.title}</h3>
                       <p className="text-2xl font-bold text-slate-400 italic">Codename: {state.questSummary.codename}</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
                      <div className="bg-blue-50 p-10 rounded-[3.5rem] border-2 border-blue-100">
                         <p className="text-blue-600 font-black uppercase text-[10px] tracking-widest mb-2">Experience Gain</p>
                         <p className="text-5xl font-black text-slate-950">+{state.questSummary.exp}</p>
                      </div>
                      <div className="bg-emerald-50 p-10 rounded-[3.5rem] border-2 border-emerald-100">
                         <p className="text-emerald-600 font-black uppercase text-[10px] tracking-widest mb-2">Final Resilience</p>
                         <p className="text-5xl font-black text-slate-950">{state.questSummary.resilience}%</p>
                      </div>
                      <div className="bg-slate-50 p-10 rounded-[3.5rem] border-2 border-slate-100">
                         <p className="text-slate-600 font-black uppercase text-[10px] tracking-widest mb-2">Stealth Signature</p>
                         <p className="text-5xl font-black text-slate-950">{Math.round(state.questSummary.stealth)}%</p>
                      </div>
                    </div>

                    <div className="bg-slate-50 p-10 rounded-[3rem] border-2 border-slate-100">
                       <p className="text-slate-400 font-bold italic text-xl leading-relaxed">"Mission intelligence has been successfully uploaded to HQ. Sector stability has been updated based on your tactical decisions."</p>
                    </div>

                    <button onClick={() => setState(s => ({ ...s, questSummary: null }))} className="w-full bg-blue-600 text-white py-12 rounded-[4rem] font-black text-4xl uppercase tracking-widest shadow-6xl hover:bg-blue-500 transition-all">Acknowledge Report</button>
                  </div>
                </ViewContainer>
              ) : state.questSummary ? (
                <ViewContainer title="Mission Debrief">
                  <div className="bg-white p-12 rounded-[4rem] text-center space-y-12 border-[20px] border-slate-50 shadow-6xl relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 to-emerald-500" />
                    <div className="space-y-4">
                       <p className="text-blue-600 font-black text-xs uppercase tracking-[0.6em]">Intelligence Extraction Complete</p>
                       <h3 className="text-6xl font-black text-slate-950 uppercase tracking-tighter leading-none">{state.questSummary.title}</h3>
                       <p className="text-2xl font-bold text-slate-400 italic">Codename: {state.questSummary.codename}</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
                      <div className="bg-blue-50 p-10 rounded-[3.5rem] border-2 border-blue-100">
                         <p className="text-blue-600 font-black uppercase text-[10px] tracking-widest mb-2">Experience Gain</p>
                         <p className="text-5xl font-black text-slate-950">+{state.questSummary.exp}</p>
                      </div>
                      <div className="bg-emerald-50 p-10 rounded-[3.5rem] border-2 border-emerald-100">
                         <p className="text-emerald-600 font-black uppercase text-[10px] tracking-widest mb-2">Final Resilience</p>
                         <p className="text-5xl font-black text-slate-950">{state.questSummary.resilience}%</p>
                      </div>
                      <div className="bg-slate-50 p-10 rounded-[3.5rem] border-2 border-slate-100">
                         <p className="text-slate-600 font-black uppercase text-[10px] tracking-widest mb-2">Stealth Signature</p>
                         <p className="text-5xl font-black text-slate-950">{Math.round(state.questSummary.stealth)}%</p>
                      </div>
                    </div>

                    <div className="bg-slate-50 p-10 rounded-[3rem] border-2 border-slate-100">
                       <p className="text-slate-400 font-bold italic text-xl leading-relaxed">"Mission intelligence has been successfully uploaded to HQ. Sector stability has been updated based on your tactical decisions."</p>
                    </div>

                    <button onClick={() => setState(s => ({ ...s, questSummary: null }))} className="w-full bg-blue-600 text-white py-12 rounded-[4rem] font-black text-4xl uppercase tracking-widest shadow-6xl hover:bg-blue-500 transition-all">Acknowledge Report</button>
                  </div>
                </ViewContainer>
              ) : state.dailySummary ? (
                <ViewContainer title="Bio-Economic Synchronization">
                  <div className="bg-white p-12 rounded-[4rem] text-center space-y-12 border-[20px] border-blue-50 shadow-6xl">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
                      <div className="bg-emerald-50 p-10 rounded-[3.5rem] shadow-inner"><p className="text-emerald-600 font-black uppercase text-sm tracking-widest">Yield Harvested</p><p className="text-5xl font-black mt-2 text-slate-950">₹{state.dailySummary.salary}</p></div>
                      <div className="bg-rose-50 p-10 rounded-[3.5rem] shadow-inner"><p className="text-rose-600 font-black uppercase text-sm tracking-widest">Metabolic Drain</p><p className="text-5xl font-black mt-2 text-slate-950">₹{state.dailySummary.livingCosts}</p></div>
                      <div className={`p-10 rounded-[3.5rem] shadow-2xl ${state.dailySummary.moneyDelta >= 0 ? 'bg-blue-600 text-white' : 'bg-rose-600 text-white'}`}><p className="font-black uppercase text-sm tracking-widest opacity-60">Net Accumulation</p><p className="text-5xl font-black mt-2">₹{state.dailySummary.moneyDelta}</p></div>
                    </div>
                    <p className="text-2xl font-bold text-slate-400 italic">"Tactical reserves have been adjusted for sector maintenance standards."</p>
                    <button onClick={() => setState(s => ({ ...s, dailySummary: null }))} className="w-full bg-blue-600 text-white py-12 rounded-[4rem] font-black text-4xl uppercase tracking-widest shadow-6xl">Proceed to Sector Analysis</button>
                  </div>
                </ViewContainer>
              ) : (
                <div className="space-y-12 h-full flex flex-col">
                  <div className="relative flex-1 rounded-[6rem] border-[20px] border-white shadow-6xl bg-slate-50 overflow-hidden min-h-[600px]">
                    <img src={currentLocationData.image} className="w-full h-full object-cover opacity-30 grayscale" />
                    <div className="absolute inset-0 bg-gradient-to-t from-white/90 via-transparent to-white/20" />
                    <div className="absolute top-16 left-16 space-y-2">
                       <span className={`px-6 py-2 rounded-full font-black uppercase text-sm tracking-widest text-white ${currentLocationData.category === 'Urban' ? 'bg-blue-600' : 'bg-emerald-600'}`}>{currentLocationData.category} Sector Infiltration</span>
                       <h2 className="text-8xl font-black text-slate-950 uppercase tracking-tighter leading-none">{state.currentLocation}</h2>
                       <p className="text-slate-400 font-bold text-3xl italic max-w-2xl leading-snug">"{currentLocationData.description}"</p>
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center gap-32">
                      {CITY_POIS[state.currentLocation]?.map(poi => (
                        <button key={poi.id} onClick={() => startQuest(poi)} className="flex flex-col items-center gap-8 group">
                          <div className="w-72 h-72 bg-white p-8 rounded-[5rem] shadow-2xl border-[16px] border-slate-50 flex items-center justify-center text-[160px] group-hover:scale-110 group-hover:border-blue-500 transition-all active:scale-95 duration-500">{poi.icon}</div>
                          <div className="bg-white px-12 py-5 rounded-full text-slate-950 text-lg font-black uppercase tracking-[0.6em] border-2 border-slate-100 shadow-sm">{poi.name}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )
            )}
            
            {activeTab === 'finance' && (
              <ViewContainer title="Strategic Ledger" subtitle="Manage tactical reserves, resilience scores, and recaptured tax capital.">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                  {/* Left Column: Stats & Resilience */}
                  <div className="lg:col-span-2 space-y-8">
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-white p-12 rounded-[5rem] text-slate-900 space-y-10 border-[15px] border-slate-50 shadow-2xl relative overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 p-8">
                         <div className="w-28 h-28 rounded-full border-4 border-blue-500/20 flex flex-col items-center justify-center bg-blue-500/5">
                            <span className="text-blue-500 font-black text-3xl">{financialStats.resilienceScore}</span>
                            <span className="text-[8px] font-black text-blue-500 uppercase tracking-widest">Score</span>
                         </div>
                      </div>
                      <div className="space-y-2">
                        <p className="text-blue-600 font-black uppercase tracking-[0.8em] text-xs">Operative Reserves</p>
                        <h2 className="text-8xl sm:text-9xl font-black leading-none tracking-tighter tabular-nums text-slate-900">₹{state.money.toLocaleString()}</h2>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <motion.div 
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.1 }}
                          className="bg-slate-50 p-8 rounded-[3rem] border-2 border-slate-100 shadow-sm"
                        >
                          <p className="text-slate-400 font-black uppercase text-[10px] tracking-widest mb-2">Net Cycle Harvest</p>
                          <p className={`text-4xl font-black ${financialStats.netDaily >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {financialStats.netDaily >= 0 ? '+' : ''}₹{financialStats.netDaily}
                          </p>
                        </motion.div>
                        <motion.div 
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.2 }}
                          className="bg-slate-50 p-8 rounded-[3rem] border-2 border-slate-100 shadow-sm"
                        >
                          <p className="text-slate-400 font-black uppercase text-[10px] tracking-widest mb-2">Maintenance Cost</p>
                          <p className="text-4xl font-black text-rose-600">₹{financialStats.lifeCosts}</p>
                        </motion.div>
                      </div>
                      {state.insurancePlan && (
                        <motion.div 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="bg-blue-600 p-8 rounded-[3rem] text-white flex items-center justify-between shadow-xl"
                        >
                           <div className="flex items-center gap-6">
                              <span className="text-5xl">{state.insurancePlan.icon}</span>
                              <div>
                                 <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Active Bio-Shield</p>
                                 <p className="text-2xl font-black uppercase">{state.insurancePlan.name}</p>
                              </div>
                           </div>
                           <div className="text-right">
                              <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Coverage</p>
                              <p className="text-2xl font-black">{state.insurancePlan.coveragePercent}%</p>
                           </div>
                        </motion.div>
                      )}
                    </motion.div>

                    <TaxEstimator />

                    {/* Financial Strategy Lab */}
                    <div className="bg-white p-10 rounded-[4rem] border-4 border-slate-50 shadow-xl space-y-8">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center text-blue-500"><CreditCard size={24} /></div>
                        <h3 className="text-2xl font-black uppercase tracking-tight text-slate-900">Financial Strategy Lab</h3>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
                        {[
                          { label: 'Field Ops', key: 'fieldOps', color: 'bg-blue-500' },
                          { label: 'Vitality', key: 'vitality', color: 'bg-emerald-500' },
                          { label: 'Savings', key: 'savings', color: 'bg-purple-500' }
                        ].map(plan => (
                          <div key={plan.key} className="space-y-4">
                            <div className="flex justify-between items-center">
                              <p className="text-[10px] font-black uppercase text-slate-500">{plan.label}</p>
                              <p className="text-lg font-black text-slate-900">{(state.budgetPlan as any)[plan.key]}%</p>
                            </div>
                            <input 
                              type="range" 
                              min="0" 
                              max="100" 
                              value={(state.budgetPlan as any)[plan.key]} 
                              onChange={(e) => {
                                const val = parseInt(e.target.value);
                                setState(prev => ({
                                  ...prev,
                                  budgetPlan: { ...prev.budgetPlan, [plan.key]: val }
                                }));
                              }}
                              className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
                            />
                          </div>
                        ))}
                      </div>
                      <div className="bg-blue-50 p-6 rounded-[2.5rem] border-2 border-blue-100">
                        <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-2">Planning Insight</p>
                        <p className="text-sm font-bold text-blue-800 italic">"Adjusting your budget allocation directly impacts your daily resilience score and long-term capital accumulation."</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                      <div className="bg-white p-10 rounded-[4rem] border-4 border-slate-50 shadow-xl space-y-6">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center text-blue-500"><TrendingUp size={24} /></div>
                          <h3 className="text-xl font-black uppercase tracking-tight text-slate-900">Budget Allocation</h3>
                        </div>
                        <div className="h-64 w-full relative">
                          <ResponsiveContainer width="100%" height={256} minWidth={0}>
                            <PieChart>
                              <Pie
                                data={[
                                  { name: 'Field Ops', value: state.budgetPlan.fieldOps, color: '#3b82f6' },
                                  { name: 'Vitality', value: state.budgetPlan.vitality, color: '#10b981' },
                                  { name: 'Savings', value: state.budgetPlan.savings, color: '#8b5cf6' }
                                ]}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                              >
                                {[0, 1, 2].map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={['#3b82f6', '#10b981', '#8b5cf6'][index]} />
                                ))}
                              </Pie>
                              <Tooltip contentStyle={{ backgroundColor: '#fff', border: 'none', borderRadius: '1rem', color: '#000' }} />
                              <Legend verticalAlign="bottom" height={36}/>
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                      </div>

                      <div className="bg-white p-10 rounded-[4rem] border-4 border-slate-50 space-y-8 shadow-xl">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-500"><Activity size={24} /></div>
                          <h3 className="text-xl font-black uppercase tracking-tight text-slate-900">Credible Metrics</h3>
                        </div>
                        <div className="space-y-6">
                          <div className="flex justify-between items-end border-b-2 border-slate-50 pb-2">
                             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Savings Rate</p>
                             <p className="text-2xl font-black text-slate-900">{financialStats.savingsRate}%</p>
                          </div>
                          <div className="flex justify-between items-end border-b-2 border-slate-50 pb-2">
                             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Expense Ratio</p>
                             <p className="text-2xl font-black text-slate-900">{financialStats.expenseRatio}%</p>
                          </div>
                          <div className="flex justify-between items-end border-b-2 border-slate-50 pb-2">
                             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Resilience Index</p>
                             <p className="text-2xl font-black text-emerald-600">{financialStats.resilienceIndex}/100</p>
                          </div>
                        </div>
                        <p className="text-[10px] font-bold text-slate-400 italic leading-tight">"Metrics influenced by operative reserves, resilience score, and sector maintenance costs."</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                      <div className="bg-white p-8 rounded-[3.5rem] border-4 border-slate-50 shadow-xl flex items-center gap-6">
                        <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center text-3xl">🎯</div>
                        <div>
                           <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Target Sync ETA</p>
                           <p className="text-2xl font-black text-slate-900">{financialStats.cyclesToGoal === Infinity ? 'Critical Drain' : `${financialStats.cyclesToGoal} Cycles`}</p>
                        </div>
                      </div>
                      <div className="bg-white p-8 rounded-[3.5rem] border-4 border-slate-50 shadow-xl flex items-center gap-6">
                        <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center text-3xl">🛡️</div>
                        <div>
                           <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Resilience Buffer</p>
                           <p className="text-2xl font-black text-slate-900">{financialStats.daysOfSurvival} Cycles</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Transaction Audits */}
                  <div className="space-y-8">
                     <div className="flex items-center justify-between px-4">
                        <h3 className="text-2xl font-black uppercase tracking-widest text-slate-900">Audit Logs</h3>
                        <span className="bg-slate-100 px-4 py-1 rounded-full text-[10px] font-black text-slate-500 uppercase">{state.transactions.length} Entries</span>
                     </div>
                     <div className="space-y-4 max-h-[700px] overflow-y-auto px-2 custom-scrollbar">
                       {state.transactions.map(t => (
                         <div key={t.id} className="flex justify-between items-center bg-white p-6 rounded-[2.5rem] border-2 border-slate-50 shadow-md hover:border-blue-100 transition-all group">
                            <div className="text-left">
                              <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest mb-1 group-hover:text-blue-400 transition-colors">Cycle {t.day} • {t.category}</p>
                              <p className="text-lg font-black text-slate-900 leading-tight">{t.description}</p>
                            </div>
                            <p className={`text-xl font-black tabular-nums ${t.type === 'income' ? 'text-emerald-600' : 'text-rose-600'}`}>
                              {t.type === 'income' ? '+' : '-'}₹{t.amount}
                            </p>
                         </div>
                       ))}
                     </div>
                  </div>
                </div>
              </ViewContainer>
            )}

            {activeTab === 'insurance' && (
              <ViewContainer title="Bio-Defense Authorization" subtitle="Secure your operative future with strategic health coverage nodes.">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 pb-20">
                  {INSURANCE_PLANS.map(plan => (
                    <motion.div 
                      key={plan.id}
                      whileHover={{ scale: 1.02, y: -10 }}
                      className={`bg-white p-10 rounded-[4rem] border-[12px] shadow-2xl flex flex-col justify-between relative overflow-hidden transition-all duration-500 ${state.insurancePlan?.id === plan.id ? 'border-blue-500 ring-[15px] ring-blue-500/10' : 'border-slate-50'}`}
                    >
                      {state.insurancePlan?.id === plan.id && (
                        <div className="absolute top-8 right-8 bg-blue-600 text-white px-6 py-2 rounded-full font-black uppercase text-[10px] tracking-widest shadow-lg">Active Policy</div>
                      )}
                      <div className="space-y-8">
                        <div className="w-24 h-24 bg-slate-50 rounded-[2.5rem] flex items-center justify-center text-6xl shadow-inner border border-slate-100">{plan.icon}</div>
                        <div className="space-y-2">
                          <h3 className="text-4xl font-black uppercase text-slate-950 leading-none tracking-tighter">{plan.name}</h3>
                          <p className="text-lg font-bold text-slate-400 italic leading-snug">"{plan.description}"</p>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                           <div className="bg-blue-50 p-6 rounded-[2rem] border border-blue-100">
                              <p className="text-[8px] font-black text-blue-600 uppercase tracking-widest mb-1">Daily Premium</p>
                              <p className="text-2xl font-black text-slate-900">₹{plan.dailyPremium}</p>
                           </div>
                           <div className="bg-emerald-50 p-6 rounded-[2rem] border border-emerald-100">
                              <p className="text-[8px] font-black text-emerald-600 uppercase tracking-widest mb-1">Coverage</p>
                              <p className="text-2xl font-black text-slate-900">{plan.coveragePercent}%</p>
                           </div>
                        </div>

                        <div className="space-y-4">
                           <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest border-b border-slate-100 pb-2">Covered Services</p>
                           <div className="flex flex-wrap gap-2">
                              {plan.coverage.map(c => (
                                <span key={c} className="bg-emerald-50 text-emerald-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-100 flex items-center gap-2">
                                   <CheckCircle2 size={12} /> {c}
                                </span>
                              ))}
                           </div>
                        </div>

                        <div className="space-y-4">
                           <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest border-b border-slate-100 pb-2">Exclusions</p>
                           <div className="flex flex-wrap gap-2">
                              {plan.exclusions.map(e => (
                                <span key={e} className="bg-rose-50 text-rose-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-rose-100 flex items-center gap-2">
                                   <AlertCircle size={12} /> {e}
                                </span>
                              ))}
                           </div>
                        </div>
                      </div>

                      <button 
                        onClick={() => buyInsurance(plan)}
                        disabled={state.insurancePlan?.id === plan.id}
                        className={`mt-12 w-full py-8 rounded-[3rem] font-black text-2xl uppercase tracking-widest shadow-xl transition-all ${state.insurancePlan?.id === plan.id ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-500 active:scale-95'}`}
                      >
                        {state.insurancePlan?.id === plan.id ? 'Policy Active' : 'Authorize Coverage'}
                      </button>
                    </motion.div>
                  ))}
                </div>
              </ViewContainer>
            )}

            {activeTab === 'healthpedia' && (
              <ViewContainer title="Intel Database" subtitle={`Deep-dive intelligence for Bio-Defense in ${currentLocationData.name} Grid.`}>
                 <div className="mb-12">
                   <SearchBar onSearch={(q) => setSearchQuery(q)} />
                 </div>
                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 pb-20">
                    <div className="space-y-12">
                       <BMICalculator />
                       <div className="bg-slate-50 p-12 rounded-[5rem] border-[12px] border-slate-100 shadow-2xl space-y-8">
                          <div className="flex items-center gap-4">
                             <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center text-blue-500"><BookOpen size={24} /></div>
                             <h3 className="text-3xl font-black uppercase tracking-tighter text-slate-900">Acronym Glossary</h3>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                             {[
                               { a: 'AQI', d: 'Air Quality Index' },
                               { a: 'BPM', d: 'Heart Rate (Beats)' },
                               { a: 'ICU', d: 'Intensive Care Unit' },
                               { a: 'BP', d: 'Blood Pressure' },
                               { a: 'BMI', d: 'Body Mass Index' },
                               { a: 'WBC', d: 'White Blood Cells' },
                               { a: 'LDL', d: 'Bad Cholesterol' },
                               { a: 'ORS', d: 'Rehydration Salts' }
                             ].map((item, i) => (
                               <motion.div 
                                 key={item.a}
                                 initial={{ opacity: 0, scale: 0.8 }}
                                 animate={{ opacity: 1, scale: 1 }}
                                 transition={{ delay: i * 0.05 }}
                                 whileHover={{ y: -5, scale: 1.05 }}
                                 className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm"
                               >
                                  <p className="text-blue-600 font-black text-lg">{item.a}</p>
                                  <p className="text-slate-400 text-[10px] font-bold uppercase">{item.d}</p>
                               </motion.div>
                             ))}
                          </div>
                       </div>

                       <h3 className="text-5xl font-black uppercase text-rose-600 border-b-8 border-rose-100 pb-4 inline-block">Local Sector Intelligence</h3>
                       <div className="bg-white p-10 rounded-[4rem] border-4 border-slate-50 shadow-xl">
                          <p className="text-2xl font-bold text-slate-500 italic leading-relaxed">"{SECTOR_INTEL[state.currentLocation] || "Audit in progress..."}"</p>
                       </div>
                       
                       <h3 className="text-5xl font-black uppercase text-rose-600 border-b-8 border-rose-100 pb-4 inline-block">Bio-Defense Archives</h3>
                       <div className="space-y-6">
                         {filteredVault.health.map((tip, idx) => (
                           <div key={idx} className="bg-white p-10 rounded-[4rem] border-4 border-slate-50 shadow-xl hover:translate-x-2 transition-transform group">
                             <div className="flex items-center gap-4 mb-3">
                                <span className="text-3xl group-hover:rotate-12 transition-transform">🧬</span>
                                <p className="text-2xl font-black uppercase text-slate-900 leading-none">{tip.title}</p>
                             </div>
                             <p className="text-xl font-bold text-slate-400 italic leading-relaxed pl-12 border-l-4 border-slate-100">"{tip.tip}"</p>
                           </div>
                         ))}
                       </div>
                    </div>
                    <div className="space-y-12">
                       <h3 className="text-5xl font-black uppercase text-blue-600 border-b-8 border-blue-100 pb-4 inline-block">Fiscal Intelligence Dossiers</h3>
                       <div className="space-y-6">
                         {filteredVault.finance.map((tip, idx) => (
                           <div key={idx} className="bg-white p-10 rounded-[4rem] border-4 border-slate-50 shadow-xl hover:translate-x-2 transition-transform group">
                             <div className="flex items-center gap-4 mb-3">
                                <span className="text-3xl group-hover:scale-110 transition-transform">🏦</span>
                                <p className="text-2xl font-black uppercase text-slate-900 leading-none">{tip.title}</p>
                             </div>
                             <p className="text-xl font-bold text-slate-400 italic leading-relaxed pl-12 border-l-4 border-slate-100">"{tip.tip}"</p>
                           </div>
                         ))}
                       </div>
                    </div>
                 </div>
              </ViewContainer>
            )}

            {activeTab === 'jobs' && (
              <ViewContainer title="Operative Clearance" subtitle={`Authorize for specialized mission paths to generate realistic daily yields.`}>
                <div className="mb-12 bg-white p-8 rounded-[3rem] border-4 border-slate-50 shadow-xl">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-black uppercase text-slate-900">Certification Progress</h3>
                    <span className="text-blue-600 font-black">{jobProgress.cleared} / {jobProgress.total} Cleared</span>
                  </div>
                  <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-600 transition-all duration-1000" 
                      style={{ width: `${(jobProgress.cleared / Math.max(1, jobProgress.total)) * 100}%` }}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pb-20">
                  {filteredJobs.map((job, idx) => (
                    <motion.div 
                      key={job.id}
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: idx * 0.1 }}
                      whileHover={{ scale: 1.02 }}
                      className="p-10 rounded-[4rem] border-[10px] flex flex-col justify-between bg-white border-slate-50 shadow-xl hover:border-blue-500/50 transition-all group relative overflow-hidden"
                    >
                      <div className="space-y-6">
                        <div className="flex justify-between items-start">
                          <p className="text-blue-600 font-black text-xs uppercase tracking-[0.4em]">{job.company}</p>
                          <div className="bg-emerald-50 text-emerald-600 px-4 py-1 rounded-full font-black text-[10px] border border-emerald-100">₹{job.dailySalary}/cycle</div>
                        </div>
                        <h3 className="text-4xl font-black uppercase text-slate-900 leading-tight tracking-tighter">{job.title}</h3>
                        <p className="text-lg font-bold text-slate-400 italic leading-relaxed">"{job.description}"</p>
                        <div className="flex flex-wrap gap-2">
                           <span className="bg-slate-50 text-slate-500 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-slate-100">Topic: {job.requiredTopic}</span>
                           <span className="bg-slate-50 text-slate-500 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-slate-100">Req: {job.passingScore}%</span>
                        </div>
                      </div>
                      <div className="mt-8">
                        {state.jobs.includes(job.id) ? (
                          <div className="w-full bg-emerald-50 text-emerald-600 py-6 rounded-[2.5rem] font-black text-xl uppercase text-center border-2 border-emerald-100 shadow-inner">Cleared Operative</div>
                        ) : (
                          <button onClick={() => { setCurrentJobTest(job); setTestAnswers(new Array(job.questions.length).fill('')); }} className="w-full bg-blue-600 text-white py-6 rounded-[2.5rem] font-black text-2xl hover:bg-blue-500 transition-all shadow-xl hover:scale-[1.02] active:scale-95 uppercase tracking-widest">Apply for Clearance</button>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </ViewContainer>
            )}

            {activeTab === 'shop' && (
              <ViewContainer title="Tactical Supply" subtitle="Acquire bio-shielding gear and metabolic recovery fuel for field longevity.">
                 <div className="flex gap-4 mb-12 overflow-x-auto pb-4 custom-scrollbar">
                   {['all', 'food', 'medicine', 'gear'].map(cat => (
                     <button 
                       key={cat} 
                       onClick={() => setShopFilter(cat as any)}
                       className={cn(
                         "px-8 py-3 rounded-full font-black uppercase text-xs tracking-widest border-2 transition-all whitespace-nowrap",
                         shopFilter === cat ? "bg-blue-600 text-white border-blue-600 shadow-lg" : "bg-white text-slate-400 border-slate-100 hover:border-slate-200"
                       )}
                     >
                       {cat}
                     </button>
                   ))}
                 </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 pb-20">
                    {SHOP_ITEMS.filter(item => shopFilter === 'all' || item.type === shopFilter).map((item, idx) => (
                      <motion.div 
                        key={item.id}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: idx * 0.05 }}
                        whileHover={{ scale: 1.03 }}
                        className="bg-white p-8 rounded-[4rem] border-[12px] border-slate-50 shadow-xl flex flex-col justify-between transition-all duration-500 group relative overflow-hidden"
                      >
                        <div className="space-y-6">
                          <div className="w-32 h-32 bg-slate-50 rounded-[3.5rem] flex items-center justify-center text-7xl mx-auto shadow-inner group-hover:scale-110 transition-transform border border-slate-100">{item.icon}</div>
                          <div className="text-center space-y-2">
                            <h3 className="text-3xl font-black uppercase text-slate-900 leading-none">{item.name}</h3>
                            <p className="text-lg font-bold text-slate-500 italic leading-snug">"{item.description}"</p>
                          </div>
                          <div className="bg-emerald-50 py-3 px-6 rounded-full text-emerald-600 text-center font-black uppercase text-[11px] tracking-widest border border-emerald-100">+{item.healthBenefit}% Bio-Sync</div>
                        </div>
                        <button onClick={() => buyItem(item)} className="mt-8 w-full bg-blue-600 text-white py-8 rounded-[3.5rem] font-black text-3xl flex items-center justify-center gap-6 hover:bg-blue-500 transition-all shadow-xl active:scale-95"><span>₹{item.cost}</span> <span>Acquire</span></button>
                      </motion.div>
                    ))}
                  </div>
              </ViewContainer>
            )}

             {activeTab === 'travel' && (
              <ViewContainer title="Transit Grid" subtitle="Infiltrate between 10 Indian sectors via high-speed capital flight.">
                <div className="flex gap-4 mb-8 overflow-x-auto pb-2 custom-scrollbar">
                  {['All', 'Urban', 'Rural'].map(cat => (
                    <button 
                      key={cat} 
                      onClick={() => setTravelFilter(cat as any)}
                      className={cn(
                        "px-8 py-3 rounded-full font-black uppercase text-xs tracking-widest border-2 transition-all whitespace-nowrap",
                        travelFilter === cat ? "bg-blue-600 text-white border-blue-600 shadow-lg" : "bg-white text-slate-400 border-slate-100 hover:border-slate-200"
                      )}
                    >
                      {cat} Sectors
                    </button>
                  ))}
                </div>
                <div className="mb-12 bg-slate-950 p-12 rounded-[5rem] shadow-2xl relative overflow-hidden border-[15px] border-slate-900">
                  <div className="absolute inset-0 opacity-20 pointer-events-none">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-500/20 via-transparent to-transparent" />
                    <div className="w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
                  </div>
                  <div className="relative z-10 space-y-8">
                    <div className="flex justify-between items-center">
                      <div className="space-y-1">
                        <h3 className="text-3xl font-black text-white uppercase tracking-tighter">Tactical Transit Map</h3>
                        <p className="text-blue-400 font-bold text-sm uppercase tracking-widest">Active Sector: {state.currentLocation}</p>
                      </div>
                      <div className="flex items-center gap-3 bg-blue-500/10 px-6 py-3 rounded-full border border-blue-500/20">
                        <div className="w-3 h-3 bg-blue-500 rounded-full animate-ping" />
                        <span className="text-blue-400 font-black text-xs uppercase tracking-widest">Live Grid Sync</span>
                      </div>
                    </div>
                    
                    <div className="h-96 w-full bg-slate-900/50 rounded-[3rem] border-2 border-slate-800 relative overflow-hidden group">
                      <svg className="w-full h-full" viewBox="0 0 800 400">
                        {Object.entries(LOCATIONS_DATA).map(([id, data]: [string, any], idx) => {
                          const x = 100 + (idx % 5) * 150;
                          const y = data.category === 'Urban' ? 100 : 300;
                          const currentData = LOCATIONS_DATA[state.currentLocation];
                          const currentIdx = Object.keys(LOCATIONS_DATA).indexOf(state.currentLocation);
                          const curX = 100 + (currentIdx % 5) * 150;
                          const curY = currentData.category === 'Urban' ? 100 : 300;
                          
                          return (
                            <motion.line 
                              key={`line-${id}`}
                              x1={curX} y1={curY} x2={x} y2={y}
                              stroke={state.currentLocation === id ? "transparent" : "rgba(59, 130, 246, 0.1)"}
                              strokeWidth="2"
                              strokeDasharray="4 4"
                            />
                          );
                        })}
                        
                        {Object.entries(LOCATIONS_DATA).map(([id, data]: [string, any], idx) => {
                          const x = 100 + (idx % 5) * 150;
                          const y = data.category === 'Urban' ? 100 : 300;
                          const isActive = state.currentLocation === id;
                          
                          return (
                            <g key={id} className="cursor-pointer" onClick={() => {
                              const el = document.getElementById(`loc-card-${id}`);
                              if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                            }}>
                              <motion.circle 
                                cx={x} cy={y} r={isActive ? 12 : 6}
                                fill={isActive ? "#3b82f6" : "#475569"}
                                initial={false}
                                animate={{ r: isActive ? [12, 16, 12] : 6 }}
                                transition={{ repeat: Infinity, duration: 2 }}
                              />
                              <text x={x} y={y + 25} textAnchor="middle" className="fill-slate-500 text-[10px] font-black uppercase tracking-widest">{id}</text>
                              {isActive && (
                                <motion.circle 
                                  cx={x} cy={y} r={24}
                                  stroke="#3b82f6" strokeWidth="2" fill="transparent"
                                  initial={{ scale: 0, opacity: 0 }}
                                  animate={{ scale: 1, opacity: [0.5, 0] }}
                                  transition={{ repeat: Infinity, duration: 1.5 }}
                                />
                              )}
                            </g>
                          );
                        })}
                      </svg>
                      
                      <div className="absolute top-6 right-6 flex flex-col gap-2">
                        <div className="flex items-center gap-2"><div className="w-3 h-3 bg-blue-500 rounded-full" /><span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Sector</span></div>
                        <div className="flex items-center gap-2"><div className="w-3 h-3 bg-slate-600 rounded-full" /><span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Available Node</span></div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mb-12 bg-white p-10 rounded-[4rem] border-[10px] border-slate-50 shadow-xl">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-600"><MapIcon size={24} /></div>
                    <h3 className="text-2xl font-black uppercase tracking-tighter text-slate-950">Sector Risk Analysis</h3>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                    {Object.entries(LOCATIONS_DATA)
                      .filter(([_, data]: [string, any]) => travelFilter === 'All' || data.category === travelFilter)
                      .map(([id, data]: [string, any]) => {
                        const risk = data.healthImpact < -7 ? 'Critical' : data.healthImpact < -4 ? 'High' : 'Moderate';
                        return (
                          <div key={id} className="bg-slate-50 p-4 rounded-3xl border border-slate-100 text-center space-y-2">
                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{id}</p>
                            <div className={cn(
                              "text-[10px] font-black uppercase px-2 py-0.5 rounded-full inline-block",
                              risk === 'Critical' ? "bg-rose-100 text-rose-600" : risk === 'High' ? "bg-orange-100 text-orange-600" : "bg-emerald-100 text-emerald-600"
                            )}>
                              {risk}
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pb-20">
                  {Object.entries(LOCATIONS_DATA)
                    .filter(([_, data]: [string, any]) => travelFilter === 'All' || data.category === travelFilter)
                    .map(([id, data]: [string, any], idx) => (
                    <motion.div 
                      key={id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: idx * 0.1 }}
                      whileHover={{ y: -10 }}
                      className={`bg-white rounded-[5rem] border-[15px] shadow-xl overflow-hidden flex flex-col transition-all duration-500 ${state.currentLocation === id ? 'border-blue-500 ring-8 ring-blue-500/10' : 'border-slate-50 hover:border-slate-100'}`}
                    >
                       <div className="h-64 relative">
                          <img src={data.image} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-gradient-to-t from-white/60 to-transparent" />
                          <div className="absolute bottom-8 left-10">
                            <h3 className="text-5xl font-black text-slate-950 uppercase tracking-tighter drop-shadow-sm">{data.name}</h3>
                            <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-white ${data.category === 'Urban' ? 'bg-blue-600' : 'bg-emerald-600'}`}>{data.category} Grid</span>
                          </div>
                       </div>
                       <div className="p-12 flex-1 flex flex-col justify-between space-y-10">
                          <p className="text-slate-400 font-bold italic text-2xl leading-relaxed">"{data.description}"</p>
                          <div className="grid grid-cols-2 gap-6">
                             <div className="bg-rose-50 p-8 rounded-[3rem] text-center border-2 border-rose-100"><p className="text-xs font-black uppercase text-rose-600 tracking-widest">Sector Cost</p><p className="text-4xl font-black text-slate-950 mt-1">₹{data.dailyCost}</p></div>
                             <div className="bg-emerald-50 p-8 rounded-[3rem] text-center border-2 border-emerald-100"><p className="text-xs font-black uppercase text-emerald-600 tracking-widest">Base Vitality</p><p className="text-4xl font-black text-slate-950 mt-1">{data.healthImpact > 0 ? '+' : ''}{data.healthImpact}% HP</p></div>
                          </div>
                          {state.currentLocation === id ? (
                            <div className="w-full py-10 rounded-[4rem] bg-slate-50 text-slate-400 font-black text-3xl uppercase text-center tracking-widest border-2 border-slate-100">Active Infiltration</div>
                          ) : (
                            <button onClick={() => travelTo(id as LocationType)} className="w-full py-10 rounded-[4rem] bg-blue-600 text-white font-black text-3xl uppercase hover:bg-blue-500 transition-all flex items-center justify-center gap-6 shadow-xl active:scale-95"><span>Authorize Flight: ₹{data.travelCost}</span></button>
                          )}
                       </div>
                    </motion.div>
                  ))}
                </div>
               </ViewContainer>
             )}
            </motion.div>
            </AnimatePresence>
        )}
      </main>

      <nav className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[95%] max-w-7xl bg-white/80 backdrop-blur-3xl rounded-[80px] py-6 px-16 z-[1000] shadow-[0_30px_100px_rgba(0,0,0,0.1)] flex justify-between items-center border-[8px] border-slate-50">
         <div className="flex gap-10">
            {[
              {id: 'world', icon: '🌍', label: 'Sector'}, 
              {id: 'finance', icon: 'Ledger', label: 'Ledger'}, 
              {id: 'insurance', icon: '🛡️', label: 'Shield'},
              {id: 'travel', icon: '✈️', label: 'Transit'}
            ].map(t => (
              <button key={t.id} onClick={() => setActiveTab(t.id as any)} className={`flex flex-col items-center transition-all p-4 rounded-[35px] ${activeTab === t.id ? 'bg-blue-500/10 text-blue-600 scale-125 filter drop-shadow-xl font-black' : 'text-slate-400 hover:text-slate-600'}`}>
                <span className="text-4xl leading-none">{t.id === 'finance' ? '🏦' : t.icon}</span>
                <span className="text-[10px] font-black uppercase mt-2 tracking-widest">{t.label}</span>
              </button>
            ))}
         </div>
         <div className="relative -translate-y-12">
            <div className="w-24 h-24 bg-white border-[8px] border-slate-50 shadow-7xl rounded-full flex items-center justify-center ring-[12px] ring-blue-500/10 overflow-hidden hover:scale-110 transition-transform cursor-pointer" onClick={() => setActiveTab('world')}>
               <img src={state.avatar?.image || ''} className="w-full h-full object-contain" />
            </div>
         </div>
         <div className="flex gap-10">
            {[{id: 'shop', icon: '🛒', label: 'Supply'}, {id: 'jobs', icon: '💼', label: 'Clearance'}, {id: 'healthpedia', icon: '📖', label: 'Intel'}].map(t => (
              <button key={t.id} onClick={() => setActiveTab(t.id as any)} className={`flex flex-col items-center transition-all p-4 rounded-[35px] ${activeTab === t.id ? 'bg-blue-600/10 text-blue-600 scale-125 filter drop-shadow-xl font-black' : 'text-slate-400 hover:text-slate-600'}`}>
                <span className="text-4xl leading-none">{t.icon}</span>
                <span className="text-[10px] font-black uppercase mt-2 tracking-widest">{t.label}</span>
              </button>
            ))}
         </div>
      </nav>

      {currentJobTest && (
        <div className="fixed inset-0 z-[3000] bg-slate-900/60 backdrop-blur-xl flex items-center justify-center p-2 sm:p-4">
          <div className="bg-white rounded-[4rem] max-w-6xl w-full p-6 sm:p-10 shadow-2xl space-y-6 max-h-[94vh] flex flex-col border-[12px] border-slate-50 relative overflow-hidden">
            {!examResult ? (
              <>
                <div className="text-center flex-shrink-0 space-y-2">
                  <div className="flex justify-between items-center mb-2 px-4">
                    <button onClick={() => setCurrentJobTest(null)} className="text-slate-400 font-black uppercase text-[10px] hover:text-rose-500 transition-colors tracking-widest bg-slate-50 px-4 py-2 rounded-full">Abort Auth</button>
                    <div className="flex gap-1.5">
                      {currentJobTest.questions.map((_, qidx) => (
                        <div key={qidx} className={`w-2.5 h-2.5 rounded-full transition-all ${testAnswers[qidx] !== '' ? 'bg-blue-600 shadow-[0_0_8px_rgba(37,99,235,0.4)]' : 'bg-slate-100'}`} />
                      ))}
                    </div>
                    <div className="text-blue-600 font-black uppercase text-[10px] tracking-widest bg-blue-50 px-4 py-2 rounded-full">Score Req: {currentJobTest.passingScore}%</div>
                  </div>
                  <h2 className="text-4xl sm:text-5xl font-black uppercase leading-none text-slate-950 tracking-tighter">Operative Clearance Exam</h2>
                  <p className="text-slate-400 font-black text-xs uppercase tracking-[0.3em] border-y-2 border-slate-50 py-1.5 inline-block">{currentJobTest.title}</p>
                </div>
                
                <div className="flex-1 overflow-y-auto px-2 sm:px-6 space-y-10 py-4 custom-scrollbar scroll-smooth" ref={examScrollRef}>
                  <div className="space-y-6">
                    <div className="border-l-4 border-blue-500 pl-4 py-1">
                       <h3 className="text-2xl font-black uppercase tracking-tighter text-slate-900">Module 1: Technical Interrogations (65%)</h3>
                       <p className="text-slate-400 font-bold italic text-sm">Validating core healthcare and financial literacy nodes.</p>
                    </div>
                    {currentJobTest.questions.filter(q => q.type === 'mcq').map((q, idx) => (
                      <div key={idx} className="bg-slate-50 p-6 rounded-[2.5rem] border-4 border-slate-100 text-left space-y-4 animate-in slide-in-from-right-10 duration-500" style={{ animationDelay: `${idx * 50}ms` }}>
                        <div className="flex items-start gap-4">
                           <span className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-black text-sm flex-shrink-0 shadow-md">0{idx + 1}</span>
                           <p className="text-xl font-black leading-tight text-slate-900 pt-1">{q.question}</p>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                          {q.options?.map((opt, oIdx) => (
                            <button 
                              key={oIdx} 
                              onClick={() => { const n = [...testAnswers]; n[idx] = oIdx; setTestAnswers(n); }} 
                              className={`p-4 rounded-[1.5rem] border-2 font-black text-sm transition-all flex items-center gap-4 ${testAnswers[idx] === oIdx ? 'bg-blue-600 text-white border-blue-400' : 'bg-white text-slate-500 hover:bg-slate-50 border-slate-100'}`}
                            >
                               <span className={`w-7 h-7 rounded-full border-2 flex items-center justify-center text-[10px] flex-shrink-0 ${testAnswers[idx] === oIdx ? 'bg-blue-400 border-white' : 'bg-slate-50 border-slate-200'}`}>{String.fromCharCode(65 + oIdx)}</span>
                               <span className="flex-1">{opt}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-6 pb-12">
                    <div className="border-l-4 border-emerald-500 pl-4 py-1">
                       <h3 className="text-2xl font-black uppercase tracking-tighter text-slate-900">Module 2: Field Reports (35%)</h3>
                       <p className="text-slate-400 font-bold italic text-sm">Synthesize complex bio-economic scenarios into actionable intelligence.</p>
                    </div>
                    {currentJobTest.questions.filter(q => q.type === 'text').map((q, idx) => {
                      const realIdx = currentJobTest.questions.findIndex(og => og.question === q.question);
                      return (
                        <div key={idx} className="bg-emerald-50 p-6 rounded-[2.5rem] border-4 border-emerald-100 text-left space-y-4 animate-in slide-in-from-right-10 duration-500" style={{ animationDelay: `${(idx + 7) * 50}ms` }}>
                          <div className="flex items-start gap-4">
                             <span className="w-10 h-10 bg-emerald-600 text-white rounded-full flex items-center justify-center font-black text-sm flex-shrink-0 shadow-md">0{idx + 8}</span>
                             <p className="text-xl font-black leading-tight text-slate-900 pt-1">{q.question}</p>
                          </div>
                          <div className="mt-3">
                            <textarea 
                              rows={3} 
                              value={testAnswers[realIdx] as string || ''} 
                              onChange={(e) => { const n = [...testAnswers]; n[realIdx] = e.target.value; setTestAnswers(n); }}
                              className="w-full bg-white border-2 border-emerald-200 rounded-[1.5rem] p-6 text-slate-900 font-bold focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all placeholder:text-slate-300"
                              placeholder="Input tactical analysis..."
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="flex-shrink-0 w-full pt-4 border-t-4 border-slate-50">
                  <button 
                    onClick={handleTestSubmit}
                    disabled={isGrading || testAnswers.includes('')}
                    className="w-full bg-blue-600 text-white py-8 rounded-[3rem] font-black text-3xl uppercase tracking-widest shadow-xl hover:bg-emerald-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-4"
                  >
                    {isGrading ? (
                      <>
                        <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Grading Protocol...</span>
                      </>
                    ) : (
                      <span>Submit for Evaluation</span>
                    )}
                  </button>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center space-y-10 text-center p-12 animate-in zoom-in-95 duration-500">
                <div className={`w-48 h-48 rounded-full flex items-center justify-center text-7xl shadow-2xl ${examResult.passed ? 'bg-emerald-500 text-white animate-bounce' : 'bg-rose-500 text-white animate-shake'}`}>
                  {examResult.passed ? '✅' : '❌'}
                </div>
                <div className="space-y-4">
                  <h2 className="text-7xl font-black uppercase text-slate-950 tracking-tighter leading-none">{examResult.passed ? 'Clearance Granted' : 'Clearance Denied'}</h2>
                  <p className="text-3xl font-black text-slate-400 uppercase tracking-widest">Score: {examResult.score}%</p>
                </div>
                <div className="bg-slate-50 p-10 rounded-[4rem] border-4 border-slate-100 max-w-3xl">
                  <p className="text-2xl font-bold text-slate-500 italic leading-relaxed pl-8 border-l-8 border-blue-500">"{examResult.advice || examResult.feedback}"</p>
                </div>
                <button 
                  onClick={() => {
                    setCurrentJobTest(null);
                    setExamResult(null);
                  }}
                  className={`w-full max-w-xl py-8 rounded-[3rem] font-black text-3xl uppercase tracking-widest shadow-xl transition-all ${examResult.passed ? 'bg-emerald-600 hover:bg-emerald-500 text-white' : 'bg-blue-600 hover:bg-blue-500 text-white'}`}
                >
                  {examResult.passed ? 'Begin Operations' : 'Return to Field'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
