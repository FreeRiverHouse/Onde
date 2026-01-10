const Database = require('better-sqlite3');
const path = require('path');

const ONDE_ROOT = '/Users/mattia/Projects/Onde';
const DB_PATH = path.join(ONDE_ROOT, '.claude-memory', 'memories.db');

class OndeMemory {
  constructor() {
    this.db = new Database(DB_PATH);
  }

  storeIdea(content, category = 'idea', source = 'chat') {
    const date = new Date().toISOString().split('T')[0];
    const stmt = this.db.prepare(`
      INSERT INTO memories (content, category, source, date)
      VALUES (?, ?, ?, ?)
    `);
    const result = stmt.run(content, category, source, date);
    console.log(`[Memory] Stored idea #${result.lastInsertRowid}`);
    return result.lastInsertRowid;
  }

  storeHandoff(sessionId, yamlContent) {
    const stmt = this.db.prepare(`
      INSERT INTO handoffs (session_id, yaml_content)
      VALUES (?, ?)
    `);
    return stmt.run(sessionId, yamlContent);
  }

  search(query, limit = 10) {
    const stmt = this.db.prepare(`
      SELECT * FROM memories
      WHERE content LIKE ?
      ORDER BY created_at DESC
      LIMIT ?
    `);
    return stmt.all(`%${query}%`, limit);
  }

  getRecentIdeas(days = 7, limit = 50) {
    const stmt = this.db.prepare(`
      SELECT * FROM memories
      WHERE date >= date('now', '-' || ? || ' days')
      ORDER BY created_at DESC
      LIMIT ?
    `);
    return stmt.all(days, limit);
  }

  getIdeasByCategory(category) {
    const stmt = this.db.prepare(`
      SELECT * FROM memories
      WHERE category = ?
      ORDER BY created_at DESC
    `);
    return stmt.all(category);
  }

  close() {
    this.db.close();
  }
}

module.exports = OndeMemory;

// Test if run directly
if (require.main === module) {
  const memory = new OndeMemory();

  // Store test idea
  memory.storeIdea('Test idea from Continuous Claude', 'test', 'implementation');

  // Search
  const results = memory.search('Continuous');
  console.log('Search results:', results);

  memory.close();
}
