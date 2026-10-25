import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { User, Shield, Zap, AlertCircle, Clock, ChevronLeft, Award, Activity, Star } from 'lucide-react';

const PlayerProfile = ({ leagueData }) => {
  const { players, name: leagueName, id: leagueId } = leagueData;
  const { playerId } = useParams();
  const player = players.find(p => p.id === playerId);

  if (!player) return <div className="min-h-screen flex items-center justify-center">Jugador no trobat</div>;

  const grogues = player.cards?.yellow || 0;
  const vermelles = player.cards?.red || 0;

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-24">
      {/* Back Navigation */}
      <Link to={`/competicio/${leagueId}`} className="inline-flex items-center gap-2 text-gray-500 hover:text-white transition-all group font-black uppercase text-[10px] tracking-widest">
        <div className="p-2 bg-white/5 rounded-lg group-hover:bg-rugby-garnet/20 transition-colors">
          <ChevronLeft className="w-4 h-4" />
        </div>
        Tornar al Dashboard
      </Link>

      {/* Player Identity Hero */}
      <div className="glass-card p-10 md:p-16 relative overflow-hidden bg-white/5 border-white/5">
        <div className="absolute top-0 right-0 w-96 h-96 bg-rugby-gold/5 rounded-full -mr-48 -mt-48 blur-3xl opacity-30" />
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-12">
          <div className="relative">
            <div className="w-40 h-40 bg-rugby-navy rounded-3xl flex items-center justify-center border-2 border-white/10 text-white relative shadow-2xl overflow-hidden">
               <User className="w-20 h-20 opacity-20" />
               <div className="absolute bottom-0 left-0 w-full h-2 bg-rugby-gold" />
            </div>
            {player.points > 20 && (
              <div className="absolute -top-4 -right-4 bg-rugby-gold p-3 rounded-2xl shadow-xl shadow-rugby-gold/20">
                < Award className="w-6 h-6 text-rugby-navy" />
              </div>
            )}
          </div>
          
          <div className="text-center md:text-left flex-1">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mb-4">
               <span className="text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1 bg-white/5 rounded-lg text-gray-400 border border-white/10">
                 Llicència: {player.id}
               </span>
               <span className="text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1 bg-rugby-gold/20 rounded-lg text-rugby-gold border border-rugby-gold/10">
                 {leagueName}
               </span>
            </div>
            <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter italic mb-6 leading-none">
              {player.name}
            </h1>
            <Link 
              to={`/club/${player.club.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
              className="inline-flex items-center gap-3 bg-white/5 hover:bg-white/10 px-6 py-3 rounded-2xl border border-white/10 transition-all group"
            >
              <Shield className="w-5 h-5 text-rugby-gold" />
              <span className="font-black uppercase text-sm tracking-tight group-hover:text-rugby-gold transition-colors">
                {player.club}
              </span>
            </Link>
          </div>
        </div>
      </div>

      {/* Real Accurate Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <SeasonalMetric icon={<Zap className="text-blue-400" />} label="Partits Jugats" value={player.matches} />
        <SeasonalMetric icon={<Star className="text-green-400" />} label="Titularitats" value={player.starts} />
        <SeasonalMetric icon={<Clock className="text-rugby-gold" />} label="Minuts (Reals)" value={player.minutes} />
        <div className="glass-card p-10 flex flex-col items-center justify-center text-center gap-2 hover:bg-white/5 hover:border-white/20 transition-all">
          <div className="flex gap-4">
             <div className="flex flex-col items-center gap-1">
                <div className="w-8 h-10 rounded bg-yellow-400 border border-yellow-500 shadow-lg" />
                <span className="text-xl font-black">{grogues}</span>
             </div>
             <div className="flex flex-col items-center gap-1">
                <div className="w-8 h-10 rounded bg-red-600 border border-red-700 shadow-lg" />
                <span className="text-xl font-black">{vermelles}</span>
             </div>
          </div>
          <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mt-2 border-t border-white/10 pt-2 w-full">Targetes</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Scoring Breakdown */}
        <div className="space-y-8">
           <div className="glass-card p-8">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-500 mb-8 border-b border-white/5 pb-4">
                Distribució de Punts
              </h3>
              <div className="space-y-6">
                <ScoringRow label="Assajos" count={player.stats.tries || 0} pts={5} color="bg-rugby-gold" />
                <ScoringRow label="Transformacions" count={player.stats.convs || 0} pts={2} color="bg-blue-500" />
                <ScoringRow label="Penals" count={player.stats.pens || 0} pts={3} color="bg-rugby-garnet" />
              </div>
              <div className="mt-12 pt-8 border-t border-white/5 flex justify-between items-center">
                 <span className="text-[10px] font-black uppercase text-gray-500">Punts Totals</span>
                 <span className="text-4xl font-black italic liquid-text">{player.points}</span>
              </div>
           </div>
        </div>

        {/* Real Season Timeline */}
        <div className="lg:col-span-2 space-y-8">
           <div className="glass-card">
              <div className="p-8 border-b border-white/10 flex items-center justify-between">
                 <h2 className="text-xl font-black uppercase italic tracking-tight">Actes Oficials (Històric)</h2>
                 <Activity className="w-5 h-5 text-rugby-gold opacity-30" />
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="bg-white/5 text-[10px] font-black uppercase tracking-widest text-gray-500 border-b border-white/10">
                      <th className="px-8 py-5 text-center" colSpan="2">Detalls del Partit</th>
                      <th className="px-8 py-5">Rol i Minuts</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {player.history.length > 0 ? (
                      player.history.map((h, i) => (
                        <tr key={i} className="hover:bg-white/5 transition-colors">
                          <td className="px-8 py-6" colSpan="2">
                             <Link to={`/competicio/${leagueId}/match/${h.matchId}`} className="block group">
                                <div className="flex items-center justify-center gap-6 p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-rugby-gold/30 transition-all">
                                   <div className="flex items-center gap-3 w-1/3 justify-end text-right">
                                      <span className="text-xs font-black uppercase tracking-tight text-white">{h.homeTeam}</span>
                                      <img src={h.homeLogo} alt={h.homeTeam} className="w-8 h-8 object-contain drop-shadow-md bg-white/5 rounded-lg p-1" />
                                   </div>
                                   <div className="px-4 py-2 bg-black/40 rounded-xl border border-white/5 text-center flex-shrink-0 min-w-[80px]">
                                      <span className="text-xl font-black italic tracking-tighter liquid-text">
                                        {h.score?.home ?? '-'} - {h.score?.away ?? '-'}
                                      </span>
                                   </div>
                                   <div className="flex items-center gap-3 w-1/3 justify-start text-left">
                                      <img src={h.awayLogo} alt={h.awayTeam} className="w-8 h-8 object-contain drop-shadow-md bg-white/5 rounded-lg p-1" />
                                      <span className="text-xs font-black uppercase tracking-tight text-white">{h.awayTeam}</span>
                                   </div>
                                </div>
                             </Link>
                          </td>
                          <td className="px-8 py-6">
                             <div className="flex flex-col gap-1">
                                {h.started ? (
                                   <span className="text-[10px] font-black uppercase tracking-widest text-blue-400">Titular</span>
                                ) : (
                                   <span className="text-[10px] font-black uppercase tracking-widest text-orange-400">Suplent</span>
                                )}
                                <span className="font-bold text-gray-300 text-xs">{h.minutes} mins disputats</span>
                             </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="3" className="px-8 py-12 text-center text-gray-500 italic">
                          No va ser convocat en cap partit de la temporada segons les actes.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

const SeasonalMetric = ({ icon, label, value }) => (
  <div className="glass-card p-10 flex flex-col items-center text-center gap-4 hover:bg-white/5 hover:border-white/20 transition-all group">
    <div className="p-4 bg-white/5 rounded-3xl group-hover:scale-110 transition-transform shadow-lg">{icon}</div>
    <p className="text-4xl font-black italic tracking-tighter uppercase">{value}</p>
    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest border-t border-white/10 pt-2 w-full">{label}</p>
  </div>
);

const ScoringRow = ({ label, count, pts, color }) => (
  <div className="space-y-2">
     <div className="flex justify-between items-baseline">
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">{label}</span>
        <span className="font-black italic text-lg">{count} <span className="text-[10px] text-gray-600 not-italic">× {pts} pts</span></span>
     </div>
     <div className="h-2 bg-white/5 rounded-full overflow-hidden flex gap-0.5">
        {count > 0 ? [...Array(Math.max(1, count))].map((_, i) => (
          <div key={i} className={`flex-1 h-full rounded-full ${color} opacity-80`} />
        )) : (
          <div className="flex-1 h-full rounded-full bg-white/5" />
        )}
     </div>
  </div>
);

export default PlayerProfile;
