/**
 * Agent Queue API Server
 * Espone REST API per Dashboard e altri client
 */

import * as http from 'http';
import * as url from 'url';
import * as agentQueue from './index';

const PORT = process.env.AGENT_QUEUE_PORT || 3002;

function sendJson(res: http.ServerResponse, data: any, status = 200) {
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  });
  res.end(JSON.stringify(data));
}

function parseBody(req: http.IncomingMessage): Promise<any> {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (e) {
        resolve({});
      }
    });
    req.on('error', reject);
  });
}

const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url || '', true);
  const path = parsedUrl.pathname || '/';
  const method = req.method || 'GET';

  // CORS preflight
  if (method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    });
    res.end();
    return;
  }

  try {
    // GET /tasks - Get all tasks
    if (path === '/tasks' && method === 'GET') {
      const tasks = agentQueue.getAllTasks();
      sendJson(res, { tasks });
      return;
    }

    // GET /tasks/blocked - Get blocked tasks
    if (path === '/tasks/blocked' && method === 'GET') {
      const tasks = agentQueue.getBlockedTasks();
      sendJson(res, { tasks });
      return;
    }

    // GET /tasks/:id - Get single task
    const taskMatch = path.match(/^\/tasks\/(\d+)$/);
    if (taskMatch && method === 'GET') {
      const task = agentQueue.getTask(taskMatch[1]);
      if (task) {
        sendJson(res, { task });
      } else {
        sendJson(res, { error: 'Task not found' }, 404);
      }
      return;
    }

    // POST /tasks - Create task
    if (path === '/tasks' && method === 'POST') {
      const body = await parseBody(req);
      const task = agentQueue.addTask(body);
      sendJson(res, { task }, 201);
      return;
    }

    // PUT /tasks/:id - Update task
    if (taskMatch && method === 'PUT') {
      const body = await parseBody(req);
      const task = agentQueue.updateTask(taskMatch[1], body);
      if (task) {
        sendJson(res, { task });
      } else {
        sendJson(res, { error: 'Task not found' }, 404);
      }
      return;
    }

    // POST /tasks/:id/approve - Approve task
    const approveMatch = path.match(/^\/tasks\/(\d+)\/approve$/);
    if (approveMatch && method === 'POST') {
      const task = agentQueue.approveTask(approveMatch[1]);
      if (task) {
        sendJson(res, { task, message: `${task.agentName} sbloccato` });
      } else {
        sendJson(res, { error: 'Task not found' }, 404);
      }
      return;
    }

    // POST /tasks/:id/block - Block task
    const blockMatch = path.match(/^\/tasks\/(\d+)\/block$/);
    if (blockMatch && method === 'POST') {
      const body = await parseBody(req);
      const task = agentQueue.blockTask(blockMatch[1], body.reason || 'Bloccato');
      if (task) {
        sendJson(res, { task });
      } else {
        sendJson(res, { error: 'Task not found' }, 404);
      }
      return;
    }

    // POST /tasks/:id/complete - Complete task
    const completeMatch = path.match(/^\/tasks\/(\d+)\/complete$/);
    if (completeMatch && method === 'POST') {
      const task = agentQueue.completeTask(completeMatch[1]);
      if (task) {
        sendJson(res, { task });
      } else {
        sendJson(res, { error: 'Task not found' }, 404);
      }
      return;
    }

    // DELETE /tasks/:id - Delete task
    if (taskMatch && method === 'DELETE') {
      const success = agentQueue.deleteTask(taskMatch[1]);
      if (success) {
        sendJson(res, { success: true });
      } else {
        sendJson(res, { error: 'Task not found' }, 404);
      }
      return;
    }

    // Health check
    if (path === '/health') {
      sendJson(res, { status: 'ok', timestamp: new Date().toISOString() });
      return;
    }

    // 404
    sendJson(res, { error: 'Not found' }, 404);

  } catch (error: any) {
    console.error('Error:', error);
    sendJson(res, { error: error.message }, 500);
  }
});

server.listen(PORT, () => {
  console.log(`🚀 Agent Queue API running on http://localhost:${PORT}`);
  console.log('   Endpoints:');
  console.log('   GET  /tasks         - List all tasks');
  console.log('   GET  /tasks/blocked - List blocked tasks');
  console.log('   POST /tasks/:id/approve - Approve/unblock task');
  console.log('   POST /tasks/:id/block   - Block task');
});

export { server };
