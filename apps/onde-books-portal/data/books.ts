export type Language = 'en' | 'it' | 'de' | 'es' | 'fr' | 'pt';

export interface BookTranslation {
  title: string;
  description: string;
}

export interface Book {
  id: string;
  translations: Record<Language, BookTranslation>;
  author: string;
  category: string;
  price: number;
  color: string;
  year?: string;
}

export const categories = [
  { id: 'spirituality', name: 'Spiritualita', icon: '🕯️' },
  { id: 'poetry', name: 'Poesia', icon: '📜' },
  { id: 'art', name: 'Arte', icon: '🎨' },
  { id: 'tech', name: 'Tech', icon: '⚡' },
  { id: 'health', name: 'Health', icon: '🌿' },
  { id: 'children', name: 'Bambini', icon: '🧸' },
  { id: 'philosophy', name: 'Filosofia', icon: '🦉' },
  { id: 'classics', name: 'Classici', icon: '📚' },
];

export const languages: { code: Language; flag: string; name: string }[] = [
  { code: 'en', flag: '🇬🇧', name: 'English' },
  { code: 'it', flag: '🇮🇹', name: 'Italiano' },
  { code: 'de', flag: '🇩🇪', name: 'Deutsch' },
  { code: 'es', flag: '🇪🇸', name: 'Espanol' },
  { code: 'fr', flag: '🇫🇷', name: 'Francais' },
  { code: 'pt', flag: '🇵🇹', name: 'Portugues' },
];

const colors = [
  'bg-gradient-to-br from-amber-200 to-orange-300',
  'bg-gradient-to-br from-rose-200 to-pink-300',
  'bg-gradient-to-br from-violet-200 to-purple-300',
  'bg-gradient-to-br from-blue-200 to-cyan-300',
  'bg-gradient-to-br from-emerald-200 to-teal-300',
  'bg-gradient-to-br from-yellow-200 to-amber-300',
  'bg-gradient-to-br from-red-200 to-rose-300',
  'bg-gradient-to-br from-indigo-200 to-blue-300',
  'bg-gradient-to-br from-lime-200 to-green-300',
  'bg-gradient-to-br from-fuchsia-200 to-pink-300',
  'bg-gradient-to-br from-orange-300 to-red-400',
  'bg-gradient-to-br from-teal-200 to-emerald-300',
];

export const books: Book[] = [
  // === SPIRITUALITY ===
  {
    id: 'psalms',
    author: 'King David',
    category: 'spirituality',
    price: 0.79,
    color: colors[0],
    year: '1000 BCE',
    translations: {
      en: { title: 'The Book of Psalms', description: 'Sacred songs and prayers from ancient Israel' },
      it: { title: 'Il Libro dei Salmi', description: 'Canti sacri e preghiere dall\'antico Israele' },
      de: { title: 'Das Buch der Psalmen', description: 'Heilige Lieder und Gebete aus dem alten Israel' },
      es: { title: 'El Libro de los Salmos', description: 'Cantos sagrados y oraciones del antiguo Israel' },
      fr: { title: 'Le Livre des Psaumes', description: 'Chants sacres et prieres de l\'ancien Israel' },
      pt: { title: 'O Livro dos Salmos', description: 'Canticos sagrados e oracoes do antigo Israel' },
    }
  },
  {
    id: 'meditations',
    author: 'Marcus Aurelius',
    category: 'spirituality',
    price: 0.89,
    color: colors[1],
    year: '180 CE',
    translations: {
      en: { title: 'Meditations', description: 'Personal writings on Stoic philosophy by a Roman Emperor' },
      it: { title: 'Meditazioni', description: 'Scritti personali sulla filosofia stoica di un imperatore romano' },
      de: { title: 'Selbstbetrachtungen', description: 'Personliche Schriften zur stoischen Philosophie eines romischen Kaisers' },
      es: { title: 'Meditaciones', description: 'Escritos personales sobre filosofia estoica de un emperador romano' },
      fr: { title: 'Pensees pour moi-meme', description: 'Ecrits personnels sur la philosophie stoicienne d\'un empereur romain' },
      pt: { title: 'Meditacoes', description: 'Escritos pessoais sobre filosofia estoica de um imperador romano' },
    }
  },
  {
    id: 'tao-te-ching',
    author: 'Lao Tzu',
    category: 'spirituality',
    price: 0.69,
    color: colors[2],
    year: '600 BCE',
    translations: {
      en: { title: 'Tao Te Ching', description: 'The foundational text of Taoist philosophy' },
      it: { title: 'Tao Te Ching', description: 'Il testo fondamentale della filosofia taoista' },
      de: { title: 'Tao Te King', description: 'Der Grundlagentext der taoistischen Philosophie' },
      es: { title: 'Tao Te Ching', description: 'El texto fundamental de la filosofia taoista' },
      fr: { title: 'Tao Te King', description: 'Le texte fondateur de la philosophie taoiste' },
      pt: { title: 'Tao Te Ching', description: 'O texto fundamental da filosofia taoista' },
    }
  },
  {
    id: 'bhagavad-gita',
    author: 'Vyasa',
    category: 'spirituality',
    price: 0.79,
    color: colors[3],
    year: '400 BCE',
    translations: {
      en: { title: 'Bhagavad Gita', description: 'The song of God - Hindu philosophical dialogue' },
      it: { title: 'Bhagavad Gita', description: 'Il canto del Signore - dialogo filosofico indu' },
      de: { title: 'Bhagavad Gita', description: 'Das Lied Gottes - hinduistischer philosophischer Dialog' },
      es: { title: 'Bhagavad Gita', description: 'El canto del Senor - dialogo filosofico hindu' },
      fr: { title: 'Bhagavad Gita', description: 'Le chant du Seigneur - dialogue philosophique hindou' },
      pt: { title: 'Bhagavad Gita', description: 'O canto do Senhor - dialogo filosofico hindu' },
    }
  },
  {
    id: 'confessions',
    author: 'St. Augustine',
    category: 'spirituality',
    price: 0.89,
    color: colors[4],
    year: '400 CE',
    translations: {
      en: { title: 'Confessions', description: 'Spiritual autobiography of a great Christian thinker' },
      it: { title: 'Confessioni', description: 'Autobiografia spirituale di un grande pensatore cristiano' },
      de: { title: 'Bekenntnisse', description: 'Spirituelle Autobiographie eines grossen christlichen Denkers' },
      es: { title: 'Confesiones', description: 'Autobiografia espiritual de un gran pensador cristiano' },
      fr: { title: 'Confessions', description: 'Autobiographie spirituelle d\'un grand penseur chretien' },
      pt: { title: 'Confissoes', description: 'Autobiografia espiritual de um grande pensador cristao' },
    }
  },
  {
    id: 'imitation-christ',
    author: 'Thomas a Kempis',
    category: 'spirituality',
    price: 0.69,
    color: colors[5],
    year: '1418',
    translations: {
      en: { title: 'The Imitation of Christ', description: 'Classic devotional guide to Christian life' },
      it: { title: 'L\'Imitazione di Cristo', description: 'Guida devozionale classica alla vita cristiana' },
      de: { title: 'Die Nachfolge Christi', description: 'Klassischer Leitfaden fur das christliche Leben' },
      es: { title: 'Imitacion de Cristo', description: 'Guia devocional clasica para la vida cristiana' },
      fr: { title: 'L\'Imitation de Jesus-Christ', description: 'Guide de devotion classique pour la vie chretienne' },
      pt: { title: 'Imitacao de Cristo', description: 'Guia devocional classico para a vida crista' },
    }
  },
  {
    id: 'dhammapada',
    author: 'Buddha',
    category: 'spirituality',
    price: 0.59,
    color: colors[6],
    year: '300 BCE',
    translations: {
      en: { title: 'The Dhammapada', description: 'Collection of Buddha\'s sayings in verse' },
      it: { title: 'Il Dhammapada', description: 'Raccolta di detti del Buddha in versi' },
      de: { title: 'Das Dhammapada', description: 'Sammlung von Buddhas Spruchen in Versform' },
      es: { title: 'El Dhammapada', description: 'Coleccion de dichos de Buda en verso' },
      fr: { title: 'Le Dhammapada', description: 'Recueil de paroles du Bouddha en vers' },
      pt: { title: 'O Dhammapada', description: 'Colecao de ditados de Buda em verso' },
    }
  },
  {
    id: 'cloud-unknowing',
    author: 'Anonymous',
    category: 'spirituality',
    price: 0.79,
    color: colors[7],
    year: '1375',
    translations: {
      en: { title: 'The Cloud of Unknowing', description: 'Medieval guide to contemplative prayer' },
      it: { title: 'La Nube della Non-Conoscenza', description: 'Guida medievale alla preghiera contemplativa' },
      de: { title: 'Die Wolke des Nichtwissens', description: 'Mittelalterlicher Leitfaden zum kontemplativen Gebet' },
      es: { title: 'La Nube del No Saber', description: 'Guia medieval para la oracion contemplativa' },
      fr: { title: 'Le Nuage d\'Inconnaissance', description: 'Guide medieval de la priere contemplative' },
      pt: { title: 'A Nuvem do Nao-Saber', description: 'Guia medieval para a oracao contemplativa' },
    }
  },

  // === POETRY ===
  {
    id: 'divine-comedy',
    author: 'Dante Alighieri',
    category: 'poetry',
    price: 0.99,
    color: colors[8],
    year: '1320',
    translations: {
      en: { title: 'The Divine Comedy', description: 'Epic journey through Hell, Purgatory, and Paradise' },
      it: { title: 'La Divina Commedia', description: 'Viaggio epico attraverso Inferno, Purgatorio e Paradiso' },
      de: { title: 'Die Gottliche Komodie', description: 'Epische Reise durch Holle, Fegefeuer und Paradies' },
      es: { title: 'La Divina Comedia', description: 'Viaje epico a traves del Infierno, Purgatorio y Paraiso' },
      fr: { title: 'La Divine Comedie', description: 'Voyage epique a travers l\'Enfer, le Purgatoire et le Paradis' },
      pt: { title: 'A Divina Comedia', description: 'Jornada epica pelo Inferno, Purgatorio e Paraiso' },
    }
  },
  {
    id: 'canti-leopardi',
    author: 'Giacomo Leopardi',
    category: 'poetry',
    price: 0.79,
    color: colors[9],
    year: '1835',
    translations: {
      en: { title: 'Canti (Songs)', description: 'Masterwork of Italian Romantic poetry' },
      it: { title: 'Canti', description: 'Capolavoro della poesia romantica italiana' },
      de: { title: 'Gesange', description: 'Meisterwerk der italienischen romantischen Poesie' },
      es: { title: 'Cantos', description: 'Obra maestra de la poesia romantica italiana' },
      fr: { title: 'Chants', description: 'Chef-d\'oeuvre de la poesie romantique italienne' },
      pt: { title: 'Cantos', description: 'Obra-prima da poesia romantica italiana' },
    }
  },
  {
    id: 'shakespeare-sonnets',
    author: 'William Shakespeare',
    category: 'poetry',
    price: 0.69,
    color: colors[10],
    year: '1609',
    translations: {
      en: { title: 'Sonnets', description: '154 poems exploring love, beauty, and mortality' },
      it: { title: 'Sonetti', description: '154 poesie che esplorano amore, bellezza e mortalita' },
      de: { title: 'Sonette', description: '154 Gedichte uber Liebe, Schonheit und Sterblichkeit' },
      es: { title: 'Sonetos', description: '154 poemas que exploran el amor, la belleza y la mortalidad' },
      fr: { title: 'Sonnets', description: '154 poemes explorant l\'amour, la beaute et la mortalite' },
      pt: { title: 'Sonetos', description: '154 poemas explorando amor, beleza e mortalidade' },
    }
  },
  {
    id: 'leaves-grass',
    author: 'Walt Whitman',
    category: 'poetry',
    price: 0.89,
    color: colors[11],
    year: '1855',
    translations: {
      en: { title: 'Leaves of Grass', description: 'Revolutionary collection of American poetry' },
      it: { title: 'Foglie d\'Erba', description: 'Rivoluzionaria raccolta di poesia americana' },
      de: { title: 'Grashalme', description: 'Revolutionare Sammlung amerikanischer Poesie' },
      es: { title: 'Hojas de Hierba', description: 'Coleccion revolucionaria de poesia americana' },
      fr: { title: 'Feuilles d\'Herbe', description: 'Collection revolutionnaire de poesie americaine' },
      pt: { title: 'Folhas de Relva', description: 'Colecao revolucionaria de poesia americana' },
    }
  },
  {
    id: 'flowers-evil',
    author: 'Charles Baudelaire',
    category: 'poetry',
    price: 0.79,
    color: colors[0],
    year: '1857',
    translations: {
      en: { title: 'The Flowers of Evil', description: 'Groundbreaking collection of French symbolist poetry' },
      it: { title: 'I Fiori del Male', description: 'Rivoluzionaria raccolta di poesia simbolista francese' },
      de: { title: 'Die Blumen des Bosen', description: 'Bahnbrechende Sammlung franzosischer symbolistischer Poesie' },
      es: { title: 'Las Flores del Mal', description: 'Coleccion revolucionaria de poesia simbolista francesa' },
      fr: { title: 'Les Fleurs du Mal', description: 'Collection revolutionnaire de poesie symboliste francaise' },
      pt: { title: 'As Flores do Mal', description: 'Colecao revolucionaria de poesia simbolista francesa' },
    }
  },
  {
    id: 'rumi-poems',
    author: 'Rumi',
    category: 'poetry',
    price: 0.69,
    color: colors[1],
    year: '1260',
    translations: {
      en: { title: 'Selected Poems', description: 'Mystical Persian poetry of divine love' },
      it: { title: 'Poesie Scelte', description: 'Poesia mistica persiana dell\'amore divino' },
      de: { title: 'Ausgewahlte Gedichte', description: 'Mystische persische Poesie der gottlichen Liebe' },
      es: { title: 'Poemas Selectos', description: 'Poesia mistica persa del amor divino' },
      fr: { title: 'Poemes Choisis', description: 'Poesie mystique persane de l\'amour divin' },
      pt: { title: 'Poemas Selecionados', description: 'Poesia mistica persa do amor divino' },
    }
  },
  {
    id: 'dickinson-poems',
    author: 'Emily Dickinson',
    category: 'poetry',
    price: 0.59,
    color: colors[2],
    year: '1890',
    translations: {
      en: { title: 'Complete Poems', description: 'Innovative poetry exploring death, immortality, and nature' },
      it: { title: 'Poesie Complete', description: 'Poesia innovativa che esplora morte, immortalita e natura' },
      de: { title: 'Samtliche Gedichte', description: 'Innovative Poesie uber Tod, Unsterblichkeit und Natur' },
      es: { title: 'Poesias Completas', description: 'Poesia innovadora que explora muerte, inmortalidad y naturaleza' },
      fr: { title: 'Poemes Complets', description: 'Poesie innovante explorant la mort, l\'immortalite et la nature' },
      pt: { title: 'Poemas Completos', description: 'Poesia inovadora explorando morte, imortalidade e natureza' },
    }
  },
  {
    id: 'rilke-elegies',
    author: 'Rainer Maria Rilke',
    category: 'poetry',
    price: 0.79,
    color: colors[3],
    year: '1923',
    translations: {
      en: { title: 'Duino Elegies', description: 'Profound meditations on existence and angels' },
      it: { title: 'Elegie Duinesi', description: 'Profonde meditazioni sull\'esistenza e gli angeli' },
      de: { title: 'Duineser Elegien', description: 'Tiefgrundige Meditationen uber Existenz und Engel' },
      es: { title: 'Elegias de Duino', description: 'Profundas meditaciones sobre existencia y angeles' },
      fr: { title: 'Elegies de Duino', description: 'Profondes meditations sur l\'existence et les anges' },
      pt: { title: 'Elegias de Duino', description: 'Profundas meditacoes sobre existencia e anjos' },
    }
  },

  // === CHILDREN ===
  {
    id: 'aesop-fables',
    author: 'Aesop',
    category: 'children',
    price: 0.59,
    color: colors[4],
    year: '600 BCE',
    translations: {
      en: { title: 'Aesop\'s Fables', description: 'Timeless animal stories with moral lessons' },
      it: { title: 'Favole di Esopo', description: 'Storie di animali senza tempo con lezioni morali' },
      de: { title: 'Asops Fabeln', description: 'Zeitlose Tiergeschichten mit moralischen Lehren' },
      es: { title: 'Fabulas de Esopo', description: 'Historias de animales atemporales con lecciones morales' },
      fr: { title: 'Fables d\'Esope', description: 'Histoires d\'animaux intemporelles avec des lecons morales' },
      pt: { title: 'Fabulas de Esopo', description: 'Historias de animais atemporais com licoes morais' },
    }
  },
  {
    id: 'pinocchio',
    author: 'Carlo Collodi',
    category: 'children',
    price: 0.69,
    color: colors[5],
    year: '1883',
    translations: {
      en: { title: 'The Adventures of Pinocchio', description: 'The wooden puppet who wanted to become a real boy' },
      it: { title: 'Le Avventure di Pinocchio', description: 'Il burattino di legno che voleva diventare un bambino vero' },
      de: { title: 'Pinocchios Abenteuer', description: 'Die Holzpuppe, die ein echter Junge werden wollte' },
      es: { title: 'Las Aventuras de Pinocho', description: 'La marioneta de madera que queria ser un nino de verdad' },
      fr: { title: 'Les Aventures de Pinocchio', description: 'La marionnette de bois qui voulait devenir un vrai garcon' },
      pt: { title: 'As Aventuras de Pinoquio', description: 'O boneco de madeira que queria ser um menino de verdade' },
    }
  },
  {
    id: 'grimm-tales',
    author: 'Brothers Grimm',
    category: 'children',
    price: 0.79,
    color: colors[6],
    year: '1812',
    translations: {
      en: { title: 'Grimm\'s Fairy Tales', description: 'Classic German fairy tales and folklore' },
      it: { title: 'Fiabe dei Fratelli Grimm', description: 'Fiabe classiche tedesche e folklore' },
      de: { title: 'Grimms Marchen', description: 'Klassische deutsche Marchen und Folklore' },
      es: { title: 'Cuentos de los Hermanos Grimm', description: 'Cuentos de hadas clasicos alemanes y folclore' },
      fr: { title: 'Contes des Freres Grimm', description: 'Contes de fees allemands classiques et folklore' },
      pt: { title: 'Contos dos Irmaos Grimm', description: 'Contos de fadas classicos alemaes e folclore' },
    }
  },
  {
    id: 'andersen-tales',
    author: 'Hans Christian Andersen',
    category: 'children',
    price: 0.69,
    color: colors[7],
    year: '1835',
    translations: {
      en: { title: 'Andersen\'s Fairy Tales', description: 'Beloved Danish fairy tales for all ages' },
      it: { title: 'Fiabe di Andersen', description: 'Amate fiabe danesi per tutte le eta' },
      de: { title: 'Andersens Marchen', description: 'Beliebte danische Marchen fur alle Altersgruppen' },
      es: { title: 'Cuentos de Andersen', description: 'Queridos cuentos de hadas daneses para todas las edades' },
      fr: { title: 'Contes d\'Andersen', description: 'Contes de fees danois bien-aimes pour tous les ages' },
      pt: { title: 'Contos de Andersen', description: 'Amados contos de fadas dinamarqueses para todas as idades' },
    }
  },
  {
    id: 'alice-wonderland',
    author: 'Lewis Carroll',
    category: 'children',
    price: 0.79,
    color: colors[8],
    year: '1865',
    translations: {
      en: { title: 'Alice\'s Adventures in Wonderland', description: 'Whimsical journey down the rabbit hole' },
      it: { title: 'Alice nel Paese delle Meraviglie', description: 'Viaggio fantastico nella tana del coniglio' },
      de: { title: 'Alice im Wunderland', description: 'Wunderliche Reise in den Kaninchenbau' },
      es: { title: 'Alicia en el Pais de las Maravillas', description: 'Viaje fantasioso por la madriguera del conejo' },
      fr: { title: 'Alice au Pays des Merveilles', description: 'Voyage fantaisiste dans le terrier du lapin' },
      pt: { title: 'Alice no Pais das Maravilhas', description: 'Jornada fantastica pela toca do coelho' },
    }
  },
  {
    id: 'peter-pan',
    author: 'J.M. Barrie',
    category: 'children',
    price: 0.69,
    color: colors[9],
    year: '1911',
    translations: {
      en: { title: 'Peter Pan', description: 'The boy who never grew up in Neverland' },
      it: { title: 'Peter Pan', description: 'Il ragazzo che non e mai cresciuto a Neverland' },
      de: { title: 'Peter Pan', description: 'Der Junge, der nie erwachsen wurde im Nimmerland' },
      es: { title: 'Peter Pan', description: 'El nino que nunca crecio en el Pais de Nunca Jamas' },
      fr: { title: 'Peter Pan', description: 'Le garcon qui ne voulait pas grandir au Pays Imaginaire' },
      pt: { title: 'Peter Pan', description: 'O menino que nunca cresceu na Terra do Nunca' },
    }
  },
  {
    id: 'jungle-book',
    author: 'Rudyard Kipling',
    category: 'children',
    price: 0.79,
    color: colors[10],
    year: '1894',
    translations: {
      en: { title: 'The Jungle Book', description: 'Mowgli\'s adventures with the wolves and jungle creatures' },
      it: { title: 'Il Libro della Giungla', description: 'Le avventure di Mowgli con i lupi e le creature della giungla' },
      de: { title: 'Das Dschungelbuch', description: 'Mowglis Abenteuer mit den Wolfen und Dschungeltieren' },
      es: { title: 'El Libro de la Selva', description: 'Las aventuras de Mowgli con los lobos y criaturas de la selva' },
      fr: { title: 'Le Livre de la Jungle', description: 'Les aventures de Mowgli avec les loups et creatures de la jungle' },
      pt: { title: 'O Livro da Selva', description: 'As aventuras de Mogli com os lobos e criaturas da selva' },
    }
  },
  {
    id: 'wizard-oz',
    author: 'L. Frank Baum',
    category: 'children',
    price: 0.59,
    color: colors[11],
    year: '1900',
    translations: {
      en: { title: 'The Wonderful Wizard of Oz', description: 'Dorothy\'s magical journey to the Emerald City' },
      it: { title: 'Il Meraviglioso Mago di Oz', description: 'Il viaggio magico di Dorothy alla Citta di Smeraldo' },
      de: { title: 'Der Zauberer von Oz', description: 'Dorothys magische Reise in die Smaragdstadt' },
      es: { title: 'El Maravilloso Mago de Oz', description: 'El viaje magico de Dorothy a la Ciudad Esmeralda' },
      fr: { title: 'Le Magicien d\'Oz', description: 'Le voyage magique de Dorothy vers la Cite d\'Emeraude' },
      pt: { title: 'O Magico de Oz', description: 'A jornada magica de Dorothy para a Cidade das Esmeraldas' },
    }
  },
  {
    id: 'little-prince',
    author: 'Antoine de Saint-Exupery',
    category: 'children',
    price: 0.79,
    color: colors[0],
    year: '1943',
    translations: {
      en: { title: 'The Little Prince', description: 'A pilot meets a young prince from a tiny asteroid' },
      it: { title: 'Il Piccolo Principe', description: 'Un pilota incontra un giovane principe da un piccolo asteroide' },
      de: { title: 'Der Kleine Prinz', description: 'Ein Pilot trifft einen kleinen Prinzen von einem winzigen Asteroiden' },
      es: { title: 'El Principito', description: 'Un piloto conoce a un joven principe de un pequeno asteroide' },
      fr: { title: 'Le Petit Prince', description: 'Un pilote rencontre un jeune prince d\'un petit asteroide' },
      pt: { title: 'O Pequeno Principe', description: 'Um piloto encontra um jovem principe de um pequeno asteroide' },
    }
  },

  // === PHILOSOPHY ===
  {
    id: 'republic',
    author: 'Plato',
    category: 'philosophy',
    price: 0.89,
    color: colors[1],
    year: '380 BCE',
    translations: {
      en: { title: 'The Republic', description: 'Socratic dialogue on justice and the ideal state' },
      it: { title: 'La Repubblica', description: 'Dialogo socratico sulla giustizia e lo stato ideale' },
      de: { title: 'Der Staat', description: 'Sokratischer Dialog uber Gerechtigkeit und den idealen Staat' },
      es: { title: 'La Republica', description: 'Dialogo socratico sobre justicia y el estado ideal' },
      fr: { title: 'La Republique', description: 'Dialogue socratique sur la justice et l\'Etat ideal' },
      pt: { title: 'A Republica', description: 'Dialogo socratico sobre justica e o estado ideal' },
    }
  },
  {
    id: 'nicomachean-ethics',
    author: 'Aristotle',
    category: 'philosophy',
    price: 0.79,
    color: colors[2],
    year: '340 BCE',
    translations: {
      en: { title: 'Nicomachean Ethics', description: 'The nature of happiness and virtue' },
      it: { title: 'Etica Nicomachea', description: 'La natura della felicita e della virtu' },
      de: { title: 'Nikomachische Ethik', description: 'Die Natur des Glucks und der Tugend' },
      es: { title: 'Etica Nicomaquea', description: 'La naturaleza de la felicidad y la virtud' },
      fr: { title: 'Ethique a Nicomaque', description: 'La nature du bonheur et de la vertu' },
      pt: { title: 'Etica a Nicomaco', description: 'A natureza da felicidade e da virtude' },
    }
  },
  {
    id: 'beyond-good-evil',
    author: 'Friedrich Nietzsche',
    category: 'philosophy',
    price: 0.89,
    color: colors[3],
    year: '1886',
    translations: {
      en: { title: 'Beyond Good and Evil', description: 'Critique of past philosophers and morality' },
      it: { title: 'Al di la del Bene e del Male', description: 'Critica dei filosofi passati e della morale' },
      de: { title: 'Jenseits von Gut und Bose', description: 'Kritik vergangener Philosophen und der Moral' },
      es: { title: 'Mas Alla del Bien y del Mal', description: 'Critica de los filosofos pasados y la moralidad' },
      fr: { title: 'Par-dela le Bien et le Mal', description: 'Critique des philosophes passes et de la moralite' },
      pt: { title: 'Alem do Bem e do Mal', description: 'Critica dos filosofos passados e da moralidade' },
    }
  },
  {
    id: 'critique-pure-reason',
    author: 'Immanuel Kant',
    category: 'philosophy',
    price: 0.99,
    color: colors[4],
    year: '1781',
    translations: {
      en: { title: 'Critique of Pure Reason', description: 'Foundation of modern Western philosophy' },
      it: { title: 'Critica della Ragion Pura', description: 'Fondamento della filosofia occidentale moderna' },
      de: { title: 'Kritik der reinen Vernunft', description: 'Grundlage der modernen westlichen Philosophie' },
      es: { title: 'Critica de la Razon Pura', description: 'Fundamento de la filosofia occidental moderna' },
      fr: { title: 'Critique de la Raison Pure', description: 'Fondement de la philosophie occidentale moderne' },
      pt: { title: 'Critica da Razao Pura', description: 'Fundamento da filosofia ocidental moderna' },
    }
  },
  {
    id: 'thus-spoke',
    author: 'Friedrich Nietzsche',
    category: 'philosophy',
    price: 0.89,
    color: colors[5],
    year: '1883',
    translations: {
      en: { title: 'Thus Spoke Zarathustra', description: 'Philosophical novel on the Ubermensch' },
      it: { title: 'Cosi Parlo Zarathustra', description: 'Romanzo filosofico sull\'Oltreuomo' },
      de: { title: 'Also sprach Zarathustra', description: 'Philosophischer Roman uber den Ubermenschen' },
      es: { title: 'Asi Hablo Zaratustra', description: 'Novela filosofica sobre el Superhombre' },
      fr: { title: 'Ainsi Parlait Zarathoustra', description: 'Roman philosophique sur le Surhomme' },
      pt: { title: 'Assim Falou Zaratustra', description: 'Romance filosofico sobre o Super-homem' },
    }
  },
  {
    id: 'leviathan',
    author: 'Thomas Hobbes',
    category: 'philosophy',
    price: 0.79,
    color: colors[6],
    year: '1651',
    translations: {
      en: { title: 'Leviathan', description: 'Social contract and structure of society' },
      it: { title: 'Leviatano', description: 'Il contratto sociale e la struttura della societa' },
      de: { title: 'Leviathan', description: 'Gesellschaftsvertrag und Struktur der Gesellschaft' },
      es: { title: 'Leviatan', description: 'El contrato social y la estructura de la sociedad' },
      fr: { title: 'Leviathan', description: 'Le contrat social et la structure de la societe' },
      pt: { title: 'Leviata', description: 'O contrato social e a estrutura da sociedade' },
    }
  },
  {
    id: 'discourse-method',
    author: 'Rene Descartes',
    category: 'philosophy',
    price: 0.69,
    color: colors[7],
    year: '1637',
    translations: {
      en: { title: 'Discourse on the Method', description: 'Foundation of modern Western philosophy' },
      it: { title: 'Discorso sul Metodo', description: 'Fondamento della filosofia occidentale moderna' },
      de: { title: 'Abhandlung uber die Methode', description: 'Grundlage der modernen westlichen Philosophie' },
      es: { title: 'Discurso del Metodo', description: 'Fundamento de la filosofia occidental moderna' },
      fr: { title: 'Discours de la Methode', description: 'Fondement de la philosophie occidentale moderne' },
      pt: { title: 'Discurso do Metodo', description: 'Fundamento da filosofia ocidental moderna' },
    }
  },

  // === CLASSICS ===
  {
    id: 'odyssey',
    author: 'Homer',
    category: 'classics',
    price: 0.89,
    color: colors[8],
    year: '800 BCE',
    translations: {
      en: { title: 'The Odyssey', description: 'Epic journey of Odysseus returning home from Troy' },
      it: { title: 'L\'Odissea', description: 'Viaggio epico di Odisseo che ritorna a casa da Troia' },
      de: { title: 'Die Odyssee', description: 'Epische Reise des Odysseus auf dem Heimweg von Troja' },
      es: { title: 'La Odisea', description: 'Viaje epico de Odiseo regresando a casa desde Troya' },
      fr: { title: 'L\'Odyssee', description: 'Voyage epique d\'Ulysse rentrant chez lui de Troie' },
      pt: { title: 'A Odisseia', description: 'Jornada epica de Odisseu retornando para casa de Troia' },
    }
  },
  {
    id: 'iliad',
    author: 'Homer',
    category: 'classics',
    price: 0.89,
    color: colors[9],
    year: '750 BCE',
    translations: {
      en: { title: 'The Iliad', description: 'Epic tale of the Trojan War and Achilles' },
      it: { title: 'L\'Iliade', description: 'Racconto epico della guerra di Troia e Achille' },
      de: { title: 'Die Ilias', description: 'Epische Erzahlung des Trojanischen Krieges und Achilles' },
      es: { title: 'La Iliada', description: 'Relato epico de la Guerra de Troya y Aquiles' },
      fr: { title: 'L\'Iliade', description: 'Recit epique de la guerre de Troie et Achille' },
      pt: { title: 'A Iliada', description: 'Conto epico da Guerra de Troia e Aquiles' },
    }
  },
  {
    id: 'don-quixote',
    author: 'Miguel de Cervantes',
    category: 'classics',
    price: 0.99,
    color: colors[10],
    year: '1605',
    translations: {
      en: { title: 'Don Quixote', description: 'The original novel of the knight-errant and his squire' },
      it: { title: 'Don Chisciotte', description: 'Il romanzo originale del cavaliere errante e il suo scudiero' },
      de: { title: 'Don Quijote', description: 'Der Originalroman des irrenden Ritters und seines Knappen' },
      es: { title: 'Don Quijote', description: 'La novela original del caballero andante y su escudero' },
      fr: { title: 'Don Quichotte', description: 'Le roman original du chevalier errant et de son ecuyer' },
      pt: { title: 'Dom Quixote', description: 'O romance original do cavaleiro andante e seu escudeiro' },
    }
  },
  {
    id: 'pride-prejudice',
    author: 'Jane Austen',
    category: 'classics',
    price: 0.79,
    color: colors[11],
    year: '1813',
    translations: {
      en: { title: 'Pride and Prejudice', description: 'Romance and social commentary in Regency England' },
      it: { title: 'Orgoglio e Pregiudizio', description: 'Romanticismo e critica sociale nell\'Inghilterra della Reggenza' },
      de: { title: 'Stolz und Vorurteil', description: 'Romantik und Gesellschaftskritik im England der Regency-Zeit' },
      es: { title: 'Orgullo y Prejuicio', description: 'Romance y critica social en la Inglaterra de la Regencia' },
      fr: { title: 'Orgueil et Prejuges', description: 'Romance et commentaire social dans l\'Angleterre de la Regence' },
      pt: { title: 'Orgulho e Preconceito', description: 'Romance e critica social na Inglaterra da Regencia' },
    }
  },
  {
    id: 'crime-punishment',
    author: 'Fyodor Dostoevsky',
    category: 'classics',
    price: 0.89,
    color: colors[0],
    year: '1866',
    translations: {
      en: { title: 'Crime and Punishment', description: 'Psychological drama of guilt and redemption' },
      it: { title: 'Delitto e Castigo', description: 'Dramma psicologico di colpa e redenzione' },
      de: { title: 'Schuld und Suhne', description: 'Psychologisches Drama von Schuld und Erlosung' },
      es: { title: 'Crimen y Castigo', description: 'Drama psicologico de culpa y redencion' },
      fr: { title: 'Crime et Chatiment', description: 'Drame psychologique de culpabilite et de redemption' },
      pt: { title: 'Crime e Castigo', description: 'Drama psicologico de culpa e redencao' },
    }
  },
  {
    id: 'war-peace',
    author: 'Leo Tolstoy',
    category: 'classics',
    price: 0.99,
    color: colors[1],
    year: '1869',
    translations: {
      en: { title: 'War and Peace', description: 'Epic novel of Russian society during Napoleonic Wars' },
      it: { title: 'Guerra e Pace', description: 'Romanzo epico della societa russa durante le guerre napoleoniche' },
      de: { title: 'Krieg und Frieden', description: 'Epischer Roman der russischen Gesellschaft wahrend der Napoleonischen Kriege' },
      es: { title: 'Guerra y Paz', description: 'Novela epica de la sociedad rusa durante las Guerras Napoleonicas' },
      fr: { title: 'Guerre et Paix', description: 'Roman epique de la societe russe pendant les guerres napoleoniennes' },
      pt: { title: 'Guerra e Paz', description: 'Romance epico da sociedade russa durante as Guerras Napoleonicas' },
    }
  },
  {
    id: 'brothers-karamazov',
    author: 'Fyodor Dostoevsky',
    category: 'classics',
    price: 0.99,
    color: colors[2],
    year: '1880',
    translations: {
      en: { title: 'The Brothers Karamazov', description: 'Philosophical novel exploring faith and free will' },
      it: { title: 'I Fratelli Karamazov', description: 'Romanzo filosofico che esplora fede e libero arbitrio' },
      de: { title: 'Die Bruder Karamasow', description: 'Philosophischer Roman uber Glauben und freien Willen' },
      es: { title: 'Los Hermanos Karamazov', description: 'Novela filosofica que explora fe y libre albedrio' },
      fr: { title: 'Les Freres Karamazov', description: 'Roman philosophique explorant la foi et le libre arbitre' },
      pt: { title: 'Os Irmaos Karamazov', description: 'Romance filosofico explorando fe e livre arbitrio' },
    }
  },
  {
    id: 'anna-karenina',
    author: 'Leo Tolstoy',
    category: 'classics',
    price: 0.89,
    color: colors[3],
    year: '1877',
    translations: {
      en: { title: 'Anna Karenina', description: 'Tragic love story in Russian aristocratic society' },
      it: { title: 'Anna Karenina', description: 'Tragica storia d\'amore nella societa aristocratica russa' },
      de: { title: 'Anna Karenina', description: 'Tragische Liebesgeschichte in der russischen aristokratischen Gesellschaft' },
      es: { title: 'Ana Karenina', description: 'Tragica historia de amor en la sociedad aristocratica rusa' },
      fr: { title: 'Anna Karenine', description: 'Histoire d\'amour tragique dans la societe aristocratique russe' },
      pt: { title: 'Anna Karenina', description: 'Tragica historia de amor na sociedade aristocratica russa' },
    }
  },

  // === ART ===
  {
    id: 'lives-artists',
    author: 'Giorgio Vasari',
    category: 'art',
    price: 0.89,
    color: colors[4],
    year: '1550',
    translations: {
      en: { title: 'Lives of the Artists', description: 'Biographies of Renaissance painters and sculptors' },
      it: { title: 'Le Vite degli Artisti', description: 'Biografie di pittori e scultori del Rinascimento' },
      de: { title: 'Leben der Kunstler', description: 'Biografien von Renaissance-Malern und Bildhauern' },
      es: { title: 'Vidas de los Artistas', description: 'Biografias de pintores y escultores del Renacimiento' },
      fr: { title: 'Vies des Artistes', description: 'Biographies de peintres et sculpteurs de la Renaissance' },
      pt: { title: 'Vidas dos Artistas', description: 'Biografias de pintores e escultores do Renascimento' },
    }
  },
  {
    id: 'treatise-painting',
    author: 'Leonardo da Vinci',
    category: 'art',
    price: 0.79,
    color: colors[5],
    year: '1651',
    translations: {
      en: { title: 'A Treatise on Painting', description: 'Leonardo\'s collected writings on art' },
      it: { title: 'Trattato della Pittura', description: 'Scritti raccolti di Leonardo sull\'arte' },
      de: { title: 'Traktat uber die Malerei', description: 'Leonardos gesammelte Schriften uber Kunst' },
      es: { title: 'Tratado de la Pintura', description: 'Escritos recopilados de Leonardo sobre arte' },
      fr: { title: 'Traite de la Peinture', description: 'Ecrits rassembles de Leonard sur l\'art' },
      pt: { title: 'Tratado da Pintura', description: 'Escritos reunidos de Leonardo sobre arte' },
    }
  },
  {
    id: 'art-spirit',
    author: 'Robert Henri',
    category: 'art',
    price: 0.69,
    color: colors[6],
    year: '1923',
    translations: {
      en: { title: 'The Art Spirit', description: 'Notes and advice from a master teacher' },
      it: { title: 'Lo Spirito dell\'Arte', description: 'Note e consigli da un maestro insegnante' },
      de: { title: 'Der Geist der Kunst', description: 'Notizen und Ratschlage eines Meisterlehrers' },
      es: { title: 'El Espiritu del Arte', description: 'Notas y consejos de un maestro profesor' },
      fr: { title: 'L\'Esprit de l\'Art', description: 'Notes et conseils d\'un maitre enseignant' },
      pt: { title: 'O Espirito da Arte', description: 'Notas e conselhos de um mestre professor' },
    }
  },
  {
    id: 'letters-theo',
    author: 'Vincent van Gogh',
    category: 'art',
    price: 0.79,
    color: colors[7],
    year: '1914',
    translations: {
      en: { title: 'Letters to Theo', description: 'Personal correspondence revealing Van Gogh\'s mind' },
      it: { title: 'Lettere a Theo', description: 'Corrispondenza personale che rivela la mente di Van Gogh' },
      de: { title: 'Briefe an Theo', description: 'Personliche Korrespondenz, die Van Goghs Geist offenbart' },
      es: { title: 'Cartas a Theo', description: 'Correspondencia personal que revela la mente de Van Gogh' },
      fr: { title: 'Lettres a Theo', description: 'Correspondance personnelle revelant l\'esprit de Van Gogh' },
      pt: { title: 'Cartas a Theo', description: 'Correspondencia pessoal revelando a mente de Van Gogh' },
    }
  },
  {
    id: 'story-art',
    author: 'E.H. Gombrich',
    category: 'art',
    price: 0.89,
    color: colors[8],
    year: '1950',
    translations: {
      en: { title: 'The Story of Art', description: 'Accessible survey of Western art history' },
      it: { title: 'La Storia dell\'Arte', description: 'Panoramica accessibile della storia dell\'arte occidentale' },
      de: { title: 'Die Geschichte der Kunst', description: 'Zuganglicher Uberblick uber die westliche Kunstgeschichte' },
      es: { title: 'La Historia del Arte', description: 'Panorama accesible de la historia del arte occidental' },
      fr: { title: 'Histoire de l\'Art', description: 'Panorama accessible de l\'histoire de l\'art occidental' },
      pt: { title: 'A Historia da Arte', description: 'Panorama acessivel da historia da arte ocidental' },
    }
  },

  // === HEALTH ===
  {
    id: 'yoga-sutras',
    author: 'Patanjali',
    category: 'health',
    price: 0.69,
    color: colors[9],
    year: '400 CE',
    translations: {
      en: { title: 'Yoga Sutras', description: 'Classical text on the theory and practice of yoga' },
      it: { title: 'Yoga Sutra', description: 'Testo classico sulla teoria e pratica dello yoga' },
      de: { title: 'Yoga Sutras', description: 'Klassischer Text uber Theorie und Praxis des Yoga' },
      es: { title: 'Yoga Sutras', description: 'Texto clasico sobre la teoria y practica del yoga' },
      fr: { title: 'Yoga Sutras', description: 'Texte classique sur la theorie et la pratique du yoga' },
      pt: { title: 'Yoga Sutras', description: 'Texto classico sobre a teoria e pratica do yoga' },
    }
  },
  {
    id: 'hippocratic-writings',
    author: 'Hippocrates',
    category: 'health',
    price: 0.79,
    color: colors[10],
    year: '400 BCE',
    translations: {
      en: { title: 'Hippocratic Writings', description: 'Foundation texts of Western medicine' },
      it: { title: 'Scritti Ippocratici', description: 'Testi fondamentali della medicina occidentale' },
      de: { title: 'Hippokratische Schriften', description: 'Grundlagentexte der westlichen Medizin' },
      es: { title: 'Escritos Hipocraticos', description: 'Textos fundamentales de la medicina occidental' },
      fr: { title: 'Ecrits Hippocratiques', description: 'Textes fondamentaux de la medecine occidentale' },
      pt: { title: 'Escritos Hipocraticos', description: 'Textos fundamentais da medicina ocidental' },
    }
  },
  {
    id: 'walden',
    author: 'Henry David Thoreau',
    category: 'health',
    price: 0.69,
    color: colors[11],
    year: '1854',
    translations: {
      en: { title: 'Walden', description: 'Reflection on simple living in natural surroundings' },
      it: { title: 'Walden', description: 'Riflessione sulla vita semplice nella natura' },
      de: { title: 'Walden', description: 'Reflexion uber einfaches Leben in naturlicher Umgebung' },
      es: { title: 'Walden', description: 'Reflexion sobre la vida sencilla en entornos naturales' },
      fr: { title: 'Walden', description: 'Reflexion sur la vie simple dans un environnement naturel' },
      pt: { title: 'Walden', description: 'Reflexao sobre vida simples em ambientes naturais' },
    }
  },
  {
    id: 'tao-health',
    author: 'Various',
    category: 'health',
    price: 0.59,
    color: colors[0],
    year: '500 BCE',
    translations: {
      en: { title: 'The Tao of Health', description: 'Ancient Chinese wisdom on wellness and longevity' },
      it: { title: 'Il Tao della Salute', description: 'Antica saggezza cinese su benessere e longevita' },
      de: { title: 'Das Tao der Gesundheit', description: 'Alte chinesische Weisheit uber Wohlbefinden und Langlebigkeit' },
      es: { title: 'El Tao de la Salud', description: 'Antigua sabiduria china sobre bienestar y longevidad' },
      fr: { title: 'Le Tao de la Sante', description: 'Sagesse chinoise ancienne sur le bien-etre et la longevite' },
      pt: { title: 'O Tao da Saude', description: 'Sabedoria chinesa antiga sobre bem-estar e longevidade' },
    }
  },
  {
    id: 'nature-cure',
    author: 'Henry Lindlahr',
    category: 'health',
    price: 0.69,
    color: colors[1],
    year: '1913',
    translations: {
      en: { title: 'Nature Cure', description: 'Philosophy and practice of natural healing' },
      it: { title: 'Cura Naturale', description: 'Filosofia e pratica della guarigione naturale' },
      de: { title: 'Naturheilkunde', description: 'Philosophie und Praxis der naturlichen Heilung' },
      es: { title: 'Cura Natural', description: 'Filosofia y practica de la sanacion natural' },
      fr: { title: 'Cure Naturelle', description: 'Philosophie et pratique de la guerison naturelle' },
      pt: { title: 'Cura Natural', description: 'Filosofia e pratica da cura natural' },
    }
  },

  // === TECH (Classic works) ===
  {
    id: 'thinking-machines',
    author: 'Alan Turing',
    category: 'tech',
    price: 0.79,
    color: colors[2],
    year: '1950',
    translations: {
      en: { title: 'Computing Machinery and Intelligence', description: 'Foundation of artificial intelligence theory' },
      it: { title: 'Macchine Calcolatrici e Intelligenza', description: 'Fondamento della teoria dell\'intelligenza artificiale' },
      de: { title: 'Rechenmaschinen und Intelligenz', description: 'Grundlage der Theorie kunstlicher Intelligenz' },
      es: { title: 'Maquinaria de Computo e Inteligencia', description: 'Fundamento de la teoria de inteligencia artificial' },
      fr: { title: 'Machines a Calculer et Intelligence', description: 'Fondement de la theorie de l\'intelligence artificielle' },
      pt: { title: 'Maquinas de Computacao e Inteligencia', description: 'Fundamento da teoria da inteligencia artificial' },
    }
  },
  {
    id: 'mathematical-theory',
    author: 'Claude Shannon',
    category: 'tech',
    price: 0.89,
    color: colors[3],
    year: '1948',
    translations: {
      en: { title: 'A Mathematical Theory of Communication', description: 'Foundation of information theory' },
      it: { title: 'Una Teoria Matematica della Comunicazione', description: 'Fondamento della teoria dell\'informazione' },
      de: { title: 'Eine Mathematische Theorie der Kommunikation', description: 'Grundlage der Informationstheorie' },
      es: { title: 'Una Teoria Matematica de la Comunicacion', description: 'Fundamento de la teoria de la informacion' },
      fr: { title: 'Une Theorie Mathematique de la Communication', description: 'Fondement de la theorie de l\'information' },
      pt: { title: 'Uma Teoria Matematica da Comunicacao', description: 'Fundamento da teoria da informacao' },
    }
  },
  {
    id: 'principia-math',
    author: 'Isaac Newton',
    category: 'tech',
    price: 0.99,
    color: colors[4],
    year: '1687',
    translations: {
      en: { title: 'Principia Mathematica', description: 'Foundation of classical mechanics and physics' },
      it: { title: 'Principi Matematici', description: 'Fondamento della meccanica classica e della fisica' },
      de: { title: 'Mathematische Prinzipien', description: 'Grundlage der klassischen Mechanik und Physik' },
      es: { title: 'Principios Matematicos', description: 'Fundamento de la mecanica clasica y la fisica' },
      fr: { title: 'Principes Mathematiques', description: 'Fondement de la mecanique classique et de la physique' },
      pt: { title: 'Principios Matematicos', description: 'Fundamento da mecanica classica e da fisica' },
    }
  },
  {
    id: 'elements-euclid',
    author: 'Euclid',
    category: 'tech',
    price: 0.69,
    color: colors[5],
    year: '300 BCE',
    translations: {
      en: { title: 'Elements', description: 'Foundation of geometry and mathematical reasoning' },
      it: { title: 'Elementi', description: 'Fondamento della geometria e del ragionamento matematico' },
      de: { title: 'Elemente', description: 'Grundlage der Geometrie und des mathematischen Denkens' },
      es: { title: 'Elementos', description: 'Fundamento de la geometria y el razonamiento matematico' },
      fr: { title: 'Elements', description: 'Fondement de la geometrie et du raisonnement mathematique' },
      pt: { title: 'Elementos', description: 'Fundamento da geometria e do raciocinio matematico' },
    }
  },
  {
    id: 'origin-species',
    author: 'Charles Darwin',
    category: 'tech',
    price: 0.89,
    color: colors[6],
    year: '1859',
    translations: {
      en: { title: 'On the Origin of Species', description: 'Revolutionary theory of evolution by natural selection' },
      it: { title: 'L\'Origine delle Specie', description: 'Teoria rivoluzionaria dell\'evoluzione per selezione naturale' },
      de: { title: 'Uber die Entstehung der Arten', description: 'Revolutionare Theorie der Evolution durch naturliche Auslese' },
      es: { title: 'El Origen de las Especies', description: 'Teoria revolucionaria de la evolucion por seleccion natural' },
      fr: { title: 'L\'Origine des Especes', description: 'Theorie revolutionnaire de l\'evolution par selection naturelle' },
      pt: { title: 'A Origem das Especies', description: 'Teoria revolucionaria da evolucao por selecao natural' },
    }
  },
  {
    id: 'relativity',
    author: 'Albert Einstein',
    category: 'tech',
    price: 0.79,
    color: colors[7],
    year: '1916',
    translations: {
      en: { title: 'Relativity: The Special and General Theory', description: 'Einstein\'s explanation of his revolutionary theory' },
      it: { title: 'La Relativita: Teoria Speciale e Generale', description: 'Spiegazione di Einstein della sua teoria rivoluzionaria' },
      de: { title: 'Relativitatstheorie', description: 'Einsteins Erklarung seiner revolutionaren Theorie' },
      es: { title: 'Relatividad: Teoria Especial y General', description: 'Explicacion de Einstein de su teoria revolucionaria' },
      fr: { title: 'La Relativite', description: 'Explication d\'Einstein de sa theorie revolutionnaire' },
      pt: { title: 'Relatividade: Teoria Especial e Geral', description: 'Explicacao de Einstein de sua teoria revolucionaria' },
    }
  },

  // === MORE SPIRITUALITY ===
  {
    id: 'interior-castle',
    author: 'St. Teresa of Avila',
    category: 'spirituality',
    price: 0.79,
    color: colors[8],
    year: '1577',
    translations: {
      en: { title: 'The Interior Castle', description: 'Mystical journey through the mansions of the soul' },
      it: { title: 'Il Castello Interiore', description: 'Viaggio mistico attraverso le dimore dell\'anima' },
      de: { title: 'Die innere Burg', description: 'Mystische Reise durch die Wohnungen der Seele' },
      es: { title: 'El Castillo Interior', description: 'Viaje mistico a traves de las moradas del alma' },
      fr: { title: 'Le Chateau Interieur', description: 'Voyage mystique a travers les demeures de l\'ame' },
      pt: { title: 'O Castelo Interior', description: 'Jornada mistica atraves das moradas da alma' },
    }
  },
  {
    id: 'dark-night',
    author: 'St. John of the Cross',
    category: 'spirituality',
    price: 0.69,
    color: colors[9],
    year: '1584',
    translations: {
      en: { title: 'Dark Night of the Soul', description: 'Poem and commentary on spiritual transformation' },
      it: { title: 'La Notte Oscura', description: 'Poema e commento sulla trasformazione spirituale' },
      de: { title: 'Die dunkle Nacht der Seele', description: 'Gedicht und Kommentar zur spirituellen Transformation' },
      es: { title: 'Noche Oscura del Alma', description: 'Poema y comentario sobre la transformacion espiritual' },
      fr: { title: 'La Nuit Obscure', description: 'Poeme et commentaire sur la transformation spirituelle' },
      pt: { title: 'Noite Escura da Alma', description: 'Poema e comentario sobre transformacao espiritual' },
    }
  },

  // === MORE CHILDREN ===
  {
    id: 'robinson-crusoe',
    author: 'Daniel Defoe',
    category: 'children',
    price: 0.79,
    color: colors[10],
    year: '1719',
    translations: {
      en: { title: 'Robinson Crusoe', description: 'Castaway\'s survival on a deserted island' },
      it: { title: 'Robinson Crusoe', description: 'Sopravvivenza di un naufrago su un\'isola deserta' },
      de: { title: 'Robinson Crusoe', description: 'Uberleben eines Schiffbruchigen auf einer einsamen Insel' },
      es: { title: 'Robinson Crusoe', description: 'Supervivencia de un naufrago en una isla desierta' },
      fr: { title: 'Robinson Crusoe', description: 'Survie d\'un naufrage sur une ile deserte' },
      pt: { title: 'Robinson Crusoe', description: 'Sobrevivencia de um naufrago em uma ilha deserta' },
    }
  },
  {
    id: 'treasure-island',
    author: 'Robert Louis Stevenson',
    category: 'children',
    price: 0.69,
    color: colors[11],
    year: '1883',
    translations: {
      en: { title: 'Treasure Island', description: 'Swashbuckling adventure of pirates and buried gold' },
      it: { title: 'L\'Isola del Tesoro', description: 'Avventura di pirati e oro sepolto' },
      de: { title: 'Die Schatzinsel', description: 'Abenteuer von Piraten und vergrabenem Gold' },
      es: { title: 'La Isla del Tesoro', description: 'Aventura de piratas y oro enterrado' },
      fr: { title: 'L\'Ile au Tresor', description: 'Aventure de pirates et d\'or enterre' },
      pt: { title: 'A Ilha do Tesouro', description: 'Aventura de piratas e ouro enterrado' },
    }
  },
  {
    id: 'heidi',
    author: 'Johanna Spyri',
    category: 'children',
    price: 0.59,
    color: colors[0],
    year: '1881',
    translations: {
      en: { title: 'Heidi', description: 'Orphan girl\'s life in the Swiss Alps' },
      it: { title: 'Heidi', description: 'Vita di una ragazza orfana nelle Alpi svizzere' },
      de: { title: 'Heidi', description: 'Leben eines Waisenmadchens in den Schweizer Alpen' },
      es: { title: 'Heidi', description: 'Vida de una nina huerfana en los Alpes suizos' },
      fr: { title: 'Heidi', description: 'Vie d\'une orpheline dans les Alpes suisses' },
      pt: { title: 'Heidi', description: 'Vida de uma orfã nos Alpes suíços' },
    }
  },

  // === MORE CLASSICS ===
  {
    id: 'les-miserables',
    author: 'Victor Hugo',
    category: 'classics',
    price: 0.99,
    color: colors[1],
    year: '1862',
    translations: {
      en: { title: 'Les Miserables', description: 'Epic tale of justice, redemption and love in 19th century France' },
      it: { title: 'I Miserabili', description: 'Racconto epico di giustizia, redenzione e amore nella Francia del XIX secolo' },
      de: { title: 'Die Elenden', description: 'Epische Geschichte von Gerechtigkeit, Erlosung und Liebe im Frankreich des 19. Jahrhunderts' },
      es: { title: 'Los Miserables', description: 'Relato epico de justicia, redencion y amor en la Francia del siglo XIX' },
      fr: { title: 'Les Miserables', description: 'Epopee de justice, redemption et amour dans la France du XIXe siecle' },
      pt: { title: 'Os Miseraveis', description: 'Epopeia de justica, redencao e amor na Franca do seculo XIX' },
    }
  },
  {
    id: 'count-monte-cristo',
    author: 'Alexandre Dumas',
    category: 'classics',
    price: 0.89,
    color: colors[2],
    year: '1844',
    translations: {
      en: { title: 'The Count of Monte Cristo', description: 'Adventure tale of betrayal, imprisonment and revenge' },
      it: { title: 'Il Conte di Montecristo', description: 'Avventura di tradimento, prigionia e vendetta' },
      de: { title: 'Der Graf von Monte Christo', description: 'Abenteuergeschichte von Verrat, Gefangenschaft und Rache' },
      es: { title: 'El Conde de Montecristo', description: 'Aventura de traicion, encarcelamiento y venganza' },
      fr: { title: 'Le Comte de Monte-Cristo', description: 'Aventure de trahison, emprisonnement et vengeance' },
      pt: { title: 'O Conde de Monte Cristo', description: 'Aventura de traicao, prisao e vinganca' },
    }
  },
  {
    id: 'moby-dick',
    author: 'Herman Melville',
    category: 'classics',
    price: 0.89,
    color: colors[3],
    year: '1851',
    translations: {
      en: { title: 'Moby Dick', description: 'Captain Ahab\'s obsessive hunt for the white whale' },
      it: { title: 'Moby Dick', description: 'La caccia ossessiva del capitano Ahab alla balena bianca' },
      de: { title: 'Moby Dick', description: 'Kapitan Ahabs obsessive Jagd auf den weissen Wal' },
      es: { title: 'Moby Dick', description: 'La caza obsesiva del capitan Ahab de la ballena blanca' },
      fr: { title: 'Moby Dick', description: 'La chasse obsessionnelle du capitaine Achab a la baleine blanche' },
      pt: { title: 'Moby Dick', description: 'A caca obsessiva do Capitao Ahab a baleia branca' },
    }
  },
  {
    id: 'great-gatsby',
    author: 'F. Scott Fitzgerald',
    category: 'classics',
    price: 0.79,
    color: colors[4],
    year: '1925',
    translations: {
      en: { title: 'The Great Gatsby', description: 'Jazz Age tale of wealth, love, and the American Dream' },
      it: { title: 'Il Grande Gatsby', description: 'Racconto dell\'eta del jazz su ricchezza, amore e il sogno americano' },
      de: { title: 'Der grosse Gatsby', description: 'Geschichte der Jazz-Ara uber Reichtum, Liebe und den amerikanischen Traum' },
      es: { title: 'El Gran Gatsby', description: 'Cuento de la Era del Jazz sobre riqueza, amor y el sueno americano' },
      fr: { title: 'Gatsby le Magnifique', description: 'Recit de l\'age du jazz sur la richesse, l\'amour et le reve americain' },
      pt: { title: 'O Grande Gatsby', description: 'Conto da Era do Jazz sobre riqueza, amor e o sonho americano' },
    }
  },
  {
    id: 'jane-eyre',
    author: 'Charlotte Bronte',
    category: 'classics',
    price: 0.79,
    color: colors[5],
    year: '1847',
    translations: {
      en: { title: 'Jane Eyre', description: 'Governess finds love and dark secrets at Thornfield Hall' },
      it: { title: 'Jane Eyre', description: 'Una governante trova amore e segreti oscuri a Thornfield Hall' },
      de: { title: 'Jane Eyre', description: 'Gouvernante findet Liebe und dunkle Geheimnisse in Thornfield Hall' },
      es: { title: 'Jane Eyre', description: 'Una institutriz encuentra amor y oscuros secretos en Thornfield Hall' },
      fr: { title: 'Jane Eyre', description: 'Une gouvernante trouve l\'amour et de sombres secrets a Thornfield Hall' },
      pt: { title: 'Jane Eyre', description: 'Governanta encontra amor e segredos sombrios em Thornfield Hall' },
    }
  },
  {
    id: 'wuthering-heights',
    author: 'Emily Bronte',
    category: 'classics',
    price: 0.79,
    color: colors[6],
    year: '1847',
    translations: {
      en: { title: 'Wuthering Heights', description: 'Passionate tale of love and revenge on the Yorkshire moors' },
      it: { title: 'Cime Tempestose', description: 'Appassionante storia d\'amore e vendetta nelle brughiere dello Yorkshire' },
      de: { title: 'Sturmhohe', description: 'Leidenschaftliche Geschichte von Liebe und Rache auf dem Yorkshire-Moor' },
      es: { title: 'Cumbres Borrascosas', description: 'Apasionante historia de amor y venganza en los paramos de Yorkshire' },
      fr: { title: 'Les Hauts de Hurlevent', description: 'Recit passionne d\'amour et de vengeance sur les landes du Yorkshire' },
      pt: { title: 'O Morro dos Ventos Uivantes', description: 'Historia apaixonante de amor e vinganca nas charnecas de Yorkshire' },
    }
  },
];

export const getBooksByCategory = (category: string) =>
  books.filter(book => book.category === category);

export const getAllBooks = () => books;
