import React from 'react';
import { Link } from 'react-router-dom';
import { Trophy, ChevronRight, Activity, Users } from 'lucide-react';

const CompetitionsList = ({ leagues }) => {
  return (
    <div className="max-w-5xl mx-auto space-y-12 pb-24">
       <div className="border-b border-white/5 pb-8">
          <h1 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter flex items-center gap-4">
             <Trophy className="w-10 h-10 text-rugby-gold" />
             Competicions Actives
          </h1>
          <p className="text-gray-400 font-bold uppercase tracking-widest text-xs mt-2">
             Trieu una categoria per veure el seu panell de gestió específic
          </p>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {Object.values(leagues).map((league) => (
             <Link key={league.id} to={`/competicio/${league.id}`} className="block group">
                <div className="glass-card p-8 hover:border-rugby-gold/30 transition-all flex justify-between items-center bg-white/5 hover:bg-white/10">
                   <div className="space-y-4">
                      <h2 className="text-2xl font-black uppercase tracking-widest group-hover:text-rugby-gold transition-colors">{league.name}</h2>
                      
                      <div className="flex items-center gap-6">
                         <div className="flex items-center gap-2 text-xs font-bold uppercase text-gray-400 tracking-widest">
                            <Users className="w-4 h-4" />
                            {league.clubs.length} Clubs
                         </div>
                         <div className="flex items-center gap-2 text-xs font-bold uppercase text-gray-400 tracking-widest">
                            <Activity className="w-4 h-4" />
                            {league.rawMatches.length} Partits
                         </div>
                      </div>
                   </div>
                   
                   <div className="w-12 h-12 rounded-full bg-black/20 flex items-center justify-center group-hover:bg-rugby-gold/20 transition-all border border-white/5">
                      <ChevronRight className="w-6 h-6 text-gray-500 group-hover:text-rugby-gold" />
                   </div>
                </div>
             </Link>
          ))}
       </div>
    </div>
  );
};

export default CompetitionsList;
