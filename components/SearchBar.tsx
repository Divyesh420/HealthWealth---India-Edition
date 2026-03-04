
import React from 'react';

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch, placeholder = "Analyze Tactical Databases..." }) => {
  return (
    <div className="relative w-full max-w-3xl mx-auto group">
      <div className="absolute inset-0 bg-purple-500/5 rounded-[3rem] blur-[40px] group-hover:bg-purple-500/10 transition-all duration-700" />
      <div className="relative flex items-center bg-white/95 backdrop-blur-2xl border-[4px] border-white rounded-[3rem] shadow-xl overflow-hidden ring-4 ring-purple-50/50 transition-all group-hover:ring-purple-100/50">
        <div className="pl-8 text-3xl transition-transform group-hover:scale-110 duration-500">🔍</div>
        <input 
          type="text" 
          onChange={(e) => onSearch(e.target.value)}
          placeholder={placeholder}
          className="w-full py-6 px-6 bg-transparent text-xl font-black text-slate-950 placeholder:text-slate-300 focus:outline-none"
        />
        <div className="pr-8 hidden sm:flex gap-2">
            <kbd className="bg-slate-50 px-3 py-1 rounded-xl text-[9px] font-black text-slate-400 border border-slate-100">AGENT</kbd>
            <kbd className="bg-slate-50 px-3 py-1 rounded-xl text-[9px] font-black text-slate-400 border border-slate-100">INPUT</kbd>
        </div>
      </div>
    </div>
  );
};

export default SearchBar;
