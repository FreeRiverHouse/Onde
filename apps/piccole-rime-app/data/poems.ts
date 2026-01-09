// Piccole Rime - Database Poesie
// Solo testi verificati in dominio pubblico

export interface Poem {
  id: string;
  title: string;
  author: string;
  authorYears: string;
  text: string[];
  theme: 'notte' | 'primavera' | 'natale' | 'animali';
  color: string;
  emoji: string;
}

export const poems: Poem[] = [
  {
    id: 'stella-stellina',
    title: 'Stella Stellina',
    author: 'Lina Schwarz',
    authorYears: '1876-1947',
    text: [
      'Stella stellina',
      'la notte s\'avvicina:',
      'la fiamma traballa,',
      'la mucca e\' nella stalla.',
      '',
      'La mucca e il vitello,',
      'la pecora e l\'agnello,',
      'la chioccia e il pulcino,',
      'la mamma e il suo bambino.',
      '',
      'Ognuno ha il suo piccino,',
      'ognuno ha la sua mamma',
      'e tutti fan la nanna.',
    ],
    theme: 'notte',
    color: '#2C3E50',
    emoji: '⭐',
  },
  {
    id: 'pioggerellina',
    title: 'Che dice la pioggerellina di marzo',
    author: 'Angiolo Silvio Novaro',
    authorYears: '1866-1938',
    text: [
      'Che dice la pioggerellina',
      'di marzo, che picchia argentina',
      'sui tegoli vecchi',
      'del tetto, sui bruscoli secchi',
      'dell\'orto, sul fico e sul moro',
      'ornati di gemmule d\'oro?',
      '',
      'Passata e\' l\'uggiosa invernata,',
      'passata, passata!',
      'Di fuor dalla nuvola nera',
      'di fuor dalla nuvola bigia',
      'che in cielo si pigia,',
      'domani uscira\' Primavera',
      'con pieno il grembiale',
      'di tiepido sole,',
      'di fresche viole,',
      'di primule rosse, di battiti d\'ale,',
      'di nidi, di gridi',
      'di rondini, ed anche',
      'di stelle di mandorlo, bianche...',
      '',
      'Cio\' dice la pioggerellina',
      'sui tegoli vecchi del tetto,',
      'sui bruscoli secchi dell\'orto,',
      'sul fico e sul moro',
      'ornati di gemmule d\'oro.',
      '',
      'Cio\' canta, cio\' dice;',
      'e il cuor che l\'ascolta e\' felice.',
    ],
    theme: 'primavera',
    color: '#27AE60',
    emoji: '🌧️',
  },
  {
    id: 'la-befana',
    title: 'La Befana',
    author: 'Guido Gozzano',
    authorYears: '1883-1916',
    text: [
      'Discesi dal lettino',
      'son la\' presso il camino,',
      'grandi occhi estasiati,',
      'i bimbi affaccendati',
      '',
      'a metter la calzetta',
      'che invita la vecchietta',
      'a portar chicche e doni',
      'per tutti i bimbi buoni.',
      '',
      'Ognun chiudendo gli occhi,',
      'sogna dolci e balocchi;',
      'e Dori, il piu\' piccino,',
      'accosta il suo visino',
      '',
      'alla grande vetrata',
      'per veder la sfilata',
      'dei Magi, su nel cielo,',
      'nella notte di gelo.',
    ],
    theme: 'natale',
    color: '#8E44AD',
    emoji: '🧹',
  },
  {
    id: 'lumachella',
    title: 'La Lumachella de la Vanagloria',
    author: 'Trilussa',
    authorYears: '1871-1950',
    text: [
      'La lumachella de la Vanagloria',
      'ch\'era strisciata sopra un obelisco,',
      'guardo\' la bava e disse: Gia\' capisco',
      'che lascero\' un\'impronta ne la Storia.',
    ],
    theme: 'animali',
    color: '#E67E22',
    emoji: '🐌',
  },
];

export const getPoem = (id: string): Poem | undefined => {
  return poems.find(p => p.id === id);
};

export const getPoemsByTheme = (theme: Poem['theme']): Poem[] => {
  return poems.filter(p => p.theme === theme);
};
