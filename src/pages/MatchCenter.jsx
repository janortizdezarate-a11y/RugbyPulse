import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft, Info, Clock, AlertTriangle, User, Users, Shield, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

const MatchCenter = ({ leagueData }) => {
  const { rawMatches, id: leagueId, name: leagueName } = leagueData;
  const { matchId } = useParams();
  const match = rawMatches.find(m => m.id === parseInt(matchId));

  if (!match) return <div className="min-h-screen flex items-center justify-center">Partit no trobat</div>;

  // Combine scorers and cards into a unified chronological timeline
  const timelineEvents = [
    ...(match.scorers || []).map(s => ({ ...s, isCard: false })),
    ...(match.cards || []).map(c => ({ ...c, isCard: true }))
  ].sort((a, b) => a.min - b.min);

  return (
    <div className="max-w-5xl mx-auto space-y-12">
      {/* Match Header */}
      <div className="glass-card overflow-hidden">
        <div className="bg-white/5 p-8 md:p-12 border-b border-white/10">
          <div className="flex flex-col items-center gap-8">
            <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">
               <CalendarItem date={match.date} />
               <span className="w-1 h-1 bg-gray-700 rounded-full" />
               <span>{leagueName}</span>
            </div>
            
            <div className="grid grid-cols-3 items-center w-full max-w-3xl">
              <TeamInfo name={match.homeTeam} logo={match.homeLogo} />
              <div className="text-center space-y-2">
                <div className="text-5xl md:text-7xl font-black italic tracking-tighter liquid-text">
                  {match.score.home} - {match.score.away}
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-rugby-gold bg-rugby-gold/10 px-4 py-1 rounded-full">
                  Finalitzat
                </span>
              </div>
              <TeamInfo name={match.awayTeam} logo={match.awayLogo} align="right" />
            </div>
          </div>
        </div>

        {/* Scoring & Events Timeline */}
        <div className="p-8 bg-black/20 border-t border-white/5">
           <h3 className="text-xs font-black uppercase tracking-widest text-gray-500 mb-6 text-center">Línia de Temps i Incidències</h3>
           <div className="space-y-3 max-w-2xl mx-auto">
              {timelineEvents.length > 0 ? (
                timelineEvents.map((evt, i) => (
                  <div key={i} className={`flex items-center gap-4 ${evt.team === match.homeTeam ? 'flex-row' : 'flex-row-reverse'}`}>
                    <span className="text-xs font-black text-gray-600 w-8 text-center">{evt.min}'</span>
                    <div className={`flex-1 p-3 rounded-xl border flex items-center gap-3 ${
                      evt.team === match.homeTeam 
                        ? 'bg-white/5 border-white/10' 
                        : 'bg-black/30 border-white/5'
                    }`}>
                      {evt.isCard ? (
                         <div className={`w-4 h-5 rounded-sm ${evt.type === 'Yellow' ? 'bg-yellow-400' : 'bg-red-500'}`} />
                      ) : (
                         <Zap className={`w-4 h-4 ${evt.type.includes('Try') ? 'text-rugby-gold' : 'text-blue-400'}`} />
                      )}
                      
                      <div className={`flex-1 flex flex-col ${evt.team === match.homeTeam ? 'items-start text-left' : 'items-end text-right'}`}>
                        <p className="text-xs font-black uppercase tracking-tight text-gray-200">{evt.player}</p>
                        <p className={`text-[9px] font-bold uppercase tracking-wider ${evt.isCard ? (evt.type === 'Yellow' ? 'text-yellow-400' : 'text-red-500') : 'text-gray-500'}`}>
                           {evt.type}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center p-8">
                  <p className="text-gray-500 italic text-xs uppercase tracking-widest font-black">Sense incidències registrades.</p>
                </div>
              )}
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Lineups */}
        <section className="space-y-6">
           <h2 className="text-xl font-black uppercase italic italic flex items-center gap-3">
              <Users className="text-rugby-gold w-6 h-6" />
              Alineacions
           </h2>
           <div className="grid grid-cols-1 gap-8 text-white">
              <TeamLineup teamName={match.homeTeam} lineup={match.lineups[match.homeTeam]} />
              <TeamLineup teamName={match.awayTeam} lineup={match.lineups[match.awayTeam]} />
           </div>
        </section>

        {/* General Info */}
        <section className="space-y-6">
           <h2 className="text-xl font-black uppercase italic flex items-center gap-3">
              <Info className="text-rugby-gold w-6 h-6" />
              Detalls
           </h2>
           <div className="glass-card p-12 text-center flex flex-col items-center gap-4 bg-white/5 h-full justify-center">
              <Shield className="w-12 h-12 text-gray-700 mx-auto" />
              <p className="text-xs font-black text-gray-500 uppercase tracking-widest leading-relaxed max-w-xs mt-4">
                Les dades mostrades aquí han estat importades automàticament des de les actes oficials. Els temps exactes poden patir petites variacions segons criteri arbitral.
              </p>
           </div>
        </section>
      </div>
    </div>
  );
};

const TeamInfo = ({ name, logo, align = 'left' }) => (
  <div className={`flex flex-col ${align === 'right' ? 'items-end' : 'items-start'} gap-4`}>
    <div className="w-20 h-20 bg-white/5 rounded-2xl border border-white/10 flex items-center justify-center shadow-2xl relative overflow-hidden">
       {logo ? <img src={logo} alt={name} className="w-14 h-14 object-contain relative z-10" /> : <Shield className="w-10 h-10 text-gray-600 relative z-10" />}
    </div>
    <h3 className={`text-xl font-black uppercase tracking-tighter ${align === 'right' ? 'text-right' : 'text-left'}`}>
      {name}
    </h3>
  </div>
);

const TeamLineup = ({ teamName, lineup }) => (
  <div className="glass-card overflow-hidden">
    <div className="px-6 py-4 bg-white/5 border-b border-white/10">
      <h4 className="text-[10px] font-black uppercase tracking-widest text-rugby-gold">{teamName}</h4>
    </div>
    <div className="p-4 space-y-1">
      {lineup?.map((p, i) => (
        <div key={i} className="flex items-center gap-4 p-2.5 rounded-lg hover:bg-white/5 transition-colors group">
          <span className="w-6 text-[10px] font-black text-gray-600 group-hover:text-rugby-gold">{p.number}</span>
          <div className="flex-1 min-w-0">
             <p className="text-[11px] font-black uppercase tracking-tight truncate">{p.name}</p>
          </div>
          {p.isStarter ? (
            <span className="text-[8px] font-bold text-gray-600 uppercase border border-gray-800 px-1.5 py-0.5 rounded">Titular</span>
          ) : (
            <span className="text-[8px] font-bold text-rugby-gold uppercase bg-rugby-gold/10 px-1.5 py-0.5 rounded">Reserva</span>
          )}
        </div>
      ))}
    </div>
  </div>
);

const CalendarItem = ({ date }) => (
  <div className="flex items-center gap-2">
    <Clock className="w-3 h-3" />
    <span>{date}</span>
  </div>
);

export default MatchCenter;
