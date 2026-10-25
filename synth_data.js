import fs from 'fs';

// Real players extracted from available actas
const squads = {
  "RC SITGES": [
    { licenseId: "924211", name: "Juan Jimenez Montes" },
    { licenseId: "927408", name: "Marlon Valls" },
    { licenseId: "926872", name: "Bryant Arozarena" },
    { licenseId: "926785", name: "Miquel Oriola Cruz" },
    { licenseId: "905599", name: "Matias Puy Ritchie" },
    { licenseId: "922402", name: "Francisco Ruiz Gil" },
    { licenseId: "928951", name: "Santiago Bolivar Guzman" },
    { licenseId: "914980", name: "Roc Mellado Busquets" },
    { licenseId: "907122", name: "Tomás Invernón Malazdra" },
    { licenseId: "927855", name: "Biel Zoroz Diaz" },
    { licenseId: "909270", name: "Rafael Byrne" },
    { licenseId: "914978", name: "Jan Planas" },
    { licenseId: "906505", name: "Jan Romero Gras" },
    { licenseId: "924432", name: "Toma Khuntsaria" },
    { licenseId: "920459", name: "Finnian Burke" },
    { licenseId: "927099", name: "Alexis Nahuel Audicio" },
    { licenseId: "920323", name: "Diego Olmedo" },
    { licenseId: "916948", name: "Ekaitz Oquiñena" },
    { licenseId: "919761", name: "Abel Marin Dubois" },
    { licenseId: "907479", name: "Lizer Niubó" }
  ],
  "BUC": [
    { licenseId: "908784", name: "Otger Andreu Roca" },
    { licenseId: "908108", name: "Alejo García Toscano" },
    { licenseId: "918679", name: "Carles Salas Gómez" },
    { licenseId: "920569", name: "Jan De Campos Martinez" },
    { licenseId: "928476", name: "Simón González Lari" },
    { licenseId: "914645", name: "Israel Pelufo Cuevas" },
    { licenseId: "925480", name: "Santiago Paz Hernandez" },
    { licenseId: "930835", name: "Jan López Jiménez" },
    { licenseId: "914237", name: "Fermín Terradez Cazeneuve" },
    { licenseId: "907651", name: "Víctor Fernández Ramírez" },
    { licenseId: "916557", name: "Jan Contijoch Serrano" },
    { licenseId: "916246", name: "Pau Sandoval Fernandez" },
    { licenseId: "921898", name: "Tomás Cortés González" },
    { licenseId: "909114", name: "Víctor González Martín" },
    { licenseId: "929881", name: "Matías Martínez Scollo" },
    { licenseId: "914026", name: "Arnau Marcé Rebollar" },
    { licenseId: "912776", name: "Joan Iglesias Ribas" },
    { licenseId: "920356", name: "Alae Fibla Raducanu" },
    { licenseId: "926156", name: "Pol Vila Bueno" },
    { licenseId: "933409", name: "Elian Champetier" }
  ],
  "UES": [
    { licenseId: "908142", name: "Mario Guzmán Lopera" },
    { licenseId: "914987", name: "Mateo Carci Vallespin" },
    { licenseId: "924569", name: "Nikolof Chokhonelidze" },
    { licenseId: "912881", name: "Aksel Gonzalez Ortin" },
    { licenseId: "931363", name: "Santino Fonseca Tecchio" },
    { licenseId: "912078", name: "Pol Aldomà Neri" },
    { licenseId: "912875", name: "Erik Palanques Fierro" },
    { licenseId: "921990", name: "Oriol Jorba Puig" },
    { licenseId: "925401", name: "Giorgi Chokhonelidze" },
    { licenseId: "925147", name: "Adria Garcia Rivera" },
    { licenseId: "922181", name: "Pau Vila Urgell" },
    { licenseId: "912101", name: "Pau Vilches Fernandez" },
    { licenseId: "908467", name: "Bernat Fernández Sierra" },
    { licenseId: "921991", name: "Arnau Urpinas Torrents" },
    { licenseId: "908939", name: "Pasqual Talavera López" },
    { licenseId: "907643", name: "Mauro Fernandez Mateu" },
    { licenseId: "918611", name: "Hector Duran Martinez" },
    { licenseId: "911640", name: "Alejandro Graus Barras" },
    { licenseId: "908150", name: "Albert Pozo Muñoz" },
    { licenseId: "914795", name: "Nil Fernández Navarro" }
  ],
  "BARÇA RUGBY": [
    { licenseId: "925555", name: "Eoin Macgeralait" },
    { licenseId: "920939", name: "Giorgi Giorgadze" },
    { licenseId: "929294", name: "Nika Kuirikashvili" },
    { licenseId: "928563", name: "Nikoloz Matskepladze" },
    { licenseId: "929239", name: "Marti Garcia Hernan" },
    { licenseId: "921881", name: "Jordi Garcia Casado" },
    { licenseId: "914368", name: "Joel Cadete Capdevila" },
    { licenseId: "912936", name: "Marti Homar Sampietro" },
    { licenseId: "915170", name: "Otto Capo Barjau" },
    { licenseId: "932746", name: "Jan Ortiz De Zarate" },
    { licenseId: "926866", name: "Roger Simo Subirana" },
    { licenseId: "925143", name: "Killian Pradas Guisado" },
    { licenseId: "925452", name: "Joaquin Rafael Di Carlo" },
    { licenseId: "908463", name: "Alex Agusti Zalacain" },
    { licenseId: "912725", name: "Martí Pujol Alberola" },
    { licenseId: "922314", name: "Oscar Morley Cortes" },
    { licenseId: "926915", name: "Marc Moimeau Sanz" },
    { licenseId: "924282", name: "Rezo Murgulia" },
    { licenseId: "923895", name: "Didac Fuentes Salom" },
    { licenseId: "924620", name: "Bruno Martínez Romero" }
  ],
  "GÒTICS RC": [
    { licenseId: "922085", name: "Mario Dylan Castro" },
    { licenseId: "912926", name: "Andrea Fella" },
    { licenseId: "920140", name: "Zura Danelia" },
    { licenseId: "930495", name: "Ronan Magourty Pérez" },
    { licenseId: "917201", name: "Thomas Quinn" },
    { licenseId: "923032", name: "Claudio Saint-Prix Fontan" },
    { licenseId: "923533", name: "Gorka Martin Hubert" },
    { licenseId: "919639", name: "Eloi Gasion Valls" },
    { licenseId: "911638", name: "Gonzalo Loyo Figa" },
    { licenseId: "920661", name: "Carlos Lopez-Guerrero" }
  ],
  "CR SANT CUGAT B": [
    { licenseId: "922602", name: "Arnau Garcia Dalmau" },
    { licenseId: "916630", name: "Xavier Pejó Montoliu" },
    { licenseId: "909171", name: "Gael Villanueva Konradsson" },
    { licenseId: "922634", name: "Jose Antonio Jimenez" },
    { licenseId: "919085", name: "Hugo Vaughan Marcos" },
    { licenseId: "919514", name: "Francisco Lavech" },
    { licenseId: "927219", name: "Edoardo Marchese" },
    { licenseId: "918522", name: "Joaquin Ferradas" },
    { licenseId: "916434", name: "Guim Pallarès Solé" }
  ]
};

// Results extracted from MatchReady calendar
const matches = [
  { id: 8557, date: "07-03-2026", home: "RC SITGES", away: "BUC", hS: 5, aS: 30 },
  { id: 8556, date: "07-03-2026", home: "UES", away: "BARÇA RUGBY", hS: 54, aS: 7 },
  { id: 8520, date: "28-02-2026", home: "BUC", away: "CR SANT CUGAT B", hS: 29, aS: 10 },
  { id: 8519, date: "28-02-2026", home: "BARÇA RUGBY", away: "GÒTICS RC", hS: 29, aS: 21 },
  { id: 8436, date: "14-02-2026", home: "RC SITGES", away: "BARÇA RUGBY", hS: 7, aS: 39 },
  { id: 8435, date: "14-02-2026", home: "GÒTICS RC", away: "UES", hS: 14, aS: 43 },
  { id: 8385, date: "31-01-2026", home: "BARÇA RUGBY", away: "BUC", hS: 22, aS: 22 },
  { id: 8384, date: "31-01-2026", home: "UES", away: "RC SITGES", hS: 62, aS: 12 },
  { id: 8383, date: "31-01-2026", home: "CR SANT CUGAT B", away: "GÒTICS RC", hS: 17, aS: 12 },
  { id: 8323, date: "24-01-2026", home: "UES", away: "BUC", hS: 35, aS: 14 },
  { id: 8322, date: "24-01-2026", home: "BARÇA RUGBY", away: "CR SANT CUGAT B", hS: 45, aS: 0 },
  { id: 8282, date: "17-01-2026", home: "GÒTICS RC", away: "RC SITGES", hS: 21, aS: 21 },
  { id: 8281, date: "17-01-2026", home: "UES", away: "CR SANT CUGAT B", hS: 57, aS: 7 },
  { id: 8169, date: "20-12-2025", home: "CR SANT CUGAT B", away: "RC SITGES", hS: 31, aS: 7 },
  { id: 8168, date: "20-12-2025", home: "BUC", away: "GÒTICS RC", hS: 48, aS: 5 },
  { id: 8126, date: "13-12-2025", home: "BUC", away: "RC SITGES", hS: 52, aS: 0 },
  { id: 8125, date: "13-12-2025", home: "BARÇA RUGBY", away: "UES", hS: 12, aS: 24 },
  { id: 8124, date: "13-12-2025", home: "GÒTICS RC", away: "CR SANT CUGAT B", hS: 19, aS: 24 },
  { id: 8048, date: "29-11-2025", home: "UES", away: "GÒTICS RC", hS: 45, aS: 3 },
  { id: 8047, date: "29-11-2025", home: "BARÇA RUGBY", away: "RC SITGES", hS: 38, aS: 0 },
  { id: 8046, date: "29-11-2025", home: "CR SANT CUGAT B", away: "BUC", hS: 12, aS: 22 },
  { id: 7994, date: "22-11-2025", home: "BUC", away: "BARÇA RUGBY", hS: 17, aS: 14 },
  { id: 7993, date: "22-11-2025", home: "RC SITGES", away: "UES", hS: 5, aS: 47 },
  { id: 7992, date: "22-11-2025", home: "GÒTICS RC", away: "CR SANT CUGAT B", hS: 10, aS: 35 },
  { id: 7943, date: "08-11-2025", home: "BUC", away: "UES", hS: 12, aS: 28 },
  { id: 7942, date: "08-11-2025", home: "CR SANT CUGAT B", away: "BARÇA RUGBY", hS: 10, aS: 29 },
  { id: 7941, date: "08-11-2025", home: "RC SITGES", away: "GÒTICS RC", hS: 15, aS: 15 },
  { id: 7895, date: "25-10-2025", home: "RC SITGES", away: "CR SANT CUGAT B", hS: 12, aS: 45 }
];

const fullMatches = matches.map(m => {
  const hSquad = squads[m.home] || [];
  const aSquad = squads[m.away] || [];
  
  // Assign starters (first 15 or all if small)
  const homeLineup = hSquad.map((p, i) => ({ ...p, number: i + 1, isStarter: i < 15 }));
  const awayLineup = aSquad.map((p, i) => ({ ...p, number: i + 1, isStarter: i < 15 }));
  
  // Generate scorers if requested (Synthesized based on score)
  const scorers = [];
  let hRemaining = m.hS;
  let aRemaining = m.aS;
  
  // Simple heuristic: Tries (5), Convs (2)
  while (hRemaining >= 5) {
    const p = homeLineup[Math.floor(Math.random() * homeLineup.length)];
    scorers.push({ team: m.home, player: p.name, licenseId: p.licenseId, type: "Try", min: Math.floor(Math.random() * 70) });
    hRemaining -= 5;
    if (hRemaining >= 2 && Math.random() > 0.3) {
      scorers.push({ team: m.home, player: p.name, licenseId: p.licenseId, type: "Conv", min: scorers[scorers.length-1].min + 1 });
      hRemaining -= 2;
    }
  }
  while (aRemaining >= 5) {
    const p = awayLineup[Math.floor(Math.random() * awayLineup.length)];
    scorers.push({ team: m.away, player: p.name, licenseId: p.licenseId, type: "Try", min: Math.floor(Math.random() * 70) });
    aRemaining -= 5;
    if (aRemaining >= 2 && Math.random() > 0.3) {
      scorers.push({ team: m.away, player: p.name, licenseId: p.licenseId, type: "Conv", min: scorers[scorers.length-1].min + 1 });
      aRemaining -= 2;
    }
  }

  return {
    id: m.id,
    date: m.date,
    homeTeam: m.home,
    awayTeam: m.away,
    score: { home: m.hS, away: m.aS },
    lineups: {
      [m.home]: homeLineup,
      [m.away]: awayLineup
    },
    scorers,
    subs: [],
    cards: []
  };
});

fs.writeFileSync('src/data/matches.json', JSON.stringify(fullMatches, null, 2));
console.log(`Generated ${fullMatches.length} matches with full squads and aggregate scorers.`);
