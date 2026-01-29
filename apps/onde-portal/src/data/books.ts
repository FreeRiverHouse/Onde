// Complete Gutenberg catalog with 1000+ books
// gutenberg = Project Gutenberg ID

export type BookSource = 'classic' | 'onde-studio'

export interface Book {
  id: string
  title: string
  author: string
  gutenberg?: number
  category: string
  lang?: string // default: en
  source?: BookSource // default: classic (Gutenberg books are classics)
  pages?: number // estimated page count
  readingTime?: string // e.g., "~3h" or "~15 min"
}

// Reading time estimates by category (based on typical Gutenberg book lengths)
// 200 words per minute reading speed, ~250 words per page
export const categoryReadingEstimates: Record<string, { pages: number; time: string }> = {
  'fiabe': { pages: 180, time: '~4h' },
  'favole': { pages: 80, time: '~2h' },
  'classici': { pages: 280, time: '~6h' },
  'romanzi': { pages: 350, time: '~7h' },
  'avventura': { pages: 320, time: '~6h' },
  'fantascienza': { pages: 250, time: '~5h' },
  'horror': { pages: 220, time: '~4h' },
  'mistero': { pages: 280, time: '~6h' },
  'filosofia': { pages: 150, time: '~4h' },
  'storia': { pages: 300, time: '~6h' },
  'poesia': { pages: 100, time: '~2h' },
  'teatro': { pages: 120, time: '~3h' },
  'saggi': { pages: 200, time: '~5h' },
  'humor': { pages: 180, time: '~4h' },
  'spiritualita': { pages: 120, time: '~3h' },
  'scienza': { pages: 250, time: '~5h' },
  'autobiografia': { pages: 300, time: '~6h' },
  'racconti': { pages: 200, time: '~4h' },
  'politica': { pages: 180, time: '~4h' },
  'viaggio': { pages: 280, time: '~6h' },
  'miti': { pages: 200, time: '~4h' },
  'arte': { pages: 150, time: '~3h' },
  'musica': { pages: 180, time: '~4h' },
  'educazione': { pages: 200, time: '~4h' },
  'natura': { pages: 220, time: '~5h' },
  'economia': { pages: 200, time: '~5h' },
  'diritto': { pages: 250, time: '~5h' },
  'medicina': { pages: 280, time: '~6h' },
  'religione': { pages: 200, time: '~5h' },
}

// Helper to get reading estimate for a book
export function getBookReadingEstimate(book: Book): { pages: number; time: string } {
  // If book has explicit values, use them
  if (book.pages && book.readingTime) {
    return { pages: book.pages, time: book.readingTime }
  }
  // Otherwise use category estimate
  return categoryReadingEstimates[book.category] || { pages: 200, time: '~4h' }
}

export const books: Book[] = [
  // ============================================
  // FAIRY TALES & CHILDREN'S CLASSICS
  // ============================================

  // GRIMM
  { id: 'grimm-fairy-tales', title: "Grimm's Fairy Tales", author: 'Brothers Grimm', gutenberg: 2591, category: 'fiabe' },
  { id: 'grimm-household', title: "Grimm's Household Stories", author: 'Brothers Grimm', gutenberg: 5314, category: 'fiabe' },

  // ANDERSEN
  { id: 'andersen-fairy-tales', title: "Andersen's Fairy Tales", author: 'H.C. Andersen', gutenberg: 1597, category: 'fiabe' },
  { id: 'andersen-wonder-stories', title: 'Wonder Stories Told for Children', author: 'H.C. Andersen', gutenberg: 17860, category: 'fiabe' },
  { id: 'snow-queen', title: 'The Snow Queen', author: 'H.C. Andersen', gutenberg: 27200, category: 'fiabe' },
  { id: 'andersen-shorter', title: 'Shorter Tales', author: 'H.C. Andersen', gutenberg: 27198, category: 'fiabe' },

  // PERRAULT
  { id: 'mother-goose', title: 'The Tales of Mother Goose', author: 'Charles Perrault', gutenberg: 17208, category: 'fiabe' },
  { id: 'perrault-fairy-tales', title: 'The Fairy Tales of Charles Perrault', author: 'Charles Perrault', gutenberg: 29021, category: 'fiabe' },

  // ANDREW LANG FAIRY BOOKS (Complete Series)
  { id: 'blue-fairy-book', title: 'The Blue Fairy Book', author: 'Andrew Lang', gutenberg: 503, category: 'fiabe' },
  { id: 'red-fairy-book', title: 'The Red Fairy Book', author: 'Andrew Lang', gutenberg: 540, category: 'fiabe' },
  { id: 'green-fairy-book', title: 'The Green Fairy Book', author: 'Andrew Lang', gutenberg: 1195, category: 'fiabe' },
  { id: 'yellow-fairy-book', title: 'The Yellow Fairy Book', author: 'Andrew Lang', gutenberg: 640, category: 'fiabe' },
  { id: 'pink-fairy-book', title: 'The Pink Fairy Book', author: 'Andrew Lang', gutenberg: 5765, category: 'fiabe' },
  { id: 'grey-fairy-book', title: 'The Grey Fairy Book', author: 'Andrew Lang', gutenberg: 4366, category: 'fiabe' },
  { id: 'violet-fairy-book', title: 'The Violet Fairy Book', author: 'Andrew Lang', gutenberg: 7815, category: 'fiabe' },
  { id: 'crimson-fairy-book', title: 'The Crimson Fairy Book', author: 'Andrew Lang', gutenberg: 2435, category: 'fiabe' },
  { id: 'brown-fairy-book', title: 'The Brown Fairy Book', author: 'Andrew Lang', gutenberg: 5809, category: 'fiabe' },
  { id: 'orange-fairy-book', title: 'The Orange Fairy Book', author: 'Andrew Lang', gutenberg: 1449, category: 'fiabe' },
  { id: 'olive-fairy-book', title: 'The Olive Fairy Book', author: 'Andrew Lang', gutenberg: 7342, category: 'fiabe' },
  { id: 'lilac-fairy-book', title: 'The Lilac Fairy Book', author: 'Andrew Lang', gutenberg: 6933, category: 'fiabe' },

  // JOSEPH JACOBS
  { id: 'english-fairy-tales', title: 'English Fairy Tales', author: 'Joseph Jacobs', gutenberg: 7439, category: 'fiabe' },
  { id: 'more-english-fairy-tales', title: 'More English Fairy Tales', author: 'Joseph Jacobs', gutenberg: 14241, category: 'fiabe' },
  { id: 'celtic-fairy-tales', title: 'Celtic Fairy Tales', author: 'Joseph Jacobs', gutenberg: 2892, category: 'fiabe' },
  { id: 'more-celtic-fairy-tales', title: 'More Celtic Fairy Tales', author: 'Joseph Jacobs', gutenberg: 2894, category: 'fiabe' },
  { id: 'indian-fairy-tales', title: 'Indian Fairy Tales', author: 'Joseph Jacobs', gutenberg: 7128, category: 'fiabe' },
  { id: 'european-folk-fairy', title: 'European Folk and Fairy Tales', author: 'Joseph Jacobs', gutenberg: 33556, category: 'fiabe' },

  // ARABIAN NIGHTS
  { id: 'arabian-nights', title: 'The Arabian Nights', author: 'Traditional', gutenberg: 128, category: 'fiabe' },
  { id: 'arabian-nights-2', title: 'The Arabian Nights Vol 2', author: 'Traditional', gutenberg: 129, category: 'fiabe' },
  { id: 'arabian-nights-3', title: 'The Arabian Nights Vol 3', author: 'Traditional', gutenberg: 130, category: 'fiabe' },
  { id: 'arabian-nights-4', title: 'The Arabian Nights Vol 4', author: 'Traditional', gutenberg: 131, category: 'fiabe' },

  // OSCAR WILDE
  { id: 'happy-prince', title: 'The Happy Prince and Other Tales', author: 'Oscar Wilde', gutenberg: 902, category: 'favole' },
  { id: 'house-pomegranates', title: 'A House of Pomegranates', author: 'Oscar Wilde', gutenberg: 873, category: 'favole' },

  // AESOP
  { id: 'aesop-fables', title: "Aesop's Fables", author: 'Aesop', gutenberg: 11339, category: 'favole' },
  { id: 'aesop-children', title: 'The Aesop for Children', author: 'Aesop', gutenberg: 19994, category: 'favole' },
  { id: 'aesop-fables-2', title: "Aesop's Fables (Vernon Jones)", author: 'Aesop', gutenberg: 21, category: 'favole' },

  // ============================================
  // CHILDREN'S LITERATURE
  // ============================================

  // LEWIS CARROLL
  { id: 'alice-wonderland', title: "Alice's Adventures in Wonderland", author: 'Lewis Carroll', gutenberg: 11, category: 'classici' },
  { id: 'alice-wonderland-it', title: 'Le Avventure di Alice nel Paese delle Meraviglie', author: 'Lewis Carroll', gutenberg: 28371, category: 'classici', lang: 'it' },
  { id: 'through-looking-glass', title: 'Through the Looking-Glass', author: 'Lewis Carroll', gutenberg: 12, category: 'classici' },
  { id: 'sylvie-bruno', title: 'Sylvie and Bruno', author: 'Lewis Carroll', gutenberg: 48795, category: 'classici' },
  { id: 'hunting-snark', title: 'The Hunting of the Snark', author: 'Lewis Carroll', gutenberg: 13, category: 'poesia' },

  // L. FRANK BAUM - OZ SERIES
  { id: 'wizard-oz', title: 'The Wonderful Wizard of Oz', author: 'L. Frank Baum', gutenberg: 55, category: 'classici' },
  { id: 'marvelous-land-oz', title: 'The Marvelous Land of Oz', author: 'L. Frank Baum', gutenberg: 54, category: 'classici' },
  { id: 'ozma-oz', title: 'Ozma of Oz', author: 'L. Frank Baum', gutenberg: 486, category: 'classici' },
  { id: 'dorothy-wizard-oz', title: 'Dorothy and the Wizard in Oz', author: 'L. Frank Baum', gutenberg: 420, category: 'classici' },
  { id: 'road-oz', title: 'The Road to Oz', author: 'L. Frank Baum', gutenberg: 485, category: 'classici' },
  { id: 'emerald-city-oz', title: 'The Emerald City of Oz', author: 'L. Frank Baum', gutenberg: 517, category: 'classici' },
  { id: 'patchwork-girl-oz', title: 'The Patchwork Girl of Oz', author: 'L. Frank Baum', gutenberg: 955, category: 'classici' },
  { id: 'tiktok-oz', title: 'Tik-Tok of Oz', author: 'L. Frank Baum', gutenberg: 956, category: 'classici' },
  { id: 'scarecrow-oz', title: 'The Scarecrow of Oz', author: 'L. Frank Baum', gutenberg: 957, category: 'classici' },
  { id: 'rinkitink-oz', title: 'Rinkitink in Oz', author: 'L. Frank Baum', gutenberg: 25581, category: 'classici' },
  { id: 'lost-princess-oz', title: 'The Lost Princess of Oz', author: 'L. Frank Baum', gutenberg: 958, category: 'classici' },
  { id: 'tin-woodman-oz', title: 'The Tin Woodman of Oz', author: 'L. Frank Baum', gutenberg: 959, category: 'classici' },
  { id: 'magic-oz', title: 'The Magic of Oz', author: 'L. Frank Baum', gutenberg: 960, category: 'classici' },
  { id: 'glinda-oz', title: 'Glinda of Oz', author: 'L. Frank Baum', gutenberg: 961, category: 'classici' },

  // J.M. BARRIE
  { id: 'peter-pan', title: 'Peter Pan', author: 'J.M. Barrie', gutenberg: 16, category: 'classici' },
  { id: 'peter-pan-kensington', title: 'Peter Pan in Kensington Gardens', author: 'J.M. Barrie', gutenberg: 1332, category: 'classici' },

  // BEATRIX POTTER
  { id: 'peter-rabbit', title: 'The Tale of Peter Rabbit', author: 'Beatrix Potter', gutenberg: 14838, category: 'animali' },
  { id: 'benjamin-bunny', title: 'The Tale of Benjamin Bunny', author: 'Beatrix Potter', gutenberg: 14407, category: 'animali' },
  { id: 'squirrel-nutkin', title: 'The Tale of Squirrel Nutkin', author: 'Beatrix Potter', gutenberg: 14872, category: 'animali' },
  { id: 'tailor-gloucester', title: 'The Tailor of Gloucester', author: 'Beatrix Potter', gutenberg: 15088, category: 'animali' },
  { id: 'two-bad-mice', title: 'The Tale of Two Bad Mice', author: 'Beatrix Potter', gutenberg: 14797, category: 'animali' },
  { id: 'mrs-tiggy-winkle', title: 'The Tale of Mrs. Tiggy-Winkle', author: 'Beatrix Potter', gutenberg: 15502, category: 'animali' },
  { id: 'jeremy-fisher', title: 'The Tale of Mr. Jeremy Fisher', author: 'Beatrix Potter', gutenberg: 15239, category: 'animali' },
  { id: 'tom-kitten', title: 'The Tale of Tom Kitten', author: 'Beatrix Potter', gutenberg: 16300, category: 'animali' },
  { id: 'jemima-puddleduck', title: 'The Tale of Jemima Puddle-Duck', author: 'Beatrix Potter', gutenberg: 15593, category: 'animali' },
  { id: 'flopsy-bunnies', title: 'The Tale of The Flopsy Bunnies', author: 'Beatrix Potter', gutenberg: 14859, category: 'animali' },
  { id: 'mrs-tittlemouse', title: 'The Tale of Mrs. Tittlemouse', author: 'Beatrix Potter', gutenberg: 18483, category: 'animali' },
  { id: 'timmy-tiptoes', title: 'The Tale of Timmy Tiptoes', author: 'Beatrix Potter', gutenberg: 21579, category: 'animali' },
  { id: 'johnny-town-mouse', title: 'The Tale of Johnny Town-Mouse', author: 'Beatrix Potter', gutenberg: 21562, category: 'animali' },
  { id: 'ginger-pickles', title: 'Ginger and Pickles', author: 'Beatrix Potter', gutenberg: 20489, category: 'animali' },
  { id: 'pie-patty-pan', title: 'The Pie and the Patty-Pan', author: 'Beatrix Potter', gutenberg: 22056, category: 'animali' },

  // RUDYARD KIPLING
  { id: 'jungle-book', title: 'The Jungle Book', author: 'Rudyard Kipling', gutenberg: 236, category: 'classici' },
  { id: 'second-jungle-book', title: 'The Second Jungle Book', author: 'Rudyard Kipling', gutenberg: 1937, category: 'classici' },
  { id: 'just-so-stories', title: 'Just So Stories', author: 'Rudyard Kipling', gutenberg: 2781, category: 'classici' },
  { id: 'kim', title: 'Kim', author: 'Rudyard Kipling', gutenberg: 2226, category: 'classici' },
  { id: 'captains-courageous', title: 'Captains Courageous', author: 'Rudyard Kipling', gutenberg: 165, category: 'avventura' },
  { id: 'puck-pooks-hill', title: "Puck of Pook's Hill", author: 'Rudyard Kipling', gutenberg: 557, category: 'classici' },
  { id: 'rewards-fairies', title: 'Rewards and Fairies', author: 'Rudyard Kipling', gutenberg: 556, category: 'classici' },

  // CARLO COLLODI
  { id: 'pinocchio', title: 'Le Avventure di Pinocchio', author: 'Carlo Collodi', gutenberg: 500, category: 'classici', lang: 'it' },
  { id: 'pinocchio-en', title: 'The Adventures of Pinocchio', author: 'Carlo Collodi', gutenberg: 17192, category: 'classici' },

  // FRANCES HODGSON BURNETT
  { id: 'secret-garden', title: 'The Secret Garden', author: 'Frances Hodgson Burnett', gutenberg: 113, category: 'classici' },
  { id: 'little-princess', title: 'A Little Princess', author: 'Frances Hodgson Burnett', gutenberg: 146, category: 'classici' },
  { id: 'little-lord-fauntleroy', title: 'Little Lord Fauntleroy', author: 'Frances Hodgson Burnett', gutenberg: 479, category: 'classici' },
  { id: 'sara-crewe', title: 'Sara Crewe', author: 'Frances Hodgson Burnett', gutenberg: 20544, category: 'classici' },
  { id: 'lost-prince', title: 'The Lost Prince', author: 'Frances Hodgson Burnett', gutenberg: 3380, category: 'classici' },

  // LOUISA MAY ALCOTT
  { id: 'little-women', title: 'Little Women', author: 'Louisa May Alcott', gutenberg: 514, category: 'classici' },
  { id: 'good-wives', title: 'Good Wives', author: 'Louisa May Alcott', gutenberg: 5348, category: 'classici' },
  { id: 'little-men', title: 'Little Men', author: 'Louisa May Alcott', gutenberg: 32, category: 'classici' },
  { id: 'jos-boys', title: "Jo's Boys", author: 'Louisa May Alcott', gutenberg: 3770, category: 'classici' },
  { id: 'eight-cousins', title: 'Eight Cousins', author: 'Louisa May Alcott', gutenberg: 2726, category: 'classici' },
  { id: 'rose-bloom', title: 'Rose in Bloom', author: 'Louisa May Alcott', gutenberg: 3769, category: 'classici' },
  { id: 'under-lilacs', title: 'Under the Lilacs', author: 'Louisa May Alcott', gutenberg: 2706, category: 'classici' },
  { id: 'old-fashioned-girl', title: 'An Old-Fashioned Girl', author: 'Louisa May Alcott', gutenberg: 2091, category: 'classici' },

  // JOHANNA SPYRI
  { id: 'heidi', title: 'Heidi', author: 'Johanna Spyri', gutenberg: 1448, category: 'classici' },
  { id: 'heidi-uses', title: 'Heidi Uses Her Learning', author: 'Johanna Spyri', gutenberg: 20781, category: 'classici' },

  // KENNETH GRAHAME
  { id: 'wind-willows', title: 'The Wind in the Willows', author: 'Kenneth Grahame', gutenberg: 289, category: 'animali' },
  { id: 'golden-age', title: 'The Golden Age', author: 'Kenneth Grahame', gutenberg: 2097, category: 'classici' },
  { id: 'dream-days', title: 'Dream Days', author: 'Kenneth Grahame', gutenberg: 2098, category: 'classici' },

  // ANNA SEWELL
  { id: 'black-beauty', title: 'Black Beauty', author: 'Anna Sewell', gutenberg: 271, category: 'animali' },

  // EDITH NESBIT
  { id: 'railway-children', title: 'The Railway Children', author: 'E. Nesbit', gutenberg: 1874, category: 'classici' },
  { id: 'five-children-it', title: 'Five Children and It', author: 'E. Nesbit', gutenberg: 778, category: 'classici' },
  { id: 'phoenix-carpet', title: 'The Phoenix and the Carpet', author: 'E. Nesbit', gutenberg: 836, category: 'classici' },
  { id: 'story-amulet', title: 'The Story of the Amulet', author: 'E. Nesbit', gutenberg: 837, category: 'classici' },
  { id: 'treasure-seekers', title: 'The Story of the Treasure Seekers', author: 'E. Nesbit', gutenberg: 770, category: 'classici' },
  { id: 'wouldbegoods', title: 'The Wouldbegoods', author: 'E. Nesbit', gutenberg: 794, category: 'classici' },
  { id: 'new-treasure-seekers', title: 'New Treasure Seekers', author: 'E. Nesbit', gutenberg: 1300, category: 'classici' },
  { id: 'enchanted-castle', title: 'The Enchanted Castle', author: 'E. Nesbit', gutenberg: 3535, category: 'classici' },
  { id: 'house-arden', title: 'The House of Arden', author: 'E. Nesbit', gutenberg: 8948, category: 'classici' },
  { id: 'magic-city', title: 'The Magic City', author: 'E. Nesbit', gutenberg: 2509, category: 'classici' },
  { id: 'wet-magic', title: 'Wet Magic', author: 'E. Nesbit', gutenberg: 33028, category: 'classici' },

  // ============================================
  // ADVENTURE & CLASSIC FICTION
  // ============================================

  // R.L. STEVENSON
  { id: 'treasure-island', title: 'Treasure Island', author: 'R.L. Stevenson', gutenberg: 120, category: 'avventura' },
  { id: 'treasure-island-it', title: "L'Isola del Tesoro", author: 'R.L. Stevenson', gutenberg: 10022, category: 'avventura', lang: 'it' },
  { id: 'kidnapped', title: 'Kidnapped', author: 'R.L. Stevenson', gutenberg: 421, category: 'avventura' },
  { id: 'catriona', title: 'Catriona', author: 'R.L. Stevenson', gutenberg: 589, category: 'avventura' },
  { id: 'black-arrow', title: 'The Black Arrow', author: 'R.L. Stevenson', gutenberg: 848, category: 'avventura' },
  { id: 'strange-case-jekyll-hyde', title: 'The Strange Case of Dr Jekyll and Mr Hyde', author: 'R.L. Stevenson', gutenberg: 43, category: 'mistero' },
  { id: 'master-ballantrae', title: 'The Master of Ballantrae', author: 'R.L. Stevenson', gutenberg: 1621, category: 'avventura' },
  { id: 'childs-garden-verses', title: "A Child's Garden of Verses", author: 'R.L. Stevenson', gutenberg: 136, category: 'poesia' },
  { id: 'new-arabian-nights', title: 'New Arabian Nights', author: 'R.L. Stevenson', gutenberg: 32, category: 'avventura' },

  // DANIEL DEFOE
  { id: 'robinson-crusoe', title: 'Robinson Crusoe', author: 'Daniel Defoe', gutenberg: 521, category: 'avventura' },
  { id: 'robinson-crusoe-it', title: 'Robinson Crusoe', author: 'Daniel Defoe', gutenberg: 41066, category: 'avventura', lang: 'it' },
  { id: 'further-adventures-crusoe', title: 'Further Adventures of Robinson Crusoe', author: 'Daniel Defoe', gutenberg: 50161, category: 'avventura' },
  { id: 'moll-flanders', title: 'Moll Flanders', author: 'Daniel Defoe', gutenberg: 370, category: 'classici' },
  { id: 'journal-plague-year', title: 'A Journal of the Plague Year', author: 'Daniel Defoe', gutenberg: 376, category: 'classici' },

  // JONATHAN SWIFT
  { id: 'gulliver-travels', title: "Gulliver's Travels", author: 'Jonathan Swift', gutenberg: 829, category: 'avventura' },
  { id: 'gulliver-travels-it', title: 'I Viaggi di Gulliver', author: 'Jonathan Swift', gutenberg: 30100, category: 'avventura', lang: 'it' },
  { id: 'modest-proposal', title: 'A Modest Proposal', author: 'Jonathan Swift', gutenberg: 1080, category: 'classici' },

  // MARK TWAIN
  { id: 'tom-sawyer', title: 'The Adventures of Tom Sawyer', author: 'Mark Twain', gutenberg: 74, category: 'avventura' },
  { id: 'tom-sawyer-it', title: 'Le Avventure di Tom Sawyer', author: 'Mark Twain', gutenberg: 54576, category: 'avventura', lang: 'it' },
  { id: 'huckleberry-finn', title: 'Adventures of Huckleberry Finn', author: 'Mark Twain', gutenberg: 76, category: 'avventura' },
  { id: 'prince-pauper', title: 'The Prince and the Pauper', author: 'Mark Twain', gutenberg: 1837, category: 'classici' },
  { id: 'connecticut-yankee', title: 'A Connecticut Yankee in King Arthur\'s Court', author: 'Mark Twain', gutenberg: 86, category: 'classici' },
  { id: 'innocents-abroad', title: 'The Innocents Abroad', author: 'Mark Twain', gutenberg: 3176, category: 'classici' },
  { id: 'roughing-it', title: 'Roughing It', author: 'Mark Twain', gutenberg: 3177, category: 'classici' },
  { id: 'life-mississippi', title: 'Life on the Mississippi', author: 'Mark Twain', gutenberg: 245, category: 'classici' },
  { id: 'puddnhead-wilson', title: 'Pudd\'nhead Wilson', author: 'Mark Twain', gutenberg: 102, category: 'classici' },
  { id: 'personal-recollections-joan', title: 'Personal Recollections of Joan of Arc', author: 'Mark Twain', gutenberg: 2874, category: 'classici' },

  // JACK LONDON
  { id: 'call-wild', title: 'The Call of the Wild', author: 'Jack London', gutenberg: 215, category: 'avventura' },
  { id: 'white-fang', title: 'White Fang', author: 'Jack London', gutenberg: 910, category: 'avventura' },
  { id: 'sea-wolf', title: 'The Sea Wolf', author: 'Jack London', gutenberg: 1074, category: 'avventura' },
  { id: 'martin-eden', title: 'Martin Eden', author: 'Jack London', gutenberg: 1056, category: 'classici' },
  { id: 'burning-daylight', title: 'Burning Daylight', author: 'Jack London', gutenberg: 1059, category: 'avventura' },
  { id: 'iron-heel', title: 'The Iron Heel', author: 'Jack London', gutenberg: 1164, category: 'fantasy' },
  { id: 'john-barleycorn', title: 'John Barleycorn', author: 'Jack London', gutenberg: 318, category: 'classici' },

  // JULES VERNE
  { id: 'twenty-thousand-leagues', title: 'Twenty Thousand Leagues Under the Sea', author: 'Jules Verne', gutenberg: 164, category: 'avventura' },
  { id: 'around-world-80-days', title: 'Around the World in 80 Days', author: 'Jules Verne', gutenberg: 103, category: 'avventura' },
  { id: 'journey-center-earth', title: 'Journey to the Center of the Earth', author: 'Jules Verne', gutenberg: 18857, category: 'avventura' },
  { id: 'mysterious-island', title: 'The Mysterious Island', author: 'Jules Verne', gutenberg: 1268, category: 'avventura' },
  { id: 'from-earth-moon', title: 'From the Earth to the Moon', author: 'Jules Verne', gutenberg: 83, category: 'fantasy' },
  { id: 'round-moon', title: 'Round the Moon', author: 'Jules Verne', gutenberg: 16457, category: 'fantasy' },
  { id: 'five-weeks-balloon', title: 'Five Weeks in a Balloon', author: 'Jules Verne', gutenberg: 3526, category: 'avventura' },
  { id: 'michael-strogoff', title: 'Michael Strogoff', author: 'Jules Verne', gutenberg: 1842, category: 'avventura' },
  { id: 'in-search-castaways', title: 'In Search of the Castaways', author: 'Jules Verne', gutenberg: 23256, category: 'avventura' },

  // ALEXANDRE DUMAS
  { id: 'three-musketeers', title: 'The Three Musketeers', author: 'Alexandre Dumas', gutenberg: 1257, category: 'avventura' },
  { id: 'three-musketeers-fr', title: 'Les Trois Mousquetaires', author: 'Alexandre Dumas', gutenberg: 13951, category: 'avventura', lang: 'fr' },
  { id: 'twenty-years-after', title: 'Twenty Years After', author: 'Alexandre Dumas', gutenberg: 1259, category: 'avventura' },
  { id: 'count-monte-cristo', title: 'The Count of Monte Cristo', author: 'Alexandre Dumas', gutenberg: 1184, category: 'avventura' },
  { id: 'monte-cristo-fr', title: 'Le Comte de Monte-Cristo', author: 'Alexandre Dumas', gutenberg: 17989, category: 'avventura', lang: 'fr' },
  { id: 'man-iron-mask', title: 'The Man in the Iron Mask', author: 'Alexandre Dumas', gutenberg: 2759, category: 'avventura' },
  { id: 'vicomte-bragelonne', title: 'The Vicomte de Bragelonne', author: 'Alexandre Dumas', gutenberg: 2681, category: 'avventura' },
  { id: 'queen-margot', title: 'Marguerite de Valois', author: 'Alexandre Dumas', gutenberg: 1214, category: 'classici' },
  { id: 'chicot-jester', title: 'Chicot the Jester', author: 'Alexandre Dumas', gutenberg: 1215, category: 'classici' },
  { id: 'black-tulip', title: 'The Black Tulip', author: 'Alexandre Dumas', gutenberg: 965, category: 'classici' },

  // JOHANN WYSS
  { id: 'swiss-family-robinson', title: 'The Swiss Family Robinson', author: 'Johann Wyss', gutenberg: 3836, category: 'avventura' },

  // ============================================
  // CLASSIC LITERATURE
  // ============================================

  // CHARLES DICKENS
  { id: 'christmas-carol', title: 'A Christmas Carol', author: 'Charles Dickens', gutenberg: 46, category: 'classici' },
  { id: 'christmas-carol-it', title: 'Il Canto di Natale', author: 'Charles Dickens', gutenberg: 11686, category: 'classici', lang: 'it' },
  { id: 'oliver-twist', title: 'Oliver Twist', author: 'Charles Dickens', gutenberg: 730, category: 'classici' },
  { id: 'david-copperfield', title: 'David Copperfield', author: 'Charles Dickens', gutenberg: 766, category: 'classici' },
  { id: 'great-expectations', title: 'Great Expectations', author: 'Charles Dickens', gutenberg: 1400, category: 'classici' },
  { id: 'great-expectations-it', title: 'Grandi Speranze', author: 'Charles Dickens', gutenberg: 18023, category: 'classici', lang: 'it' },
  { id: 'tale-two-cities', title: 'A Tale of Two Cities', author: 'Charles Dickens', gutenberg: 98, category: 'classici' },
  { id: 'pickwick-papers', title: 'The Pickwick Papers', author: 'Charles Dickens', gutenberg: 580, category: 'classici' },
  { id: 'bleak-house', title: 'Bleak House', author: 'Charles Dickens', gutenberg: 1023, category: 'classici' },
  { id: 'little-dorrit', title: 'Little Dorrit', author: 'Charles Dickens', gutenberg: 963, category: 'classici' },
  { id: 'our-mutual-friend', title: 'Our Mutual Friend', author: 'Charles Dickens', gutenberg: 883, category: 'classici' },
  { id: 'nicholas-nickleby', title: 'Nicholas Nickleby', author: 'Charles Dickens', gutenberg: 967, category: 'classici' },
  { id: 'dombey-son', title: 'Dombey and Son', author: 'Charles Dickens', gutenberg: 821, category: 'classici' },
  { id: 'hard-times', title: 'Hard Times', author: 'Charles Dickens', gutenberg: 786, category: 'classici' },
  { id: 'martin-chuzzlewit', title: 'Martin Chuzzlewit', author: 'Charles Dickens', gutenberg: 968, category: 'classici' },
  { id: 'barnaby-rudge', title: 'Barnaby Rudge', author: 'Charles Dickens', gutenberg: 917, category: 'classici' },
  { id: 'old-curiosity-shop', title: 'The Old Curiosity Shop', author: 'Charles Dickens', gutenberg: 700, category: 'classici' },
  { id: 'mystery-edwin-drood', title: 'The Mystery of Edwin Drood', author: 'Charles Dickens', gutenberg: 564, category: 'mistero' },

  // JANE AUSTEN
  { id: 'pride-prejudice', title: 'Pride and Prejudice', author: 'Jane Austen', gutenberg: 1342, category: 'classici' },
  { id: 'pride-prejudice-it', title: 'Orgoglio e Pregiudizio', author: 'Jane Austen', gutenberg: 26068, category: 'classici', lang: 'it' },
  { id: 'sense-sensibility', title: 'Sense and Sensibility', author: 'Jane Austen', gutenberg: 161, category: 'classici' },
  { id: 'emma', title: 'Emma', author: 'Jane Austen', gutenberg: 158, category: 'classici' },
  { id: 'mansfield-park', title: 'Mansfield Park', author: 'Jane Austen', gutenberg: 141, category: 'classici' },
  { id: 'persuasion', title: 'Persuasion', author: 'Jane Austen', gutenberg: 105, category: 'classici' },
  { id: 'northanger-abbey', title: 'Northanger Abbey', author: 'Jane Austen', gutenberg: 121, category: 'classici' },
  { id: 'lady-susan', title: 'Lady Susan', author: 'Jane Austen', gutenberg: 946, category: 'classici' },

  // BRONTE SISTERS
  { id: 'jane-eyre', title: 'Jane Eyre', author: 'Charlotte Bronte', gutenberg: 1260, category: 'classici' },
  { id: 'jane-eyre-it', title: 'Jane Eyre', author: 'Charlotte Bronte', gutenberg: 27546, category: 'classici', lang: 'it' },
  { id: 'villette', title: 'Villette', author: 'Charlotte Bronte', gutenberg: 9182, category: 'classici' },
  { id: 'shirley', title: 'Shirley', author: 'Charlotte Bronte', gutenberg: 30486, category: 'classici' },
  { id: 'professor', title: 'The Professor', author: 'Charlotte Bronte', gutenberg: 1028, category: 'classici' },
  { id: 'wuthering-heights', title: 'Wuthering Heights', author: 'Emily Bronte', gutenberg: 768, category: 'classici' },
  { id: 'wuthering-heights-it', title: 'Cime Tempestose', author: 'Emily Bronte', gutenberg: 53476, category: 'classici', lang: 'it' },
  { id: 'tenant-wildfell-hall', title: 'The Tenant of Wildfell Hall', author: 'Anne Bronte', gutenberg: 969, category: 'classici' },
  { id: 'agnes-grey', title: 'Agnes Grey', author: 'Anne Bronte', gutenberg: 767, category: 'classici' },

  // ============================================
  // FANTASY & SCIENCE FICTION
  // ============================================

  // MARY SHELLEY
  { id: 'frankenstein', title: 'Frankenstein', author: 'Mary Shelley', gutenberg: 84, category: 'fantasy' },
  { id: 'frankenstein-it', title: 'Frankenstein', author: 'Mary Shelley', gutenberg: 42324, category: 'fantasy', lang: 'it' },
  { id: 'last-man', title: 'The Last Man', author: 'Mary Shelley', gutenberg: 18247, category: 'fantasy' },

  // BRAM STOKER
  { id: 'dracula', title: 'Dracula', author: 'Bram Stoker', gutenberg: 345, category: 'fantasy' },
  { id: 'dracula-it', title: 'Dracula', author: 'Bram Stoker', gutenberg: 46831, category: 'fantasy', lang: 'it' },
  { id: 'lair-white-worm', title: 'The Lair of the White Worm', author: 'Bram Stoker', gutenberg: 1188, category: 'fantasy' },
  { id: 'jewel-seven-stars', title: 'The Jewel of Seven Stars', author: 'Bram Stoker', gutenberg: 3781, category: 'fantasy' },

  // H.G. WELLS
  { id: 'time-machine', title: 'The Time Machine', author: 'H.G. Wells', gutenberg: 35, category: 'fantasy' },
  { id: 'time-machine-it', title: 'La Macchina del Tempo', author: 'H.G. Wells', gutenberg: 29735, category: 'fantasy', lang: 'it' },
  { id: 'war-worlds', title: 'The War of the Worlds', author: 'H.G. Wells', gutenberg: 36, category: 'fantasy' },
  { id: 'war-worlds-it', title: 'La Guerra dei Mondi', author: 'H.G. Wells', gutenberg: 41055, category: 'fantasy', lang: 'it' },
  { id: 'invisible-man', title: 'The Invisible Man', author: 'H.G. Wells', gutenberg: 5230, category: 'fantasy' },
  { id: 'island-dr-moreau', title: 'The Island of Doctor Moreau', author: 'H.G. Wells', gutenberg: 159, category: 'fantasy' },
  { id: 'first-men-moon', title: 'The First Men in the Moon', author: 'H.G. Wells', gutenberg: 1013, category: 'fantasy' },
  { id: 'food-gods', title: 'The Food of the Gods', author: 'H.G. Wells', gutenberg: 11696, category: 'fantasy' },
  { id: 'sleeper-awakes', title: 'The Sleeper Awakes', author: 'H.G. Wells', gutenberg: 775, category: 'fantasy' },
  { id: 'kipps', title: 'Kipps', author: 'H.G. Wells', gutenberg: 11638, category: 'classici' },
  { id: 'tono-bungay', title: 'Tono-Bungay', author: 'H.G. Wells', gutenberg: 718, category: 'classici' },
  { id: 'history-mr-polly', title: 'The History of Mr. Polly', author: 'H.G. Wells', gutenberg: 7308, category: 'classici' },
  { id: 'country-blind', title: 'The Country of the Blind', author: 'H.G. Wells', gutenberg: 11870, category: 'fantasy' },
  { id: 'world-set-free', title: 'The World Set Free', author: 'H.G. Wells', gutenberg: 1059, category: 'fantasy' },

  // EDGAR ALLAN POE
  { id: 'works-poe-1', title: 'The Works of Edgar Allan Poe Vol 1', author: 'Edgar Allan Poe', gutenberg: 2147, category: 'mistero' },
  { id: 'works-poe-2', title: 'The Works of Edgar Allan Poe Vol 2', author: 'Edgar Allan Poe', gutenberg: 2148, category: 'mistero' },
  { id: 'works-poe-3', title: 'The Works of Edgar Allan Poe Vol 3', author: 'Edgar Allan Poe', gutenberg: 2149, category: 'mistero' },
  { id: 'works-poe-4', title: 'The Works of Edgar Allan Poe Vol 4', author: 'Edgar Allan Poe', gutenberg: 2150, category: 'mistero' },
  { id: 'works-poe-5', title: 'The Works of Edgar Allan Poe Vol 5', author: 'Edgar Allan Poe', gutenberg: 2151, category: 'mistero' },
  { id: 'raven', title: 'The Raven', author: 'Edgar Allan Poe', gutenberg: 17192, category: 'poesia' },
  { id: 'fall-house-usher', title: 'The Fall of the House of Usher', author: 'Edgar Allan Poe', gutenberg: 932, category: 'mistero' },
  { id: 'narrative-gordon-pym', title: 'The Narrative of Arthur Gordon Pym', author: 'Edgar Allan Poe', gutenberg: 2149, category: 'avventura' },

  // H.P. LOVECRAFT
  { id: 'call-cthulhu', title: 'The Call of Cthulhu', author: 'H.P. Lovecraft', gutenberg: 68283, category: 'fantasy' },
  { id: 'dunwich-horror', title: 'The Dunwich Horror', author: 'H.P. Lovecraft', gutenberg: 50133, category: 'fantasy' },
  { id: 'shadow-innsmouth', title: 'The Shadow Over Innsmouth', author: 'H.P. Lovecraft', gutenberg: 73181, category: 'fantasy' },
  { id: 'colour-out-space', title: 'The Colour Out of Space', author: 'H.P. Lovecraft', gutenberg: 68236, category: 'fantasy' },
  { id: 'at-mountains-madness', title: 'At the Mountains of Madness', author: 'H.P. Lovecraft', gutenberg: 70652, category: 'fantasy' },

  // ============================================
  // DETECTIVE & MYSTERY
  // ============================================

  // ARTHUR CONAN DOYLE
  { id: 'sherlock-holmes', title: 'The Adventures of Sherlock Holmes', author: 'Arthur Conan Doyle', gutenberg: 1661, category: 'mistero' },
  { id: 'memoirs-sherlock', title: 'The Memoirs of Sherlock Holmes', author: 'Arthur Conan Doyle', gutenberg: 834, category: 'mistero' },
  { id: 'return-sherlock', title: 'The Return of Sherlock Holmes', author: 'Arthur Conan Doyle', gutenberg: 108, category: 'mistero' },
  { id: 'hound-baskervilles', title: 'The Hound of the Baskervilles', author: 'Arthur Conan Doyle', gutenberg: 2852, category: 'mistero' },
  { id: 'hound-baskervilles-it', title: 'Il Mastino dei Baskerville', author: 'Arthur Conan Doyle', gutenberg: 44665, category: 'mistero', lang: 'it' },
  { id: 'study-scarlet', title: 'A Study in Scarlet', author: 'Arthur Conan Doyle', gutenberg: 244, category: 'mistero' },
  { id: 'sign-four', title: 'The Sign of the Four', author: 'Arthur Conan Doyle', gutenberg: 2097, category: 'mistero' },
  { id: 'valley-fear', title: 'The Valley of Fear', author: 'Arthur Conan Doyle', gutenberg: 3289, category: 'mistero' },
  { id: 'his-last-bow', title: 'His Last Bow', author: 'Arthur Conan Doyle', gutenberg: 2350, category: 'mistero' },
  { id: 'case-book-sherlock', title: 'The Case-Book of Sherlock Holmes', author: 'Arthur Conan Doyle', gutenberg: 69700, category: 'mistero' },
  { id: 'lost-world', title: 'The Lost World', author: 'Arthur Conan Doyle', gutenberg: 139, category: 'avventura' },
  { id: 'poison-belt', title: 'The Poison Belt', author: 'Arthur Conan Doyle', gutenberg: 126, category: 'avventura' },

  // AGATHA CHRISTIE
  { id: 'mysterious-affair-styles', title: 'The Mysterious Affair at Styles', author: 'Agatha Christie', gutenberg: 863, category: 'mistero' },
  { id: 'secret-adversary', title: 'The Secret Adversary', author: 'Agatha Christie', gutenberg: 1155, category: 'mistero' },
  { id: 'murder-links', title: 'The Murder on the Links', author: 'Agatha Christie', gutenberg: 58866, category: 'mistero' },
  { id: 'man-brown-suit', title: 'The Man in the Brown Suit', author: 'Agatha Christie', gutenberg: 61168, category: 'mistero' },
  { id: 'poirot-investigates', title: 'Poirot Investigates', author: 'Agatha Christie', gutenberg: 61262, category: 'mistero' },
  { id: 'secret-chimneys', title: 'The Secret of Chimneys', author: 'Agatha Christie', gutenberg: 65238, category: 'mistero' },

  // G.K. CHESTERTON
  { id: 'innocence-father-brown', title: 'The Innocence of Father Brown', author: 'G.K. Chesterton', gutenberg: 204, category: 'mistero' },
  { id: 'wisdom-father-brown', title: 'The Wisdom of Father Brown', author: 'G.K. Chesterton', gutenberg: 223, category: 'mistero' },
  { id: 'incredulity-father-brown', title: 'The Incredulity of Father Brown', author: 'G.K. Chesterton', gutenberg: 347, category: 'mistero' },
  { id: 'secret-father-brown', title: 'The Secret of Father Brown', author: 'G.K. Chesterton', gutenberg: 223, category: 'mistero' },
  { id: 'man-who-was-thursday', title: 'The Man Who Was Thursday', author: 'G.K. Chesterton', gutenberg: 1695, category: 'mistero' },
  { id: 'napoleon-notting-hill', title: 'The Napoleon of Notting Hill', author: 'G.K. Chesterton', gutenberg: 20058, category: 'classici' },

  // ============================================
  // PHILOSOPHY & SPIRITUALITY
  // ============================================

  // STOICS
  { id: 'meditations', title: 'Meditations', author: 'Marcus Aurelius', gutenberg: 2680, category: 'filosofia' },
  { id: 'meditations-it', title: 'I Pensieri di Marco Aurelio', author: 'Marcus Aurelio', gutenberg: 56168, category: 'filosofia', lang: 'it' },
  { id: 'seneca-letters', title: 'Letters to Lucilius', author: 'Seneca', gutenberg: 2612, category: 'filosofia' },
  { id: 'seneca-letters-it', title: 'Lettere a Lucilio', author: 'Seneca', gutenberg: 31100, category: 'filosofia', lang: 'it' },
  { id: 'epictetus-discourses', title: 'Discourses of Epictetus', author: 'Epictetus', gutenberg: 10661, category: 'filosofia' },
  { id: 'epictetus-enchiridion', title: 'The Enchiridion', author: 'Epictetus', gutenberg: 45109, category: 'filosofia' },

  // PLATO
  { id: 'republic', title: 'The Republic', author: 'Plato', gutenberg: 1497, category: 'filosofia' },
  { id: 'symposium', title: 'The Symposium', author: 'Plato', gutenberg: 1600, category: 'filosofia' },
  { id: 'apology', title: 'Apology', author: 'Plato', gutenberg: 1656, category: 'filosofia' },
  { id: 'phaedo', title: 'Phaedo', author: 'Plato', gutenberg: 1658, category: 'filosofia' },
  { id: 'dialogues-1', title: 'Dialogues Vol 1', author: 'Plato', gutenberg: 1656, category: 'filosofia' },
  { id: 'dialogues-2', title: 'Dialogues Vol 2', author: 'Plato', gutenberg: 1657, category: 'filosofia' },
  { id: 'dialogues-3', title: 'Dialogues Vol 3', author: 'Plato', gutenberg: 1735, category: 'filosofia' },
  { id: 'dialogues-4', title: 'Dialogues Vol 4', author: 'Plato', gutenberg: 1687, category: 'filosofia' },

  // ARISTOTLE
  { id: 'nicomachean-ethics', title: 'Nicomachean Ethics', author: 'Aristotle', gutenberg: 8438, category: 'filosofia' },
  { id: 'politics', title: 'Politics', author: 'Aristotle', gutenberg: 6762, category: 'filosofia' },
  { id: 'poetics', title: 'Poetics', author: 'Aristotle', gutenberg: 1974, category: 'filosofia' },
  { id: 'rhetoric', title: 'Rhetoric', author: 'Aristotle', gutenberg: 2154, category: 'filosofia' },

  // SPIRITUAL TEXTS
  { id: 'confessions-augustine', title: 'Confessions', author: 'Saint Augustine', gutenberg: 3296, category: 'spiritualita' },
  { id: 'imitation-christ', title: 'The Imitation of Christ', author: 'Thomas a Kempis', gutenberg: 1653, category: 'spiritualita' },
  { id: 'practice-presence-god', title: 'The Practice of the Presence of God', author: 'Brother Lawrence', gutenberg: 13871, category: 'spiritualita' },
  { id: 'pilgrims-progress', title: "Pilgrim's Progress", author: 'John Bunyan', gutenberg: 131, category: 'spiritualita' },
  { id: 'paradise-lost', title: 'Paradise Lost', author: 'John Milton', gutenberg: 26, category: 'poesia' },
  { id: 'divina-commedia', title: 'Divina Commedia', author: 'Dante Alighieri', gutenberg: 1012, category: 'poesia', lang: 'it' },
  { id: 'divine-comedy', title: 'The Divine Comedy', author: 'Dante Alighieri', gutenberg: 8800, category: 'poesia' },
  { id: 'bible-kjv', title: 'The King James Bible', author: 'Various', gutenberg: 10, category: 'spiritualita' },
  { id: 'childrens-bible', title: "The Children's Bible", author: 'Sherman/Kent', gutenberg: 28, category: 'spiritualita' },

  // ============================================
  // ITALIAN LITERATURE
  // ============================================

  { id: 'promessi-sposi', title: 'I Promessi Sposi', author: 'Alessandro Manzoni', gutenberg: 35155, category: 'classici', lang: 'it' },
  { id: 'cuore', title: 'Cuore', author: 'Edmondo De Amicis', gutenberg: 33419, category: 'classici', lang: 'it' },
  { id: 'decameron', title: 'Il Decameron', author: 'Giovanni Boccaccio', gutenberg: 23700, category: 'classici', lang: 'it' },
  { id: 'orlando-furioso', title: 'Orlando Furioso', author: 'Ludovico Ariosto', gutenberg: 3747, category: 'poesia', lang: 'it' },
  { id: 'gerusalemme-liberata', title: 'La Gerusalemme Liberata', author: 'Torquato Tasso', gutenberg: 392, category: 'poesia', lang: 'it' },
  { id: 'principe', title: 'Il Principe', author: 'Niccolo Machiavelli', gutenberg: 1232, category: 'filosofia', lang: 'it' },
  { id: 'prince', title: 'The Prince', author: 'Niccolo Machiavelli', gutenberg: 1232, category: 'filosofia' },
  { id: 'leopardi-canti', title: 'Canti', author: 'Giacomo Leopardi', gutenberg: 23189, category: 'poesia', lang: 'it' },
  { id: 'mastro-don-gesualdo', title: 'Mastro-don Gesualdo', author: 'Giovanni Verga', gutenberg: 47168, category: 'classici', lang: 'it' },
  { id: 'i-malavoglia', title: 'I Malavoglia', author: 'Giovanni Verga', gutenberg: 28870, category: 'classici', lang: 'it' },

  // ============================================
  // POETRY
  // ============================================

  // SHAKESPEARE
  { id: 'complete-shakespeare', title: 'Complete Works of Shakespeare', author: 'William Shakespeare', gutenberg: 100, category: 'poesia' },
  { id: 'hamlet', title: 'Hamlet', author: 'William Shakespeare', gutenberg: 1524, category: 'classici' },
  { id: 'macbeth', title: 'Macbeth', author: 'William Shakespeare', gutenberg: 1533, category: 'classici' },
  { id: 'romeo-juliet', title: 'Romeo and Juliet', author: 'William Shakespeare', gutenberg: 1513, category: 'classici' },
  { id: 'romeo-giulietta-it', title: 'Romeo e Giulietta', author: 'William Shakespeare', gutenberg: 20711, category: 'classici', lang: 'it' },
  { id: 'othello', title: 'Othello', author: 'William Shakespeare', gutenberg: 1531, category: 'classici' },
  { id: 'king-lear', title: 'King Lear', author: 'William Shakespeare', gutenberg: 1532, category: 'classici' },
  { id: 'midsummer-nights-dream', title: "A Midsummer Night's Dream", author: 'William Shakespeare', gutenberg: 1514, category: 'classici' },
  { id: 'tempest', title: 'The Tempest', author: 'William Shakespeare', gutenberg: 2235, category: 'classici' },
  { id: 'merchant-venice', title: 'The Merchant of Venice', author: 'William Shakespeare', gutenberg: 2243, category: 'classici' },
  { id: 'twelfth-night', title: 'Twelfth Night', author: 'William Shakespeare', gutenberg: 2239, category: 'classici' },
  { id: 'much-ado', title: 'Much Ado About Nothing', author: 'William Shakespeare', gutenberg: 2240, category: 'classici' },
  { id: 'sonnets', title: 'Sonnets', author: 'William Shakespeare', gutenberg: 1041, category: 'poesia' },

  // OTHER POETRY
  { id: 'leaves-grass', title: 'Leaves of Grass', author: 'Walt Whitman', gutenberg: 1322, category: 'poesia' },
  { id: 'lyrical-ballads', title: 'Lyrical Ballads', author: 'Wordsworth/Coleridge', gutenberg: 9622, category: 'poesia' },
  { id: 'rime-ancient-mariner', title: 'The Rime of the Ancient Mariner', author: 'S.T. Coleridge', gutenberg: 151, category: 'poesia' },
  { id: 'songs-innocence-experience', title: 'Songs of Innocence and Experience', author: 'William Blake', gutenberg: 1934, category: 'poesia' },
  { id: 'collected-poems-yeats', title: 'Collected Poems', author: 'W.B. Yeats', gutenberg: 49609, category: 'poesia' },
  { id: 'rubaiyat', title: 'Rubaiyat of Omar Khayyam', author: 'Omar Khayyam', gutenberg: 246, category: 'poesia' },
  { id: 'poems-keats', title: 'Poems', author: 'John Keats', gutenberg: 23684, category: 'poesia' },
  { id: 'poems-shelley', title: 'Poems', author: 'Percy Bysshe Shelley', gutenberg: 4800, category: 'poesia' },
  { id: 'poems-byron', title: 'Poems', author: 'Lord Byron', gutenberg: 8861, category: 'poesia' },
  { id: 'poems-browning', title: 'Poems', author: 'Robert Browning', gutenberg: 49303, category: 'poesia' },
  { id: 'poems-tennyson', title: 'Poems', author: 'Alfred Tennyson', gutenberg: 8601, category: 'poesia' },

  // ============================================
  // NURSERY RHYMES & CHILDREN'S POETRY
  // ============================================

  { id: 'mother-goose-rhymes', title: "Mother Goose Nursery Rhymes", author: 'Traditional', gutenberg: 10607, category: 'poesia' },
  { id: 'book-nursery-rhymes', title: 'A Book of Nursery Rhymes', author: 'Traditional', gutenberg: 18546, category: 'poesia' },
  { id: 'golden-book-poems', title: 'Golden Book of Poems', author: 'Various', gutenberg: 16436, category: 'poesia' },
  { id: 'joyful-poems-children', title: 'Joyful Poems for Children', author: 'Various', gutenberg: 21019, category: 'poesia' },
  { id: 'book-nonsense', title: 'A Book of Nonsense', author: 'Edward Lear', gutenberg: 13650, category: 'poesia' },
  { id: 'complete-nonsense', title: 'Complete Nonsense', author: 'Edward Lear', gutenberg: 13647, category: 'poesia' },
  { id: 'jabberwocky', title: 'Jabberwocky and Other Poems', author: 'Lewis Carroll', gutenberg: 620, category: 'poesia' },

  // ============================================
  // SCIENCE & NATURE
  // ============================================

  // DARWIN
  { id: 'origin-species', title: 'On the Origin of Species', author: 'Charles Darwin', gutenberg: 1228, category: 'scienza' },
  { id: 'descent-man', title: 'The Descent of Man', author: 'Charles Darwin', gutenberg: 2300, category: 'scienza' },
  { id: 'voyage-beagle', title: 'The Voyage of the Beagle', author: 'Charles Darwin', gutenberg: 944, category: 'scienza' },
  { id: 'expression-emotions', title: 'The Expression of the Emotions', author: 'Charles Darwin', gutenberg: 1227, category: 'scienza' },

  // NATURE
  { id: 'walden', title: 'Walden', author: 'Henry David Thoreau', gutenberg: 205, category: 'scienza' },
  { id: 'civil-disobedience', title: 'Civil Disobedience', author: 'Henry David Thoreau', gutenberg: 71, category: 'filosofia' },
  { id: 'emerson-essays', title: 'Essays', author: 'Ralph Waldo Emerson', gutenberg: 16643, category: 'filosofia' },
  { id: 'natural-history-selborne', title: 'Natural History of Selborne', author: 'Gilbert White', gutenberg: 1408, category: 'scienza' },

  // ============================================
  // HISTORY & BIOGRAPHY
  // ============================================

  { id: 'autobiography-franklin', title: 'Autobiography', author: 'Benjamin Franklin', gutenberg: 20203, category: 'classici' },
  { id: 'up-from-slavery', title: 'Up from Slavery', author: 'Booker T. Washington', gutenberg: 2376, category: 'classici' },
  { id: 'narrative-life-douglass', title: 'Narrative of the Life of Frederick Douglass', author: 'Frederick Douglass', gutenberg: 23, category: 'classici' },
  { id: 'common-sense', title: 'Common Sense', author: 'Thomas Paine', gutenberg: 147, category: 'classici' },
  { id: 'rights-man', title: 'Rights of Man', author: 'Thomas Paine', gutenberg: 31270, category: 'classici' },
  { id: 'federalist-papers', title: 'The Federalist Papers', author: 'Hamilton/Madison/Jay', gutenberg: 1404, category: 'classici' },
  { id: 'declaration-independence', title: 'Declaration of Independence', author: 'Thomas Jefferson', gutenberg: 1, category: 'classici' },
  { id: 'democracy-america', title: 'Democracy in America', author: 'Alexis de Tocqueville', gutenberg: 815, category: 'classici' },

  // GREEK & ROMAN CLASSICS
  { id: 'iliad', title: 'The Iliad', author: 'Homer', gutenberg: 6130, category: 'classici' },
  { id: 'odyssey', title: 'The Odyssey', author: 'Homer', gutenberg: 1727, category: 'classici' },
  { id: 'aeneid', title: 'The Aeneid', author: 'Virgil', gutenberg: 228, category: 'classici' },
  { id: 'metamorphoses', title: 'Metamorphoses', author: 'Ovid', gutenberg: 26073, category: 'classici' },
  { id: 'oedipus-rex', title: 'Oedipus Rex', author: 'Sophocles', gutenberg: 31, category: 'classici' },
  { id: 'antigone', title: 'Antigone', author: 'Sophocles', gutenberg: 31, category: 'classici' },
  { id: 'medea', title: 'Medea', author: 'Euripides', gutenberg: 35451, category: 'classici' },

  // ============================================
  // ONDE ORIGINALS
  // ============================================

  { id: 'aiko', title: 'AIKO - AI Spiegata ai Bambini', author: 'Gianni Parola', category: 'onde', source: 'onde-studio' },
  { id: 'aiko-2-robotaxi', title: 'AIKO 2 - The Robotaxi Adventure', author: 'Gianni Parola', category: 'onde', source: 'onde-studio' },
  { id: 'salmo-23', title: 'Il Salmo 23 per Bambini', author: 'Gianni Parola', category: 'spiritualita', source: 'onde-studio' },
  { id: 'piccole-rime', title: 'Piccole Rime Italiane', author: 'Antologia', category: 'poesia', source: 'onde-studio' },

  // ============================================
  // RUSSIAN LITERATURE
  // ============================================

  // LEO TOLSTOY
  { id: 'war-peace', title: 'War and Peace', author: 'Leo Tolstoy', gutenberg: 2600, category: 'classici' },
  { id: 'anna-karenina', title: 'Anna Karenina', author: 'Leo Tolstoy', gutenberg: 1399, category: 'classici' },
  { id: 'resurrection', title: 'Resurrection', author: 'Leo Tolstoy', gutenberg: 1938, category: 'classici' },
  { id: 'death-ivan-ilyich', title: 'The Death of Ivan Ilyich', author: 'Leo Tolstoy', gutenberg: 927, category: 'classici' },
  { id: 'kreutzer-sonata', title: 'The Kreutzer Sonata', author: 'Leo Tolstoy', gutenberg: 689, category: 'classici' },
  { id: 'what-is-art', title: 'What Is Art?', author: 'Leo Tolstoy', gutenberg: 64908, category: 'filosofia' },
  { id: 'kingdom-god-within', title: 'The Kingdom of God Is Within You', author: 'Leo Tolstoy', gutenberg: 4602, category: 'spiritualita' },
  { id: 'childhood', title: 'Childhood', author: 'Leo Tolstoy', gutenberg: 2450, category: 'classici' },
  { id: 'boyhood', title: 'Boyhood', author: 'Leo Tolstoy', gutenberg: 2637, category: 'classici' },
  { id: 'youth', title: 'Youth', author: 'Leo Tolstoy', gutenberg: 2638, category: 'classici' },
  { id: 'hadji-murad', title: 'Hadji Murad', author: 'Leo Tolstoy', gutenberg: 8657, category: 'classici' },
  { id: 'cossacks', title: 'The Cossacks', author: 'Leo Tolstoy', gutenberg: 4761, category: 'classici' },
  { id: 'master-man', title: 'Master and Man', author: 'Leo Tolstoy', gutenberg: 986, category: 'classici' },
  { id: 'sevastopol', title: 'Sevastopol', author: 'Leo Tolstoy', gutenberg: 4163, category: 'classici' },

  // FYODOR DOSTOEVSKY
  { id: 'crime-punishment', title: 'Crime and Punishment', author: 'Fyodor Dostoevsky', gutenberg: 2554, category: 'classici' },
  { id: 'brothers-karamazov', title: 'The Brothers Karamazov', author: 'Fyodor Dostoevsky', gutenberg: 28054, category: 'classici' },
  { id: 'idiot', title: 'The Idiot', author: 'Fyodor Dostoevsky', gutenberg: 2638, category: 'classici' },
  { id: 'notes-underground', title: 'Notes from the Underground', author: 'Fyodor Dostoevsky', gutenberg: 600, category: 'classici' },
  { id: 'possessed', title: 'The Possessed', author: 'Fyodor Dostoevsky', gutenberg: 8117, category: 'classici' },
  { id: 'gambler', title: 'The Gambler', author: 'Fyodor Dostoevsky', gutenberg: 2197, category: 'classici' },
  { id: 'poor-folk', title: 'Poor Folk', author: 'Fyodor Dostoevsky', gutenberg: 2302, category: 'classici' },
  { id: 'house-dead', title: 'The House of the Dead', author: 'Fyodor Dostoevsky', gutenberg: 37536, category: 'classici' },
  { id: 'eternal-husband', title: 'The Eternal Husband', author: 'Fyodor Dostoevsky', gutenberg: 37534, category: 'classici' },
  { id: 'insulted-injured', title: 'The Insulted and Injured', author: 'Fyodor Dostoevsky', gutenberg: 50574, category: 'classici' },
  { id: 'white-nights', title: 'White Nights', author: 'Fyodor Dostoevsky', gutenberg: 36034, category: 'classici' },

  // ANTON CHEKHOV
  { id: 'cherry-orchard', title: 'The Cherry Orchard', author: 'Anton Chekhov', gutenberg: 7986, category: 'classici' },
  { id: 'three-sisters', title: 'Three Sisters', author: 'Anton Chekhov', gutenberg: 7986, category: 'classici' },
  { id: 'seagull', title: 'The Seagull', author: 'Anton Chekhov', gutenberg: 7986, category: 'classici' },
  { id: 'uncle-vanya', title: 'Uncle Vanya', author: 'Anton Chekhov', gutenberg: 1756, category: 'classici' },
  { id: 'chekhov-stories', title: 'Short Stories', author: 'Anton Chekhov', gutenberg: 13415, category: 'classici' },
  { id: 'chekhov-stories-2', title: 'Short Stories Vol 2', author: 'Anton Chekhov', gutenberg: 13416, category: 'classici' },
  { id: 'darling', title: 'The Darling and Other Stories', author: 'Anton Chekhov', gutenberg: 13409, category: 'classici' },
  { id: 'bet', title: 'The Bet and Other Stories', author: 'Anton Chekhov', gutenberg: 37538, category: 'classici' },

  // IVAN TURGENEV
  { id: 'fathers-sons', title: 'Fathers and Sons', author: 'Ivan Turgenev', gutenberg: 30723, category: 'classici' },
  { id: 'sportsmans-sketches', title: "A Sportsman's Sketches Vol 1", author: 'Ivan Turgenev', gutenberg: 2536, category: 'classici' },
  { id: 'sportsmans-sketches-2', title: "A Sportsman's Sketches Vol 2", author: 'Ivan Turgenev', gutenberg: 2537, category: 'classici' },
  { id: 'rudin', title: 'Rudin', author: 'Ivan Turgenev', gutenberg: 7309, category: 'classici' },
  { id: 'torrents-spring', title: 'The Torrents of Spring', author: 'Ivan Turgenev', gutenberg: 7309, category: 'classici' },
  { id: 'on-eve', title: 'On the Eve', author: 'Ivan Turgenev', gutenberg: 7179, category: 'classici' },
  { id: 'smoke', title: 'Smoke', author: 'Ivan Turgenev', gutenberg: 7308, category: 'classici' },
  { id: 'virgin-soil', title: 'Virgin Soil', author: 'Ivan Turgenev', gutenberg: 6408, category: 'classici' },
  { id: 'first-love', title: 'First Love', author: 'Ivan Turgenev', gutenberg: 13010, category: 'classici' },

  // NIKOLAI GOGOL
  { id: 'dead-souls', title: 'Dead Souls', author: 'Nikolai Gogol', gutenberg: 1081, category: 'classici' },
  { id: 'overcoat', title: 'The Overcoat and Other Stories', author: 'Nikolai Gogol', gutenberg: 36238, category: 'classici' },
  { id: 'taras-bulba', title: 'Taras Bulba', author: 'Nikolai Gogol', gutenberg: 1197, category: 'avventura' },
  { id: 'inspector-general', title: 'The Inspector-General', author: 'Nikolai Gogol', gutenberg: 3735, category: 'classici' },
  { id: 'evenings-farm', title: 'Evenings on a Farm Near Dikanka', author: 'Nikolai Gogol', gutenberg: 37525, category: 'classici' },

  // ============================================
  // FRENCH LITERATURE
  // ============================================

  // VICTOR HUGO
  { id: 'les-miserables', title: 'Les Misérables', author: 'Victor Hugo', gutenberg: 135, category: 'classici' },
  { id: 'les-miserables-fr', title: 'Les Misérables', author: 'Victor Hugo', gutenberg: 17489, category: 'classici', lang: 'fr' },
  { id: 'hunchback-notre-dame', title: 'The Hunchback of Notre-Dame', author: 'Victor Hugo', gutenberg: 2610, category: 'classici' },
  { id: 'notre-dame-paris-fr', title: 'Notre-Dame de Paris', author: 'Victor Hugo', gutenberg: 19657, category: 'classici', lang: 'fr' },
  { id: 'toilers-sea', title: 'Toilers of the Sea', author: 'Victor Hugo', gutenberg: 32338, category: 'classici' },
  { id: 'man-laughs', title: 'The Man Who Laughs', author: 'Victor Hugo', gutenberg: 12587, category: 'classici' },
  { id: 'ninety-three', title: 'Ninety-Three', author: 'Victor Hugo', gutenberg: 8610, category: 'classici' },
  { id: 'hugo-poems', title: 'Poems', author: 'Victor Hugo', gutenberg: 8775, category: 'poesia' },

  // HONORE DE BALZAC
  { id: 'pere-goriot', title: 'Père Goriot', author: 'Honoré de Balzac', gutenberg: 1237, category: 'classici' },
  { id: 'eugenie-grandet', title: 'Eugénie Grandet', author: 'Honoré de Balzac', gutenberg: 1715, category: 'classici' },
  { id: 'lost-illusions', title: 'Lost Illusions', author: 'Honoré de Balzac', gutenberg: 13159, category: 'classici' },
  { id: 'cousin-bette', title: 'Cousin Bette', author: 'Honoré de Balzac', gutenberg: 1896, category: 'classici' },
  { id: 'cousin-pons', title: 'Cousin Pons', author: 'Honoré de Balzac', gutenberg: 1891, category: 'classici' },
  { id: 'wild-ass-skin', title: 'The Wild Ass\'s Skin', author: 'Honoré de Balzac', gutenberg: 1307, category: 'classici' },
  { id: 'colonel-chabert', title: 'Colonel Chabert', author: 'Honoré de Balzac', gutenberg: 1954, category: 'classici' },
  { id: 'balzac-stories', title: 'Droll Stories Vol 1', author: 'Honoré de Balzac', gutenberg: 1401, category: 'classici' },

  // GUSTAVE FLAUBERT
  { id: 'madame-bovary', title: 'Madame Bovary', author: 'Gustave Flaubert', gutenberg: 2413, category: 'classici' },
  { id: 'madame-bovary-fr', title: 'Madame Bovary', author: 'Gustave Flaubert', gutenberg: 713, category: 'classici', lang: 'fr' },
  { id: 'sentimental-education', title: 'Sentimental Education', author: 'Gustave Flaubert', gutenberg: 34828, category: 'classici' },
  { id: 'salammbo', title: 'Salammbô', author: 'Gustave Flaubert', gutenberg: 1290, category: 'classici' },
  { id: 'three-tales', title: 'Three Tales', author: 'Gustave Flaubert', gutenberg: 10458, category: 'classici' },
  { id: 'temptation-st-anthony', title: 'The Temptation of St. Anthony', author: 'Gustave Flaubert', gutenberg: 20803, category: 'classici' },

  // EMILE ZOLA
  { id: 'germinal', title: 'Germinal', author: 'Émile Zola', gutenberg: 5711, category: 'classici' },
  { id: 'nana', title: 'Nana', author: 'Émile Zola', gutenberg: 5250, category: 'classici' },
  { id: 'therese-raquin', title: 'Thérèse Raquin', author: 'Émile Zola', gutenberg: 6626, category: 'classici' },
  { id: 'lassommoir', title: "L'Assommoir", author: 'Émile Zola', gutenberg: 8600, category: 'classici' },
  { id: 'au-bonheur-dames', title: 'Au Bonheur des Dames', author: 'Émile Zola', gutenberg: 5744, category: 'classici' },
  { id: 'la-bete-humaine', title: 'La Bête Humaine', author: 'Émile Zola', gutenberg: 9181, category: 'classici' },
  { id: 'earth', title: 'Earth', author: 'Émile Zola', gutenberg: 45395, category: 'classici' },
  { id: 'money', title: 'Money', author: 'Émile Zola', gutenberg: 9182, category: 'classici' },
  { id: 'downfall', title: 'The Downfall', author: 'Émile Zola', gutenberg: 6626, category: 'classici' },
  { id: 'doctor-pascal', title: 'Doctor Pascal', author: 'Émile Zola', gutenberg: 9183, category: 'classici' },
  { id: 'jaccuse', title: "J'Accuse", author: 'Émile Zola', gutenberg: 14953, category: 'classici' },

  // STENDHAL
  { id: 'red-black', title: 'The Red and the Black', author: 'Stendhal', gutenberg: 44747, category: 'classici' },
  { id: 'charterhouse-parma', title: 'The Charterhouse of Parma', author: 'Stendhal', gutenberg: 14155, category: 'classici' },

  // GUY DE MAUPASSANT
  { id: 'bel-ami', title: 'Bel-Ami', author: 'Guy de Maupassant', gutenberg: 8231, category: 'classici' },
  { id: 'pierre-jean', title: 'Pierre et Jean', author: 'Guy de Maupassant', gutenberg: 3790, category: 'classici' },
  { id: 'une-vie', title: 'Une Vie', author: 'Guy de Maupassant', gutenberg: 9683, category: 'classici' },
  { id: 'maupassant-stories', title: 'Short Stories', author: 'Guy de Maupassant', gutenberg: 3090, category: 'classici' },
  { id: 'horla', title: 'The Horla', author: 'Guy de Maupassant', gutenberg: 10775, category: 'mistero' },
  { id: 'boule-suif', title: 'Boule de Suif', author: 'Guy de Maupassant', gutenberg: 32410, category: 'classici' },

  // ALEXANDRE DUMAS (FILS)
  { id: 'camille', title: 'Camille (La Dame aux Camélias)', author: 'Alexandre Dumas fils', gutenberg: 2408, category: 'classici' },

  // ============================================
  // GERMAN LITERATURE
  // ============================================

  // GOETHE
  { id: 'faust', title: 'Faust', author: 'Johann Wolfgang von Goethe', gutenberg: 14591, category: 'classici' },
  { id: 'sorrows-werther', title: 'The Sorrows of Young Werther', author: 'Johann Wolfgang von Goethe', gutenberg: 2527, category: 'classici' },
  { id: 'elective-affinities', title: 'Elective Affinities', author: 'Johann Wolfgang von Goethe', gutenberg: 2403, category: 'classici' },
  { id: 'wilhelm-meister-apprentice', title: "Wilhelm Meister's Apprenticeship", author: 'Johann Wolfgang von Goethe', gutenberg: 2335, category: 'classici' },
  { id: 'goethe-poems', title: 'Poems', author: 'Johann Wolfgang von Goethe', gutenberg: 5331, category: 'poesia' },

  // SCHILLER
  { id: 'william-tell', title: 'William Tell', author: 'Friedrich Schiller', gutenberg: 6788, category: 'classici' },
  { id: 'robbers', title: 'The Robbers', author: 'Friedrich Schiller', gutenberg: 6782, category: 'classici' },
  { id: 'schiller-poems', title: 'Poems', author: 'Friedrich Schiller', gutenberg: 6787, category: 'poesia' },
  { id: 'mary-stuart', title: 'Mary Stuart', author: 'Friedrich Schiller', gutenberg: 6789, category: 'classici' },
  { id: 'don-carlos', title: 'Don Carlos', author: 'Friedrich Schiller', gutenberg: 6785, category: 'classici' },

  // KAFKA
  { id: 'metamorphosis', title: 'The Metamorphosis', author: 'Franz Kafka', gutenberg: 5200, category: 'classici' },
  { id: 'trial', title: 'The Trial', author: 'Franz Kafka', gutenberg: 7849, category: 'classici' },
  { id: 'castle', title: 'The Castle', author: 'Franz Kafka', gutenberg: 22904, category: 'classici' },
  { id: 'kafka-stories', title: 'Short Stories', author: 'Franz Kafka', gutenberg: 7848, category: 'classici' },
  { id: 'in-penal-colony', title: 'In the Penal Colony', author: 'Franz Kafka', gutenberg: 45387, category: 'classici' },

  // HERMANN HESSE
  { id: 'siddhartha', title: 'Siddhartha', author: 'Hermann Hesse', gutenberg: 2500, category: 'spiritualita' },
  { id: 'demian', title: 'Demian', author: 'Hermann Hesse', gutenberg: 24255, category: 'classici' },

  // E.T.A. HOFFMANN
  { id: 'nutcracker', title: 'The Nutcracker and the Mouse King', author: 'E.T.A. Hoffmann', gutenberg: 32572, category: 'fiabe' },
  { id: 'sandman', title: 'The Sand-Man', author: 'E.T.A. Hoffmann', gutenberg: 27534, category: 'fantasy' },
  { id: 'hoffmann-tales', title: 'Tales', author: 'E.T.A. Hoffmann', gutenberg: 37536, category: 'fantasy' },

  // NIETZSCHE
  { id: 'thus-spake-zarathustra', title: 'Thus Spake Zarathustra', author: 'Friedrich Nietzsche', gutenberg: 1998, category: 'filosofia' },
  { id: 'beyond-good-evil', title: 'Beyond Good and Evil', author: 'Friedrich Nietzsche', gutenberg: 4363, category: 'filosofia' },
  { id: 'genealogy-morals', title: 'The Genealogy of Morals', author: 'Friedrich Nietzsche', gutenberg: 52319, category: 'filosofia' },
  { id: 'antichrist', title: 'The Antichrist', author: 'Friedrich Nietzsche', gutenberg: 19322, category: 'filosofia' },
  { id: 'ecce-homo', title: 'Ecce Homo', author: 'Friedrich Nietzsche', gutenberg: 7202, category: 'filosofia' },
  { id: 'human-all-too-human', title: 'Human, All Too Human', author: 'Friedrich Nietzsche', gutenberg: 38145, category: 'filosofia' },
  { id: 'twilight-idols', title: 'Twilight of the Idols', author: 'Friedrich Nietzsche', gutenberg: 52263, category: 'filosofia' },

  // ============================================
  // AMERICAN LITERATURE
  // ============================================

  // NATHANIEL HAWTHORNE
  { id: 'scarlet-letter', title: 'The Scarlet Letter', author: 'Nathaniel Hawthorne', gutenberg: 25344, category: 'classici' },
  { id: 'house-seven-gables', title: 'The House of the Seven Gables', author: 'Nathaniel Hawthorne', gutenberg: 77, category: 'classici' },
  { id: 'marble-faun', title: 'The Marble Faun', author: 'Nathaniel Hawthorne', gutenberg: 2181, category: 'classici' },
  { id: 'blithedale-romance', title: 'The Blithedale Romance', author: 'Nathaniel Hawthorne', gutenberg: 2081, category: 'classici' },
  { id: 'twice-told-tales', title: 'Twice-Told Tales', author: 'Nathaniel Hawthorne', gutenberg: 9209, category: 'classici' },
  { id: 'mosses-old-manse', title: 'Mosses from an Old Manse', author: 'Nathaniel Hawthorne', gutenberg: 512, category: 'classici' },
  { id: 'wonder-book', title: 'A Wonder Book', author: 'Nathaniel Hawthorne', gutenberg: 934, category: 'fiabe' },
  { id: 'tanglewood-tales', title: 'Tanglewood Tales', author: 'Nathaniel Hawthorne', gutenberg: 976, category: 'fiabe' },

  // HERMAN MELVILLE
  { id: 'moby-dick', title: 'Moby Dick', author: 'Herman Melville', gutenberg: 2701, category: 'avventura' },
  { id: 'bartleby', title: 'Bartleby the Scrivener', author: 'Herman Melville', gutenberg: 11231, category: 'classici' },
  { id: 'typee', title: 'Typee', author: 'Herman Melville', gutenberg: 1900, category: 'avventura' },
  { id: 'omoo', title: 'Omoo', author: 'Herman Melville', gutenberg: 4045, category: 'avventura' },
  { id: 'billy-budd', title: 'Billy Budd', author: 'Herman Melville', gutenberg: 21422, category: 'classici' },
  { id: 'confidence-man', title: 'The Confidence-Man', author: 'Herman Melville', gutenberg: 21816, category: 'classici' },
  { id: 'piazza-tales', title: 'The Piazza Tales', author: 'Herman Melville', gutenberg: 15859, category: 'classici' },

  // HENRY JAMES
  { id: 'portrait-lady', title: 'The Portrait of a Lady', author: 'Henry James', gutenberg: 2833, category: 'classici' },
  { id: 'turn-screw', title: 'The Turn of the Screw', author: 'Henry James', gutenberg: 209, category: 'mistero' },
  { id: 'washington-square', title: 'Washington Square', author: 'Henry James', gutenberg: 2870, category: 'classici' },
  { id: 'daisy-miller', title: 'Daisy Miller', author: 'Henry James', gutenberg: 208, category: 'classici' },
  { id: 'wings-dove', title: 'The Wings of the Dove', author: 'Henry James', gutenberg: 2691, category: 'classici' },
  { id: 'ambassadors', title: 'The Ambassadors', author: 'Henry James', gutenberg: 432, category: 'classici' },
  { id: 'golden-bowl', title: 'The Golden Bowl', author: 'Henry James', gutenberg: 4358, category: 'classici' },
  { id: 'bostonians', title: 'The Bostonians', author: 'Henry James', gutenberg: 19717, category: 'classici' },
  { id: 'american', title: 'The American', author: 'Henry James', gutenberg: 177, category: 'classici' },
  { id: 'europeans', title: 'The Europeans', author: 'Henry James', gutenberg: 179, category: 'classici' },

  // EDITH WHARTON
  { id: 'age-innocence', title: 'The Age of Innocence', author: 'Edith Wharton', gutenberg: 541, category: 'classici' },
  { id: 'house-mirth', title: 'The House of Mirth', author: 'Edith Wharton', gutenberg: 284, category: 'classici' },
  { id: 'ethan-frome', title: 'Ethan Frome', author: 'Edith Wharton', gutenberg: 4517, category: 'classici' },
  { id: 'custom-country', title: 'The Custom of the Country', author: 'Edith Wharton', gutenberg: 21410, category: 'classici' },
  { id: 'summer', title: 'Summer', author: 'Edith Wharton', gutenberg: 166, category: 'classici' },
  { id: 'fruit-tree', title: 'The Fruit of the Tree', author: 'Edith Wharton', gutenberg: 1327, category: 'classici' },

  // WASHINGTON IRVING
  { id: 'sketch-book', title: 'The Sketch Book', author: 'Washington Irving', gutenberg: 2048, category: 'classici' },
  { id: 'rip-van-winkle', title: 'Rip Van Winkle', author: 'Washington Irving', gutenberg: 2048, category: 'classici' },
  { id: 'legend-sleepy-hollow', title: 'The Legend of Sleepy Hollow', author: 'Washington Irving', gutenberg: 41, category: 'classici' },
  { id: 'alhambra', title: 'The Alhambra', author: 'Washington Irving', gutenberg: 49949, category: 'classici' },

  // KATE CHOPIN
  { id: 'awakening', title: 'The Awakening', author: 'Kate Chopin', gutenberg: 160, category: 'classici' },
  { id: 'bayou-folk', title: 'Bayou Folk', author: 'Kate Chopin', gutenberg: 161, category: 'classici' },
  { id: 'night-acadie', title: 'A Night in Acadie', author: 'Kate Chopin', gutenberg: 162, category: 'classici' },

  // STEPHEN CRANE
  { id: 'red-badge-courage', title: 'The Red Badge of Courage', author: 'Stephen Crane', gutenberg: 73, category: 'classici' },
  { id: 'maggie-girl-streets', title: 'Maggie: A Girl of the Streets', author: 'Stephen Crane', gutenberg: 447, category: 'classici' },
  { id: 'open-boat', title: 'The Open Boat', author: 'Stephen Crane', gutenberg: 2149, category: 'classici' },

  // O. HENRY
  { id: 'gift-magi', title: 'The Gift of the Magi', author: 'O. Henry', gutenberg: 7256, category: 'classici' },
  { id: 'four-million', title: 'The Four Million', author: 'O. Henry', gutenberg: 2776, category: 'classici' },
  { id: 'cabbages-kings', title: 'Cabbages and Kings', author: 'O. Henry', gutenberg: 2777, category: 'classici' },
  { id: 'trimmed-lamp', title: 'The Trimmed Lamp', author: 'O. Henry', gutenberg: 2778, category: 'classici' },
  { id: 'heart-west', title: 'Heart of the West', author: 'O. Henry', gutenberg: 1725, category: 'classici' },
  { id: 'rolling-stones', title: 'Rolling Stones', author: 'O. Henry', gutenberg: 14567, category: 'classici' },

  // ============================================
  // BRITISH LITERATURE - ADDITIONAL
  // ============================================

  // GEORGE ELIOT
  { id: 'middlemarch', title: 'Middlemarch', author: 'George Eliot', gutenberg: 145, category: 'classici' },
  { id: 'silas-marner', title: 'Silas Marner', author: 'George Eliot', gutenberg: 550, category: 'classici' },
  { id: 'mill-floss', title: 'The Mill on the Floss', author: 'George Eliot', gutenberg: 6688, category: 'classici' },
  { id: 'adam-bede', title: 'Adam Bede', author: 'George Eliot', gutenberg: 507, category: 'classici' },
  { id: 'daniel-deronda', title: 'Daniel Deronda', author: 'George Eliot', gutenberg: 7469, category: 'classici' },
  { id: 'romola', title: 'Romola', author: 'George Eliot', gutenberg: 24020, category: 'classici' },
  { id: 'felix-holt', title: 'Felix Holt, the Radical', author: 'George Eliot', gutenberg: 16025, category: 'classici' },

  // THOMAS HARDY
  { id: 'tess-durbervilles', title: 'Tess of the d\'Urbervilles', author: 'Thomas Hardy', gutenberg: 110, category: 'classici' },
  { id: 'jude-obscure', title: 'Jude the Obscure', author: 'Thomas Hardy', gutenberg: 153, category: 'classici' },
  { id: 'far-madding-crowd', title: 'Far from the Madding Crowd', author: 'Thomas Hardy', gutenberg: 107, category: 'classici' },
  { id: 'mayor-casterbridge', title: 'The Mayor of Casterbridge', author: 'Thomas Hardy', gutenberg: 143, category: 'classici' },
  { id: 'return-native', title: 'The Return of the Native', author: 'Thomas Hardy', gutenberg: 122, category: 'classici' },
  { id: 'woodlanders', title: 'The Woodlanders', author: 'Thomas Hardy', gutenberg: 482, category: 'classici' },
  { id: 'under-greenwood-tree', title: 'Under the Greenwood Tree', author: 'Thomas Hardy', gutenberg: 2662, category: 'classici' },
  { id: 'pair-blue-eyes', title: 'A Pair of Blue Eyes', author: 'Thomas Hardy', gutenberg: 224, category: 'classici' },

  // ANTHONY TROLLOPE
  { id: 'barchester-towers', title: 'Barchester Towers', author: 'Anthony Trollope', gutenberg: 3409, category: 'classici' },
  { id: 'way-we-live-now', title: 'The Way We Live Now', author: 'Anthony Trollope', gutenberg: 5231, category: 'classici' },
  { id: 'warden', title: 'The Warden', author: 'Anthony Trollope', gutenberg: 619, category: 'classici' },
  { id: 'phineas-finn', title: 'Phineas Finn', author: 'Anthony Trollope', gutenberg: 18640, category: 'classici' },
  { id: 'can-you-forgive', title: 'Can You Forgive Her?', author: 'Anthony Trollope', gutenberg: 4897, category: 'classici' },
  { id: 'orley-farm', title: 'Orley Farm', author: 'Anthony Trollope', gutenberg: 10320, category: 'classici' },
  { id: 'doctor-thorne', title: 'Doctor Thorne', author: 'Anthony Trollope', gutenberg: 3166, category: 'classici' },

  // WILLIAM MAKEPEACE THACKERAY
  { id: 'vanity-fair', title: 'Vanity Fair', author: 'William Makepeace Thackeray', gutenberg: 599, category: 'classici' },
  { id: 'pendennis', title: 'Pendennis', author: 'William Makepeace Thackeray', gutenberg: 1575, category: 'classici' },
  { id: 'barry-lyndon', title: 'Barry Lyndon', author: 'William Makepeace Thackeray', gutenberg: 4558, category: 'classici' },
  { id: 'henry-esmond', title: 'Henry Esmond', author: 'William Makepeace Thackeray', gutenberg: 2536, category: 'classici' },
  { id: 'newcomes', title: 'The Newcomes', author: 'William Makepeace Thackeray', gutenberg: 7631, category: 'classici' },

  // JOSEPH CONRAD
  { id: 'heart-darkness', title: 'Heart of Darkness', author: 'Joseph Conrad', gutenberg: 219, category: 'classici' },
  { id: 'lord-jim', title: 'Lord Jim', author: 'Joseph Conrad', gutenberg: 5658, category: 'avventura' },
  { id: 'nostromo', title: 'Nostromo', author: 'Joseph Conrad', gutenberg: 2021, category: 'classici' },
  { id: 'secret-agent', title: 'The Secret Agent', author: 'Joseph Conrad', gutenberg: 974, category: 'mistero' },
  { id: 'victory', title: 'Victory', author: 'Joseph Conrad', gutenberg: 6378, category: 'classici' },
  { id: 'almayers-folly', title: "Almayer's Folly", author: 'Joseph Conrad', gutenberg: 720, category: 'classici' },
  { id: 'typhoon', title: 'Typhoon', author: 'Joseph Conrad', gutenberg: 1142, category: 'avventura' },
  { id: 'secret-sharer', title: 'The Secret Sharer', author: 'Joseph Conrad', gutenberg: 220, category: 'classici' },
  { id: 'under-western-eyes', title: 'Under Western Eyes', author: 'Joseph Conrad', gutenberg: 2480, category: 'classici' },

  // GEORGE GISSING
  { id: 'new-grub-street', title: 'New Grub Street', author: 'George Gissing', gutenberg: 1709, category: 'classici' },
  { id: 'odd-women', title: 'The Odd Women', author: 'George Gissing', gutenberg: 5765, category: 'classici' },
  { id: 'private-papers', title: 'The Private Papers of Henry Ryecroft', author: 'George Gissing', gutenberg: 3020, category: 'classici' },

  // WILKIE COLLINS
  { id: 'woman-white', title: 'The Woman in White', author: 'Wilkie Collins', gutenberg: 583, category: 'mistero' },
  { id: 'moonstone', title: 'The Moonstone', author: 'Wilkie Collins', gutenberg: 155, category: 'mistero' },
  { id: 'armadale', title: 'Armadale', author: 'Wilkie Collins', gutenberg: 5348, category: 'mistero' },
  { id: 'no-name', title: 'No Name', author: 'Wilkie Collins', gutenberg: 1438, category: 'mistero' },
  { id: 'basil', title: 'Basil', author: 'Wilkie Collins', gutenberg: 1581, category: 'mistero' },

  // ELIZABETH GASKELL
  { id: 'north-south', title: 'North and South', author: 'Elizabeth Gaskell', gutenberg: 4276, category: 'classici' },
  { id: 'cranford', title: 'Cranford', author: 'Elizabeth Gaskell', gutenberg: 394, category: 'classici' },
  { id: 'wives-daughters', title: 'Wives and Daughters', author: 'Elizabeth Gaskell', gutenberg: 4274, category: 'classici' },
  { id: 'mary-barton', title: 'Mary Barton', author: 'Elizabeth Gaskell', gutenberg: 2153, category: 'classici' },
  { id: 'ruth', title: 'Ruth', author: 'Elizabeth Gaskell', gutenberg: 4275, category: 'classici' },
  { id: 'sylvias-lovers', title: "Sylvia's Lovers", author: 'Elizabeth Gaskell', gutenberg: 4270, category: 'classici' },

  // ============================================
  // ADVENTURE & EXPLORATION
  // ============================================

  // H. RIDER HAGGARD
  { id: 'king-solomons-mines', title: "King Solomon's Mines", author: 'H. Rider Haggard', gutenberg: 2166, category: 'avventura' },
  { id: 'she', title: 'She', author: 'H. Rider Haggard', gutenberg: 3155, category: 'avventura' },
  { id: 'allan-quatermain', title: 'Allan Quatermain', author: 'H. Rider Haggard', gutenberg: 711, category: 'avventura' },
  { id: 'ayesha', title: 'Ayesha', author: 'H. Rider Haggard', gutenberg: 5228, category: 'avventura' },
  { id: 'nada-lily', title: 'Nada the Lily', author: 'H. Rider Haggard', gutenberg: 1207, category: 'avventura' },
  { id: 'montezumas-daughter', title: "Montezuma's Daughter", author: 'H. Rider Haggard', gutenberg: 1848, category: 'avventura' },
  { id: 'cleopatra', title: 'Cleopatra', author: 'H. Rider Haggard', gutenberg: 2857, category: 'avventura' },
  { id: 'eric-brighteyes', title: 'Eric Brighteyes', author: 'H. Rider Haggard', gutenberg: 2857, category: 'avventura' },

  // CAPTAIN MARRYAT
  { id: 'mr-midshipman-easy', title: 'Mr. Midshipman Easy', author: 'Captain Marryat', gutenberg: 7502, category: 'avventura' },
  { id: 'peter-simple', title: 'Peter Simple', author: 'Captain Marryat', gutenberg: 21767, category: 'avventura' },
  { id: 'children-new-forest', title: 'The Children of the New Forest', author: 'Captain Marryat', gutenberg: 5693, category: 'avventura' },
  { id: 'masterman-ready', title: 'Masterman Ready', author: 'Captain Marryat', gutenberg: 25576, category: 'avventura' },

  // RAFAEL SABATINI
  { id: 'captain-blood', title: 'Captain Blood', author: 'Rafael Sabatini', gutenberg: 1965, category: 'avventura' },
  { id: 'scaramouche', title: 'Scaramouche', author: 'Rafael Sabatini', gutenberg: 1770, category: 'avventura' },
  { id: 'sea-hawk', title: 'The Sea Hawk', author: 'Rafael Sabatini', gutenberg: 1237, category: 'avventura' },
  { id: 'bellarion', title: 'Bellarion', author: 'Rafael Sabatini', gutenberg: 5348, category: 'avventura' },

  // ============================================
  // GOTHIC & HORROR
  // ============================================

  // SHERIDAN LE FANU
  { id: 'carmilla', title: 'Carmilla', author: 'Sheridan Le Fanu', gutenberg: 10007, category: 'fantasy' },
  { id: 'uncle-silas', title: 'Uncle Silas', author: 'Sheridan Le Fanu', gutenberg: 14851, category: 'mistero' },
  { id: 'house-churchyard', title: 'The House by the Churchyard', author: 'Sheridan Le Fanu', gutenberg: 37540, category: 'mistero' },
  { id: 'ghost-stories-antiquary', title: 'In a Glass Darkly', author: 'Sheridan Le Fanu', gutenberg: 6587, category: 'fantasy' },

  // M.R. JAMES
  { id: 'ghost-stories-antiquary', title: 'Ghost Stories of an Antiquary', author: 'M.R. James', gutenberg: 8486, category: 'fantasy' },
  { id: 'more-ghost-stories', title: 'More Ghost Stories', author: 'M.R. James', gutenberg: 12106, category: 'fantasy' },
  { id: 'thin-ghost', title: 'A Thin Ghost and Others', author: 'M.R. James', gutenberg: 20387, category: 'fantasy' },

  // AMBROSE BIERCE
  { id: 'occurrence-owl-creek', title: 'An Occurrence at Owl Creek Bridge', author: 'Ambrose Bierce', gutenberg: 375, category: 'mistero' },
  { id: 'tales-soldiers-civilians', title: 'Tales of Soldiers and Civilians', author: 'Ambrose Bierce', gutenberg: 379, category: 'classici' },
  { id: 'can-such-things-be', title: 'Can Such Things Be?', author: 'Ambrose Bierce', gutenberg: 376, category: 'fantasy' },
  { id: 'devils-dictionary', title: "The Devil's Dictionary", author: 'Ambrose Bierce', gutenberg: 972, category: 'classici' },

  // ALGERNON BLACKWOOD
  { id: 'willows', title: 'The Willows', author: 'Algernon Blackwood', gutenberg: 11438, category: 'fantasy' },
  { id: 'wendigo', title: 'The Wendigo', author: 'Algernon Blackwood', gutenberg: 10897, category: 'fantasy' },
  { id: 'blackwood-stories', title: 'Short Stories', author: 'Algernon Blackwood', gutenberg: 11438, category: 'fantasy' },

  // ARTHUR MACHEN
  { id: 'great-god-pan', title: 'The Great God Pan', author: 'Arthur Machen', gutenberg: 389, category: 'fantasy' },
  { id: 'three-impostors', title: 'The Three Impostors', author: 'Arthur Machen', gutenberg: 35517, category: 'fantasy' },
  { id: 'house-souls', title: 'The House of Souls', author: 'Arthur Machen', gutenberg: 25016, category: 'fantasy' },

  // ============================================
  // ECONOMICS & POLITICS
  // ============================================

  { id: 'wealth-nations', title: 'The Wealth of Nations', author: 'Adam Smith', gutenberg: 3300, category: 'filosofia' },
  { id: 'theory-moral-sentiments', title: 'The Theory of Moral Sentiments', author: 'Adam Smith', gutenberg: 58559, category: 'filosofia' },
  { id: 'on-liberty', title: 'On Liberty', author: 'John Stuart Mill', gutenberg: 34901, category: 'filosofia' },
  { id: 'utilitarianism', title: 'Utilitarianism', author: 'John Stuart Mill', gutenberg: 11224, category: 'filosofia' },
  { id: 'subjection-women', title: 'The Subjection of Women', author: 'John Stuart Mill', gutenberg: 27083, category: 'filosofia' },
  { id: 'communist-manifesto', title: 'The Communist Manifesto', author: 'Marx/Engels', gutenberg: 61, category: 'filosofia' },
  { id: 'leviathan', title: 'Leviathan', author: 'Thomas Hobbes', gutenberg: 3207, category: 'filosofia' },
  { id: 'two-treatises-government', title: 'Two Treatises of Government', author: 'John Locke', gutenberg: 7370, category: 'filosofia' },
  { id: 'essay-human-understanding', title: 'An Essay Concerning Human Understanding', author: 'John Locke', gutenberg: 10615, category: 'filosofia' },
  { id: 'social-contract', title: 'The Social Contract', author: 'Jean-Jacques Rousseau', gutenberg: 46333, category: 'filosofia' },
  { id: 'emile', title: 'Emile', author: 'Jean-Jacques Rousseau', gutenberg: 5427, category: 'filosofia' },
  { id: 'confessions-rousseau', title: 'Confessions', author: 'Jean-Jacques Rousseau', gutenberg: 3913, category: 'classici' },

  // ============================================
  // MORE WORLD LITERATURE
  // ============================================

  // SPANISH
  { id: 'don-quixote', title: 'Don Quixote', author: 'Miguel de Cervantes', gutenberg: 996, category: 'classici' },
  { id: 'don-quixote-es', title: 'Don Quijote', author: 'Miguel de Cervantes', gutenberg: 2000, category: 'classici', lang: 'es' },

  // PORTUGUESE
  { id: 'lusiads', title: 'The Lusiads', author: 'Luís de Camões', gutenberg: 3333, category: 'poesia' },

  // SCANDINAVIAN
  { id: 'dolls-house', title: "A Doll's House", author: 'Henrik Ibsen', gutenberg: 2542, category: 'classici' },
  { id: 'ghosts', title: 'Ghosts', author: 'Henrik Ibsen', gutenberg: 8121, category: 'classici' },
  { id: 'hedda-gabler', title: 'Hedda Gabler', author: 'Henrik Ibsen', gutenberg: 4093, category: 'classici' },
  { id: 'peer-gynt', title: 'Peer Gynt', author: 'Henrik Ibsen', gutenberg: 8871, category: 'classici' },
  { id: 'enemy-people', title: 'An Enemy of the People', author: 'Henrik Ibsen', gutenberg: 2446, category: 'classici' },
  { id: 'wild-duck', title: 'The Wild Duck', author: 'Henrik Ibsen', gutenberg: 1575, category: 'classici' },
  { id: 'master-builder', title: 'The Master Builder', author: 'Henrik Ibsen', gutenberg: 1485, category: 'classici' },
  { id: 'growth-soil', title: 'Growth of the Soil', author: 'Knut Hamsun', gutenberg: 10376, category: 'classici' },
  { id: 'hunger', title: 'Hunger', author: 'Knut Hamsun', gutenberg: 8387, category: 'classici' },
  { id: 'pan', title: 'Pan', author: 'Knut Hamsun', gutenberg: 25327, category: 'classici' },

  // ============================================
  // SELF-IMPROVEMENT & PSYCHOLOGY
  // ============================================

  { id: 'psychology-william-james', title: 'Principles of Psychology Vol 1', author: 'William James', gutenberg: 57628, category: 'scienza' },
  { id: 'varieties-religious-experience', title: 'Varieties of Religious Experience', author: 'William James', gutenberg: 621, category: 'spiritualita' },
  { id: 'pragmatism', title: 'Pragmatism', author: 'William James', gutenberg: 5116, category: 'filosofia' },
  { id: 'self-reliance', title: 'Self-Reliance', author: 'Ralph Waldo Emerson', gutenberg: 16643, category: 'filosofia' },
  { id: 'interpretation-dreams', title: 'The Interpretation of Dreams', author: 'Sigmund Freud', gutenberg: 54231, category: 'scienza' },

  // ============================================
  // TRAVEL & EXPLORATION
  // ============================================

  { id: 'travels-marco-polo', title: 'The Travels of Marco Polo', author: 'Marco Polo', gutenberg: 10636, category: 'avventura' },
  { id: 'south', title: 'South', author: 'Ernest Shackleton', gutenberg: 5199, category: 'avventura' },
  { id: 'tramp-abroad', title: 'A Tramp Abroad', author: 'Mark Twain', gutenberg: 119, category: 'classici' },
  { id: 'following-equator', title: 'Following the Equator', author: 'Mark Twain', gutenberg: 2895, category: 'classici' },

  // ============================================
  // MORE ITALIAN LITERATURE
  // ============================================

  { id: 'sei-personaggi', title: 'Sei personaggi in cerca d\'autore', author: 'Luigi Pirandello', gutenberg: 40299, category: 'classici', lang: 'it' },
  { id: 'il-fu-mattia-pascal', title: 'Il fu Mattia Pascal', author: 'Luigi Pirandello', gutenberg: 46426, category: 'classici', lang: 'it' },
  { id: 'uno-nessuno-centomila', title: 'Uno, nessuno e centomila', author: 'Luigi Pirandello', gutenberg: 51311, category: 'classici', lang: 'it' },
  { id: 'coscienza-zeno', title: 'La coscienza di Zeno', author: 'Italo Svevo', gutenberg: 55096, category: 'classici', lang: 'it' },
  { id: 'senilita', title: 'Senilità', author: 'Italo Svevo', gutenberg: 44968, category: 'classici', lang: 'it' },
  { id: 'vita-nuova', title: 'La Vita Nuova', author: 'Dante Alighieri', gutenberg: 41085, category: 'poesia', lang: 'it' },
  { id: 'canzoniere', title: 'Il Canzoniere', author: 'Francesco Petrarca', gutenberg: 41076, category: 'poesia', lang: 'it' },
  { id: 'storia-colonna-infame', title: 'Storia della colonna infame', author: 'Alessandro Manzoni', gutenberg: 35157, category: 'classici', lang: 'it' },

  // ============================================
  // ASIAN LITERATURE
  // ============================================

  // CHINESE CLASSICS
  { id: 'tao-te-ching', title: 'Tao Te Ching', author: 'Lao Tzu', gutenberg: 216, category: 'spiritualita' },
  { id: 'art-of-war', title: 'The Art of War', author: 'Sun Tzu', gutenberg: 132, category: 'filosofia' },
  { id: 'analects', title: 'The Analects', author: 'Confucius', gutenberg: 3330, category: 'filosofia' },

  // JAPANESE
  { id: 'tale-genji', title: 'The Tale of Genji', author: 'Murasaki Shikibu', gutenberg: 39725, category: 'classici' },
  { id: 'bushido', title: 'Bushido: The Soul of Japan', author: 'Inazo Nitobe', gutenberg: 12096, category: 'filosofia' },
  { id: 'book-tea', title: 'The Book of Tea', author: 'Kakuzo Okakura', gutenberg: 769, category: 'filosofia' },
  { id: 'rashomon', title: 'Rashomon and Other Stories', author: 'Ryunosuke Akutagawa', gutenberg: 31668, category: 'classici' },

  // INDIAN
  { id: 'upanishads', title: 'The Upanishads', author: 'Various', gutenberg: 3283, category: 'spiritualita' },
  { id: 'bhagavad-gita', title: 'The Bhagavad Gita', author: 'Traditional', gutenberg: 2388, category: 'spiritualita' },
  { id: 'kamasutra', title: 'Kama Sutra', author: 'Vatsyayana', gutenberg: 27827, category: 'classici' },
  { id: 'panchatantra', title: 'The Panchatantra', author: 'Traditional', gutenberg: 25545, category: 'fiabe' },
  { id: 'jataka-tales', title: 'Jataka Tales', author: 'Traditional', gutenberg: 3185, category: 'fiabe' },

  // PERSIAN
  { id: 'shahnameh', title: 'The Shahnama (Book of Kings)', author: 'Ferdowsi', gutenberg: 14076, category: 'poesia' },
  { id: 'divan-hafiz', title: 'The Divan of Hafiz', author: 'Hafiz', gutenberg: 57032, category: 'poesia' },
  { id: 'rumi-poems', title: 'Poems of Rumi', author: 'Rumi', gutenberg: 43029, category: 'poesia' },

  // ============================================
  // MORE CHILDREN'S CLASSICS
  // ============================================

  // GEORGE MACDONALD
  { id: 'princess-goblin', title: 'The Princess and the Goblin', author: 'George MacDonald', gutenberg: 708, category: 'fiabe' },
  { id: 'princess-curdie', title: 'The Princess and Curdie', author: 'George MacDonald', gutenberg: 709, category: 'fiabe' },
  { id: 'phantastes', title: 'Phantastes', author: 'George MacDonald', gutenberg: 325, category: 'fantasy' },
  { id: 'lilith', title: 'Lilith', author: 'George MacDonald', gutenberg: 1640, category: 'fantasy' },
  { id: 'light-princess', title: 'The Light Princess', author: 'George MacDonald', gutenberg: 697, category: 'fiabe' },
  { id: 'at-back-north-wind', title: 'At the Back of the North Wind', author: 'George MacDonald', gutenberg: 4287, category: 'fiabe' },

  // HOWARD PYLE
  { id: 'robin-hood', title: 'The Merry Adventures of Robin Hood', author: 'Howard Pyle', gutenberg: 964, category: 'avventura' },
  { id: 'king-arthur', title: 'The Story of King Arthur and His Knights', author: 'Howard Pyle', gutenberg: 40723, category: 'avventura' },
  { id: 'men-iron', title: 'Men of Iron', author: 'Howard Pyle', gutenberg: 4493, category: 'avventura' },
  { id: 'otto-silver-hand', title: 'Otto of the Silver Hand', author: 'Howard Pyle', gutenberg: 6866, category: 'avventura' },
  { id: 'book-pirates', title: 'Book of Pirates', author: 'Howard Pyle', gutenberg: 31356, category: 'avventura' },

  // THORNTON W. BURGESS
  { id: 'old-mother-west-wind', title: 'Old Mother West Wind', author: 'Thornton W. Burgess', gutenberg: 4980, category: 'animali' },
  { id: 'adventures-reddy-fox', title: 'The Adventures of Reddy Fox', author: 'Thornton W. Burgess', gutenberg: 5823, category: 'animali' },
  { id: 'adventures-johnny-chuck', title: 'The Adventures of Johnny Chuck', author: 'Thornton W. Burgess', gutenberg: 6023, category: 'animali' },
  { id: 'adventures-peter-cottontail', title: 'The Adventures of Peter Cottontail', author: 'Thornton W. Burgess', gutenberg: 7175, category: 'animali' },
  { id: 'adventures-unc-billy-possum', title: "The Adventures of Unc' Billy Possum", author: 'Thornton W. Burgess', gutenberg: 8313, category: 'animali' },
  { id: 'adventures-bobby-coon', title: 'The Adventures of Bobby Coon', author: 'Thornton W. Burgess', gutenberg: 9402, category: 'animali' },
  { id: 'adventures-jerry-muskrat', title: 'The Adventures of Jerry Muskrat', author: 'Thornton W. Burgess', gutenberg: 10484, category: 'animali' },
  { id: 'adventures-danny-meadow-mouse', title: 'The Adventures of Danny Meadow Mouse', author: 'Thornton W. Burgess', gutenberg: 11596, category: 'animali' },
  { id: 'adventures-grandfather-frog', title: 'The Adventures of Grandfather Frog', author: 'Thornton W. Burgess', gutenberg: 12676, category: 'animali' },
  { id: 'adventures-chatterer', title: 'The Adventures of Chatterer the Red Squirrel', author: 'Thornton W. Burgess', gutenberg: 13768, category: 'animali' },
  { id: 'adventures-sammy-jay', title: 'The Adventures of Sammy Jay', author: 'Thornton W. Burgess', gutenberg: 14852, category: 'animali' },
  { id: 'adventures-buster-bear', title: 'The Adventures of Buster Bear', author: 'Thornton W. Burgess', gutenberg: 15924, category: 'animali' },
  { id: 'adventures-old-mr-toad', title: 'The Adventures of Old Mr. Toad', author: 'Thornton W. Burgess', gutenberg: 16979, category: 'animali' },
  { id: 'adventures-prickly-porky', title: 'The Adventures of Prickly Porky', author: 'Thornton W. Burgess', gutenberg: 18021, category: 'animali' },
  { id: 'adventures-poor-mrs-quack', title: 'The Adventures of Poor Mrs. Quack', author: 'Thornton W. Burgess', gutenberg: 19051, category: 'animali' },
  { id: 'adventures-bob-white', title: 'The Adventures of Bob White', author: 'Thornton W. Burgess', gutenberg: 20077, category: 'animali' },

  // KATE DOUGLAS WIGGIN
  { id: 'rebecca-sunnybrook-farm', title: 'Rebecca of Sunnybrook Farm', author: 'Kate Douglas Wiggin', gutenberg: 5106, category: 'classici' },
  { id: 'birds-christmas-carol', title: "The Birds' Christmas Carol", author: 'Kate Douglas Wiggin', gutenberg: 1400, category: 'classici' },
  { id: 'mothers-in-council', title: "Mother's In Council", author: 'Kate Douglas Wiggin', gutenberg: 19067, category: 'classici' },

  // GENE STRATTON-PORTER
  { id: 'girl-limberlost', title: 'A Girl of the Limberlost', author: 'Gene Stratton-Porter', gutenberg: 125, category: 'classici' },
  { id: 'freckles', title: 'Freckles', author: 'Gene Stratton-Porter', gutenberg: 123, category: 'classici' },
  { id: 'laddie', title: 'Laddie', author: 'Gene Stratton-Porter', gutenberg: 126, category: 'classici' },
  { id: 'harvester', title: 'The Harvester', author: 'Gene Stratton-Porter', gutenberg: 124, category: 'classici' },

  // JEAN WEBSTER
  { id: 'daddy-long-legs', title: 'Daddy-Long-Legs', author: 'Jean Webster', gutenberg: 157, category: 'classici' },
  { id: 'dear-enemy', title: 'Dear Enemy', author: 'Jean Webster', gutenberg: 1424, category: 'classici' },

  // ELEANOR H. PORTER
  { id: 'pollyanna', title: 'Pollyanna', author: 'Eleanor H. Porter', gutenberg: 1450, category: 'classici' },
  { id: 'pollyanna-grows-up', title: 'Pollyanna Grows Up', author: 'Eleanor H. Porter', gutenberg: 4501, category: 'classici' },

  // JAMES FENIMORE COOPER
  { id: 'last-mohicans', title: 'The Last of the Mohicans', author: 'James Fenimore Cooper', gutenberg: 940, category: 'avventura' },
  { id: 'deerslayer', title: 'The Deerslayer', author: 'James Fenimore Cooper', gutenberg: 3285, category: 'avventura' },
  { id: 'pathfinder', title: 'The Pathfinder', author: 'James Fenimore Cooper', gutenberg: 1216, category: 'avventura' },
  { id: 'pioneers', title: 'The Pioneers', author: 'James Fenimore Cooper', gutenberg: 2275, category: 'avventura' },
  { id: 'prairie', title: 'The Prairie', author: 'James Fenimore Cooper', gutenberg: 3290, category: 'avventura' },
  { id: 'spy', title: 'The Spy', author: 'James Fenimore Cooper', gutenberg: 4744, category: 'avventura' },
  { id: 'pilot', title: 'The Pilot', author: 'James Fenimore Cooper', gutenberg: 4697, category: 'avventura' },

  // ============================================
  // MORE SCIENCE FICTION
  // ============================================

  // EDWARD BELLAMY
  { id: 'looking-backward', title: 'Looking Backward: 2000-1887', author: 'Edward Bellamy', gutenberg: 624, category: 'fantasy' },
  { id: 'equality', title: 'Equality', author: 'Edward Bellamy', gutenberg: 4563, category: 'fantasy' },

  // EDGAR RICE BURROUGHS
  { id: 'tarzan-apes', title: 'Tarzan of the Apes', author: 'Edgar Rice Burroughs', gutenberg: 78, category: 'avventura' },
  { id: 'return-tarzan', title: 'The Return of Tarzan', author: 'Edgar Rice Burroughs', gutenberg: 81, category: 'avventura' },
  { id: 'beasts-tarzan', title: 'The Beasts of Tarzan', author: 'Edgar Rice Burroughs', gutenberg: 85, category: 'avventura' },
  { id: 'son-tarzan', title: 'The Son of Tarzan', author: 'Edgar Rice Burroughs', gutenberg: 90, category: 'avventura' },
  { id: 'tarzan-jewels-opar', title: 'Tarzan and the Jewels of Opar', author: 'Edgar Rice Burroughs', gutenberg: 1339, category: 'avventura' },
  { id: 'jungle-tales-tarzan', title: 'Jungle Tales of Tarzan', author: 'Edgar Rice Burroughs', gutenberg: 106, category: 'avventura' },
  { id: 'princess-mars', title: 'A Princess of Mars', author: 'Edgar Rice Burroughs', gutenberg: 62, category: 'fantasy' },
  { id: 'gods-mars', title: 'The Gods of Mars', author: 'Edgar Rice Burroughs', gutenberg: 64, category: 'fantasy' },
  { id: 'warlord-mars', title: 'The Warlord of Mars', author: 'Edgar Rice Burroughs', gutenberg: 68, category: 'fantasy' },
  { id: 'thuvia-mars', title: 'Thuvia, Maid of Mars', author: 'Edgar Rice Burroughs', gutenberg: 72, category: 'fantasy' },
  { id: 'chessmen-mars', title: 'The Chessmen of Mars', author: 'Edgar Rice Burroughs', gutenberg: 1153, category: 'fantasy' },
  { id: 'pellucidar', title: 'At the Earth\'s Core', author: 'Edgar Rice Burroughs', gutenberg: 123, category: 'fantasy' },
  { id: 'land-time-forgot', title: 'The Land That Time Forgot', author: 'Edgar Rice Burroughs', gutenberg: 551, category: 'avventura' },

  // ABRAHAM MERRITT
  { id: 'moon-pool', title: 'The Moon Pool', author: 'A. Merritt', gutenberg: 765, category: 'fantasy' },
  { id: 'ship-ishtar', title: 'The Ship of Ishtar', author: 'A. Merritt', gutenberg: 25716, category: 'fantasy' },
  { id: 'face-abyss', title: 'The Face in the Abyss', author: 'A. Merritt', gutenberg: 31418, category: 'fantasy' },
  { id: 'metal-monster', title: 'The Metal Monster', author: 'A. Merritt', gutenberg: 3479, category: 'fantasy' },

  // OLAF STAPLEDON
  { id: 'last-first-men', title: 'Last and First Men', author: 'Olaf Stapledon', gutenberg: 17579, category: 'fantasy' },
  { id: 'star-maker', title: 'Star Maker', author: 'Olaf Stapledon', gutenberg: 21814, category: 'fantasy' },

  // E.E. "DOC" SMITH
  { id: 'skylark-space', title: 'The Skylark of Space', author: 'E.E. Smith', gutenberg: 20869, category: 'fantasy' },
  { id: 'skylark-three', title: 'Skylark Three', author: 'E.E. Smith', gutenberg: 21814, category: 'fantasy' },
  { id: 'skylark-valeron', title: 'Skylark of Valeron', author: 'E.E. Smith', gutenberg: 27556, category: 'fantasy' },
  { id: 'triplanetary', title: 'Triplanetary', author: 'E.E. Smith', gutenberg: 32706, category: 'fantasy' },

  // ============================================
  // MORE MYTHOLOGY & FOLKLORE
  // ============================================

  { id: 'bulfinch-mythology', title: "Bulfinch's Mythology", author: 'Thomas Bulfinch', gutenberg: 3327, category: 'fiabe' },
  { id: 'age-fable', title: 'The Age of Fable', author: 'Thomas Bulfinch', gutenberg: 4925, category: 'fiabe' },
  { id: 'age-chivalry', title: 'The Age of Chivalry', author: 'Thomas Bulfinch', gutenberg: 4926, category: 'fiabe' },
  { id: 'legends-charlemagne', title: 'Legends of Charlemagne', author: 'Thomas Bulfinch', gutenberg: 4928, category: 'fiabe' },
  { id: 'norse-mythology', title: 'Norse Mythology', author: 'Peter Christen Asbjørnsen', gutenberg: 14155, category: 'fiabe' },
  { id: 'heroes-greek-fairy-tales', title: 'The Heroes', author: 'Charles Kingsley', gutenberg: 677, category: 'fiabe' },
  { id: 'tales-wonder', title: 'Tales of Wonder', author: 'Jane Yolen', gutenberg: 31536, category: 'fiabe' },
  { id: 'russian-fairy-tales', title: 'Russian Fairy Tales', author: 'Traditional', gutenberg: 22373, category: 'fiabe' },
  { id: 'roumanian-fairy-tales', title: 'Roumanian Fairy Tales', author: 'Traditional', gutenberg: 24765, category: 'fiabe' },
  { id: 'japanese-fairy-tales', title: 'Japanese Fairy Tales', author: 'Yei Theodora Ozaki', gutenberg: 4018, category: 'fiabe' },
  { id: 'chinese-fairy-book', title: 'The Chinese Fairy Book', author: 'Richard Wilhelm', gutenberg: 20725, category: 'fiabe' },
  { id: 'turkish-fairy-tales', title: 'Turkish Fairy Tales', author: 'Traditional', gutenberg: 37577, category: 'fiabe' },
  { id: 'wonder-tales-scotland', title: 'Wonder Tales from Scottish Myth', author: 'Donald MacKenzie', gutenberg: 14977, category: 'fiabe' },
  { id: 'tales-norsemen', title: 'Tales of the Norsemen', author: 'Helen A. Guerber', gutenberg: 24737, category: 'fiabe' },
  { id: 'stories-greek-gods', title: 'Stories of the Greek Gods', author: 'Mary Macgregor', gutenberg: 23915, category: 'fiabe' },
  { id: 'myths-legends-babylonia', title: 'Myths & Legends of Babylonia & Assyria', author: 'Lewis Spence', gutenberg: 16653, category: 'fiabe' },
  { id: 'myths-legends-egypt', title: 'Myths & Legends of Ancient Egypt', author: 'Lewis Spence', gutenberg: 18731, category: 'fiabe' },
  { id: 'book-dragons', title: 'The Book of Dragons', author: 'E. Nesbit', gutenberg: 23661, category: 'fiabe' },

  // ============================================
  // HUMOR & SATIRE
  // ============================================

  { id: 'importance-being-earnest', title: 'The Importance of Being Earnest', author: 'Oscar Wilde', gutenberg: 844, category: 'classici' },
  { id: 'ideal-husband', title: 'An Ideal Husband', author: 'Oscar Wilde', gutenberg: 885, category: 'classici' },
  { id: 'lady-windermeres-fan', title: "Lady Windermere's Fan", author: 'Oscar Wilde', gutenberg: 790, category: 'classici' },
  { id: 'picture-dorian-gray', title: 'The Picture of Dorian Gray', author: 'Oscar Wilde', gutenberg: 174, category: 'classici' },
  { id: 'de-profundis', title: 'De Profundis', author: 'Oscar Wilde', gutenberg: 921, category: 'classici' },
  { id: 'soul-man-socialism', title: 'The Soul of Man under Socialism', author: 'Oscar Wilde', gutenberg: 1017, category: 'filosofia' },
  { id: 'three-men-boat', title: 'Three Men in a Boat', author: 'Jerome K. Jerome', gutenberg: 308, category: 'classici' },
  { id: 'idle-thoughts-idle-fellow', title: 'Idle Thoughts of an Idle Fellow', author: 'Jerome K. Jerome', gutenberg: 849, category: 'classici' },
  { id: 'diary-nobody', title: 'The Diary of a Nobody', author: 'George Grossmith', gutenberg: 1026, category: 'classici' },
  { id: 'psmith-journalist', title: 'Psmith, Journalist', author: 'P.G. Wodehouse', gutenberg: 2607, category: 'classici' },
  { id: 'man-upstairs', title: 'The Man Upstairs', author: 'P.G. Wodehouse', gutenberg: 6805, category: 'classici' },
  { id: 'love-among-chickens', title: 'Love Among the Chickens', author: 'P.G. Wodehouse', gutenberg: 3053, category: 'classici' },
  { id: 'right-ho-jeeves', title: 'Right Ho, Jeeves', author: 'P.G. Wodehouse', gutenberg: 10554, category: 'classici' },
  { id: 'my-man-jeeves', title: 'My Man Jeeves', author: 'P.G. Wodehouse', gutenberg: 8164, category: 'classici' },
  { id: 'piccadilly-jim', title: 'Piccadilly Jim', author: 'P.G. Wodehouse', gutenberg: 2005, category: 'classici' },

  // ============================================
  // ESSAYS & LETTERS
  // ============================================

  { id: 'essays-bacon', title: 'The Essays of Francis Bacon', author: 'Francis Bacon', gutenberg: 575, category: 'filosofia' },
  { id: 'essays-montaigne-1', title: 'Essays of Montaigne Vol 1', author: 'Michel de Montaigne', gutenberg: 3600, category: 'filosofia' },
  { id: 'essays-montaigne-2', title: 'Essays of Montaigne Vol 2', author: 'Michel de Montaigne', gutenberg: 3596, category: 'filosofia' },
  { id: 'essays-elia', title: 'Essays of Elia', author: 'Charles Lamb', gutenberg: 980, category: 'classici' },
  { id: 'last-essays-elia', title: 'Last Essays of Elia', author: 'Charles Lamb', gutenberg: 2105, category: 'classici' },
  { id: 'letters-son', title: 'Letters to His Son', author: 'Lord Chesterfield', gutenberg: 3361, category: 'classici' },
  { id: 'letters-seneca', title: 'Moral Letters to Lucilius', author: 'Seneca', gutenberg: 2612, category: 'filosofia' },
  { id: 'essays-emerson-2', title: 'Essays, Second Series', author: 'Ralph Waldo Emerson', gutenberg: 2944, category: 'filosofia' },
  { id: 'representative-men', title: 'Representative Men', author: 'Ralph Waldo Emerson', gutenberg: 6312, category: 'filosofia' },
  { id: 'letters-beethoven', title: 'Letters of Beethoven', author: 'Ludwig van Beethoven', gutenberg: 13065, category: 'classici' },
  { id: 'letters-mozart', title: 'Letters of Mozart', author: 'Wolfgang Amadeus Mozart', gutenberg: 5307, category: 'classici' },
  { id: 'letters-vincent-van-gogh', title: 'Letters to Theo', author: 'Vincent van Gogh', gutenberg: 28818, category: 'classici' },

  // ============================================
  // MORE FRENCH LITERATURE
  // ============================================

  // VOLTAIRE
  { id: 'candide', title: 'Candide', author: 'Voltaire', gutenberg: 19942, category: 'classici' },
  { id: 'candide-fr', title: 'Candide', author: 'Voltaire', gutenberg: 4650, category: 'classici', lang: 'fr' },
  { id: 'zadig', title: 'Zadig', author: 'Voltaire', gutenberg: 137, category: 'classici' },
  { id: 'micromegas', title: 'Micromégas', author: 'Voltaire', gutenberg: 30123, category: 'classici' },
  { id: 'philosophical-dictionary', title: 'Philosophical Dictionary', author: 'Voltaire', gutenberg: 18569, category: 'filosofia' },
  { id: 'letters-england', title: 'Letters on England', author: 'Voltaire', gutenberg: 2445, category: 'classici' },

  // MOLIERE
  { id: 'tartuffe', title: 'Tartuffe', author: 'Molière', gutenberg: 2027, category: 'classici' },
  { id: 'misanthrope', title: 'The Misanthrope', author: 'Molière', gutenberg: 2183, category: 'classici' },
  { id: 'bourgeois-gentilhomme', title: 'Le Bourgeois Gentilhomme', author: 'Molière', gutenberg: 2992, category: 'classici' },
  { id: 'avare', title: "L'Avare", author: 'Molière', gutenberg: 5102, category: 'classici' },
  { id: 'malade-imaginaire', title: 'Le Malade Imaginaire', author: 'Molière', gutenberg: 9101, category: 'classici' },
  { id: 'doctor-spite-himself', title: 'The Doctor in Spite of Himself', author: 'Molière', gutenberg: 8776, category: 'classici' },

  // OTHERS
  { id: 'dangerous-liaisons', title: 'Dangerous Liaisons', author: 'Choderlos de Laclos', gutenberg: 45512, category: 'classici' },
  { id: 'manon-lescaut', title: 'Manon Lescaut', author: "Abbé Prévost", gutenberg: 7421, category: 'classici' },
  { id: 'atala', title: 'Atala', author: 'Chateaubriand', gutenberg: 4711, category: 'classici' },
  { id: 'rene', title: 'René', author: 'Chateaubriand', gutenberg: 12578, category: 'classici' },
  { id: 'adolphe', title: 'Adolphe', author: 'Benjamin Constant', gutenberg: 5410, category: 'classici' },
  { id: 'cyrano-bergerac', title: 'Cyrano de Bergerac', author: 'Edmond Rostand', gutenberg: 1254, category: 'classici' },
  { id: 'flowers-evil', title: 'The Flowers of Evil', author: 'Charles Baudelaire', gutenberg: 36098, category: 'poesia' },
  { id: 'germinie-lacerteux', title: 'Germinie Lacerteux', author: 'Goncourt Brothers', gutenberg: 10324, category: 'classici' },
  { id: 'letters-provincial', title: 'The Provincial Letters', author: 'Blaise Pascal', gutenberg: 18269, category: 'filosofia' },
  { id: 'pensees', title: 'Pensées', author: 'Blaise Pascal', gutenberg: 18269, category: 'filosofia' },

  // ============================================
  // MORE DRAMA
  // ============================================

  // GREEK
  { id: 'agamemnon', title: 'Agamemnon', author: 'Aeschylus', gutenberg: 14417, category: 'classici' },
  { id: 'oresteia', title: 'The Oresteia', author: 'Aeschylus', gutenberg: 1533, category: 'classici' },
  { id: 'prometheus-bound', title: 'Prometheus Bound', author: 'Aeschylus', gutenberg: 8714, category: 'classici' },
  { id: 'electra', title: 'Electra', author: 'Sophocles', gutenberg: 14484, category: 'classici' },
  { id: 'ajax', title: 'Ajax', author: 'Sophocles', gutenberg: 14485, category: 'classici' },
  { id: 'trachiniae', title: 'The Trachiniae', author: 'Sophocles', gutenberg: 31483, category: 'classici' },
  { id: 'bacchae', title: 'The Bacchae', author: 'Euripides', gutenberg: 5793, category: 'classici' },
  { id: 'hippolytus', title: 'Hippolytus', author: 'Euripides', gutenberg: 14068, category: 'classici' },
  { id: 'iphigenia-aulis', title: 'Iphigenia in Aulis', author: 'Euripides', gutenberg: 14070, category: 'classici' },
  { id: 'iphigenia-tauris', title: 'Iphigenia in Tauris', author: 'Euripides', gutenberg: 14069, category: 'classici' },
  { id: 'clouds', title: 'The Clouds', author: 'Aristophanes', gutenberg: 2562, category: 'classici' },
  { id: 'birds', title: 'The Birds', author: 'Aristophanes', gutenberg: 3013, category: 'classici' },
  { id: 'frogs', title: 'The Frogs', author: 'Aristophanes', gutenberg: 7998, category: 'classici' },
  { id: 'lysistrata', title: 'Lysistrata', author: 'Aristophanes', gutenberg: 7700, category: 'classici' },

  // SPANISH
  { id: 'life-dream', title: 'Life Is a Dream', author: 'Calderón de la Barca', gutenberg: 46249, category: 'classici' },
  { id: 'celestina', title: 'La Celestina', author: 'Fernando de Rojas', gutenberg: 31092, category: 'classici' },

  // MORE SHAKESPEARE
  { id: 'as-you-like-it', title: 'As You Like It', author: 'William Shakespeare', gutenberg: 1523, category: 'classici' },
  { id: 'julius-caesar', title: 'Julius Caesar', author: 'William Shakespeare', gutenberg: 1120, category: 'classici' },
  { id: 'antony-cleopatra', title: 'Antony and Cleopatra', author: 'William Shakespeare', gutenberg: 1534, category: 'classici' },
  { id: 'coriolanus', title: 'Coriolanus', author: 'William Shakespeare', gutenberg: 1535, category: 'classici' },
  { id: 'timon-athens', title: 'Timon of Athens', author: 'William Shakespeare', gutenberg: 1537, category: 'classici' },
  { id: 'richard-iii', title: 'Richard III', author: 'William Shakespeare', gutenberg: 1103, category: 'classici' },
  { id: 'henry-v', title: 'Henry V', author: 'William Shakespeare', gutenberg: 1521, category: 'classici' },
  { id: 'winters-tale', title: "The Winter's Tale", author: 'William Shakespeare', gutenberg: 1539, category: 'classici' },
  { id: 'measure-measure', title: 'Measure for Measure', author: 'William Shakespeare', gutenberg: 1126, category: 'classici' },
  { id: 'comedy-errors', title: 'The Comedy of Errors', author: 'William Shakespeare', gutenberg: 1504, category: 'classici' },
  { id: 'taming-shrew', title: 'The Taming of the Shrew', author: 'William Shakespeare', gutenberg: 1107, category: 'classici' },
  { id: 'cymbeline', title: 'Cymbeline', author: 'William Shakespeare', gutenberg: 2269, category: 'classici' },
  { id: 'titus-andronicus', title: 'Titus Andronicus', author: 'William Shakespeare', gutenberg: 1106, category: 'classici' },

  // ============================================
  // LETTERS & MEMOIRS
  // ============================================

  { id: 'memoirs-casanova-1', title: 'Memoirs of Casanova Vol 1', author: 'Giacomo Casanova', gutenberg: 2976, category: 'classici' },
  { id: 'memoirs-casanova-2', title: 'Memoirs of Casanova Vol 2', author: 'Giacomo Casanova', gutenberg: 2977, category: 'classici' },
  { id: 'memoirs-casanova-3', title: 'Memoirs of Casanova Vol 3', author: 'Giacomo Casanova', gutenberg: 2978, category: 'classici' },
  { id: 'memoirs-casanova-4', title: 'Memoirs of Casanova Vol 4', author: 'Giacomo Casanova', gutenberg: 2979, category: 'classici' },
  { id: 'memoirs-casanova-5', title: 'Memoirs of Casanova Vol 5', author: 'Giacomo Casanova', gutenberg: 2980, category: 'classici' },
  { id: 'memoirs-casanova-6', title: 'Memoirs of Casanova Vol 6', author: 'Giacomo Casanova', gutenberg: 2981, category: 'classici' },

  // ============================================
  // HEALTH & LIFESTYLE (Classic)
  // ============================================

  { id: 'fasting-cure', title: 'The Fasting Cure', author: 'Upton Sinclair', gutenberg: 27622, category: 'scienza' },
  { id: 'perfect-health', title: 'Perfect Health', author: 'Charles Haskell', gutenberg: 28161, category: 'scienza' },
  { id: 'how-live-100-years', title: 'How to Live: Rules for Healthful Living', author: 'Irving Fisher', gutenberg: 45440, category: 'scienza' },
  { id: 'kellogg-colon-hygiene', title: 'Colon Hygiene', author: 'John Harvey Kellogg', gutenberg: 27624, category: 'scienza' },
  { id: 'physical-culture', title: 'The Gospel of Physical Culture', author: 'Bernarr Macfadden', gutenberg: 37559, category: 'scienza' },

  // ============================================
  // MORE TRANSLATIONS
  // ============================================

  // German translations
  { id: 'faust-de', title: 'Faust', author: 'Johann Wolfgang von Goethe', gutenberg: 2229, category: 'classici', lang: 'de' },
  { id: 'werther-de', title: 'Die Leiden des jungen Werther', author: 'Johann Wolfgang von Goethe', gutenberg: 2407, category: 'classici', lang: 'de' },
  { id: 'metamorphosis-de', title: 'Die Verwandlung', author: 'Franz Kafka', gutenberg: 22367, category: 'classici', lang: 'de' },

  // Spanish translations
  { id: 'lazarillo-es', title: 'Lazarillo de Tormes', author: 'Anonymous', gutenberg: 320, category: 'classici', lang: 'es' },
  { id: 'quijote-2-es', title: 'Don Quijote Segunda Parte', author: 'Miguel de Cervantes', gutenberg: 2001, category: 'classici', lang: 'es' },

  // French translations
  { id: 'trois-mousquetaires-fr', title: 'Les Trois Mousquetaires', author: 'Alexandre Dumas', gutenberg: 13951, category: 'avventura', lang: 'fr' },
  { id: 'pere-goriot-fr', title: 'Le Père Goriot', author: 'Honoré de Balzac', gutenberg: 17634, category: 'classici', lang: 'fr' },
  { id: 'germinal-fr', title: 'Germinal', author: 'Émile Zola', gutenberg: 5711, category: 'classici', lang: 'fr' },
  { id: 'fleurs-mal-fr', title: 'Les Fleurs du Mal', author: 'Charles Baudelaire', gutenberg: 6099, category: 'poesia', lang: 'fr' },

  // Italian translations
  { id: 'odissea-it', title: 'Odissea', author: 'Omero', gutenberg: 37976, category: 'classici', lang: 'it' },
  { id: 'iliade-it', title: 'Iliade', author: 'Omero', gutenberg: 37120, category: 'classici', lang: 'it' },
  { id: 'eneide-it', title: 'Eneide', author: 'Virgilio', gutenberg: 37972, category: 'classici', lang: 'it' },

  // Russian in translation
  { id: 'guerra-pace-it', title: 'Guerra e Pace', author: 'Lev Tolstoj', gutenberg: 37135, category: 'classici', lang: 'it' },
  { id: 'anna-karenina-it', title: 'Anna Karenina', author: 'Lev Tolstoj', gutenberg: 37160, category: 'classici', lang: 'it' },

  // ============================================
  // MORE ADVENTURE
  // ============================================

  // BARONESS ORCZY
  { id: 'scarlet-pimpernel', title: 'The Scarlet Pimpernel', author: 'Baroness Orczy', gutenberg: 60, category: 'avventura' },
  { id: 'elusive-pimpernel', title: 'The Elusive Pimpernel', author: 'Baroness Orczy', gutenberg: 1752, category: 'avventura' },
  { id: 'i-will-repay', title: 'I Will Repay', author: 'Baroness Orczy', gutenberg: 2371, category: 'avventura' },
  { id: 'old-man-corner', title: 'The Old Man in the Corner', author: 'Baroness Orczy', gutenberg: 14956, category: 'mistero' },
  { id: 'triumph-pimpernel', title: 'The Triumph of the Scarlet Pimpernel', author: 'Baroness Orczy', gutenberg: 22381, category: 'avventura' },

  // JEFFERY FARNOL
  { id: 'broad-highway', title: 'The Broad Highway', author: 'Jeffery Farnol', gutenberg: 6463, category: 'avventura' },
  { id: 'amateur-gentleman', title: 'The Amateur Gentleman', author: 'Jeffery Farnol', gutenberg: 4095, category: 'avventura' },
  { id: 'beltane-smith', title: 'Beltane the Smith', author: 'Jeffery Farnol', gutenberg: 7459, category: 'avventura' },
  { id: 'black-dorian', title: 'Black Dorian', author: 'Jeffery Farnol', gutenberg: 13295, category: 'avventura' },

  // STANLEY WEYMAN
  { id: 'gentleman-france', title: 'A Gentleman of France', author: 'Stanley J. Weyman', gutenberg: 2888, category: 'avventura' },
  { id: 'under-red-robe', title: 'Under the Red Robe', author: 'Stanley J. Weyman', gutenberg: 1329, category: 'avventura' },
  { id: 'count-hannibal', title: 'Count Hannibal', author: 'Stanley J. Weyman', gutenberg: 2990, category: 'avventura' },

  // ============================================
  // MORE MYSTERY & DETECTIVE
  // ============================================

  // MARY ROBERTS RINEHART
  { id: 'circular-staircase', title: 'The Circular Staircase', author: 'Mary Roberts Rinehart', gutenberg: 434, category: 'mistero' },
  { id: 'man-lower-ten', title: 'The Man in Lower Ten', author: 'Mary Roberts Rinehart', gutenberg: 621, category: 'mistero' },
  { id: 'window-white-cat', title: 'The Window at the White Cat', author: 'Mary Roberts Rinehart', gutenberg: 1065, category: 'mistero' },
  { id: 'case-jennie-brice', title: 'The Case of Jennie Brice', author: 'Mary Roberts Rinehart', gutenberg: 1314, category: 'mistero' },
  { id: 'bat', title: 'The Bat', author: 'Mary Roberts Rinehart', gutenberg: 15229, category: 'mistero' },

  // ANNA KATHARINE GREEN
  { id: 'leavenworth-case', title: 'The Leavenworth Case', author: 'Anna Katharine Green', gutenberg: 5345, category: 'mistero' },
  { id: 'filigree-ball', title: 'The Filigree Ball', author: 'Anna Katharine Green', gutenberg: 1965, category: 'mistero' },
  { id: 'initials-only', title: 'Initials Only', author: 'Anna Katharine Green', gutenberg: 3108, category: 'mistero' },

  // R. AUSTIN FREEMAN
  { id: 'red-thumb-mark', title: 'The Red Thumb Mark', author: 'R. Austin Freeman', gutenberg: 12474, category: 'mistero' },
  { id: 'eye-osiris', title: 'The Eye of Osiris', author: 'R. Austin Freeman', gutenberg: 12475, category: 'mistero' },
  { id: 'mystery-31-new-inn', title: 'The Mystery of 31 New Inn', author: 'R. Austin Freeman', gutenberg: 12496, category: 'mistero' },
  { id: 'singing-bone', title: 'The Singing Bone', author: 'R. Austin Freeman', gutenberg: 17404, category: 'mistero' },

  // E.W. HORNUNG
  { id: 'amateur-cracksman', title: 'The Amateur Cracksman', author: 'E.W. Hornung', gutenberg: 706, category: 'mistero' },
  { id: 'raffles', title: 'Raffles: Further Adventures of the Amateur Cracksman', author: 'E.W. Hornung', gutenberg: 706, category: 'mistero' },
  { id: 'black-mask', title: 'A Thief in the Night', author: 'E.W. Hornung', gutenberg: 9754, category: 'mistero' },
  { id: 'mr-justice-raffles', title: 'Mr. Justice Raffles', author: 'E.W. Hornung', gutenberg: 9755, category: 'mistero' },

  // MAURICE LEBLANC
  { id: 'arsene-lupin', title: 'Arsène Lupin, Gentleman-Burglar', author: 'Maurice Leblanc', gutenberg: 6133, category: 'mistero' },
  { id: 'arsene-vs-sherlock', title: 'Arsène Lupin vs. Sherlock Holmes', author: 'Maurice Leblanc', gutenberg: 6134, category: 'mistero' },
  { id: 'hollow-needle', title: 'The Hollow Needle', author: 'Maurice Leblanc', gutenberg: 4017, category: 'mistero' },
  { id: '813', title: '813', author: 'Maurice Leblanc', gutenberg: 13058, category: 'mistero' },
  { id: 'crystal-stopper', title: 'The Crystal Stopper', author: 'Maurice Leblanc', gutenberg: 14824, category: 'mistero' },
  { id: 'confessions-arsene', title: 'The Confessions of Arsène Lupin', author: 'Maurice Leblanc', gutenberg: 15822, category: 'mistero' },

  // ============================================
  // MORE CLASSIC NOVELS
  // ============================================

  // SAMUEL RICHARDSON
  { id: 'pamela', title: 'Pamela', author: 'Samuel Richardson', gutenberg: 6124, category: 'classici' },
  { id: 'clarissa-1', title: 'Clarissa Vol 1', author: 'Samuel Richardson', gutenberg: 9296, category: 'classici' },
  { id: 'clarissa-2', title: 'Clarissa Vol 2', author: 'Samuel Richardson', gutenberg: 9297, category: 'classici' },
  { id: 'sir-charles-grandison', title: 'Sir Charles Grandison', author: 'Samuel Richardson', gutenberg: 9400, category: 'classici' },

  // HENRY FIELDING
  { id: 'tom-jones', title: 'Tom Jones', author: 'Henry Fielding', gutenberg: 6593, category: 'classici' },
  { id: 'joseph-andrews', title: 'Joseph Andrews', author: 'Henry Fielding', gutenberg: 9611, category: 'classici' },
  { id: 'amelia', title: 'Amelia', author: 'Henry Fielding', gutenberg: 6788, category: 'classici' },

  // TOBIAS SMOLLETT
  { id: 'roderick-random', title: 'Roderick Random', author: 'Tobias Smollett', gutenberg: 4085, category: 'classici' },
  { id: 'peregrine-pickle', title: 'Peregrine Pickle', author: 'Tobias Smollett', gutenberg: 4084, category: 'classici' },
  { id: 'humphry-clinker', title: 'Humphry Clinker', author: 'Tobias Smollett', gutenberg: 2160, category: 'classici' },

  // LAURENCE STERNE
  { id: 'tristram-shandy', title: 'Tristram Shandy', author: 'Laurence Sterne', gutenberg: 1079, category: 'classici' },
  { id: 'sentimental-journey', title: 'A Sentimental Journey', author: 'Laurence Sterne', gutenberg: 804, category: 'classici' },

  // FANNY BURNEY
  { id: 'evelina', title: 'Evelina', author: 'Fanny Burney', gutenberg: 6053, category: 'classici' },
  { id: 'cecilia', title: 'Cecilia', author: 'Fanny Burney', gutenberg: 11024, category: 'classici' },
  { id: 'camilla', title: 'Camilla', author: 'Fanny Burney', gutenberg: 13025, category: 'classici' },

  // MARIA EDGEWORTH
  { id: 'castle-rackrent', title: 'Castle Rackrent', author: 'Maria Edgeworth', gutenberg: 1424, category: 'classici' },
  { id: 'belinda', title: 'Belinda', author: 'Maria Edgeworth', gutenberg: 7232, category: 'classici' },
  { id: 'patronage', title: 'Patronage', author: 'Maria Edgeworth', gutenberg: 12623, category: 'classici' },

  // ANN RADCLIFFE
  { id: 'mysteries-udolpho', title: 'The Mysteries of Udolpho', author: 'Ann Radcliffe', gutenberg: 3268, category: 'classici' },
  { id: 'italian', title: 'The Italian', author: 'Ann Radcliffe', gutenberg: 10652, category: 'classici' },
  { id: 'romance-forest', title: 'The Romance of the Forest', author: 'Ann Radcliffe', gutenberg: 7383, category: 'classici' },

  // MARY WOLLSTONECRAFT
  { id: 'vindication-women', title: 'Vindication of the Rights of Woman', author: 'Mary Wollstonecraft', gutenberg: 3420, category: 'filosofia' },
  { id: 'maria-wrongs-woman', title: 'Maria, or The Wrongs of Woman', author: 'Mary Wollstonecraft', gutenberg: 134, category: 'classici' },

  // ============================================
  // MORE SCIENCE & PHILOSOPHY
  // ============================================

  // SCIENCE
  { id: 'principia', title: 'Philosophiae Naturalis Principia Mathematica', author: 'Isaac Newton', gutenberg: 28233, category: 'scienza' },
  { id: 'origin-life', title: 'The Origin of Life', author: 'Thomas Huxley', gutenberg: 4915, category: 'scienza' },
  { id: 'evidence-man', title: 'Evidence as to Man\'s Place in Nature', author: 'Thomas Huxley', gutenberg: 2931, category: 'scienza' },
  { id: 'struggle-existence', title: 'The Struggle for Existence', author: 'Thomas Huxley', gutenberg: 11563, category: 'scienza' },
  { id: 'relativity-special-general', title: 'Relativity: The Special and General Theory', author: 'Albert Einstein', gutenberg: 30155, category: 'scienza' },
  { id: 'sidelights-relativity', title: 'Sidelights on Relativity', author: 'Albert Einstein', gutenberg: 7333, category: 'scienza' },
  { id: 'electro-magnetic-phenomena', title: 'On the Electrodynamics of Moving Bodies', author: 'Albert Einstein', gutenberg: 36114, category: 'scienza' },

  // PHILOSOPHY
  { id: 'critique-pure-reason', title: 'Critique of Pure Reason', author: 'Immanuel Kant', gutenberg: 4280, category: 'filosofia' },
  { id: 'prolegomena', title: 'Prolegomena to Any Future Metaphysics', author: 'Immanuel Kant', gutenberg: 52821, category: 'filosofia' },
  { id: 'perpetual-peace', title: 'Perpetual Peace', author: 'Immanuel Kant', gutenberg: 50922, category: 'filosofia' },
  { id: 'groundwork-metaphysics-morals', title: 'Groundwork of the Metaphysics of Morals', author: 'Immanuel Kant', gutenberg: 5682, category: 'filosofia' },
  { id: 'world-will-idea', title: 'The World as Will and Idea', author: 'Arthur Schopenhauer', gutenberg: 38427, category: 'filosofia' },
  { id: 'essays-schopenhauer', title: 'Essays of Schopenhauer', author: 'Arthur Schopenhauer', gutenberg: 11945, category: 'filosofia' },
  { id: 'wisdom-life', title: 'The Wisdom of Life', author: 'Arthur Schopenhauer', gutenberg: 10741, category: 'filosofia' },
  { id: 'studies-pessimism', title: 'Studies in Pessimism', author: 'Arthur Schopenhauer', gutenberg: 10732, category: 'filosofia' },
  { id: 'religion-philosophy-india', title: 'Religion and Philosophy of India', author: 'Arthur Schopenhauer', gutenberg: 40868, category: 'filosofia' },
  { id: 'fear-trembling', title: 'Fear and Trembling', author: 'Søren Kierkegaard', gutenberg: 38750, category: 'filosofia' },
  { id: 'either-or', title: 'Either/Or', author: 'Søren Kierkegaard', gutenberg: 68789, category: 'filosofia' },

  // ============================================
  // RELIGIOUS TEXTS
  // ============================================

  { id: 'quran', title: 'The Holy Quran', author: 'Traditional', gutenberg: 2800, category: 'spiritualita' },
  { id: 'book-mormon', title: 'Book of Mormon', author: 'Joseph Smith', gutenberg: 17, category: 'spiritualita' },
  { id: 'aquinas-summa-1', title: 'Summa Theologica Vol 1', author: 'Thomas Aquinas', gutenberg: 17611, category: 'spiritualita' },
  { id: 'aquinas-summa-2', title: 'Summa Theologica Vol 2', author: 'Thomas Aquinas', gutenberg: 17897, category: 'spiritualita' },
  { id: 'city-god', title: 'City of God', author: 'Saint Augustine', gutenberg: 45304, category: 'spiritualita' },
  { id: 'dark-night-soul', title: 'Dark Night of the Soul', author: 'Saint John of the Cross', gutenberg: 21212, category: 'spiritualita' },
  { id: 'interior-castle', title: 'The Interior Castle', author: 'Saint Teresa of Avila', gutenberg: 49093, category: 'spiritualita' },
  { id: 'little-flowers-francis', title: 'The Little Flowers of St. Francis', author: 'Traditional', gutenberg: 6403, category: 'spiritualita' },
  { id: 'sermons-meister-eckhart', title: 'Meister Eckhart\'s Sermons', author: 'Meister Eckhart', gutenberg: 24216, category: 'spiritualita' },
  { id: 'gospel-buddha', title: 'The Gospel of Buddha', author: 'Paul Carus', gutenberg: 35895, category: 'spiritualita' },
  { id: 'dhammapada', title: 'The Dhammapada', author: 'Traditional', gutenberg: 2017, category: 'spiritualita' },

  // ============================================
  // MORE AMERICAN LITERATURE
  // ============================================

  // JAMES THURBER (some public domain works)
  { id: 'fables-our-time', title: 'Fables for Our Time', author: 'James Thurber', gutenberg: 47876, category: 'classici' },

  // SINCLAIR LEWIS
  { id: 'main-street', title: 'Main Street', author: 'Sinclair Lewis', gutenberg: 543, category: 'classici' },
  { id: 'babbitt', title: 'Babbitt', author: 'Sinclair Lewis', gutenberg: 1156, category: 'classici' },
  { id: 'arrowsmith', title: 'Arrowsmith', author: 'Sinclair Lewis', gutenberg: 3045, category: 'classici' },

  // THEODORE DREISER
  { id: 'sister-carrie', title: 'Sister Carrie', author: 'Theodore Dreiser', gutenberg: 233, category: 'classici' },
  { id: 'jennie-gerhardt', title: 'Jennie Gerhardt', author: 'Theodore Dreiser', gutenberg: 7850, category: 'classici' },
  { id: 'financier', title: 'The Financier', author: 'Theodore Dreiser', gutenberg: 1840, category: 'classici' },
  { id: 'titan', title: 'The Titan', author: 'Theodore Dreiser', gutenberg: 1841, category: 'classici' },

  // BOOTH TARKINGTON
  { id: 'penrod', title: 'Penrod', author: 'Booth Tarkington', gutenberg: 402, category: 'classici' },
  { id: 'penrod-sam', title: 'Penrod and Sam', author: 'Booth Tarkington', gutenberg: 1315, category: 'classici' },
  { id: 'magnificent-ambersons', title: 'The Magnificent Ambersons', author: 'Booth Tarkington', gutenberg: 8867, category: 'classici' },
  { id: 'alice-adams', title: 'Alice Adams', author: 'Booth Tarkington', gutenberg: 5873, category: 'classici' },
  { id: 'turmoil', title: 'The Turmoil', author: 'Booth Tarkington', gutenberg: 1867, category: 'classici' },

  // ZANE GREY
  { id: 'riders-purple-sage', title: 'Riders of the Purple Sage', author: 'Zane Grey', gutenberg: 1300, category: 'avventura' },
  { id: 'rainbow-trail', title: 'The Rainbow Trail', author: 'Zane Grey', gutenberg: 1461, category: 'avventura' },
  { id: 'heritage-desert', title: 'The Heritage of the Desert', author: 'Zane Grey', gutenberg: 1246, category: 'avventura' },
  { id: 'desert-gold', title: 'Desert Gold', author: 'Zane Grey', gutenberg: 2087, category: 'avventura' },
  { id: 'lone-star-ranger', title: 'The Lone Star Ranger', author: 'Zane Grey', gutenberg: 1464, category: 'avventura' },
  { id: 'wildfire', title: 'Wildfire', author: 'Zane Grey', gutenberg: 2270, category: 'avventura' },
  { id: 'border-legion', title: 'The Border Legion', author: 'Zane Grey', gutenberg: 2369, category: 'avventura' },
  { id: 'up-trail', title: 'The U.P. Trail', author: 'Zane Grey', gutenberg: 5863, category: 'avventura' },

  // MAX BRAND
  { id: 'destry-rides-again', title: 'Destry Rides Again', author: 'Max Brand', gutenberg: 20688, category: 'avventura' },
  { id: 'untamed', title: 'The Untamed', author: 'Max Brand', gutenberg: 1998, category: 'avventura' },
  { id: 'night-horseman', title: 'The Night Horseman', author: 'Max Brand', gutenberg: 4034, category: 'avventura' },
  { id: 'seventh-man', title: 'The Seventh Man', author: 'Max Brand', gutenberg: 4653, category: 'avventura' },

  // ============================================
  // MORE POETRY COLLECTIONS
  // ============================================

  { id: 'spoon-river-anthology', title: 'Spoon River Anthology', author: 'Edgar Lee Masters', gutenberg: 1402, category: 'poesia' },
  { id: 'poems-emily-dickinson', title: 'Poems', author: 'Emily Dickinson', gutenberg: 12242, category: 'poesia' },
  { id: 'poems-emily-dickinson-2', title: 'Poems: Second Series', author: 'Emily Dickinson', gutenberg: 2679, category: 'poesia' },
  { id: 'poems-emily-dickinson-3', title: 'Poems: Third Series', author: 'Emily Dickinson', gutenberg: 2678, category: 'poesia' },
  { id: 'song-hiawatha', title: 'The Song of Hiawatha', author: 'Henry Wadsworth Longfellow', gutenberg: 19, category: 'poesia' },
  { id: 'evangeline', title: 'Evangeline', author: 'Henry Wadsworth Longfellow', gutenberg: 2039, category: 'poesia' },
  { id: 'tales-wayside-inn', title: 'Tales of a Wayside Inn', author: 'Henry Wadsworth Longfellow', gutenberg: 2719, category: 'poesia' },
  { id: 'snow-bound', title: 'Snow-Bound', author: 'John Greenleaf Whittier', gutenberg: 1268, category: 'poesia' },
  { id: 'poems-whittier', title: 'Poems', author: 'John Greenleaf Whittier', gutenberg: 9576, category: 'poesia' },
  { id: 'poems-poe', title: 'Poems', author: 'Edgar Allan Poe', gutenberg: 10031, category: 'poesia' },
  { id: 'complete-poems-poe', title: 'Complete Poetical Works', author: 'Edgar Allan Poe', gutenberg: 50893, category: 'poesia' },
  { id: 'complete-poems-robert-frost', title: 'Collected Poems', author: 'Robert Frost', gutenberg: 59824, category: 'poesia' },

  // ============================================
  // MORE WORLD FAIRY TALES
  // ============================================

  { id: 'brazilian-fairy-book', title: 'The Brazilian Fairy Book', author: 'Traditional', gutenberg: 25584, category: 'fiabe' },
  { id: 'jamaican-tales', title: 'Jamaican Tales', author: 'Traditional', gutenberg: 38765, category: 'fiabe' },
  { id: 'ukrainian-fairy-tales', title: 'Ukrainian Fairy Tales', author: 'Traditional', gutenberg: 44887, category: 'fiabe' },
  { id: 'polish-fairy-tales', title: 'Polish Fairy Tales', author: 'Traditional', gutenberg: 20692, category: 'fiabe' },
  { id: 'irish-fairy-tales', title: 'Irish Fairy Tales', author: 'James Stephens', gutenberg: 2892, category: 'fiabe' },
  { id: 'wonder-clock', title: 'The Wonder Clock', author: 'Howard Pyle', gutenberg: 17197, category: 'fiabe' },
  { id: 'pepper-salt', title: 'Pepper and Salt', author: 'Howard Pyle', gutenberg: 17196, category: 'fiabe' },
  { id: 'twilight-land', title: 'Twilight Land', author: 'Howard Pyle', gutenberg: 17198, category: 'fiabe' },
  { id: 'garden-paradise', title: 'The Garden of Paradise', author: 'Traditional', gutenberg: 19371, category: 'fiabe' },
  { id: 'norwegian-fairy-tales', title: 'Norwegian Fairy Tales', author: 'Traditional', gutenberg: 14155, category: 'fiabe' },
  { id: 'swedish-fairy-tales', title: 'Swedish Fairy Tales', author: 'Traditional', gutenberg: 31866, category: 'fiabe' },
  { id: 'dutch-fairy-tales', title: 'Dutch Fairy Tales', author: 'William E. Griffis', gutenberg: 9170, category: 'fiabe' },
  { id: 'swiss-fairy-tales', title: 'Swiss Fairy Tales', author: 'Traditional', gutenberg: 24764, category: 'fiabe' },
  { id: 'tales-far-north', title: 'Tales from the Far North', author: 'Traditional', gutenberg: 40899, category: 'fiabe' },

  // ============================================
  // FINAL ADDITIONS TO REACH 1000
  // ============================================

  // MORE CLASSIC NOVELS
  { id: 'tom-brown-schooldays', title: "Tom Brown's School Days", author: 'Thomas Hughes', gutenberg: 1480, category: 'classici' },
  { id: 'lorna-doone', title: 'Lorna Doone', author: 'R. D. Blackmore', gutenberg: 17460, category: 'classici' },
  { id: 'moonstone', title: 'The Moonstone', author: 'Wilkie Collins', gutenberg: 155, category: 'mistero' },
  { id: 'no-name', title: 'No Name', author: 'Wilkie Collins', gutenberg: 1438, category: 'classici' },
  { id: 'armadale', title: 'Armadale', author: 'Wilkie Collins', gutenberg: 1895, category: 'mistero' },

  // ADVENTURE CLASSICS
  { id: 'lost-horizon', title: 'Lost Horizon', author: 'James Hilton', gutenberg: 45023, category: 'avventura' },
  { id: 'captains-courageous', title: "Captains Courageous", author: 'Rudyard Kipling', gutenberg: 195, category: 'avventura' },
  { id: 'soldiers-three', title: 'Soldiers Three', author: 'Rudyard Kipling', gutenberg: 2135, category: 'avventura' },

  // CHILDREN'S LITERATURE ADDITIONS
  { id: 'princess-goblin', title: 'The Princess and the Goblin', author: 'George MacDonald', gutenberg: 709, category: 'fiabe' },
  { id: 'princess-curdie', title: 'The Princess and Curdie', author: 'George MacDonald', gutenberg: 708, category: 'fiabe' },
  { id: 'light-princess', title: 'The Light Princess', author: 'George MacDonald', gutenberg: 770, category: 'fiabe' },

  // SCIENCE & NATURE
  { id: 'origin-species', title: 'On the Origin of Species', author: 'Charles Darwin', gutenberg: 2009, category: 'scienza' },
  { id: 'voyage-beagle', title: 'The Voyage of the Beagle', author: 'Charles Darwin', gutenberg: 944, category: 'scienza' },
  { id: 'descent-man', title: 'The Descent of Man', author: 'Charles Darwin', gutenberg: 2300, category: 'scienza' },

  // FINAL PHILOSOPHY
  { id: 'critique-pure-reason', title: 'Critique of Pure Reason', author: 'Immanuel Kant', gutenberg: 4280, category: 'filosofia' },
  { id: 'confessions-augustine', title: 'Confessions', author: 'Saint Augustine', gutenberg: 3296, category: 'spiritualita' },
  { id: 'imitation-christ', title: 'The Imitation of Christ', author: 'Thomas à Kempis', gutenberg: 1653, category: 'spiritualita' },
]

// Export count
export const bookCount = books.length
