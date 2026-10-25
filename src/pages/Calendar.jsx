import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar as CalendarIcon, ChevronRight, Clock, Shield } from 'lucide-react';

const Calendar = ({ leagueData }) => {
  const { rawMatches, id, name } = leagueData;
  // We sort rawMatches by ID assuming chronological order for simplicity,
  // or by a proper date string if parsed correctly.
  // Then we group them into "Finished" and "Scheduled".
  
  // Helper to parse DD-MM-YYYY
  const parseDate = (dateStr) => {
    if (!dateStr || dateStr === 'Unknown Date') return new Date(0);
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      return new Date(parts[2], parts[1] - 1, parts[0]);
    }
    return new Date(0);
  };

  // Group matches by phase
  const groupedMatches = rawMatches.reduce((acc, match) => {
    const phase = match.phase || "Jornada Desconeguda";
    if (!acc[phase]) acc[phase] = [];
    acc[phase].push(match);
    return acc;
  }, {});

  // Sort phases: Jornada 1, Jornada 2, ... Semifinal, Final
  const sortedPhases = Object.keys(groupedMatches).sort((a, b) => {
    const getPriority = (phase) => {
      if (phase.toLowerCase().includes('final')) return 100;
      if (phase.toLowerCase().includes('semifinal')) return 90;
      if (phase.toLowerCase().includes('jornada')) {
        const num = parseInt(phase.match(/\d+/)?.[0] || 0);
        return num;
      }
      return 0;
    };
    return getPriority(b) - getPriority(a); // Descending (latest first)
  });

  // Sort matches within each phase by date/ID
  sortedPhases.forEach(phase => {
    groupedMatches[phase].sort((a, b) => {
      const diff = parseDate(b.date) - parseDate(a.date);
      return diff !== 0 ? diff : (b.id - a.id);
    });
  });

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-24">
       <div className="flex flex-col md:flex-row items-center justify-between gap-6 border-b border-white/5 pb-8">
          <div>
            <h1 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter flex items-center gap-4">
              <CalendarIcon className="w-10 h-10 text-rugby-gold" />
              Calendari Oficial
            </h1>
            <p className="text-gray-400 font-bold uppercase tracking-widest text-xs mt-2">
              {name}
            </p>
          </div>
       </div>

       <div className="space-y-12">
          {sortedPhases.map(phase => (
             <section key={phase} className="space-y-6">
                <h2 className="text-xl font-black uppercase tracking-widest text-gray-500 flex items-center gap-3">
                   {phase}
                   <div className="flex-1 h-[1px] bg-white/5" />
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                   {groupedMatches[phase].map(m => {
                      const hasEvents = m.scorers.length > 0 || m.cards.length > 0;
                      const hasLineups = Object.values(m.lineups).some(arr => arr.length > 0);
                      const isZeroScore = m.score.home === 0 && m.score.away === 0;
                      const type = (!hasEvents && !hasLineups && isZeroScore) ? 'scheduled' : 'finished';
                      return <MatchCard key={m.id} match={m} type={type} leagueId={id} />;
                   })}
                </div>
             </section>
          ))}
       </div>
    </div>
  );
};

const MatchCard = ({ match, type, leagueId }) => (
  <Link to={`/competicio/${leagueId}/match/${match.id}`} className="block group">
    <div className="glass-card overflow-hidden hover:border-rugby-gold/30 transition-all h-full flex flex-col">
       <div className={`px-5 py-3 border-b flex justify-between items-center ${
         type === 'finished' ? 'bg-white/5 border-white/10' : 'bg-rugby-gold/10 border-rugby-gold/20'
       }`}>
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
             <Clock className={`w-3 h-3 ${type === 'finished' ? 'text-gray-500' : 'text-rugby-gold'}`} />
             <span className={type === 'finished' ? 'text-gray-500' : 'text-rugby-gold'}>
               {type === 'finished' ? match.date : 'Programat'}
             </span>
          </div>
          <span className="text-[10px] font-bold text-gray-600 uppercase">Acta #{match.id}</span>
       </div>
       
       <div className="p-6 flex-1 flex flex-col justify-center">
          <div className="flex items-center justify-between">
             <TeamDisplay name={match.homeTeam} logo={match.homeLogo} />
             
             {type === 'finished' ? (
                <div className="px-5 py-2 bg-black/30 rounded-xl border border-white/5 text-center">
                   <span className="text-3xl font-black italic tracking-tighter liquid-text">
                     {match.score.home} - {match.score.away}
                   </span>
                </div>
             ) : (
                <div className="text-gray-500 font-black uppercase text-xl italic px-4">VS</div>
             )}
             
             <TeamDisplay name={match.awayTeam} logo={match.awayLogo} align="right" />
          </div>
       </div>

       <div className="px-6 py-4 bg-black/20 border-t border-white/5 flex items-center justify-between group-hover:bg-white/5 transition-colors">
          <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500 group-hover:text-white transition-colors">
            {type === 'finished' ? 'Veure Detalls i Anotadors' : 'Veure Prèvia'}
          </span>
          <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-rugby-gold transition-colors" />
       </div>
    </div>
  </Link>
);

const TeamDisplay = ({ name, logo, align = 'left' }) => (
  <div className={`flex flex-col gap-2 ${align === 'right' ? 'items-end' : 'items-start'} max-w-[100px]`}>
     <div className="w-14 h-14 bg-white/5 rounded-xl border border-white/10 flex items-center justify-center p-2 shadow-inner">
       {logo ? (
          <img src={logo} alt={name} className="w-full h-full object-contain drop-shadow-md" />
       ) : (
          <Shield className="w-6 h-6 text-gray-600" />
       )}
     </div>
     <span className={`text-[10px] font-black uppercase leading-tight ${align === 'right' ? 'text-right' : 'text-left'}`}>
        {name?.length > 15 ? name.substring(0, 15) + '...' : (name || 'Equip')}
     </span>
  </div>
);

export default Calendar;
