export interface Book {
  id: string;
  title: string;
  author: string;
  description: string;
  coverUrl: string;
  epubPath: string;
  price: number; // in cents (30 = €0.30)
  isFree: boolean;
  language: string;
  category: string;
  publishedAt: string;
  isPurchased: boolean;
}

export interface ReadingProgress {
  bookId: string;
  currentPage: number;
  totalPages: number;
  lastReadAt: string;
}
