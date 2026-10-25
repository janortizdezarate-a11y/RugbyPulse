const clubMetadata = {
  "UNIO ESPORTIVA SANTBOIANA": { primary: "#0047AB", secondary: "#FFFFFF", name: "UE Santboiana" }, // Blau i Blanc
  "FC BARCELONA": { primary: "#A50044", secondary: "#004D98", name: "Barça Rugby" }, // Blaugrana
  "RUGBY CLUB SITGES": { primary: "#00A859", secondary: "#0047AB", name: "RC Sitges" }, // Verd i Blau
  "BARCELONA UNIVERSITARI CLUB": { primary: "#000000", secondary: "#F58220", name: "BUC" }, // Negre i Taronja
  "CR SANT CUGAT": { primary: "#000000", secondary: "#FFFFFF", name: "CR Sant Cugat" }, // Negre i Blanc
  "GOTICS R.C.": { primary: "#0047AB", secondary: "#FFFFFF", name: "Gòtics RC" }, // Blau i Blanc
  "CE INEF LLEIDA": { primary: "#00A859", secondary: "#FFFFFF", name: "CE INEF Lleida" }, // Verd i blanc
  "QUIMIC ER": { primary: "#000000", secondary: "#FFFFFF", name: "Químic ER" }, // Negre i Blanc
  "CEU": { primary: "#0047AB", secondary: "#FFFFFF", name: "CEU" }, // Blau
  "CR TARRAGONA": { primary: "#A50044", secondary: "#FFFFFF", name: "CR Tarragona" },
  "CRUC": { primary: "#00A859", secondary: "#0047AB", name: "CRUC" },
  "CN POBLE NOU": { primary: "#FFFFFF", secondary: "#0047AB", name: "CN Poble Nou" }
};

const normalizeTeamName = (name) => {
  let upper = name.toUpperCase().replace(/\s+/g, ' ').trim();
  if (upper.includes("SANTBOIANA") || upper === "UES") return "UNIO ESPORTIVA SANTBOIANA";
  if (upper.includes("BARÇA") || upper.includes("FC BARCELONA")) return "FC BARCELONA";
  if (upper.includes("SITGES")) return "RUGBY CLUB SITGES";
  if (upper.includes("BUC") || upper.includes("BARCELONA UNIVERSITARI")) return "BARCELONA UNIVERSITARI CLUB";
  if (upper.includes("SANT CUGAT") || upper === "CR SANT CUGAT B") return "CR SANT CUGAT";
  if (upper.includes("GOTICS") || upper.includes("GÒTICS")) return "GOTICS R.C.";
  if (upper.includes("INEF LLEIDA")) return "CE INEF LLEIDA";
  if (upper.includes("QUÍMIC") || upper.includes("QUIMIC")) return "QUIMIC ER";
  if (upper === "CEU") return "CEU";
  if (upper.includes("TARRAGONA")) return "CR TARRAGONA";
  if (upper.includes("CRUC") || upper.includes("CORNE")) return "CRUC";
  if (upper.includes("CNPN") || upper.includes("POBLE NOU")) return "CN POBLE NOU";
  return upper;
};

// Converts the raw JSON payload into the multi-league Federation Architecture
export const processRawMatches = (allLeaguesData) => {
  const globalClubs = {}; // Master registry of clubs
  const leagues = {};

  if (!allLeaguesData || allLeaguesData.length === 0) {
    return { global: { totalClubs: 0, totalPlayers: 0, totalMatches: 0, matches: [] }, leagues, clubs: Object.values(globalClubs) };
  }

  let totalMatchesCount = 0;
  let allMatches = [];
  let totalPlayersCount = 0;

  allLeaguesData.forEach(leagueInput => {
    const leagueId = leagueInput.id;
    const rawMatches = leagueInput.matches || [];
    
    leagues[leagueId] = {
      id: leagueId,
      name: leagueInput.name,
      players: {},
      clubs: {},
      rawMatches: rawMatches,
      standings: [],
      topScorers: [],
      recentActivity: []
    };

    const league = leagues[leagueId];
    const lPlayers = league.players;
    const lClubs = league.clubs;

    totalMatchesCount += rawMatches.length;
    allMatches = allMatches.concat(rawMatches);

    // PASS 1: Initialize Clubs locally & globally
    rawMatches.forEach(match => {
      if (!match.homeTeam || !match.awayTeam) return;
      const homeTeam = normalizeTeamName(match.homeTeam);
      const awayTeam = normalizeTeamName(match.awayTeam);

      [homeTeam, awayTeam].forEach(teamName => {
        const clubId = teamName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        const meta = clubMetadata[teamName] || { primary: "#8B1D3D", secondary: "#C5A059", name: teamName };
        
        // Global Registry entry
        if (!globalClubs[clubId]) {
           globalClubs[clubId] = {
             id: clubId,
             name: meta.name,
             rawName: teamName,
             colors: meta,
             logo: "",
             activeLeagues: new Set()
           };
        }
        globalClubs[clubId].activeLeagues.add(leagueId);

        // League-Specific Entry
        if (!lClubs[teamName]) {
          lClubs[teamName] = {
            name: meta.name,
            rawName: teamName,
            id: clubId,
            colors: meta,
            played: 0,
            won: 0,
            drawn: 0,
            lost: 0,
            pointsFor: 0,
            pointsAgainst: 0,
            triesFor: 0,
            triesAgainst: 0,
            bonusOffensive: 0,
            bonusDefensive: 0,
            points: 0,
            logo: "",
            squad: new Set(),
            matchHistory: []
          };
        }
      });

      if (match.homeLogo) {
        if (!lClubs[homeTeam].logo) lClubs[homeTeam].logo = match.homeLogo;
        if (!globalClubs[lClubs[homeTeam].id].logo) globalClubs[lClubs[homeTeam].id].logo = match.homeLogo;
      }
      if (match.awayLogo) {
        if (!lClubs[awayTeam].logo) lClubs[awayTeam].logo = match.awayLogo;
        if (!globalClubs[lClubs[awayTeam].id].logo) globalClubs[lClubs[awayTeam].id].logo = match.awayLogo;
      }

      const isHomeWin = match.score.home > match.score.away;
      const isDraw = match.score.home === match.score.away;
      const homePointsDiff = match.score.home - match.score.away;
      const awayPointsDiff = match.score.away - match.score.home;

      // Determine if this match counts for league standings (only regular Jornada matches)
      const matchPhase = (match.phase || '').toLowerCase();
      const isRegularSeason = matchPhase.includes('jornada') || matchPhase === '' || matchPhase === 'jornada desconeguda';

      if (isRegularSeason) {
        lClubs[homeTeam].pointsFor += match.score.home;
        lClubs[awayTeam].pointsFor += match.score.away;
        lClubs[homeTeam].pointsAgainst += match.score.away;
        lClubs[awayTeam].pointsAgainst += match.score.home;

        const homeTries = match.scorers.filter(s => s.team === match.homeTeam && (s.type.includes("Try") || s.type.includes("Assaig"))).length;
        const awayTries = match.scorers.filter(s => s.team === match.awayTeam && (s.type.includes("Try") || s.type.includes("Assaig"))).length;
        
        lClubs[homeTeam].triesFor += homeTries;
        lClubs[homeTeam].triesAgainst += awayTries;
        lClubs[awayTeam].triesFor += awayTries;
        lClubs[awayTeam].triesAgainst += homeTries;

        lClubs[homeTeam].played++;
        lClubs[awayTeam].played++;
        
        if (isHomeWin) {
          lClubs[homeTeam].won++;
          lClubs[homeTeam].points += 4;
          if (awayPointsDiff >= -7) {
              lClubs[awayTeam].bonusDefensive++;
              lClubs[awayTeam].points += 1;
          }
          lClubs[awayTeam].lost++;
        } else if (isDraw) {
          lClubs[homeTeam].drawn++;
          lClubs[awayTeam].drawn++;
          lClubs[homeTeam].points += 2;
          lClubs[awayTeam].points += 2;
        } else {
          lClubs[awayTeam].won++;
          lClubs[awayTeam].points += 4;
          if (homePointsDiff >= -7) {
              lClubs[homeTeam].bonusDefensive++;
              lClubs[homeTeam].points += 1;
          }
          lClubs[homeTeam].lost++;
        }
        
        if (homeTries >= 4) {
            lClubs[homeTeam].bonusOffensive++;
            lClubs[homeTeam].points += 1;
        }
        if (awayTries >= 4) {
            lClubs[awayTeam].bonusOffensive++;
            lClubs[awayTeam].points += 1;
        }
      }

      // Match history is always recorded (playoffs included), just tagged with phase
      lClubs[homeTeam].matchHistory.push({
        matchId: match.id,
        date: match.date,
        opponent: lClubs[awayTeam].name,
        result: isHomeWin ? 'W' : (isDraw ? 'D' : 'L'),
        score: `${match.score.home} - ${match.score.away}`,
        phase: match.phase || '',
      });
      lClubs[awayTeam].matchHistory.push({
        matchId: match.id,
        date: match.date,
        opponent: lClubs[homeTeam].name,
        result: !isHomeWin && !isDraw ? 'W' : (isDraw ? 'D' : 'L'),
        score: `${match.score.away} - ${match.score.home}`,
        phase: match.phase || '',
      });
    });


    // PASS 2: Process Players & Incidents
    rawMatches.forEach(match => {
      const { lineups = {}, subs = [], cards = [], scorers = [] } = match;
      
      Object.keys(lineups).forEach(rawTeam => {
        const teamName = normalizeTeamName(rawTeam);
        const teamLineup = lineups[rawTeam];
        
        teamLineup.forEach(entry => {
          const { licenseId, name, isStarter } = entry;
          const normalizedId = licenseId.trim();

          if (!lPlayers[normalizedId]) {
            lPlayers[normalizedId] = {
              id: normalizedId,
              name: name,
              club: teamName,
              matches: 0,
              minutes: 0,
              starts: 0,
              points: 0,
              stats: { tries: 0, convs: 0, pens: 0 },
              cards: { yellow: 0, red: 0 },
              history: []
            };
          }
          
          const p = lPlayers[normalizedId];
          if (lClubs[teamName]) lClubs[teamName].squad.add(normalizedId);
          p.matches++;
          
          const matchMinutes = 80; // Changed to 80 for DHC / generic adult length. Not ideal to hardcode, but ok for now.
          if (isStarter) {
             p.starts++;
             let mins = matchMinutes;
             const subOut = subs.find(s => s.out.includes(name) || name.includes(s.out));
             const cardRed = cards.find(c => c.type === "Red" && (c.player.includes(name) || name.includes(c.player)));
             
             if (subOut) mins = subOut.min;
             if (cardRed && cardRed.min < mins) mins = cardRed.min;
             p.minutes += mins;
             p.history.push({ 
                 matchId: match.id, 
                 minutes: mins,
                 started: true,
                 opponent: normalizeTeamName(rawTeam === match.homeTeam ? match.awayTeam : match.homeTeam),
                 homeTeam: normalizeTeamName(match.homeTeam),
                 awayTeam: normalizeTeamName(match.awayTeam),
                 homeLogo: match.homeLogo,
                 awayLogo: match.awayLogo,
                 score: { home: match.score.home, away: match.score.away },
                 result: `${match.score.home} - ${match.score.away}`
             });
          } else {
             let mins = 0;
             const subIn = subs.find(s => s.in.includes(name) || name.includes(s.in));
             if (subIn) {
                 mins = matchMinutes - subIn.min;
                 const subOut = subs.find(s => s.out.includes(name) || name.includes(s.out));
                 const cardRed = cards.find(c => c.type === "Red" && (c.player.includes(name) || name.includes(c.player)));
                 if (subOut && subOut.min > subIn.min) mins = subOut.min - subIn.min;
                 if (cardRed && cardRed.min > subIn.min && cardRed.min < (subIn.min + mins)) mins = cardRed.min - subIn.min;
             }
             if (mins > 0) {
                p.minutes += mins;
                p.history.push({ 
                    matchId: match.id, 
                    minutes: mins,
                    started: false,
                    opponent: normalizeTeamName(rawTeam === match.homeTeam ? match.awayTeam : match.homeTeam),
                    homeTeam: normalizeTeamName(match.homeTeam),
                    awayTeam: normalizeTeamName(match.awayTeam),
                    homeLogo: match.homeLogo,
                    awayLogo: match.awayLogo,
                    score: { home: match.score.home, away: match.score.away },
                    result: `${match.score.home} - ${match.score.away}`
                });
             }
          }
        });
      });

      cards.forEach(c => {
         if (lPlayers[c.licenseId]) {
             if (c.type === "Yellow") lPlayers[c.licenseId].cards.yellow++;
             else lPlayers[c.licenseId].cards.red++;
         }
      });

      scorers.forEach(s => {
         if (lPlayers[s.licenseId]) {
             const p = lPlayers[s.licenseId];
             if (s.type.includes("Try") || s.type.includes("Assaig"))      { p.points += 5; p.stats.tries++; }
             if (s.type.includes("Conv") || s.type.includes("Transform"))  { p.points += 2; p.stats.convs++; }
             if (s.type === "Penalty") { p.points += 3; p.stats.pens++; }
         }
      });

      // Populate activity feed
      if (match.score.home !== 0 || match.score.away !== 0) {
          league.recentActivity.push({
             type: 'Resultat Oficial',
             desc: `${match.homeTeam} ${match.score.home} - ${match.score.away} ${match.awayTeam}`,
             date: match.date,
             matchId: match.id,
             leagueId: leagueId
          });
      }
    });

    // Finalize computations for this league
    Object.values(lClubs).forEach(club => {
      club.squad = Array.from(club.squad).map(id => lPlayers[id]);
      club.lastMatches = club.matchHistory
         .sort((a,b) => b.matchId - a.matchId)
         .map(m => m.result)
         .slice(0, 5)
         .reverse();
    });

    league.players = Object.values(lPlayers);
    league.clubs = Object.values(lClubs);
    league.standings = Object.values(lClubs).sort((a, b) => b.points - a.points || (b.pointsFor - b.pointsAgainst) - (a.pointsFor - a.pointsAgainst));
    league.topScorers = league.players.filter(p => p.points > 0).sort((a, b) => b.points - a.points).slice(0, 10);
    
    league.globalPlayersCount = league.players.length;
    league.globalMatchesCount = rawMatches.length;
    
    totalPlayersCount += league.players.length;
  });

  // Convert Global clubs sets to arrays
  Object.values(globalClubs).forEach(gc => {
      gc.activeLeagues = Array.from(gc.activeLeagues);
  });

  // Global recent activity
  const recentMatches = allMatches.filter(m => (m.score.home !== 0 || m.score.away !== 0)).slice(-5);
  const upcomingMatches = allMatches.filter(m => m.score.home === 0 && m.score.away === 0).slice(0, 5);

  return {
    global: {
      totalClubs: Object.keys(globalClubs).length,
      totalPlayers: totalPlayersCount,
      totalMatches: totalMatchesCount,
      recentMatches,
      upcomingMatches
    },
    leagues,
    clubs: Object.values(globalClubs)
  };
};
