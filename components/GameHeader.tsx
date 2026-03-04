
import React from 'react';
import { GameState } from '../types';
import { XP_PER_LEVEL, LOCATIONS_DATA } from '../constants';

interface GameHeaderProps {
  state: GameState;
  onExit: () => void;
}

const GameHeader: React.FC<GameHeaderProps> = ({ state, onExit }) => {
  const xpPercentage = (state.experience / XP_PER_LEVEL) * 100;
  const locData = LOCATIONS_DATA[state.currentLocation];

  return (
    <div className="sticky top-0 z-[1100] w-full bg-white/95 backdrop-blur-2xl border-b-[6px] border-slate-100 px-6 py-4 shadow-xl">
      <div className="max-w-7xl mx-auto flex items-center gap-8">
        
        {/* Profile / Level Section */}
        <div className="flex items-center gap-4 bg-slate-900 p-1.5 rounded-full pr-8 border-[4px] border-slate-800 shadow-2xl">
            <div className="relative">
              <div className="w-14 h-14 bg-purple-600 rounded-full flex flex-col items-center justify-center text-white font-black shadow-lg">
                  <span className="text-[10px] leading-none uppercase tracking-widest">Rank</span>
                  <span className="text-2xl leading-none">{state.level}</span>
              </div>
              <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-emerald-500 border-[3px] border-slate-900 rounded-full flex items-center justify-center text-[10px] font-black text-white">
                {state.day}
              </div>
            </div>
            <div className="hidden sm:flex flex-col">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] uppercase font-black text-purple-400 tracking-[0.2em] leading-none">{state.agentRank}</span>
                  <span className="text-[10px] font-black text-white ml-4">{Math.round(xpPercentage)}%</span>
                </div>
                <div className="w-32 h-2.5 bg-slate-800 rounded-full mt-2 overflow-hidden border border-slate-700">
                  <div 
                    className="h-full bg-purple-500 transition-all duration-700 shadow-[0_0_10px_rgba(168,85,247,0.5)]"
                    style={{ width: `${xpPercentage}%` }}
                  />
                </div>
            </div>
        </div>

        {/* Vitality Hub */}
        <div className="flex-1 flex items-center gap-5 bg-white rounded-full p-3 px-8 border-[5px] border-slate-50 shadow-inner group">
            <span className="text-3xl animate-pulse-soft">🧬</span>
            <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden relative shadow-inner">
                <div 
                    className={`h-full transition-all duration-1000 cubic-bezier(0.4, 0, 0.2, 1) ${state.health > 70 ? 'bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]' : state.health > 30 ? 'bg-amber-500' : 'bg-rose-500 animate-pulse'}`}
                    style={{ width: `${state.health}%` }}
                />
            </div>
            <div className="flex flex-col items-end">
              <span className={`font-black text-xl tracking-tighter tabular-nums ${state.health > 70 ? 'text-emerald-600' : state.health > 30 ? 'text-amber-600' : 'text-rose-600'}`}>
                  {state.health}%
              </span>
              <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">Vitality</span>
            </div>
        </div>

        {/* Location Display */}
        <div className="hidden lg:flex flex-col items-center bg-slate-50 px-8 py-2.5 rounded-full border-[3px] border-slate-100">
          <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest mb-1">Sector Infiltration</p>
          <p className="text-lg font-black text-slate-900 uppercase tracking-tighter leading-none">{state.currentLocation}</p>
        </div>

        {/* Financial Counter */}
        <div className="flex items-center gap-4 bg-emerald-50 px-8 py-3 rounded-full border-[5px] border-emerald-100 shadow-xl group hover:bg-emerald-100 transition-colors">
            <div className="w-10 h-10 bg-emerald-600 rounded-full flex items-center justify-center text-white font-black text-xl shadow-lg">₹</div>
            <span className="mono text-emerald-950 font-black text-2xl tracking-tighter tabular-nums">
                {state.money.toLocaleString()}
            </span>
        </div>

        {/* Exit Action */}
        <button 
            onClick={onExit}
            className="w-14 h-14 flex items-center justify-center bg-rose-50 text-rose-500 rounded-full border-[4px] border-rose-100 hover:bg-rose-500 hover:text-white transition-all duration-300 group shadow-lg active:scale-95"
            title="Terminate Protocol"
        >
            <span className="text-2xl group-hover:rotate-12 transition-transform">🛑</span>
        </button>

      </div>
    </div>
  );
};

export default GameHeader;
