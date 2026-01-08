"use strict";
/**
 * Agent Queue - Sistema centrale per gestire lo stato degli agenti
 * Usato da: Dashboard Kanban + Telegram Bot
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.onTaskBlocked = onTaskBlocked;
exports.getAllTasks = getAllTasks;
exports.getTasksByStatus = getTasksByStatus;
exports.getBlockedTasks = getBlockedTasks;
exports.getTask = getTask;
exports.addTask = addTask;
exports.updateTask = updateTask;
exports.approveTask = approveTask;
exports.blockTask = blockTask;
exports.completeTask = completeTask;
exports.deleteTask = deleteTask;
exports.resetTasks = resetTasks;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
// Path per persistenza
const DATA_FILE = path.join(__dirname, '../data/tasks.json');
// Ensure data directory exists
const dataDir = path.dirname(DATA_FILE);
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}
// Load tasks from file
function loadTasks() {
    if (fs.existsSync(DATA_FILE)) {
        const data = fs.readFileSync(DATA_FILE, 'utf-8');
        return JSON.parse(data);
    }
    return getDefaultTasks();
}
// Save tasks to file
function saveTasks(tasks) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(tasks, null, 2));
}
// Default tasks
function getDefaultTasks() {
    const now = new Date().toISOString();
    return [
        {
            id: '1',
            agentName: 'Claude Code',
            agentType: 'claude',
            task: 'Implementare sistema approvazione',
            status: 'in_progress',
            startedAt: now,
            priority: 'high',
            createdAt: now,
            updatedAt: now,
        },
        {
            id: '2',
            agentName: 'Grok',
            agentType: 'grok',
            task: 'Generare immagini Pina Pennello',
            status: 'todo',
            priority: 'high',
            createdAt: now,
            updatedAt: now,
        },
        {
            id: '3',
            agentName: 'PR Agent',
            agentType: 'pr',
            task: 'Schedulare post @Onde_FRH',
            status: 'blocked',
            blockedReason: 'In attesa approvazione contenuto',
            priority: 'high',
            createdAt: now,
            updatedAt: now,
        },
        {
            id: '4',
            agentName: 'Gianni Parola',
            agentType: 'gianni',
            task: 'Revisione capitolo 3 AIKO',
            status: 'todo',
            priority: 'medium',
            createdAt: now,
            updatedAt: now,
        },
        {
            id: '5',
            agentName: 'Pina Pennello',
            agentType: 'pina',
            task: 'Illustrazioni Antologia Poesia',
            status: 'blocked',
            blockedReason: 'Stile visivo non ancora definito',
            priority: 'high',
            createdAt: now,
            updatedAt: now,
        },
    ];
}
// In-memory cache
let tasks = loadTasks();
const blockedCallbacks = [];
function onTaskBlocked(callback) {
    blockedCallbacks.push(callback);
}
function notifyBlocked(task) {
    blockedCallbacks.forEach(cb => cb(task));
}
// API
function getAllTasks() {
    return tasks;
}
function getTasksByStatus(status) {
    return tasks.filter(t => t.status === status);
}
function getBlockedTasks() {
    return tasks.filter(t => t.status === 'blocked');
}
function getTask(id) {
    return tasks.find(t => t.id === id);
}
function addTask(task) {
    const now = new Date().toISOString();
    const newTask = {
        ...task,
        id: Date.now().toString(),
        createdAt: now,
        updatedAt: now,
    };
    tasks.push(newTask);
    saveTasks(tasks);
    if (newTask.status === 'blocked') {
        notifyBlocked(newTask);
    }
    return newTask;
}
function updateTask(id, updates) {
    const index = tasks.findIndex(t => t.id === id);
    if (index === -1)
        return null;
    const wasBlocked = tasks[index].status === 'blocked';
    tasks[index] = {
        ...tasks[index],
        ...updates,
        updatedAt: new Date().toISOString(),
    };
    saveTasks(tasks);
    // Notify if newly blocked
    if (!wasBlocked && tasks[index].status === 'blocked') {
        notifyBlocked(tasks[index]);
    }
    return tasks[index];
}
function approveTask(id) {
    return updateTask(id, {
        status: 'in_progress',
        blockedReason: undefined,
        startedAt: new Date().toISOString(),
    });
}
function blockTask(id, reason) {
    return updateTask(id, {
        status: 'blocked',
        blockedReason: reason,
    });
}
function completeTask(id) {
    return updateTask(id, {
        status: 'done',
        blockedReason: undefined,
        completedAt: new Date().toISOString(),
    });
}
function deleteTask(id) {
    const index = tasks.findIndex(t => t.id === id);
    if (index === -1)
        return false;
    tasks.splice(index, 1);
    saveTasks(tasks);
    return true;
}
// Reset to defaults (useful for testing)
function resetTasks() {
    tasks = getDefaultTasks();
    saveTasks(tasks);
}
