import React from 'react';
import { Link } from 'react-router-dom';
import { Trophy, ChevronRight, Users, Star, ArrowUpRight, Activity, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

const Dashboard = ({ leagueData }) => {
  if (!leagueData || !leagueData.standings) return null;
  const { standings, topScorers, id, name, rawMatches } = leagueData;
  const topClubs = standings.slice(0, 3);

  // Extract Playoff matches
  const playoffMatches = rawMatches.filter(m => 
    m.phase && (m.phase.toLowerCase().includes('semifinal') || m.phase.toLowerCase().includes('final'))
  ).sort((a, b) => {
    // Sort Final after Semifinal
    if (a.phase.toLowerCase().includes('final') && !b.phase.toLowerCase().includes('final')) return 1;
    if (!a.phase.toLowerCase().includes('final') && b.phase.toLowerCase().includes('final')) return -1;
    return 0;
  });

  return (
    <div className="space-y-12">
      {/* Playoff Section */}
      {playoffMatches.length > 0 && (
        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <Activity className="text-rugby-gold w-6 h-6 animate-pulse" />
            <h2 className="text-xl font-black uppercase italic tracking-widest">Fase Final / Playoffs</h2>
            <div className="flex-1 h-[1px] bg-white/5" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {playoffMatches.map((match) => (
              <Link key={match.id} to={`/competicio/${id}/match/${match.id}`} className="block group">
                <div className="glass-card overflow-hidden hover:border-rugby-gold/30 transition-all">
                  <div className="px-4 py-2 bg-white/5 border-b border-white/10 flex justify-between items-center">
                    <span className="text-[10px] font-black uppercase tracking-widest text-rugby-gold">{match.phase}</span>
                    <span className="text-[10px] font-bold text-gray-500 uppercase">{match.date}</span>
                  </div>
                  <div className="p-6 flex items-center justify-between gap-4">
                    <div className="flex flex-col items-center gap-2 flex-1 min-w-0">
                      <img src={match.homeLogo} alt={match.homeTeam} className="w-10 h-10 object-contain drop-shadow-lg" />
                      <span className="text-[10px] font-black uppercase tracking-tight text-center truncate w-full">{match.homeTeam}</span>
                    </div>
                    
                    <div className="flex flex-col items-center gap-1">
                      <div className="px-4 py-2 bg-black/40 rounded-xl border border-white/5 text-center min-w-[70px]">
                        <span className="text-2xl font-black italic tracking-tighter liquid-text">
                          {match.score.home} - {match.score.away}
                        </span>
                      </div>
                      <span className="text-[8px] font-bold text-gray-500 uppercase tracking-widest">Finalitzat</span>
                    </div>

                    <div className="flex flex-col items-center gap-2 flex-1 min-w-0">
                      <img src={match.awayLogo} alt={match.awayTeam} className="w-10 h-10 object-contain drop-shadow-lg" />
                      <span className="text-[10px] font-black uppercase tracking-tight text-center truncate w-full">{match.awayTeam}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Featured Clubs Hero */}
      <section>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-black flex items-center gap-3 tracking-tighter uppercase italic">
              <Star className="text-rugby-gold fill-rugby-gold w-8 h-8" />
              {name}
            </h2>
            <p className="text-gray-400 text-sm mt-1">Dashboard de competició</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {topClubs.map((club, index) => (
            <motion.div
              key={club.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="glass-card hover:border-rugby-gold/30 transition-all group overflow-hidden relative"
            >
              <div 
                className="absolute top-0 left-0 w-full h-1" 
                style={{ backgroundColor: club.colors.primary }} 
              />
              <Link to={`/club/${club.id}`} className="p-6 block">
                <div className="flex justify-between items-start mb-6">
                  <div className="p-3 rounded-2xl bg-white/5 border border-white/10 group-hover:bg-rugby-gold/10 transition-colors">
                    {club.logo ? (
                       <img src={club.logo} alt={club.name} className="w-8 h-8 object-contain" />
                    ) : (
                       <Users className="w-8 h-8 text-rugby-gold" />
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Classificació</p>
                    <p className="text-4xl font-black text-white italic">{index + 1}r</p>
                  </div>
                </div>
                
                <h3 className="text-2xl font-black mb-1 group-hover:text-rugby-gold transition-colors">{club.name}</h3>
                <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-6">{name}</p>
                
                <div className="grid grid-cols-3 gap-4 border-t border-white/10 pt-4">
                  <StatItem label="Punts" value={club.points} />
                  <StatItem label="Victòries" value={club.won} />
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] text-gray-500 font-bold uppercase tracking-tighter">Forma</span>
                    <div className="flex gap-1">
                      {club.lastMatches.map((m, i) => (
                        <div key={i} className={`w-2 h-2 rounded-full ${m === 'W' ? 'bg-green-500' : m === 'D' ? 'bg-yellow-500' : 'bg-red-500'}`} />
                      ))}
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Standings */}
        <section className="lg:col-span-2">
          <div className="glass-card border-white/5 overflow-hidden">
            <div className="p-6 bg-white/5 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Trophy className="text-rugby-gold w-6 h-6" />
                <h2 className="text-xl font-black uppercase italic tracking-tight">Classificació Oficial</h2>
              </div>
              <Link to={`/competicio/${id}/classificacio`} className="text-[10px] font-bold text-gray-500 hover:text-white transition-colors uppercase tracking-widest flex items-center gap-1 group">
                 Veure Tota la Taula <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-white/5 text-[10px] uppercase font-black tracking-widest text-gray-400 border-b border-white/10">
                    <th className="px-6 py-4">#</th>
                    <th className="px-6 py-4">Club</th>
                    <th className="px-6 py-4 text-center">PJ</th>
                    <th className="px-6 py-4 text-center">PTS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {standings.map((club, index) => (
                    <tr key={club.id} className="hover:bg-white/5 transition-colors group">
                      <td className="px-6 py-5 font-black text-gray-500">{index + 1}</td>
                      <td className="px-6 py-5">
                        <Link to={`/club/${club.id}`} className="flex items-center gap-4 group-hover:text-rugby-gold transition-all">
                          <div className="w-2 h-8 rounded-full flex-shrink-0" style={{ backgroundColor: club.colors.primary }} />
                          {club.logo && <img src={club.logo} alt={club.name} className="w-6 h-6 object-contain" />}
                          <span className="font-black uppercase text-sm tracking-tight">{club.name}</span>
                          <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </Link>
                      </td>
                      <td className="px-6 py-5 text-center font-bold text-gray-400">{club.played}</td>
                      <td className="px-6 py-5 text-center font-black text-lg text-rugby-gold">{club.points}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Top Scorers */}
        <section className="space-y-8">
          <div className="glass-card border-rugby-gold/10">
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Zap className="text-rugby-gold w-6 h-6" />
                <h2 className="text-xl font-black uppercase italic tracking-tight">Màxims Anotadors</h2>
              </div>
            </div>
            <div className="p-4 space-y-3">
              {topScorers.map((player, index) => (
                <Link key={player.id} to={`/competicio/${id}/player/${player.id}`} className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition-all group">
                  <div className="text-lg font-black text-gray-600 group-hover:text-rugby-gold transition-colors">{index + 1}</div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm truncate uppercase tracking-tight">{player.name}</p>
                    <p className="text-[10px] text-gray-500 font-bold uppercase truncate">{player.club}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-black text-white">{player.points}</p>
                    <p className="text-[8px] text-gray-500 font-bold uppercase tracking-widest leading-none">PTS</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
          
          <div className="glass-card p-6 bg-rugby-garnet/10 border-rugby-garnet/20">
            <h3 className="text-sm font-black uppercase tracking-widest mb-2">Matchday Live</h3>
            <p className="text-xs text-gray-400 mb-4">Segueix els marcadors en temps real a l'Match Center.</p>
            <Link to={`/competicio/${id}/calendari`} className="glass-button w-full block text-center text-xs uppercase font-black tracking-widest">
              Anar al Calendari
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
};

const StatItem = ({ label, value }) => (
  <div className="flex flex-col gap-1">
    <span className="text-[10px] text-gray-500 font-bold uppercase tracking-tighter">{label}</span>
    <span className="text-lg font-black text-white tracking-tight">{value}</span>
  </div>
);

export default Dashboard;
