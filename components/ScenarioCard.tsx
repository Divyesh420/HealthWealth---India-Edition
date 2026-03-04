
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from "motion/react";
import { Scenario, ScenarioOption, InvestigationPoint, Avatar, LocationType, Obstacle } from '../types';
import { LOCATIONS_DATA } from '../constants';
import { getTacticalAdvice } from '../services/geminiService';
import { cn } from '../utils';

interface ScenarioCardProps {
  scenario: Scenario;
  currentStep: number;
  totalSteps: number;
  onSelect: (option: ScenarioOption) => void;
  onComplete: (stealth: number) => void;
  isLoading: boolean;
  avatar: Avatar | null;
  location: LocationType;
  onHealthChange?: (delta: number) => void;
}

type Tool = 'bio-scan' | 'sig-int' | 'hum-int' | null;

const FULL_KEYS = [
  '1','2','3','4','5','6','7','8','9','0',
  'A','B','C','D','E','F','G','H','I','J',
  'K','L','M','N','O','P','Q','R','S','T',
  'U','V','W','X','Y','Z'
];

const getIconUrl = (keyword: string) => {
  const kw = (keyword || '').toLowerCase();
  if (kw.includes('virus') || kw.includes('germ') || kw.includes('pathogen')) return "https://img.icons8.com/fluency/144/virus.png";
  if (kw.includes('water') || kw.includes('well')) return "https://img.icons8.com/fluency/144/water.png";
  if (kw.includes('doctor') || kw.includes('nurse')) return "https://img.icons8.com/fluency/144/doctor-female.png";
  if (kw.includes('trash') || kw.includes('waste')) return "https://img.icons8.com/fluency/144/trash.png";
  if (kw.includes('pills') || kw.includes('med')) return "https://img.icons8.com/fluency/144/pills.png";
  if (kw.includes('microscope')) return "https://img.icons8.com/fluency/144/microscope.png";
  if (kw.includes('heart') || kw.includes('health')) return "https://img.icons8.com/fluency/144/heart-health.png";
  if (kw.includes('house') || kw.includes('village')) return "https://img.icons8.com/fluency/144/house.png";
  if (kw.includes('dna') || kw.includes('code')) return "https://img.icons8.com/fluency/144/dna-helix.png";
  return "https://img.icons8.com/fluency/144/medical-case.png"; 
};

const ScenarioCard: React.FC<ScenarioCardProps> = ({ scenario, currentStep, totalSteps, onSelect, onComplete, isLoading, avatar, location, onHealthChange }) => {
  const [inspectedIds, setInspectedIds] = useState<string[]>([]);
  const [selectedTool, setSelectedTool] = useState<Tool>(null);
  const [activeDossier, setActiveDossier] = useState<InvestigationPoint | null>(null);
  const [activePuzzle, setActivePuzzle] = useState<InvestigationPoint | null>(null);
  const [puzzleProgress, setPuzzleProgress] = useState<string>('');
  const [message, setMessage] = useState<{ text: string, type: 'info' | 'success' | 'error' } | null>(null);
  const [shake, setShake] = useState(false);
  const [revealedIds, setRevealedIds] = useState<string[]>([]);
  const [showSynthesisBoard, setShowSynthesisBoard] = useState(false);
  const [decisionPhase, setDecisionPhase] = useState(false);
  const [simulatingOption, setSimulatingOption] = useState<ScenarioOption | null>(null);
  const [decisionOutcome, setDecisionOutcome] = useState<ScenarioOption | null>(null);
  const [showEvidenceBoard, setShowEvidenceBoard] = useState(false);

  const [pos, setPos] = useState({ x: 50, y: 50 });
  const [isSlowed, setIsSlowed] = useState(false);
  const [isTakingDamage, setIsTakingDamage] = useState(false);
  const [isTimeWarped, setIsTimeWarped] = useState(false);
  const [timeLeft, setTimeLeft] = useState(100); 
  
  const [showCommsTerminal, setShowCommsTerminal] = useState(false);
  const [agentInput, setAgentInput] = useState('');
  const [aiAdvice, setAiAdvice] = useState<string | null>(null);
  const [isFetchingAdvice, setIsFetchingAdvice] = useState(false);
  
  const requestRef = useRef<number>(null);
  const keys = useRef<Set<string>>(new Set());
  const posRef = useRef({ x: 50, y: 50 });
  const velRef = useRef({ x: 0, y: 0 });
  const nearPointRef = useRef<InvestigationPoint | null>(null);
  const selectedToolRef = useRef<Tool>(null);
  const activeObstacles = useRef<Obstacle[]>([]);

  const [stealthLevel, setStealthLevel] = useState(100);
  const [signalStrength, setSignalStrength] = useState(0);

  useEffect(() => {
    const cleanObstacles = (scenario.obstacles || []).filter(obs => {
      const distToSpawn = Math.sqrt(Math.pow(obs.x - 50, 2) + Math.pow(obs.y - 50, 2));
      return distToSpawn > obs.radius + 12;
    });
    activeObstacles.current = cleanObstacles;
    posRef.current = { x: 50, y: 50 };
    setPos({ x: 50, y: 50 });
    velRef.current = { x: 0, y: 0 };
    setTimeLeft(100); 
    setStealthLevel(100);
  }, [scenario]);

  useEffect(() => {
    selectedToolRef.current = selectedTool;
  }, [selectedTool]);

  useEffect(() => {
    setInspectedIds([]);
    setRevealedIds([]);
    setSelectedTool(null);
    setMessage(null);
    setShowSynthesisBoard(false);
    setDecisionPhase(false);
    setSimulatingOption(null);
    setDecisionOutcome(null);
    setAiAdvice(null);
  }, [scenario]);

  useEffect(() => {
    if (showSynthesisBoard || decisionPhase || activePuzzle || activeDossier || decisionOutcome) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 0) return 0;
        return prev - (isTimeWarped ? 3 : 1);
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [showSynthesisBoard, decisionPhase, activePuzzle, activeDossier, isTimeWarped]);

  useEffect(() => {
    const loop = () => {
      if (activePuzzle || activeDossier || showSynthesisBoard || decisionPhase || showCommsTerminal || decisionOutcome) {
        requestRef.current = requestAnimationFrame(loop);
        return;
      }

      const friction = 0.88;
      const accel = 0.5;
      const maxSpeed = 2.2;

      let ax = 0; let ay = 0;
      if (keys.current.has('arrowup') || keys.current.has('w')) ay -= accel;
      if (keys.current.has('arrowdown') || keys.current.has('s')) ay += accel;
      if (keys.current.has('arrowleft') || keys.current.has('a')) ax -= accel;
      if (keys.current.has('arrowright') || keys.current.has('d')) ax += accel;

      let vx = (velRef.current.x + ax) * friction;
      let vy = (velRef.current.y + ay) * friction;

      const speed = Math.sqrt(vx * vx + vy * vy);
      if (speed > maxSpeed) {
        vx = (vx / speed) * maxSpeed;
        vy = (vy / speed) * maxSpeed;
      }

      let nx = posRef.current.x + vx;
      let ny = posRef.current.y + vy;

      nx = Math.max(3, Math.min(97, nx));
      ny = Math.max(3, Math.min(97, ny));

      let slowActive = false;
      let hazardActive = false;

      for (const obs of activeObstacles.current) {
        const dx = nx - obs.x; 
        const dy = ny - obs.y;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < obs.radius) {
          if (obs.type === 'block') {
            nx += (dx / d) * ((obs.radius - d) + 0.1);
            ny += (dy / d) * ((obs.radius - d) + 0.1);
            vx *= 0.5; vy *= 0.5;
          } else if (obs.type === 'slow') {
            slowActive = true;
          } else if (obs.type === 'hazard') {
            hazardActive = true;
          } else if (obs.type === 'multi') {
            slowActive = true;
            hazardActive = true;
          }
        }
      }

      if (slowActive) {
        vx *= 0.4; vy *= 0.4;
        setIsSlowed(true);
      } else {
        setIsSlowed(false);
      }

      if (hazardActive) {
        setIsTakingDamage(true);
        if (onHealthChange) onHealthChange(-0.05); // Small drain per frame
        setStealthLevel(prev => Math.max(0, prev - 0.1));
      } else {
        setIsTakingDamage(false);
      }

      posRef.current = { x: nx, y: ny }; 
      velRef.current = { x: vx, y: vy };
      setPos({ x: nx, y: ny });

      let currentNear = null;
      let maxSignal = 0;
      for (const pt of scenario.investigationPoints) {
        const dist = Math.sqrt(Math.pow(nx - pt.x, 2) + Math.pow(ny - pt.y, 2));
        const signal = Math.max(0, 100 - (dist * 2));
        if (signal > maxSignal) maxSignal = signal;
        if (dist < 10) {
          currentNear = pt;
          if (!revealedIds.includes(pt.id)) setRevealedIds(curr => [...curr, pt.id]);
        }
      }
      setSignalStrength(Math.round(maxSignal));
      nearPointRef.current = currentNear;
      requestRef.current = requestAnimationFrame(loop);
    };

    const handleKeyDown = (e: KeyboardEvent) => { if (!showCommsTerminal) keys.current.add(e.key.toLowerCase()); };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (!showCommsTerminal) {
        keys.current.delete(e.key.toLowerCase());
        if (e.key.toLowerCase() === 'e') handleAction();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    requestRef.current = requestAnimationFrame(loop);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [scenario, activePuzzle, activeDossier, showSynthesisBoard, decisionPhase, revealedIds, onHealthChange, showCommsTerminal]);

  const handleAction = () => {
    const pt = nearPointRef.current;
    const tool = selectedToolRef.current;
    if (!pt || activePuzzle || activeDossier) return;
    if (!tool) { setMessage({ text: "SYNC TOOL REQUIRED", type: 'error' }); triggerShake(); return; }
    if (tool === pt.requiredTool) {
      if (!inspectedIds.includes(pt.id)) { setActivePuzzle(pt); setPuzzleProgress(''); setMessage(null); }
      else setActiveDossier(pt);
    } else { setMessage({ text: "INCOMPATIBLE GEAR", type: 'error' }); triggerShake(); }
  };

  const sendAgentMessage = async () => {
    if (!agentInput.trim() || isFetchingAdvice) return;
    setIsFetchingAdvice(true);
    const findings = scenario.investigationPoints.filter(p => inspectedIds.includes(p.id)).map(p => `${p.subLocation}: ${p.clueResult}`);
    const advice = await getTacticalAdvice(scenario, findings, agentInput);
    setAiAdvice(advice); setAgentInput(''); setIsFetchingAdvice(false);
  };

  const handlePuzzleInput = (char: string) => {
    if (!activePuzzle) return;
    const target = activePuzzle.puzzleCode || 'DNA';
    const next = puzzleProgress + char;
    setPuzzleProgress(next);
    if (next === target) {
      setInspectedIds(prev => [...prev, activePuzzle.id]);
      setActiveDossier(activePuzzle); setActivePuzzle(null);
      setMessage({ text: "LINK ESTABLISHED", type: 'success' });
    } else if (!target.startsWith(next)) {
      setPuzzleProgress(''); triggerShake();
      setMessage({ text: "SIGNAL LOSS", type: 'error' });
    }
  };

  const [showFinalChallenge, setShowFinalChallenge] = useState(false);
  const [extractionProgress, setExtractionProgress] = useState(0);
  const [extractionFailed, setExtractionFailed] = useState(false);

  const startExtraction = () => {
    setShowFinalChallenge(true);
    setExtractionProgress(0);
    setExtractionFailed(false);
  };

  const handleExtractionTap = () => {
    if (extractionFailed) return;
    setExtractionProgress(prev => {
      const next = prev + 5;
      if (next >= 100) {
        setTimeout(() => onComplete(stealthLevel), 1000);
        return 100;
      }
      return next;
    });
  };

  useEffect(() => {
    if (showFinalChallenge && extractionProgress < 100 && !extractionFailed) {
      const interval = setInterval(() => {
        setExtractionProgress(prev => {
          const next = prev - 1.5;
          if (next <= 0) return 0;
          return next;
        });
      }, 100);
      return () => clearInterval(interval);
    }
  }, [showFinalChallenge, extractionProgress, extractionFailed]);

  const triggerShake = () => { setShake(true); setTimeout(() => setShake(false), 500); };

  if (isLoading) return <div className="p-32 text-center text-4xl font-black text-slate-400 animate-pulse uppercase tracking-widest">Initializing Sector Synchronization...</div>;

  const allPointsInspected = inspectedIds.length === scenario.investigationPoints.length;

  return (
    <div className={`flex flex-col gap-8 max-w-6xl mx-auto mb-32 ${shake ? 'animate-shake' : ''}`}>
      <AnimatePresence>
        {showFinalChallenge && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-[9000] bg-slate-950 flex flex-col items-center justify-center p-8 overflow-hidden"
          >
            <div className="absolute inset-0 opacity-20">
               <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(59,130,246,0.2)_0%,transparent_70%)] animate-pulse" />
               <div className="h-full w-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-30" />
            </div>
            
            <div className="relative z-10 max-w-2xl w-full text-center space-y-12">
               <div className="space-y-4">
                  <motion.h2 
                    animate={{ scale: [1, 1.02, 1] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="text-7xl font-black text-white uppercase tracking-tighter"
                  >
                    Extraction Protocol
                  </motion.h2>
                  <p className="text-blue-400 font-black uppercase tracking-[0.5em] text-xl">Upload Mission Intelligence</p>
               </div>

               <div className="relative h-24 bg-slate-900 rounded-[2rem] border-4 border-slate-800 overflow-hidden shadow-[0_0_50px_rgba(59,130,246,0.2)]">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${extractionProgress}%` }}
                    className="h-full bg-gradient-to-r from-blue-600 to-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.5)]"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                     <span className="text-3xl font-black text-white drop-shadow-md">{Math.round(extractionProgress)}%</span>
                  </div>
               </div>

               <div className="space-y-8">
                  <p className="text-slate-400 font-bold italic text-xl">"Rapidly initiate neural handshake to bypass sector firewalls."</p>
                  <button 
                    onMouseDown={handleExtractionTap}
                    className="w-64 h-64 bg-blue-600 rounded-full border-[12px] border-blue-400 shadow-[0_0_60px_rgba(59,130,246,0.4)] hover:bg-blue-500 active:scale-90 transition-all flex flex-col items-center justify-center group"
                  >
                     <span className="text-6xl group-active:scale-125 transition-transform">⚡</span>
                     <span className="text-xs font-black text-white uppercase mt-4 tracking-widest">Neural Link</span>
                  </button>
               </div>

               {extractionProgress >= 100 && (
                 <motion.div 
                   initial={{ opacity: 0, y: 20 }}
                   animate={{ opacity: 1, y: 0 }}
                   className="text-emerald-400 font-black text-4xl uppercase tracking-widest animate-bounce"
                 >
                   Extraction Successful
                 </motion.div>
               )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-[3rem] p-8 border-4 border-slate-50 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-8"
      >
        <div className="text-left flex-1 space-y-2">
          <div className="flex gap-3 items-center">
            <span className="bg-blue-50 text-blue-600 px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em]">Codename: Operative Field Sync</span>
            <span className="bg-slate-50 text-slate-400 px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest">Phase {currentStep + 1} / {totalSteps}</span>
          </div>
          <h2 className="text-4xl font-black text-slate-950 uppercase tracking-tighter leading-none">{scenario.title}</h2>
          <p className="text-slate-400 font-bold italic text-lg leading-snug">"Mission Intelligence: {scenario.description}"</p>
          <div className="pt-4 flex items-center gap-4">
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Stealth Signature</span>
            <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${stealthLevel}%` }}
                className={`h-full transition-colors duration-500 ${stealthLevel < 30 ? 'bg-rose-500' : stealthLevel < 70 ? 'bg-amber-500' : 'bg-emerald-500'}`}
              />
            </div>
            <span className="text-[10px] font-black text-slate-600">{Math.round(stealthLevel)}%</span>
          </div>
        </div>
        <div className="flex gap-4">
           <button onClick={() => setShowEvidenceBoard(true)} className="px-8 py-5 rounded-[2rem] border-2 bg-emerald-50 border-emerald-500 flex flex-col items-center justify-center hover:bg-emerald-100 transition-all active:scale-95 shadow-sm">
             <span className="text-2xl">📋</span>
             <p className="text-[8px] font-black text-emerald-600 uppercase mt-1 tracking-widest leading-none">Evidence</p>
           </button>
           <button onClick={() => setShowCommsTerminal(true)} className="px-8 py-5 rounded-[2rem] border-2 bg-blue-50 border-blue-500 flex flex-col items-center justify-center hover:bg-blue-100 transition-all active:scale-95 shadow-sm">
             <span className="text-2xl">👤</span>
             <p className="text-[8px] font-black text-blue-600 uppercase mt-1 tracking-widest leading-none">HQ Link</p>
           </button>
           <div className={`px-8 py-5 rounded-[2rem] border-2 bg-white ${timeLeft < 20 ? 'border-rose-500 animate-pulse' : timeLeft < 50 ? 'border-amber-500' : 'border-slate-100'} transition-colors text-center shadow-sm`}>
              <p className="text-[9px] font-black uppercase text-slate-400 tracking-[0.2em]">Sync Window</p>
              <p className={`text-4xl font-black tabular-nums ${timeLeft < 20 ? 'text-rose-500' : timeLeft < 50 ? 'text-amber-500' : 'text-slate-900'}`}>{timeLeft}s</p>
           </div>
           <div className="px-8 py-5 rounded-[2rem] border-2 bg-white border-slate-100 text-center min-w-[120px] shadow-sm">
              <p className="text-[9px] font-black uppercase text-slate-400 tracking-[0.2em] mb-3">Nodes Gathered</p>
              <div className="flex flex-wrap justify-center gap-1.5">
               {scenario.investigationPoints.map(pt => (
                 <div key={pt.id} className={`w-3 h-3 rounded-full transition-all duration-700 ${inspectedIds.includes(pt.id) ? 'bg-emerald-500 shadow-[0_0_15px_#10b981]' : 'bg-slate-200'}`} />
               ))}
              </div>
           </div>
        </div>
      </motion.div>

      <div className="relative">
        <AnimatePresence>
          {decisionOutcome && (
            <motion.div 
              initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
              animate={{ opacity: 1, backdropFilter: "blur(12px)" }}
              exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
              className="absolute inset-0 z-[2000] bg-slate-900/60 rounded-[5rem] flex items-center justify-center p-8 border-[12px] border-slate-50 shadow-2xl"
            >
             <div className="max-w-3xl w-full text-center space-y-12">
                <div className="space-y-4">
                   <p className="text-blue-600 font-black text-xs uppercase tracking-[0.6em]">Protocol Outcome Synchronized</p>
                   <h3 className="text-6xl font-black text-slate-950 uppercase tracking-tighter">{decisionOutcome.label}</h3>
                </div>
                
                <div className="bg-white p-12 rounded-[4rem] border-2 border-slate-100 shadow-xl space-y-8">
                   <p className="text-2xl font-bold text-slate-600 italic leading-relaxed">"{decisionOutcome.feedback}"</p>
                   
                   <div className="grid grid-cols-4 gap-6">
                      <div className="bg-rose-50 p-6 rounded-[2.5rem] border border-rose-100">
                         <p className="text-[8px] font-black text-rose-600 uppercase tracking-widest mb-1">Reserves</p>
                         <p className="text-2xl font-black text-rose-600">-₹{decisionOutcome.cost}</p>
                      </div>
                      <div className="bg-emerald-50 p-6 rounded-[2.5rem] border border-emerald-100">
                         <p className="text-[8px] font-black text-emerald-600 uppercase tracking-widest mb-1">Vitality</p>
                         <p className="text-2xl font-black text-emerald-600">{decisionOutcome.healthEffect > 0 ? '+' : ''}{decisionOutcome.healthEffect}%</p>
                      </div>
                      <div className="bg-blue-50 p-6 rounded-[2.5rem] border border-blue-100">
                         <p className="text-[8px] font-black text-blue-600 uppercase tracking-widest mb-1">Resilience</p>
                         <p className="text-2xl font-black text-blue-600">{decisionOutcome.resilienceImpact > 0 ? '+' : ''}{decisionOutcome.resilienceImpact}</p>
                      </div>
                      <div className="bg-slate-50 p-6 rounded-[2.5rem] border border-slate-100">
                         <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest mb-1">Stealth</p>
                         <p className="text-2xl font-black text-slate-600">{decisionOutcome.stealthImpact > 0 ? '+' : ''}{decisionOutcome.stealthImpact}</p>
                      </div>
                   </div>
                </div>

                <button 
                  onClick={() => {
                    if (currentStep + 1 === totalSteps) {
                      startExtraction();
                    } else {
                      onComplete(stealthLevel);
                    }
                  }} 
                  className="w-full bg-blue-600 text-white py-10 rounded-[3.5rem] font-black text-3xl uppercase tracking-[0.2em] shadow-xl hover:bg-blue-500 hover:scale-[1.02] active:scale-95 transition-all"
                >
                   {currentStep + 1 === totalSteps ? 'Finalize Mission' : 'Advance to Next Phase'}
                </button>
             </div>
            </motion.div>
          )}

          {showEvidenceBoard && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="absolute inset-0 z-[1100] bg-slate-900/60 backdrop-blur-xl rounded-[5rem] flex items-center justify-center p-8 border-[12px] border-slate-50 shadow-2xl"
            >
             <div className="max-w-4xl w-full h-full flex flex-col gap-8">
                <div className="flex justify-between items-center border-b-2 border-slate-100 pb-6">
                   <div className="flex items-center gap-4">
                      <span className="text-4xl">📋</span>
                      <h3 className="text-3xl font-black text-slate-950 uppercase tracking-tighter">Sector Evidence Board</h3>
                   </div>
                   <button onClick={() => setShowEvidenceBoard(false)} className="bg-slate-100 text-slate-600 px-6 py-2 rounded-full font-black uppercase text-xs hover:bg-rose-500 hover:text-white transition-colors">Close Board</button>
                </div>
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 overflow-y-auto custom-scrollbar p-4">
                   {scenario.investigationPoints.map(pt => {
                     const checked = inspectedIds.includes(pt.id);
                     return (
                       <div key={pt.id} className={`p-6 rounded-[2.5rem] border-4 transition-all flex flex-col gap-4 ${checked ? 'bg-white border-emerald-500 shadow-lg' : 'bg-slate-50 border-slate-100 opacity-50'}`}>
                          <div className="flex justify-between items-center">
                             <span className="text-3xl">{checked ? getIconUrl(pt.icon).includes('virus') ? '🦠' : getIconUrl(pt.icon).includes('water') ? '💧' : '📄' : '🔒'}</span>
                             <span className={`text-[8px] font-black uppercase px-3 py-1 rounded-full ${checked ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-200 text-slate-400'}`}>{checked ? 'Verified' : 'Encrypted'}</span>
                          </div>
                          <div>
                             <p className={`text-[10px] font-black uppercase tracking-widest ${checked ? 'text-blue-600' : 'text-slate-400'}`}>{pt.subLocation}</p>
                             <p className={`text-lg font-black leading-tight ${checked ? 'text-slate-900' : 'text-slate-300'}`}>{checked ? pt.clueResult : 'Data node not yet synchronized.'}</p>
                          </div>
                          {checked && <p className="text-xs font-bold text-slate-400 italic">"{pt.description}"</p>}
                       </div>
                     );
                   })}
                </div>
                <div className="bg-blue-50 p-8 rounded-[3rem] border-2 border-blue-100">
                   <p className="text-blue-600 font-black text-[10px] uppercase tracking-[0.4em] mb-2">HQ Synthesis Progress</p>
                   <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden border-2 border-slate-200">
                      <div className="h-full bg-blue-500 transition-all duration-1000" style={{ width: `${(inspectedIds.length / scenario.investigationPoints.length) * 100}%` }} />
                   </div>
                   <p className="text-slate-600 font-bold italic mt-4 text-sm">"{inspectedIds.length === scenario.investigationPoints.length ? 'All nodes synchronized. Deployment protocol ready.' : `Synchronizing nodes... ${inspectedIds.length}/${scenario.investigationPoints.length} complete.`}"</p>
                </div>
             </div>
            </motion.div>
          )}

          {showCommsTerminal && (
            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="absolute inset-0 z-[1000] bg-slate-900/60 backdrop-blur-xl rounded-[5rem] flex items-center justify-center p-8 border-[12px] border-slate-50 shadow-2xl"
            >
             <div className="max-w-3xl w-full h-full flex flex-col gap-8">
                <div className="flex justify-between items-center border-b-2 border-slate-100 pb-6">
                   <div className="flex items-center gap-4">
                      <span className="w-4 h-4 rounded-full bg-blue-500 animate-pulse" />
                      <h3 className="text-3xl font-black text-slate-950 uppercase tracking-tighter">HQ Neural Terminal</h3>
                   </div>
                   <button onClick={() => setShowCommsTerminal(false)} className="text-slate-400 hover:text-blue-600 font-black uppercase text-xs">Disconnect</button>
                </div>
                <div className="flex-1 bg-white rounded-[3rem] p-8 border-2 border-slate-100 overflow-y-auto custom-scrollbar flex flex-col gap-6 shadow-inner">
                   <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Incoming Tactical Advice:</p>
                   <p className="text-xl font-bold text-slate-600 italic leading-relaxed">
                      {aiAdvice || "No active transmission. Interrogate HQ for guidance on gathering field intel."}
                   </p>
                   {isFetchingAdvice && <div className="flex items-center gap-3 animate-pulse"><div className="w-3 h-3 bg-blue-600 rounded-full" /><p className="text-xs font-black text-blue-400">Syncing Bio-Satellites...</p></div>}
                </div>
                <div className="relative">
                   <input type="text" value={agentInput} onChange={(e) => setAgentInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && sendAgentMessage()} placeholder="Interrogate HQ (e.g. 'Explain Ayushman Bharat coverage')..." className="w-full bg-white py-8 px-10 rounded-[3.5rem] border-4 border-slate-100 text-xl font-bold text-slate-950 placeholder:text-slate-200 focus:border-blue-500 outline-none transition-all shadow-xl" />
                   <button onClick={sendAgentMessage} className="absolute right-4 top-1/2 -translate-y-1/2 w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white text-3xl hover:bg-blue-500 transition-all shadow-xl">⚡</button>
                </div>
             </div>
            </motion.div>
          )}
        </AnimatePresence>

        {!allPointsInspected ? (
          <div className="flex flex-col gap-8">
              <div className={`h-[680px] rounded-[5rem] border-[12px] shadow-6xl overflow-hidden bg-slate-50 relative transition-colors duration-500 ${isTakingDamage ? 'border-rose-500 shadow-[0_0_50px_rgba(244,63,94,0.3)] animate-pulse' : isSlowed ? 'border-amber-500' : 'border-slate-200'} ${timeLeft < 30 ? 'animate-pulse' : ''}`}>
                {/* Spy HUD Overlay */}
                <div className="absolute top-8 left-8 right-8 z-[100] flex justify-between items-start pointer-events-none">
                   <div className="space-y-4">
                      <div className="bg-white/80 backdrop-blur-md p-4 rounded-2xl border border-slate-200 w-64 shadow-lg">
                         <div className="flex justify-between items-center mb-2">
                            <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Stealth Level</p>
                            <p className="text-xs font-black text-slate-900">{Math.round(stealthLevel)}%</p>
                         </div>
                         <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div className={cn(
                               "h-full transition-all duration-300",
                               stealthLevel > 50 ? "bg-blue-500" : stealthLevel > 20 ? "bg-amber-500" : "bg-rose-500"
                            )} style={{ width: `${stealthLevel}%` }} />
                         </div>
                      </div>
                      <div className="bg-white/80 backdrop-blur-md p-4 rounded-2xl border border-slate-200 w-64 shadow-lg">
                         <div className="flex justify-between items-center mb-2">
                            <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Signal Strength</p>
                            <p className="text-xs font-black text-slate-900">{signalStrength}%</p>
                         </div>
                         <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500 transition-all duration-300" style={{ width: `${signalStrength}%` }} />
                         </div>
                      </div>
                   </div>
                   <div className="bg-white/80 backdrop-blur-md p-4 rounded-2xl border border-slate-200 text-right shadow-lg">
                      <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">Neural Integrity</p>
                      <p className="text-2xl font-black text-slate-900">STABLE</p>
                      <div className="flex gap-1 mt-2 justify-end">
                         {[...Array(5)].map((_, i) => (
                           <div key={i} className={`w-1.5 h-4 rounded-sm ${i < 4 ? 'bg-blue-500' : 'bg-slate-200'}`} />
                         ))}
                      </div>
                   </div>
                </div>

                <div className="absolute inset-0 opacity-10 bg-cover bg-center grayscale" style={{ backgroundImage: `url(${LOCATIONS_DATA[location]?.image})` }} />
                {isTakingDamage && <div className="absolute inset-0 bg-rose-500/10 animate-pulse z-0" />}
                {isSlowed && <div className="absolute inset-0 bg-amber-500/5 z-0" />}
                {activeObstacles.current.map(obs => (
                  <div key={obs.id} className="absolute -translate-x-1/2 -translate-y-1/2 flex items-center justify-center z-10" style={{ left: `${obs.x}%`, top: `${obs.y}%`, width: `${obs.radius * 2.5}%`, height: `${obs.radius * 2.5}%` }}>
                    <div className={cn(
                      "w-full h-full rounded-[2.5rem] border-[6px] flex flex-col items-center justify-center shadow-2xl transition-all relative overflow-hidden",
                      obs.type === 'hazard' ? "bg-rose-50 border-rose-400 animate-pulse" : 
                      obs.type === 'slow' ? "bg-amber-50 border-amber-400" : 
                      obs.type === 'multi' ? "bg-indigo-50 border-indigo-400" :
                      "bg-slate-100 border-slate-300"
                    )}>
                      <div className={cn(
                        "absolute inset-0 opacity-20",
                        obs.type === 'hazard' ? "bg-[radial-gradient(circle,rgba(244,63,94,0.4)_0%,transparent_70%)]" :
                        obs.type === 'slow' ? "bg-[radial-gradient(circle,rgba(245,158,11,0.4)_0%,transparent_70%)]" :
                        obs.type === 'multi' ? "bg-[radial-gradient(circle,rgba(99,102,241,0.4)_0%,transparent_70%)]" :
                        "bg-[radial-gradient(circle,rgba(100,116,139,0.4)_0%,transparent_70%)]"
                      )} />
                      <span className="text-4xl drop-shadow-xl z-20 mb-1">{obs.icon}</span>
                      <p className={cn(
                        "text-[8px] font-black uppercase tracking-widest z-20",
                        obs.type === 'hazard' ? "text-rose-600" :
                        obs.type === 'slow' ? "text-amber-600" :
                        obs.type === 'multi' ? "text-indigo-600" :
                        "text-slate-600"
                      )}>{obs.name}</p>
                    </div>
                  </div>
                ))}
              {scenario.investigationPoints.map(pt => {
                const checked = inspectedIds.includes(pt.id); const revealed = revealedIds.includes(pt.id); const near = nearPointRef.current?.id === pt.id;
                return (
                  <div key={pt.id} className="absolute -translate-x-1/2 -translate-y-1/2 z-20" style={{ left: `${pt.x}%`, top: `${pt.y}%` }}>
                    <div className="relative group">
                       <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full border-[6px] transition-all duration-700 flex items-center justify-center overflow-hidden bg-white ${checked ? 'opacity-40 scale-75 border-emerald-500' : revealed ? (near ? 'scale-125 border-purple-500 shadow-[0_0_30px_purple] animate-bounce-soft' : 'border-slate-700 shadow-xl') : 'opacity-10 bg-slate-900 border-slate-800'}`}>
                          {revealed ? (checked ? <span className="text-3xl font-black text-emerald-500">✓</span> : <img src={getIconUrl(pt.icon)} className="w-12 h-12 object-contain" />) : <span className="text-2xl font-black text-slate-700">?</span>}
                       </div>
                       {near && !checked && <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 bg-purple-600 text-white px-5 py-2 rounded-full text-[10px] font-black uppercase animate-bounce shadow-xl whitespace-nowrap">Audit (E)</div>}
                    </div>
                  </div>
                );
              })}
              <div className="absolute w-16 h-16 -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none transition-transform" style={{ left: `${pos.x}%`, top: `${pos.y}%` }}>
                <div className="relative w-full h-full">
                  <div className={`absolute -inset-6 border-4 border-dashed rounded-full animate-spin-slow border-white/20 opacity-40`} />
                  <img src={avatar?.image} className={`w-full relative z-[70] drop-shadow-3xl transition-all`} />
                </div>
              </div>
              {timeLeft === 0 && !allPointsInspected && (
                <div className="absolute inset-0 z-[500] bg-rose-900/40 backdrop-blur-md flex items-center justify-center p-8">
                   <div className="bg-white p-12 rounded-[3rem] border-8 border-rose-100 text-center space-y-6 shadow-2xl animate-in zoom-in-95">
                      <span className="text-7xl">📡</span>
                      <h3 className="text-4xl font-black text-rose-600 uppercase tracking-tighter">Signal Lost</h3>
                      <p className="text-xl font-bold text-slate-500 italic">"The sync window has closed. Stealth signature compromised. Emergency extraction required."</p>
                      <button onClick={() => setTimeLeft(30)} className="w-full bg-rose-600 text-white py-6 rounded-2xl font-black uppercase tracking-widest hover:bg-rose-500 transition-all shadow-lg">Emergency Reboot (+30s)</button>
                   </div>
                </div>
              )}
              {activePuzzle && (
                <div className="absolute inset-0 z-[200] bg-slate-900/60 backdrop-blur-xl flex items-center justify-center p-8">
                   <div className="max-w-2xl w-full bg-white rounded-[3rem] border-8 border-slate-50 p-8 sm:p-12 text-center space-y-6 shadow-2xl">
                      <p className="text-blue-600 font-black text-[10px] uppercase tracking-[0.6em]">Operative Sync: {activePuzzle.subLocation}</p>
                      <div className="bg-slate-50 p-6 rounded-2xl border-2 border-slate-100"><p className="text-xl font-bold text-slate-900 italic">"{activePuzzle.puzzleClue}"</p></div>
                      <div className="flex justify-center gap-3">
                        {Array.from({ length: activePuzzle.puzzleCode?.length || 3 }).map((_, i) => (
                          <div key={i} className={`w-12 h-16 border-[4px] rounded-xl flex items-center justify-center text-3xl font-black ${puzzleProgress.length > i ? 'bg-blue-50 border-blue-500 text-blue-600' : 'bg-slate-50 border-slate-200 text-slate-300'}`}>
                            {puzzleProgress.length > i ? puzzleProgress[i] : ''}
                          </div>
                        ))}
                      </div>
                      <div className="grid grid-cols-10 gap-1.5 max-w-2xl mx-auto overflow-y-auto max-h-[300px] p-2 custom-scrollbar">
                        {FULL_KEYS.map(char => <button key={char} onClick={() => handlePuzzleInput(char)} className="bg-slate-100 h-10 rounded-lg text-xs font-black text-slate-500 hover:bg-blue-600 hover:text-white transition-all active:scale-90">{char}</button>)}
                      </div>
                      <button onClick={() => setActivePuzzle(null)} className="text-[10px] font-black uppercase text-slate-400 hover:text-rose-500 tracking-widest">Abort Audit</button>
                   </div>
                </div>
              )}
              {activeDossier && (
                 <div className="absolute inset-0 z-[190] bg-slate-900/60 backdrop-blur-xl flex items-center justify-center p-8">
                    <div className="max-w-2xl w-full bg-white rounded-[4rem] p-12 text-center space-y-8 border-[12px] border-slate-50 shadow-2xl">
                       <img src={getIconUrl(activeDossier.icon)} className="w-24 h-24 mx-auto mb-4" />
                       <h3 className="text-4xl font-black text-slate-950 uppercase tracking-tighter">Dossier: {activeDossier.subLocation}</h3>
                       <div className="space-y-4">
                          <p className="text-xl font-bold text-slate-500 italic leading-relaxed">"Audit Finding: {activeDossier.description}"</p>
                          <div className="bg-emerald-50 p-8 rounded-[2.5rem] border-2 border-emerald-100"><p className="text-2xl font-black text-emerald-400 uppercase tracking-tight">Intelligence: {activeDossier.clueResult}</p></div>
                       </div>
                       <button onClick={() => setActiveDossier(null)} className="w-full bg-blue-600 text-white py-8 rounded-[3rem] font-black uppercase text-xl shadow-xl hover:bg-blue-500 transition-all">Synchronize Findings</button>
                    </div>
                 </div>
              )}
            </div>
            <div className="flex flex-col items-center gap-6">
              <div className="bg-white p-4 rounded-[3.5rem] border-[6px] border-slate-50 shadow-xl flex gap-8 sm:gap-16 items-center justify-center px-12 sm:px-20">
                 {[ { id: 'bio-scan', icon: '🔍', label: 'BIO-SCAN' }, { id: 'sig-int', icon: '📡', label: 'SIG-INT' }, { id: 'hum-int', icon: '🎤', label: 'HUM-INT' } ].map(tool => (
                   <button key={tool.id} onClick={() => setSelectedTool(tool.id as Tool)} className={`flex flex-col items-center p-4 px-10 rounded-[2rem] border-4 transition-all ${selectedTool === tool.id ? 'bg-blue-50 border-blue-500 text-blue-600 scale-105 shadow-lg' : 'bg-slate-50 border-slate-100 text-slate-400 hover:bg-slate-100'}`}>
                    <span className="text-4xl">{tool.icon}</span>
                    <p className="text-[10px] font-black uppercase mt-2 tracking-widest">{tool.label}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : !showSynthesisBoard ? (
          <div className="bg-white p-12 sm:p-20 rounded-[5rem] shadow-2xl text-center space-y-12 animate-in zoom-in-95 border-[15px] border-slate-50">
            <h3 className="text-6xl font-black text-slate-950 uppercase tracking-tighter leading-none">Sector Intelligence Debrief</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 text-left max-w-6xl mx-auto">
               <div className="bg-slate-50 p-10 rounded-[3rem] border-4 border-slate-100 space-y-6">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Audit Logs Gathered</p>
                  <ul className="space-y-4 max-h-[300px] overflow-y-auto pr-4 custom-scrollbar">
                    {scenario.investigationPoints.map(pt => (
                      <li key={pt.id} className="bg-white p-6 rounded-2xl border-2 border-slate-100 shadow-sm">
                         <p className="text-[10px] font-black uppercase text-blue-600 leading-none mb-1">{pt.subLocation}</p>
                         <p className="text-lg font-bold text-slate-600">"{pt.clueResult}"</p>
                      </li>
                    ))}
                  </ul>
               </div>
               <div className="bg-slate-50 p-10 rounded-[3rem] border-4 border-slate-100 flex flex-col justify-center space-y-6 shadow-inner">
                  <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.3em] mb-1">HQ Synthesis Analysis</p>
                  <p className="text-3xl font-black text-slate-900 italic leading-snug">"{scenario.synthesisAnalysis}"</p>
                  <div className="pt-6 border-t-2 border-slate-200">
                     <p className="text-[10px] font-black text-blue-600 uppercase mb-2">Recommended Sector Strategy</p>
                     <p className="text-xl font-bold text-slate-600">{scenario.healthFact}</p>
                  </div>
               </div>
            </div>
            <button onClick={() => setShowSynthesisBoard(true)} className="w-full bg-blue-600 text-white py-12 rounded-[4rem] font-black text-4xl uppercase tracking-[0.3em] shadow-xl hover:bg-blue-500 transition-all">Engage Deployment Protocol</button>
          </div>
        ) : (
          <div className="space-y-12 animate-in slide-in-from-bottom-10 pb-20">
            <div className="bg-white p-12 rounded-[5rem] shadow-2xl text-center border-[15px] border-slate-50 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 via-emerald-500 to-blue-500 animate-gradient-x" />
              <h3 className="text-6xl font-black text-slate-950 uppercase tracking-tighter leading-none">Deployment Decision Protocol</h3>
              <p className="text-slate-400 font-bold italic mt-4 text-xl">"Intelligence synthesis complete. Select a strategic protocol to authorize deployment."</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {scenario.options.map((opt, idx) => (
                <div 
                  key={idx} 
                  onClick={() => setSimulatingOption(opt)} 
                  className={cn(
                    "p-10 rounded-[4rem] border-[12px] shadow-2xl transition-all cursor-pointer flex flex-col justify-between min-h-[600px] relative group",
                    simulatingOption === opt 
                      ? "bg-white border-blue-500 scale-105 z-10" 
                      : "bg-slate-50 border-slate-100 hover:border-slate-200 opacity-80 hover:opacity-100"
                  )}
                >
                  <div className="space-y-8">
                     <div className="flex justify-between items-center">
                        <div className={cn(
                          "px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.3em]",
                          simulatingOption === opt ? "bg-blue-50 text-blue-600" : "bg-slate-200 text-slate-500"
                        )}>
                          Node 0{idx + 1}
                        </div>
                        {simulatingOption === opt && (
                          <div className="flex items-center gap-2">
                             <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
                             <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Active Simulation</span>
                          </div>
                        )}
                     </div>
                     <h4 className={cn(
                       "text-5xl font-black leading-none tracking-tighter uppercase",
                       simulatingOption === opt ? "text-slate-950" : "text-slate-900"
                     )}>{opt.label}</h4>
                     
                     <div className={cn(
                       "p-8 rounded-[2.5rem] border-2 transition-colors",
                       simulatingOption === opt ? "bg-slate-50 border-slate-100" : "bg-white border-slate-50"
                     )}>
                        <p className={cn(
                          "text-lg font-bold italic leading-relaxed",
                          simulatingOption === opt ? "text-slate-600" : "text-slate-400"
                        )}>"{opt.feedback}"</p>
                     </div>
                  </div>
                  
                  <div className="space-y-4 mt-8">
                     <div className={cn(
                       "flex justify-between items-center p-6 rounded-[2rem] border-2 transition-all",
                       simulatingOption === opt ? "bg-rose-50 border-rose-100" : "bg-white border-slate-100"
                     )}>
                        <div className="flex items-center gap-3">
                           <span className="text-2xl">💰</span>
                           <span className={cn("text-[10px] font-black uppercase tracking-widest", simulatingOption === opt ? "text-rose-600" : "text-slate-400")}>Cost</span>
                        </div>
                        <span className={cn("text-3xl font-black", simulatingOption === opt ? "text-rose-600" : "text-slate-900")}>₹{opt.cost}</span>
                     </div>

                     <div className={cn(
                       "flex justify-between items-center p-6 rounded-[2rem] border-2 transition-all",
                       simulatingOption === opt ? "bg-emerald-50 border-emerald-100" : "bg-white border-slate-100"
                     )}>
                        <div className="flex items-center gap-3">
                           <span className="text-2xl">🧬</span>
                           <span className={cn("text-[10px] font-black uppercase tracking-widest", simulatingOption === opt ? "text-emerald-600" : "text-slate-400")}>Vitality</span>
                        </div>
                        <span className={cn("text-3xl font-black", simulatingOption === opt ? "text-emerald-600" : "text-slate-900")}>{opt.healthEffect > 0 ? '+' : ''}{opt.healthEffect}%</span>
                     </div>

                     <div className={cn(
                       "flex justify-between items-center p-6 rounded-[2rem] border-2 transition-all",
                       simulatingOption === opt ? "bg-blue-50 border-blue-100" : "bg-white border-slate-100"
                     )}>
                        <div className="flex items-center gap-3">
                           <span className="text-2xl">🛡️</span>
                           <span className={cn("text-[10px] font-black uppercase tracking-widest", simulatingOption === opt ? "text-blue-600" : "text-slate-400")}>Resilience</span>
                        </div>
                        <span className={cn("text-3xl font-black", simulatingOption === opt ? "text-blue-600" : "text-slate-900")}>{opt.resilienceImpact > 0 ? '+' : ''}{opt.resilienceImpact}</span>
                     </div>

                     <div className={cn(
                       "flex justify-between items-center p-6 rounded-[2rem] border-2 transition-all",
                       simulatingOption === opt ? "bg-slate-50 border-slate-100" : "bg-white border-slate-100"
                     )}>
                        <div className="flex items-center gap-3">
                           <span className="text-2xl">👤</span>
                           <span className={cn("text-[10px] font-black uppercase tracking-widest", simulatingOption === opt ? "text-slate-600" : "text-slate-400")}>Stealth</span>
                        </div>
                        <span className={cn("text-3xl font-black", simulatingOption === opt ? "text-slate-900" : "text-slate-900")}>{opt.stealthImpact > 0 ? '+' : ''}{opt.stealthImpact}</span>
                     </div>

                     {simulatingOption === opt && (
                       <button 
                         onClick={(e) => { e.stopPropagation(); onSelect(opt); setDecisionOutcome(opt); }} 
                         className="w-full py-8 mt-4 bg-blue-600 text-white rounded-[3rem] font-black uppercase text-2xl shadow-xl hover:bg-blue-500 active:scale-95 transition-all flex items-center justify-center gap-4 group"
                       >
                          <span>Authorize Protocol</span>
                          <span className="text-2xl group-hover:translate-x-2 transition-transform">⚡</span>
                       </button>
                     )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default ScenarioCard;
