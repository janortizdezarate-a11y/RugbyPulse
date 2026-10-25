import React from 'react';
import { Link } from 'react-router-dom';
import { Trophy, ChevronLeft, ArrowUpRight, Info } from 'lucide-react';

const Standings = ({ leagueData }) => {
  const { standings, name, id } = leagueData;
  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-24">
      {/* Back Navigation */}
      <Link to={`/competicio/${id}`} className="inline-flex items-center gap-2 text-gray-500 hover:text-white transition-all group font-black uppercase text-[10px] tracking-widest">
        <div className="p-2 bg-white/5 rounded-lg group-hover:bg-rugby-gold/20 transition-colors">
          <ChevronLeft className="w-4 h-4" />
        </div>
        Tornar al Dashboard
      </Link>

      <div className="glass-card overflow-hidden">
        <div className="p-8 bg-white/5 border-b border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <Trophy className="text-rugby-gold w-8 h-8" />
            <div>
               <h1 className="text-3xl font-black uppercase italic tracking-tight">Classificació Oficial</h1>
               <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em] mt-1">{name}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-rugby-gold bg-rugby-gold/10 px-4 py-2 rounded-xl border border-rugby-gold/20">
             Temporada 2025/2026
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white/5 text-[10px] uppercase font-black tracking-[0.2em] text-gray-400 border-b border-white/10">
                <th className="px-6 py-5 text-center">#</th>
                <th className="px-6 py-5">Equip</th>
                <th className="px-3 py-5 text-center" title="Jugats">J</th>
                <th className="px-3 py-5 text-center" title="Guanyats">G</th>
                <th className="px-3 py-5 text-center" title="Empatats">E</th>
                <th className="px-3 py-5 text-center" title="Perduts">P</th>
                <th className="px-3 py-5 text-center" title="Punts a Favor">PF</th>
                <th className="px-3 py-5 text-center" title="Punts en Contra">PC</th>
                <th className="px-3 py-5 text-center border-r border-white/5" title="Diferència de Punts">DP</th>
                <th className="px-3 py-5 text-center text-blue-400" title="Assajos a Favor">AF</th>
                <th className="px-3 py-5 text-center text-orange-400 border-r border-white/5" title="Assajos en Contra">AC</th>
                <th className="px-3 py-5 text-center text-green-400" title="Bonus Ofensiu">BO</th>
                <th className="px-3 py-5 text-center text-purple-400 border-r border-white/5" title="Bonus Defensiu">BD</th>
                <th className="px-6 py-5 text-center text-rugby-gold">Punts</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {standings.map((club, index) => (
                <tr key={club.id} className="hover:bg-white/5 transition-colors group">
                  <td className="px-6 py-5 font-black text-gray-500 text-center">{index + 1}</td>
                  <td className="px-6 py-5">
                    <Link to={`/club/${club.id}`} className="flex items-center gap-4 group-hover:text-rugby-gold transition-all">
                      {club.logo ? (
                         <img src={club.logo} alt={club.name} className="w-8 h-8 object-contain drop-shadow-md" />
                      ) : (
                         <div className="w-2 h-8 rounded-full flex-shrink-0" style={{ backgroundColor: club.colors.primary }} />
                      )}
                      <span className="font-black uppercase text-sm tracking-tight">{club.name}</span>
                      <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>
                  </td>
                  <td className="px-3 py-5 text-center font-bold text-gray-300">{club.played}</td>
                  <td className="px-3 py-5 text-center font-bold text-gray-300">{club.won}</td>
                  <td className="px-3 py-5 text-center font-bold text-gray-300">{club.drawn}</td>
                  <td className="px-3 py-5 text-center font-bold text-gray-300">{club.lost}</td>
                  <td className="px-3 py-5 text-center font-bold text-gray-400">{club.pointsFor}</td>
                  <td className="px-3 py-5 text-center font-bold text-gray-400">{club.pointsAgainst}</td>
                  <td className="px-3 py-5 text-center font-black text-white border-r border-white/5">
                    {club.pointsFor - club.pointsAgainst > 0 ? `+${club.pointsFor - club.pointsAgainst}` : club.pointsFor - club.pointsAgainst}
                  </td>
                  <td className="px-3 py-5 text-center font-bold text-blue-400/80">{club.triesFor}</td>
                  <td className="px-3 py-5 text-center font-bold text-orange-400/80 border-r border-white/5">{club.triesAgainst}</td>
                  <td className="px-3 py-5 text-center font-black text-green-400">{club.bonusOffensive}</td>
                  <td className="px-3 py-5 text-center font-black text-purple-400 border-r border-white/5">{club.bonusDefensive}</td>
                  <td className="px-6 py-5 text-center font-black text-xl text-rugby-gold italic">{club.points}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Legend */}
        <div className="p-8 bg-black/20 border-t border-white/10 flex flex-col md:flex-row items-center justify-center gap-x-8 gap-y-4 flex-wrap text-[10px] font-bold text-gray-500 tracking-widest uppercase">
           <div className="flex items-center gap-2">
              <span className="text-white font-black">J</span> Jugats
           </div>
           <div className="flex items-center gap-2">
              <span className="text-white font-black">G</span> Guanyats
           </div>
           <div className="flex items-center gap-2">
              <span className="text-white font-black">E</span> Empatats
           </div>
           <div className="flex items-center gap-2">
              <span className="text-white font-black">P</span> Perduts
           </div>
           <div className="flex items-center gap-2">
              <span className="text-white font-black">PF</span> Punts a Favor
           </div>
           <div className="flex items-center gap-2">
              <span className="text-white font-black">PC</span> Punts en Contra
           </div>
           <div className="flex items-center gap-2">
              <span className="text-white font-black">DP</span> Diferència de Punts
           </div>
           <div className="flex items-center gap-2">
              <span className="text-blue-400 font-black">AF</span> Assajos a Favor
           </div>
           <div className="flex items-center gap-2">
              <span className="text-orange-400 font-black">AC</span> Assajos en Contra
           </div>
           <div className="flex items-center gap-2">
              <span className="text-green-400 font-black">BO</span> Bonus Ofensiu
           </div>
           <div className="flex items-center gap-2">
              <span className="text-purple-400 font-black">BD</span> Bonus Defensiu
           </div>
        </div>
      </div>
    </div>
  );
};

export default Standings;
