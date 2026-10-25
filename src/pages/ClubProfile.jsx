import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, MapPin, Trophy, Shield } from 'lucide-react';

const ClubProfile = ({ globalClubs, leagues }) => {
  const { id, leagueId } = useParams();
  
  const globalClub = globalClubs.find(c => c.id === id);
  
  const [selectedLeagueId, setSelectedLeagueId] = useState(
    leagueId || (globalClub?.activeLeagues[0] ?? null)
  );

  if (!globalClub) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4">
        <Shield className="w-16 h-16 text-gray-700 mx-auto" />
        <p className="text-white font-black uppercase tracking-widest">Equip no trobat</p>
        <Link to="/clubs" className="text-rugby-gold text-xs uppercase font-bold tracking-widest hover:underline">
          Tornar al directori
        </Link>
      </div>
    </div>
  );

  const activeLeague = selectedLeagueId ? leagues[selectedLeagueId] : null;
  const clubData = activeLeague ? activeLeague.clubs.find(c => c.id === id) : null;
  const backPath = leagueId ? `/competicio/${leagueId}/clubs` : '/clubs';

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-24">

      {/* Back Navigation */}
      <Link to={backPath} className="inline-flex items-center gap-2 text-gray-500 hover:text-white transition-all group font-black uppercase text-[10px] tracking-widest">
        <div className="p-2 bg-white/5 rounded-lg group-hover:bg-rugby-gold/20 transition-colors">
          <ChevronLeft className="w-4 h-4" />
        </div>
        Tornar
      </Link>

      {/* Universal Club Header */}
      <div className="glass-card overflow-hidden">
        <div 
           className="h-48 relative overflow-hidden flex items-center justify-center"
           style={{ backgroundColor: globalClub.colors?.primary || '#8B1D3D' }}
        >
           <div className="absolute inset-0 opacity-10 flex items-center justify-center">
              <Shield className="w-96 h-96 text-white" />
           </div>
        </div>
        
        <div className="px-8 pb-8 relative">
           <div className="flex flex-col md:flex-row items-center gap-8 -mt-20 relative z-10">
              <div
                className="w-40 h-40 bg-rugby-navy rounded-3xl border-4 p-4 flex items-center justify-center shadow-2xl"
                style={{ borderColor: globalClub.colors?.primary || '#8B1D3D' }}
              >
                 {globalClub.logo ? (
                    <img src={globalClub.logo} alt={globalClub.name} className="w-full h-full object-contain" />
                 ) : (
                    <Shield className="w-20 h-20 text-gray-600" />
                 )}
              </div>
              
              <div className="flex-1 text-center md:text-left mt-4 md:mt-16">
                 <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter italic">{globalClub.name}</h1>
                 <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-4">
                    <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-gray-400">
                       <MapPin className="w-4 h-4" /> Catalunya
                    </span>
                 </div>
              </div>
           </div>
        </div>
      </div>

      {/* League Selection Tabs — always show even if only 1 */}
      <section className="space-y-4">
         <h3 className="text-xs font-black uppercase tracking-widest text-gray-500">Categories Registrades</h3>
         <div className="flex flex-wrap items-center gap-3">
            {globalClub.activeLeagues.map(lid => (
               <button
                 key={lid}
                 onClick={() => setSelectedLeagueId(lid)}
                 className={`px-5 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                   selectedLeagueId === lid 
                   ? 'bg-rugby-gold text-rugby-navy' 
                   : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                 }`}
               >
                  {leagues[lid]?.name || lid}
               </button>
            ))}
         </div>
      </section>

      {/* Stats Dashboard */}
      {clubData && activeLeague ? (
         <div className="space-y-12">
           
           <div className="flex items-center gap-4 border-b border-white/5 pb-6">
             <Trophy className="w-6 h-6 text-rugby-gold" />
             <h2 className="text-2xl font-black uppercase italic tracking-widest">
                {activeLeague.name}
             </h2>
             <span className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-auto">
               Classificat {activeLeague.standings.findIndex(c => c.id === clubData.id) + 1}r
             </span>
           </div>

           <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
             <StatCard title="Punts Lliga" value={clubData.points} />
             <StatCard title="Victòries" value={clubData.won} />
             <StatCard title="Anotacions (PF)" value={clubData.pointsFor} />
             <StatCard title="Partits Jugats" value={clubData.played} />
           </div>

           <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
             
             {/* Match History */}
             <div className="space-y-6">
                <h3 className="text-xl font-black uppercase italic">Històric de Partits</h3>
                <div className="space-y-3">
                   {clubData.matchHistory && clubData.matchHistory.length > 0 ? (
                     clubData.matchHistory.map((match, i) => (
                       <Link key={i} to={`/competicio/${selectedLeagueId}/match/${match.matchId}`} className="block group">
                          <div className="glass-card p-5 bg-white/5 border-white/10 hover:border-rugby-gold/30 transition-all flex items-center justify-between">
                             <div className="flex items-center gap-4">
                                <div className={`w-2 h-12 rounded-full flex-shrink-0 ${match.result === 'W' ? 'bg-green-500' : match.result === 'D' ? 'bg-yellow-500' : 'bg-red-500'}`} />
                                <div>
                                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block">{match.date}</span>
                                  <h4 className="text-sm font-black uppercase tracking-tight mt-1">vs {match.opponent}</h4>
                                </div>
                             </div>
                             <div className="flex items-center gap-4">
                                <span className="text-xl font-black italic tracking-tighter">{match.score}</span>
                                <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-rugby-gold transition-colors" />
                             </div>
                          </div>
                       </Link>
                     ))
                   ) : (
                     <div className="text-center p-8 glass-card">
                       <p className="text-xs uppercase font-bold text-gray-500 tracking-widest">Sense historial actiu</p>
                     </div>
                   )}
                </div>
             </div>

             {/* Top Players */}
             <div className="space-y-6">
                 <h3 className="text-xl font-black uppercase italic">Jugadors Destacats</h3>
                 <div className="glass-card p-6 bg-white/5 space-y-3">
                    {clubData.squad && clubData.squad.length > 0 ? (
                      [...clubData.squad].sort((a,b) => (b.points || 0) - (a.points || 0)).slice(0, 5).map((player, idx) => (
                        <Link key={player.id} to={`/competicio/${selectedLeagueId}/player/${player.id}`} className="flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition-colors group">
                           <div className="flex items-center gap-4">
                              <span className="text-lg font-black text-gray-600 group-hover:text-rugby-gold w-6">{idx + 1}</span>
                              <span className="text-xs font-black uppercase tracking-widest">{player.name}</span>
                           </div>
                           <span className="text-xs font-bold text-gray-400 bg-white/5 px-3 py-1 rounded-full uppercase tracking-widest group-hover:bg-rugby-gold/20 group-hover:text-rugby-gold transition-colors flex-shrink-0">
                             {player.points || 0} pts
                           </span>
                        </Link>
                      ))
                    ) : (
                      <div className="text-center p-4">
                        <p className="text-[10px] uppercase font-bold text-gray-500 tracking-widest">Plantilla sense dades registrades</p>
                      </div>
                    )}
                 </div>
             </div>

             </div>

             {/* Full Squad - Now spans full width! */}
             <div className="space-y-6">
                 <h3 className="text-xl font-black uppercase italic">Plantilla</h3>
                 <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {clubData.squad && clubData.squad.length > 0 ? (
                      [...clubData.squad].sort((a,b) => (b.minutes || 0) - (a.minutes || 0)).map((player, idx) => (
                        <Link key={player.id} to={`/competicio/${selectedLeagueId}/player/${player.id}`} className="glass-card p-4 bg-white/5 hover:bg-white/10 hover:border-rugby-gold/30 transition-all group flex flex-col gap-2">
                           <div className="flex items-center gap-3 border-b border-white/5 pb-2">
                              <span className="text-lg font-black italic text-gray-600 group-hover:text-rugby-gold">{idx + 1}</span>
                              <span className="text-[10px] sm:text-xs font-black uppercase tracking-tight leading-tight truncate">{player.name}</span>
                           </div>
                           <div className="flex items-center justify-between">
                              <div className="flex flex-col">
                                 <span className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-500">Minuts</span>
                                 <span className="text-lg font-black italic text-white group-hover:text-rugby-gold transition-colors">{player.minutes}</span>
                              </div>
                              <div className="w-[1px] h-8 bg-white/10" />
                              <div className="flex flex-col text-right">
                                 <span className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-500">Partits</span>
                                 <span className="text-lg font-black italic text-gray-300">{player.matches}</span>
                              </div>
                           </div>
                        </Link>
                      ))
                    ) : (
                      <div className="text-center p-4">
                        <p className="text-[10px] uppercase font-bold text-gray-500 tracking-widest">Plantilla sense dades registrades</p>
                      </div>
                    )}
                 </div>
             </div>

          </div>
      ) : (
         <div className="text-center py-24">
            <Shield className="w-16 h-16 text-gray-700 mx-auto mb-6" />
            <h3 className="text-2xl font-black uppercase italic tracking-widest text-gray-500">Sense Dades Actives</h3>
            <p className="text-xs font-bold text-gray-600 uppercase tracking-widest mt-2">
              {selectedLeagueId ? leagues[selectedLeagueId]?.name : 'Cap Competició Seleccionada'}
            </p>
         </div>
      )}
    </div>
  );
};

const StatCard = ({ title, value }) => (
  <div className="glass-card p-6 border-white/5 flex flex-col items-center text-center gap-2">
     <span className="text-[10px] uppercase font-bold tracking-widest text-gray-500">{title}</span>
     <span className="text-3xl font-black italic tracking-tighter text-white">{value}</span>
  </div>
);

export default ClubProfile;
