import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Activity, Calendar as CalendarIcon, Users, ChevronRight, AlertTriangle, Info } from 'lucide-react';
import { motion } from 'framer-motion';

const GeneralDashboard = ({ data }) => {
  if (!data || !data.global) return null;
  const { global, leagues } = data;

  return (
    <div className="space-y-12 pb-24">
      {/* Federation Header / KPIs */}
      <section className="space-y-8">
        <div>
          <h1 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter flex items-center gap-4">
            <Activity className="w-12 h-12 text-rugby-gold" />
            Federació Catalana de Rugby
          </h1>
          <p className="text-gray-400 font-bold uppercase tracking-widest text-xs mt-2">
            Plataforma Digital de Competició Oficial
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KPICard title="Clubs Federats" value={global.totalClubs} icon={<Shield className="w-5 h-5 text-rugby-gold" />} />
          <KPICard title="Jugadors" value={global.totalPlayers} icon={<Users className="w-5 h-5 text-rugby-gold" />} />
          <KPICard title="Competicions" value={Object.keys(leagues).length} icon={<TrophyIcon className="w-5 h-5 text-rugby-gold" />} />
          <KPICard title="Partits" value={global.totalMatches} icon={<CalendarIcon className="w-5 h-5 text-rugby-gold" />} />
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Main Column: Standings Previews & Results */}
        <div className="lg:col-span-2 space-y-12">
           
           {/* Active Competitions Preview */}
           <section className="space-y-6">
              <h2 className="text-2xl font-black uppercase italic flex items-center gap-3">
                 <TrophyIcon className="text-rugby-gold w-6 h-6" />
                 Lligues en Joc
              </h2>
              <div className="space-y-8">
                 {Object.values(leagues).map(league => (
                    <LeaguePreviewCard key={league.id} league={league} />
                 ))}
              </div>
           </section>

           {/* Latest Global Results */}
           <section className="space-y-6">
              <div className="flex items-center justify-between">
                 <h2 className="text-xl font-black uppercase italic flex items-center gap-3">
                    <Activity className="text-rugby-gold w-6 h-6" />
                    Últims Resultats
                 </h2>
                 <Link to="/competicions" className="text-[10px] font-bold text-gray-400 hover:text-white transition-colors uppercase tracking-widest flex items-center gap-1 group">
                    Veure Tot <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                 </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 {global.recentMatches.map(match => (
                    <MatchMiniCard key={match.id} match={match} />
                 ))}
              </div>
           </section>
        </div>

        {/* Sidebar: Notices & Upcoming */}
        <div className="space-y-12">
           <section className="space-y-6">
              <h2 className="text-xl font-black uppercase italic flex items-center gap-3">
                 <AlertTriangle className="text-rugby-gold w-6 h-6" />
                 Tauler de la Federació
              </h2>
              <div className="glass-card p-6 space-y-4">
                 <NoticeItem 
                   title="Tancament d'Actes Jornada 14" 
                   date="Fa 2 hores" 
                   color="border-rugby-gold"
                 />
                 <NoticeItem 
                   title="Comunicat Comitè de Disciplina" 
                   date="Ahir" 
                   color="border-red-500"
                 />
                 <NoticeItem 
                   title="Actualització Protocol Conmocions" 
                   date="Fa 3 dies" 
                   color="border-blue-500"
                 />
              </div>
           </section>

           <section className="space-y-6">
              <h2 className="text-xl font-black uppercase italic flex items-center gap-3">
                 <CalendarIcon className="text-rugby-gold w-6 h-6" />
                 Pròxima Jornada
              </h2>
              <div className="space-y-4">
                 {global.upcomingMatches.map(match => (
                    <UpcomingMiniCard key={match.id} match={match} />
                 ))}
                 {global.upcomingMatches.length === 0 && (
                    <div className="p-6 glass-card text-center text-xs font-bold uppercase tracking-widest text-gray-500">
                       No hi ha partits propers programats.
                    </div>
                 )}
              </div>
           </section>
        </div>
      </div>
    </div>
  );
};

const KPICard = ({ title, value, icon }) => (
  <div className="glass-card p-6 border-white/5 flex flex-col gap-2">
     <div className="flex items-center justify-between">
        <span className="text-[10px] uppercase font-bold tracking-widest text-gray-400">{title}</span>
        {icon}
     </div>
     <span className="text-4xl font-black italic tracking-tighter liquid-text">{value}</span>
  </div>
);

const LeaguePreviewCard = ({ league }) => {
  const topTeams = league.standings.slice(0, 3);
  return (
    <div className="glass-card overflow-hidden">
       <div className="p-5 bg-white/5 border-b border-white/10 flex items-center justify-between">
          <div>
            <h3 className="font-black uppercase tracking-widest">{league.name}</h3>
            <p className="text-[9px] text-gray-400 font-bold uppercase tracking-[0.2em] mt-1">{league.clubs.length} Clubs Registrats</p>
          </div>
          <Link to={`/competicio/${league.id}`} className="glass-button text-[10px] uppercase font-black px-4 py-2 flex items-center gap-2 group">
             Entrar al Dashboard <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
          </Link>
       </div>
       <div className="p-0">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-black/20 text-[9px] uppercase font-black tracking-widest text-gray-500 border-b border-white/5">
                <th className="px-5 py-3">#</th>
                <th className="px-5 py-3">Equip</th>
                <th className="px-5 py-3 text-center">J</th>
                <th className="px-5 py-3 text-center">Pts</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {topTeams.map((club, index) => (
                 <tr key={club.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-5 py-3 font-black text-gray-500 text-xs">{index + 1}</td>
                    <td className="px-5 py-3">
                       <div className="flex items-center gap-3">
                          {club.logo ? (
                            <img src={club.logo} className="w-6 h-6 object-contain" alt="" />
                          ) : (
                            <div className="w-1.5 h-6 rounded-full" style={{ backgroundColor: club.colors.primary }} />
                          )}
                          <span className="font-black text-xs uppercase">{club.name}</span>
                       </div>
                    </td>
                    <td className="px-5 py-3 text-center font-bold text-gray-400 text-xs">{club.played}</td>
                    <td className="px-5 py-3 text-center font-black text-rugby-gold text-sm">{club.points}</td>
                 </tr>
              ))}
            </tbody>
          </table>
       </div>
       <div className="bg-black/40 p-3 text-center">
         <Link to={`/competicio/${league.id}/classificacio`} className="text-[9px] font-bold text-gray-500 hover:text-white transition-colors uppercase tracking-widest">
            Veure Taula Completa
         </Link>
       </div>
    </div>
  );
};

const MatchMiniCard = ({ match }) => (
  <div className="glass-card p-4 hover:border-rugby-gold/30 transition-all flex flex-col gap-3">
     <div className="flex justify-between items-center border-b border-white/5 pb-2">
        <span className="text-[8px] font-black uppercase tracking-widest text-gray-500">{match.date}</span>
        <span className="px-2 py-0.5 bg-rugby-gold/10 text-rugby-gold text-[8px] font-black uppercase rounded">Finalitzat</span>
     </div>
     <div className="flex justify-between items-center px-2">
        <span className="font-black uppercase text-[10px] text-right truncate w-24">{match.homeTeam}</span>
        <div className="px-3 py-1 bg-black/30 rounded border border-white/10 font-black italic">
           {match.score.home} - {match.score.away}
        </div>
        <span className="font-black uppercase text-[10px] truncate w-24">{match.awayTeam}</span>
     </div>
  </div>
);

const UpcomingMiniCard = ({ match }) => (
  <div className="glass-card p-4 border-white/5 border-l-2 border-l-rugby-gold flex flex-col gap-3">
     <div className="flex justify-between items-center border-b border-white/5 pb-2">
        <span className="text-[8px] font-black uppercase tracking-widest text-gray-500">Pendent Fixar Data</span>
        <span className="text-[8px] font-bold uppercase text-gray-600">S18 Primera</span>
     </div>
     <div className="flex justify-between items-center px-2">
        <span className="font-black uppercase text-[10px] text-gray-300 truncate">{match.homeTeam}</span>
        <span className="font-black text-gray-600 text-xs italic">VS</span>
        <span className="font-black uppercase text-[10px] text-gray-300 truncate">{match.awayTeam}</span>
     </div>
  </div>
);

const NoticeItem = ({ title, date, color }) => (
  <div className={`pl-4 border-l-2 ${color} py-1`}>
     <p className="text-xs font-black uppercase tracking-tight">{title}</p>
     <p className="text-[9px] font-bold uppercase tracking-widest text-gray-500 mt-1">{date}</p>
  </div>
);

const TrophyIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/>
    <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/>
    <path d="M4 22h16"/>
    <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/>
    <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/>
    <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>
  </svg>
);

export default GeneralDashboard;
