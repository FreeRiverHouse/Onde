// Database module - disabled for static Gutenberg catalog
// Will be re-enabled when we add user authentication

export function getDb() {
  return null
}

export function getBooks() {
  return []
}

export function getBook(_id: string) {
  return null
}

export function getUserPurchases(_userId: number) {
  return []
}
