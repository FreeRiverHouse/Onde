/**
 * 🎮 OndeGamer SDK v1.0.0
 * Sistema username leggero per giochi su onde.la
 * 
 * Uso (HTML statico):
 *   <script src="/static-games/onde-gamer.js"></script>
 *   <script>
 *     OndeGamer.init({ gameId: 'my-game' });
 *     const profile = OndeGamer.getProfile();
 *   </script>
 * 
 * Uso (ES Module):
 *   import { OndeGamer } from '/static-games/onde-gamer.js';
 * 
 * Zero dependencies. < 10KB. Kid-friendly UI.
 */

;(function(root, factory) {
  // UMD: works as <script>, CommonJS, or ESM
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.OndeGamer = factory();
  }
}(typeof self !== 'undefined' ? self : this, function() {
  'use strict';

  // ==================== CONSTANTS ====================
  const STORAGE_KEYS = {
    IDENTITY: 'onde-gamer-identity',
    STATS: 'onde-gamer-stats',
    PROGRESS_PREFIX: 'onde-gamer-progress-',
  };

  const DEFAULT_AVATARS = ['🐰', '🦊', '🐱', '🐶', '🦄', '🐸', '🐼', '🦁', '🐧', '🐙', '🦋', '🐢', '🦉', '🐬', '🌟', '🚀'];

  const MAX_USERNAME_LENGTH = 20;
  const MIN_USERNAME_LENGTH = 2;

  // ==================== UTILITIES ====================

  function generateId() {
    // Short-ish unique ID: g_ + 8 hex chars
    var arr = new Uint8Array(4);
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
      crypto.getRandomValues(arr);
    } else {
      for (var i = 0; i < 4; i++) arr[i] = Math.floor(Math.random() * 256);
    }
    return 'g_' + Array.from(arr).map(function(b) { return b.toString(16).padStart(2, '0'); }).join('');
  }

  function randomAvatar() {
    return DEFAULT_AVATARS[Math.floor(Math.random() * DEFAULT_AVATARS.length)];
  }

  function safeGet(key) {
    try {
      var val = localStorage.getItem(key);
      return val ? JSON.parse(val) : null;
    } catch(e) {
      return null;
    }
  }

  function safeSet(key, data) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
      return true;
    } catch(e) {
      return false;
    }
  }

  function sanitizeUsername(name) {
    if (!name || typeof name !== 'string') return null;
    // Strip HTML, trim, enforce length
    var clean = name.replace(/<[^>]*>/g, '').replace(/[<>"'&]/g, '').trim();
    if (clean.length < MIN_USERNAME_LENGTH) return null;
    if (clean.length > MAX_USERNAME_LENGTH) clean = clean.substring(0, MAX_USERNAME_LENGTH);
    return clean;
  }

  // ==================== IDENTITY ====================

  var _identity = null;
  var _currentGameId = null;
  var _sessionStartTime = null;
  var _badgeElement = null;
  var _initialized = false;

  function ensureIdentity() {
    if (_identity) return _identity;
    _identity = safeGet(STORAGE_KEYS.IDENTITY);
    if (!_identity) {
      _identity = {
        id: generateId(),
        username: null,
        avatar: randomAvatar(),
        createdAt: new Date().toISOString(),
        lastSeen: new Date().toISOString(),
      };
      safeSet(STORAGE_KEYS.IDENTITY, _identity);
    }
    // Update lastSeen
    _identity.lastSeen = new Date().toISOString();
    safeSet(STORAGE_KEYS.IDENTITY, _identity);
    return _identity;
  }

  // ==================== STATS ====================

  function getStats() {
    return safeGet(STORAGE_KEYS.STATS) || {
      totalSessions: 0,
      totalPlaytimeMs: 0,
      gamesPlayed: {},
      firstPlayed: null,
      lastPlayed: null,
    };
  }

  function saveStats(stats) {
    safeSet(STORAGE_KEYS.STATS, stats);
  }

  // ==================== CSS STYLES ====================

  function getStyles() {
    return '\n' +
    '.onde-gamer-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.7); z-index: 99999; display: flex; align-items: center; justify-content: center; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; animation: ondeGamerFadeIn 0.3s ease; }' +
    '@keyframes ondeGamerFadeIn { from { opacity: 0; } to { opacity: 1; } }' +
    '@keyframes ondeGamerSlideUp { from { transform: translateY(30px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }' +
    '.onde-gamer-modal { background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%); border-radius: 20px; padding: 32px; max-width: 380px; width: 90%; box-shadow: 0 25px 50px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.1); animation: ondeGamerSlideUp 0.4s ease; color: white; text-align: center; }' +
    '.onde-gamer-modal h2 { margin: 0 0 8px 0; font-size: 22px; font-weight: 700; }' +
    '.onde-gamer-modal .subtitle { color: rgba(255,255,255,0.6); font-size: 14px; margin: 0 0 24px 0; }' +
    '.onde-gamer-input { width: 100%; box-sizing: border-box; padding: 14px 16px; border: 2px solid rgba(255,255,255,0.15); border-radius: 12px; background: rgba(255,255,255,0.08); color: white; font-size: 18px; text-align: center; outline: none; transition: border-color 0.2s; }' +
    '.onde-gamer-input:focus { border-color: #00d2d3; }' +
    '.onde-gamer-input::placeholder { color: rgba(255,255,255,0.3); }' +
    '.onde-gamer-avatars { display: flex; flex-wrap: wrap; justify-content: center; gap: 8px; margin: 20px 0; }' +
    '.onde-gamer-avatar-btn { width: 44px; height: 44px; border-radius: 50%; border: 2px solid rgba(255,255,255,0.15); background: rgba(255,255,255,0.05); font-size: 22px; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; justify-content: center; }' +
    '.onde-gamer-avatar-btn:hover { transform: scale(1.15); border-color: rgba(255,255,255,0.4); }' +
    '.onde-gamer-avatar-btn.selected { border-color: #00d2d3; background: rgba(0,210,211,0.15); transform: scale(1.15); box-shadow: 0 0 12px rgba(0,210,211,0.3); }' +
    '.onde-gamer-buttons { display: flex; gap: 12px; margin-top: 24px; }' +
    '.onde-gamer-btn { flex: 1; padding: 14px 20px; border: none; border-radius: 12px; font-size: 16px; font-weight: 600; cursor: pointer; transition: all 0.2s; }' +
    '.onde-gamer-btn-primary { background: linear-gradient(135deg, #00d2d3, #0abde3); color: #1a1a2e; }' +
    '.onde-gamer-btn-primary:hover { transform: translateY(-2px); box-shadow: 0 5px 15px rgba(0,210,211,0.4); }' +
    '.onde-gamer-btn-secondary { background: rgba(255,255,255,0.1); color: rgba(255,255,255,0.7); }' +
    '.onde-gamer-btn-secondary:hover { background: rgba(255,255,255,0.15); color: white; }' +
    '.onde-gamer-badge { position: fixed; top: 12px; right: 12px; z-index: 99990; background: linear-gradient(135deg, #1a1a2e, #16213e); border: 1px solid rgba(255,255,255,0.15); border-radius: 50px; padding: 6px 14px 6px 8px; display: flex; align-items: center; gap: 8px; cursor: pointer; transition: all 0.3s; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; box-shadow: 0 4px 12px rgba(0,0,0,0.3); }' +
    '.onde-gamer-badge:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(0,0,0,0.4); border-color: #00d2d3; }' +
    '.onde-gamer-badge .avatar { font-size: 20px; }' +
    '.onde-gamer-badge .name { color: white; font-size: 13px; font-weight: 600; max-width: 120px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }' +
    '.onde-gamer-badge .anonymous { color: rgba(255,255,255,0.5); font-style: italic; }' +
    '.onde-gamer-error { color: #ff6b6b; font-size: 13px; margin-top: 8px; min-height: 20px; }' +
    '';
  }

  var _styleInjected = false;
  function injectStyles() {
    if (_styleInjected) return;
    var style = document.createElement('style');
    style.id = 'onde-gamer-styles';
    style.textContent = getStyles();
    document.head.appendChild(style);
    _styleInjected = true;
  }

  // ==================== UI: USERNAME PROMPT ====================

  function showUsernamePrompt(options) {
    options = options || {};
    injectStyles();

    return new Promise(function(resolve) {
      var identity = ensureIdentity();
      var selectedAvatar = identity.avatar || randomAvatar();
      var overlay = document.createElement('div');
      overlay.className = 'onde-gamer-overlay';

      var modal = document.createElement('div');
      modal.className = 'onde-gamer-modal';

      var title = options.title || '🎮 Come ti chiami?';
      var subtitle = options.subtitle || 'Scegli un nome e un avatar per giocare!';
      var playText = options.playText || 'Gioca! 🚀';
      var skipText = options.skipText || 'Dopo';

      modal.innerHTML = 
        '<h2>' + title + '</h2>' +
        '<p class="subtitle">' + subtitle + '</p>' +
        '<input class="onde-gamer-input" type="text" placeholder="Il tuo nome..." maxlength="' + MAX_USERNAME_LENGTH + '" value="' + (identity.username || '') + '" autocomplete="off" spellcheck="false" />' +
        '<div class="onde-gamer-error" id="onde-gamer-error"></div>' +
        '<div class="onde-gamer-avatars" id="onde-gamer-avatars"></div>' +
        '<div class="onde-gamer-buttons">' +
        '  <button class="onde-gamer-btn onde-gamer-btn-secondary" id="onde-gamer-skip">' + skipText + '</button>' +
        '  <button class="onde-gamer-btn onde-gamer-btn-primary" id="onde-gamer-play">' + playText + '</button>' +
        '</div>';

      overlay.appendChild(modal);
      document.body.appendChild(overlay);

      // Render avatar picker
      var avatarContainer = modal.querySelector('#onde-gamer-avatars');
      DEFAULT_AVATARS.forEach(function(emoji) {
        var btn = document.createElement('button');
        btn.className = 'onde-gamer-avatar-btn' + (emoji === selectedAvatar ? ' selected' : '');
        btn.textContent = emoji;
        btn.type = 'button';
        btn.addEventListener('click', function() {
          selectedAvatar = emoji;
          avatarContainer.querySelectorAll('.onde-gamer-avatar-btn').forEach(function(b) {
            b.classList.remove('selected');
          });
          btn.classList.add('selected');
        });
        avatarContainer.appendChild(btn);
      });

      var input = modal.querySelector('.onde-gamer-input');
      var errorEl = modal.querySelector('#onde-gamer-error');

      function cleanup() {
        if (overlay.parentNode) {
          overlay.style.opacity = '0';
          overlay.style.transition = 'opacity 0.2s';
          setTimeout(function() {
            if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
          }, 200);
        }
      }

      function confirm() {
        var raw = input.value;
        var clean = sanitizeUsername(raw);
        if (raw.trim() && !clean) {
          errorEl.textContent = 'Nome troppo corto (min ' + MIN_USERNAME_LENGTH + ' caratteri)';
          input.focus();
          return;
        }
        // Save
        identity.username = clean;
        identity.avatar = selectedAvatar;
        _identity = identity;
        safeSet(STORAGE_KEYS.IDENTITY, identity);
        updateBadge();
        cleanup();
        resolve(clean);
      }

      function skip() {
        // Still save avatar choice
        identity.avatar = selectedAvatar;
        _identity = identity;
        safeSet(STORAGE_KEYS.IDENTITY, identity);
        updateBadge();
        cleanup();
        resolve(null);
      }

      modal.querySelector('#onde-gamer-play').addEventListener('click', confirm);
      modal.querySelector('#onde-gamer-skip').addEventListener('click', skip);

      // Enter to confirm
      input.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') confirm();
        errorEl.textContent = '';
      });

      // Click outside to skip (if not forced)
      if (!options.required) {
        overlay.addEventListener('click', function(e) {
          if (e.target === overlay) skip();
        });
      }

      // Focus input
      setTimeout(function() { input.focus(); }, 100);
    });
  }

  // ==================== UI: PROFILE BADGE ====================

  function showProfileBadge(container) {
    injectStyles();
    var identity = ensureIdentity();

    // Remove existing badge
    hideProfileBadge();

    var badge = document.createElement('div');
    badge.className = 'onde-gamer-badge';
    badge.id = 'onde-gamer-badge';

    updateBadgeContent(badge, identity);

    badge.addEventListener('click', function() {
      showUsernamePrompt();
    });

    if (container) {
      // Relative positioning in container
      badge.style.position = 'relative';
      badge.style.top = 'auto';
      badge.style.right = 'auto';
      container.appendChild(badge);
    } else {
      document.body.appendChild(badge);
    }

    _badgeElement = badge;
    return badge;
  }

  function updateBadgeContent(badge, identity) {
    badge.innerHTML = 
      '<span class="avatar">' + (identity.avatar || '🎮') + '</span>' +
      '<span class="name ' + (!identity.username ? 'anonymous' : '') + '">' +
      (identity.username || 'Giocatore') +
      '</span>';
  }

  function updateBadge() {
    if (!_badgeElement) return;
    var identity = ensureIdentity();
    updateBadgeContent(_badgeElement, identity);
  }

  function hideProfileBadge() {
    var existing = document.getElementById('onde-gamer-badge');
    if (existing) existing.parentNode.removeChild(existing);
    _badgeElement = null;
  }

  // ==================== PUBLIC API ====================

  var OndeGamer = {
    /**
     * Initialize the SDK. Call once per page.
     * @param {Object} options - { gameId: string, showBadge?: boolean, autoPrompt?: boolean }
     */
    init: function(options) {
      options = options || {};
      _currentGameId = options.gameId || null;
      ensureIdentity();

      if (_currentGameId) {
        this.startSession(_currentGameId);
      }

      // Auto-show badge unless disabled
      if (options.showBadge !== false) {
        if (document.readyState === 'loading') {
          document.addEventListener('DOMContentLoaded', function() {
            showProfileBadge(options.badgeContainer || null);
          });
        } else {
          showProfileBadge(options.badgeContainer || null);
        }
      }

      // Auto-prompt for username on first visit (if enabled)
      if (options.autoPrompt && !_identity.username) {
        var promptFn = function() {
          showUsernamePrompt(options.promptOptions || {});
        };
        if (document.readyState === 'loading') {
          document.addEventListener('DOMContentLoaded', function() {
            setTimeout(promptFn, 1000);
          });
        } else {
          setTimeout(promptFn, 1000);
        }
      }

      _initialized = true;
    },

    // === IDENTITY ===

    getId: function() {
      return ensureIdentity().id;
    },

    getUsername: function() {
      return ensureIdentity().username;
    },

    setUsername: function(name) {
      var identity = ensureIdentity();
      identity.username = sanitizeUsername(name);
      _identity = identity;
      safeSet(STORAGE_KEYS.IDENTITY, identity);
      updateBadge();
    },

    getAvatar: function() {
      return ensureIdentity().avatar;
    },

    setAvatar: function(emoji) {
      var identity = ensureIdentity();
      identity.avatar = emoji;
      _identity = identity;
      safeSet(STORAGE_KEYS.IDENTITY, identity);
      updateBadge();
    },

    getProfile: function() {
      var identity = ensureIdentity();
      var stats = getStats();
      return {
        id: identity.id,
        username: identity.username,
        avatar: identity.avatar,
        createdAt: identity.createdAt,
        lastSeen: identity.lastSeen,
        stats: stats,
      };
    },

    // === UI ===

    promptUsername: showUsernamePrompt,
    showProfileBadge: showProfileBadge,
    hideProfileBadge: hideProfileBadge,

    // === PROGRESS (per-game) ===

    /**
     * Save progress for a game
     * @param {string} gameId 
     * @param {Object} data - any JSON-serializable object
     */
    save: function(gameId, data) {
      gameId = gameId || _currentGameId;
      if (!gameId) { console.warn('[OndeGamer] No gameId specified'); return; }
      var key = STORAGE_KEYS.PROGRESS_PREFIX + gameId;
      var wrapped = {
        data: data,
        savedAt: new Date().toISOString(),
        gamerId: ensureIdentity().id,
      };
      safeSet(key, wrapped);
    },

    /**
     * Load progress for a game
     * @param {string} gameId 
     * @returns {Object|null}
     */
    load: function(gameId) {
      gameId = gameId || _currentGameId;
      if (!gameId) return null;
      var key = STORAGE_KEYS.PROGRESS_PREFIX + gameId;
      var wrapped = safeGet(key);
      return wrapped ? wrapped.data : null;
    },

    /**
     * Clear progress for a game
     * @param {string} gameId 
     */
    clear: function(gameId) {
      gameId = gameId || _currentGameId;
      if (!gameId) return;
      try {
        localStorage.removeItem(STORAGE_KEYS.PROGRESS_PREFIX + gameId);
      } catch(e) {}
    },

    // === STATS (cross-game) ===

    getStats: getStats,

    /**
     * Start a game session (tracks playtime and session count)
     * @param {string} gameId 
     */
    startSession: function(gameId) {
      gameId = gameId || _currentGameId;
      if (!gameId) return;

      _sessionStartTime = Date.now();
      var stats = getStats();
      stats.totalSessions = (stats.totalSessions || 0) + 1;
      stats.lastPlayed = new Date().toISOString();
      if (!stats.firstPlayed) stats.firstPlayed = stats.lastPlayed;

      if (!stats.gamesPlayed) stats.gamesPlayed = {};
      if (!stats.gamesPlayed[gameId]) {
        stats.gamesPlayed[gameId] = { sessions: 0, totalPlaytimeMs: 0, firstPlayed: stats.lastPlayed };
      }
      stats.gamesPlayed[gameId].sessions++;
      stats.gamesPlayed[gameId].lastPlayed = stats.lastPlayed;

      saveStats(stats);

      // Auto end session on page unload
      var self = this;
      window.addEventListener('beforeunload', function() {
        self.endSession(gameId);
      });
    },

    /**
     * End a game session (calculates playtime)
     * @param {string} gameId 
     */
    endSession: function(gameId) {
      gameId = gameId || _currentGameId;
      if (!gameId || !_sessionStartTime) return;

      var duration = Date.now() - _sessionStartTime;
      _sessionStartTime = null;

      var stats = getStats();
      stats.totalPlaytimeMs = (stats.totalPlaytimeMs || 0) + duration;
      if (stats.gamesPlayed && stats.gamesPlayed[gameId]) {
        stats.gamesPlayed[gameId].totalPlaytimeMs = (stats.gamesPlayed[gameId].totalPlaytimeMs || 0) + duration;
      }
      saveStats(stats);
    },

    // === LEGACY COMPATIBILITY ===
    // Read existing localStorage keys from games that predate the SDK

    /**
     * Read existing game saves (for migration/dashboard)
     * @returns {Object} map of detected game saves
     */
    detectExistingSaves: function() {
      var detected = {};
      
      // Moonlight Magic House
      var moonlight = safeGet('moonlight-house-save');
      if (moonlight) {
        detected['moonlight-magic-house'] = {
          petName: moonlight.petName,
          level: moonlight.stats ? Math.floor((moonlight.gameState || {}).dayCount / 3) : 0,
          coins: moonlight.stats ? moonlight.stats.coins : 0,
          achievements: (moonlight.achievements || []).filter(function(a) { return a.unlocked; }).length,
          totalVisits: moonlight.totalVisits || 0,
          savedAt: moonlight.savedAt,
        };
      }

      // Skin Creator
      var skins = safeGet('minecraft-my-skins');
      var skinAchievements = safeGet('skin-creator-achievements');
      if (skins || skinAchievements) {
        detected['skin-creator'] = {
          skinsCreated: skins ? skins.length : 0,
          achievements: skinAchievements ? Object.keys(skinAchievements).length : 0,
        };
      }

      // Science Lab
      var scienceLab = safeGet('scienceLab_discovered');
      if (scienceLab) {
        detected['science-lab'] = { discovered: scienceLab.length };
      }

      // Code Builder
      var codeBuilder = safeGet('codeBuilder_completed');
      if (codeBuilder) {
        detected['code-builder'] = { completed: codeBuilder.length };
      }

      // Story Creator
      var stories = safeGet('storyCreator_stories');
      if (stories) {
        detected['story-creator'] = { storiesCreated: stories.length };
      }

      // Ocean Explorer
      var ocean = safeGet('oceanExplorer_discovered');
      if (ocean) {
        detected['ocean-explorer'] = { discovered: ocean.length };
      }

      return detected;
    },

    // === VERSION ===
    version: '1.0.0',

    // === CONSTANTS (exposed for testing) ===
    AVATARS: DEFAULT_AVATARS,
  };

  // Export for ESM
  if (typeof exports === 'object') {
    exports.OndeGamer = OndeGamer;
  }

  return OndeGamer;
}));
