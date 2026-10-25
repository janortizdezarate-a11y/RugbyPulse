import React from 'react';
import { Link } from 'react-router-dom';
import { Users, Shield, ChevronLeft } from 'lucide-react';
import { motion } from 'framer-motion';

const LeagueClubsList = ({ leagueData }) => {
  const { clubs, name, id } = leagueData;

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-24">
      {/* Back Navigation */}
      <Link to={`/competicio/${id}`} className="inline-flex items-center gap-2 text-gray-500 hover:text-white transition-all group font-black uppercase text-[10px] tracking-widest">
        <div className="p-2 bg-white/5 rounded-lg group-hover:bg-rugby-gold/20 transition-colors">
           <ChevronLeft className="w-4 h-4" />
        </div>
        Tornar al Dashboard
      </Link>

      <div className="flex items-center justify-between border-b border-white/5 pb-8">
        <div>
          <h1 className="text-4xl md:text-5xl font-black flex items-center gap-4 tracking-tighter uppercase italic">
            <Users className="text-rugby-gold w-10 h-10" />
            Clubs
          </h1>
          <p className="text-gray-400 font-bold uppercase tracking-widest text-xs mt-2">
            Equips federats en la lliga {name}
          </p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 text-white">
        {clubs.map((club, index) => (
          <motion.div
            key={club.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            className="glass-card hover:border-rugby-gold/30 transition-all group overflow-hidden relative"
          >
            <div 
              className="absolute top-0 left-0 w-full h-1" 
              style={{ backgroundColor: club.colors.primary }} 
            />
            <Link to={`/competicio/${id}/club/${club.id}`} className="p-6 block">
              <div className="flex justify-between items-start mb-6">
                <div className="p-3 rounded-2xl bg-white/5 border border-white/10 group-hover:bg-rugby-gold/10 transition-colors">
                  {club.logo ? (
                     <img src={club.logo} alt={club.name} className="w-10 h-10 object-contain drop-shadow-md" />
                  ) : (
                     <Shield className="w-10 h-10 text-rugby-gold" />
                  )}
                </div>
              </div>
              
              <h3 className="text-2xl font-black mb-1 group-hover:text-rugby-gold transition-colors">{club.name}</h3>
              <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-6">{name}</p>
              
              <div className="grid grid-cols-3 gap-4 border-t border-white/10 pt-4">
                <StatItem label="Punts" value={club.points} />
                <StatItem label="Victòries" value={club.won} />
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] text-gray-500 font-bold uppercase tracking-tighter">Forma</span>
                  <div className="flex gap-1 mt-1">
                    {club.lastMatches && club.lastMatches.length > 0 ? (
                       club.lastMatches.map((m, i) => (
                         <div key={i} className={`w-2 h-2 rounded-full ${m === 'W' ? 'bg-green-500' : m === 'D' ? 'bg-yellow-500' : 'bg-red-500'}`} />
                       ))
                    ) : (
                       <span className="text-xs text-gray-500">-</span>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

const StatItem = ({ label, value }) => (
  <div className="flex flex-col gap-1">
    <span className="text-[10px] text-gray-500 font-bold uppercase tracking-tighter">{label}</span>
    <span className="text-xl font-black text-white tracking-tight">{value}</span>
  </div>
);

export default LeagueClubsList;
