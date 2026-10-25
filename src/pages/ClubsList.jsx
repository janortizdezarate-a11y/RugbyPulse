import React from 'react';
import { Link } from 'react-router-dom';
import { Users, Shield } from 'lucide-react';
import { motion } from 'framer-motion';

const ClubsList = ({ globalClubs }) => {
  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-24">
      <div className="flex items-center justify-between border-b border-white/5 pb-8">
        <div>
          <h1 className="text-4xl md:text-5xl font-black flex items-center gap-4 tracking-tighter uppercase italic">
            <Users className="text-rugby-gold w-10 h-10" />
            Clubs
          </h1>
          <p className="text-gray-400 font-bold uppercase tracking-widest text-xs mt-2">
            Directori Global de Clubs Federats
          </p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 text-white">
        {globalClubs.map((club, index) => (
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
            <Link to={`/club/${club.id}`} className="p-6 flex flex-col h-full justify-between">
              <div>
                 <div className="flex justify-between items-start mb-6">
                   <div className="p-3 rounded-2xl bg-white/5 border border-white/10 group-hover:bg-rugby-gold/10 transition-colors">
                     {club.logo ? (
                        <img src={club.logo} alt={club.name} className="w-10 h-10 object-contain drop-shadow-md" />
                     ) : (
                        <Shield className="w-10 h-10 text-rugby-gold" />
                     )}
                   </div>
                 </div>
                 
                 <h3 className="text-2xl font-black mb-1 group-hover:text-rugby-gold transition-colors truncate">{club.name}</h3>
                 <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-6">Múltiples Categories Registrades</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4 border-t border-white/10 pt-4 mt-auto">
                <StatItem label="Lligues Actives" value={club.activeLeagues.length} />
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

export default ClubsList;
