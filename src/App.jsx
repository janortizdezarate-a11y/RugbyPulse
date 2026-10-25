import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, useParams, Navigate } from 'react-router-dom';
import { Trophy, Users, Calendar as CalendarIcon, Activity, Menu, X, Shield, BarChart3, ChevronLeft } from 'lucide-react';
import s18Data from './data/matches.json';
import dhcData from './data/dhc_matches.json';
import { processRawMatches } from './logic/dataProcessor';

// Pages
import GeneralDashboard from './pages/GeneralDashboard';
import CompetitionsList from './pages/CompetitionsList';
import Dashboard from './pages/Dashboard';
import MatchCenter from './pages/MatchCenter';
import ClubProfile from './pages/ClubProfile';
import PlayerProfile from './pages/PlayerProfile';
import Standings from './pages/Standings';
import Calendar from './pages/Calendar';
import ClubsList from './pages/ClubsList';
import LeagueClubsList from './pages/LeagueClubsList';

const App = () => {
  const [data, setData] = useState({ global: null, leagues: {}, clubs: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      const allLeaguesData = [
        {
          id: "s18-primera",
          name: "S18 Primera Catalana",
          matches: s18Data
        },
        {
          id: "dhc-masculi",
          name: "Divisió d'Honor Catalana Masculina",
          matches: dhcData
        }
      ];
      const processed = processRawMatches(allLeaguesData);
      setData(processed);
      setLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-rugby-navy flex flex-col items-center justify-center gap-6">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-rugby-gold/20 border-t-rugby-gold rounded-full animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
             <Shield className="w-6 h-6 text-rugby-gold animate-pulse" />
          </div>
        </div>
        <p className="text-rugby-gold font-black uppercase tracking-[0.3em] text-xs animate-pulse">RugbyPulse</p>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-rugby-navy font-sans selection:bg-rugby-gold selection:text-rugby-navy flex flex-col">
        <Navigation leagues={data.leagues} />
        
        <main className="container mx-auto px-4 py-8 md:py-16 lg:px-8 flex-1">
          <Routes>
            {/* Global Federation Routes */}
            <Route path="/" element={<GeneralDashboard data={data} />} />
            <Route path="/competicions" element={<CompetitionsList leagues={data.leagues} />} />
            <Route path="/clubs" element={<ClubsList globalClubs={data.clubs} />} />
            <Route path="/club/:id" element={<ClubProfile globalClubs={data.clubs} leagues={data.leagues} />} />
            
            {/* League Specific Routes */}
            <Route path="/competicio/:leagueId" element={<LeagueWrapper leagues={data.leagues} Component={Dashboard} />} />
            <Route path="/competicio/:leagueId/clubs" element={<LeagueWrapper leagues={data.leagues} Component={LeagueClubsList} />} />
            <Route path="/competicio/:leagueId/club/:id" element={<ClubProfile globalClubs={data.clubs} leagues={data.leagues} />} />
            <Route path="/competicio/:leagueId/classificacio" element={<LeagueWrapper leagues={data.leagues} Component={Standings} />} />
            <Route path="/competicio/:leagueId/calendari" element={<LeagueWrapper leagues={data.leagues} Component={Calendar} />} />
            <Route path="/competicio/:leagueId/match/:matchId" element={<LeagueWrapper leagues={data.leagues} Component={MatchCenter} />} />
            <Route path="/competicio/:leagueId/player/:playerId" element={<LeagueWrapper leagues={data.leagues} Component={PlayerProfile} />} />
            
            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        <footer className="border-t border-white/5 py-12 bg-black/20 mt-auto">
          <div className="container mx-auto px-8 flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-3">
              <Activity className="text-rugby-gold w-6 h-6" />
              <span className="text-xl font-black italic tracking-tighter uppercase">RugbyPulse</span>
            </div>
            <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest text-center">
              © 2026 Plataforma oficial de Seguiment · Federació Catalana de Rugby
            </p>
          </div>
        </footer>
      </div>
    </Router>
  );
};

// Wrapper passes the specific league data into the specific dashboard components
const LeagueWrapper = ({ leagues, Component }) => {
   const { leagueId } = useParams();
   const leagueData = leagues[leagueId];

   if (!leagueData) return <Navigate to="/competicions" replace />;

   return <Component leagueData={leagueData} />;
};

const Navigation = ({ leagues }) => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const isLeagueContext = location.pathname.startsWith('/competicio/');
  let currentLeagueName = null;
  let basePath = '/';
  
  if (isLeagueContext) {
     const parts = location.pathname.split('/');
     const leagueId = parts[2];
     if (leagues[leagueId]) {
        currentLeagueName = leagues[leagueId].name;
        basePath = `/competicio/${leagueId}`;
     }
  }

  let navLinks = [];
  
  if (isLeagueContext) {
     navLinks = [
       { name: 'Dashboard', path: basePath, icon: <BarChart3 className="w-4 h-4" /> },
       { name: 'Classificació', path: `${basePath}/classificacio`, icon: <Trophy className="w-4 h-4" /> },
       { name: 'Clubs', path: `${basePath}/clubs`, icon: <Users className="w-4 h-4" /> },
       { name: 'Calendari', path: `${basePath}/calendari`, icon: <CalendarIcon className="w-4 h-4" /> }
     ];
  } else {
     navLinks = [
       { name: 'Inici', path: '/', icon: <Activity className="w-4 h-4" /> },
       { name: 'Competicions', path: '/competicions', icon: <Trophy className="w-4 h-4" /> },
       { name: 'Clubs', path: '/clubs', icon: <Users className="w-4 h-4" /> }
     ];
  }

  return (
    <nav className="sticky top-0 z-50 bg-rugby-navy/95 backdrop-blur-xl border-b border-white/5">
      <div className="container mx-auto px-8">
        <div className="flex items-center justify-between h-24">
          
          <div className="flex items-center gap-6">
            {/* Main Logo */}
            <Link to="/" className="flex items-center gap-3 group">
              <div className="p-2 bg-rugby-garnet rounded-xl group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-rugby-garnet/20">
                <Activity className="text-white w-6 h-6" />
              </div>
              <div className="flex flex-col -gap-1">
                <span className="text-2xl font-black italic tracking-tighter uppercase leading-none">RugbyPulse</span>
              </div>
            </Link>

            {/* Context Badge */}
            {isLeagueContext && currentLeagueName && (
              <div className="hidden lg:flex items-center gap-3 border-l border-white/10 pl-6 animate-in fade-in slide-in-from-left">
                 <Link to="/competicions" className="p-2 hover:bg-white/5 rounded-lg transition-colors text-gray-500 hover:text-white" title="Tornar a Federació">
                    <ChevronLeft className="w-4 h-4" />
                 </Link>
                 <span className="text-xs font-black text-rugby-gold uppercase tracking-[0.2em]">{currentLeagueName}</span>
              </div>
            )}
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                  location.pathname === link.path || (link.path !== '/' && location.pathname.endsWith(link.path.split('/').pop()))
                    ? 'bg-white/5 text-rugby-gold' 
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {link.icon}
                {link.name}
              </Link>
            ))}
          </div>

          {/* Mobile Toggle */}
          <button 
             onClick={() => setIsOpen(!isOpen)}
             className="md:hidden p-3 bg-white/5 rounded-xl border border-white/10"
          >
            {isOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {/* Mobile Context Badge */}
      {isLeagueContext && currentLeagueName && (
        <div className="lg:hidden px-8 py-3 bg-black/20 border-b border-white/5 flex items-center justify-between">
           <span className="text-[10px] font-black text-rugby-gold uppercase tracking-[0.2em] truncate">{currentLeagueName}</span>
           <Link to="/competicions" className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-1">
              Tornar <ChevronLeft className="w-3 h-3" />
           </Link>
        </div>
      )}

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-rugby-navy border-b border-white/10 p-6 space-y-4 shadow-2xl">
           {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 font-black uppercase text-xs tracking-widest border border-white/5"
              >
                {link.icon}
                {link.name}
              </Link>
           ))}
        </div>
      )}
    </nav>
  );
};

export default App;
