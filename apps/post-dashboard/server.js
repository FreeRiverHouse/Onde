const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3456;
const FEEDBACK_FILE = path.join(__dirname, 'feedback.json');
const POSTS_FILE = path.join(__dirname, 'posts.json');

// Initialize files if they don't exist
if (!fs.existsSync(FEEDBACK_FILE)) {
    fs.writeFileSync(FEEDBACK_FILE, JSON.stringify([], null, 2));
}

if (!fs.existsSync(POSTS_FILE)) {
    fs.writeFileSync(POSTS_FILE, JSON.stringify({
        posts: [
            {
                id: 1,
                room: 'freeriver',
                type: 'Video',
                content: `The mouse is moving by itself.\n\nSelecting categories. Filling forms. Clicking buttons.\n\nI'm just watching.`,
                video: 'IMG_4095.mov',
                status: 'pending',
                feedback: null
            },
            {
                id: 2,
                room: 'freeriver',
                type: 'Post',
                content: `Claude sees the screen, understands context, does the tedious stuff.\n\nI went to make coffee.`,
                status: 'pending',
                feedback: null
            },
            {
                id: 3,
                room: 'freeriver',
                type: 'Image Post',
                content: `Meanwhile we're making illustrated books.\n\nThe boring parts are automated.\nThe creative parts stay human.`,
                imageChoices: ['rondinella', 'paese', 'stella'],
                selectedImage: null,
                status: 'pending',
                feedback: null
            }
        ],
        lastUpdate: new Date().toISOString()
    }, null, 2));
}

// Telegram notification (optional)
async function sendTelegramNotification(message) {
    const TELEGRAM_TOKEN = '8272332520:AAF7zrKpqOCnFMqOlF1GJCLycJFk3IPO6ps';
    const CHAT_ID = '7505631979';

    try {
        const url = `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`;
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: CHAT_ID,
                text: message,
                parse_mode: 'HTML'
            })
        });
        return response.ok;
    } catch (e) {
        console.log('Telegram notification failed:', e.message);
        return false;
    }
}

const server = http.createServer(async (req, res) => {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    const url = new URL(req.url, `http://localhost:${PORT}`);

    // Serve static files
    if (req.method === 'GET' && (url.pathname === '/' || url.pathname === '/index.html')) {
        const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(html);
        return;
    }

    // Serve images
    if (req.method === 'GET' && url.pathname.startsWith('/images/')) {
        const imageName = url.pathname.replace('/images/', '');
        const imagePath = path.join(__dirname, '../../books/piccole-rime/images', imageName);

        if (fs.existsSync(imagePath)) {
            const ext = path.extname(imagePath).toLowerCase();
            const mimeTypes = { '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png' };
            res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' });
            res.end(fs.readFileSync(imagePath));
            return;
        }
    }

    // Get posts
    if (req.method === 'GET' && url.pathname === '/api/posts') {
        const data = JSON.parse(fs.readFileSync(POSTS_FILE, 'utf8'));
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(data));
        return;
    }

    // Get feedback (for Claude to read)
    if (req.method === 'GET' && url.pathname === '/api/feedback') {
        const data = JSON.parse(fs.readFileSync(FEEDBACK_FILE, 'utf8'));
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(data));
        return;
    }

    // Submit feedback
    if (req.method === 'POST' && url.pathname === '/api/feedback') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', async () => {
            try {
                const feedback = JSON.parse(body);
                feedback.timestamp = new Date().toISOString();
                feedback.read = false;

                // Save to feedback file
                const feedbacks = JSON.parse(fs.readFileSync(FEEDBACK_FILE, 'utf8'));
                feedbacks.push(feedback);
                fs.writeFileSync(FEEDBACK_FILE, JSON.stringify(feedbacks, null, 2));

                // Update post status
                const postsData = JSON.parse(fs.readFileSync(POSTS_FILE, 'utf8'));
                const post = postsData.posts.find(p => p.id === feedback.postId);
                if (post) {
                    post.feedback = feedback.text;
                    post.status = 'revision';
                    postsData.lastUpdate = new Date().toISOString();
                    fs.writeFileSync(POSTS_FILE, JSON.stringify(postsData, null, 2));
                }

                // Send Telegram notification
                await sendTelegramNotification(
                    `📝 <b>Dashboard Feedback</b>\n\n` +
                    `Post #${feedback.postId}\n` +
                    `<i>${feedback.text}</i>\n\n` +
                    `Room: ${feedback.room || 'freeriver'}`
                );

                console.log(`[${new Date().toLocaleTimeString()}] Feedback received for post #${feedback.postId}: "${feedback.text}"`);

                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: true, message: 'Feedback saved!' }));
            } catch (e) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: e.message }));
            }
        });
        return;
    }

    // Approve post
    if (req.method === 'POST' && url.pathname === '/api/approve') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', async () => {
            try {
                const { postId, selectedImage } = JSON.parse(body);

                const postsData = JSON.parse(fs.readFileSync(POSTS_FILE, 'utf8'));
                const post = postsData.posts.find(p => p.id === postId);
                if (post) {
                    post.status = 'approved';
                    if (selectedImage) post.selectedImage = selectedImage;
                    post.approvedAt = new Date().toISOString();
                    postsData.lastUpdate = new Date().toISOString();
                    fs.writeFileSync(POSTS_FILE, JSON.stringify(postsData, null, 2));
                }

                // Send Telegram notification
                await sendTelegramNotification(
                    `✅ <b>Post Approved!</b>\n\n` +
                    `Post #${postId}` +
                    (selectedImage ? `\nImage: ${selectedImage}` : '')
                );

                console.log(`[${new Date().toLocaleTimeString()}] Post #${postId} approved!`);

                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: true }));
            } catch (e) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: e.message }));
            }
        });
        return;
    }

    // Select image
    if (req.method === 'POST' && url.pathname === '/api/select-image') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            try {
                const { postId, imageId } = JSON.parse(body);

                const postsData = JSON.parse(fs.readFileSync(POSTS_FILE, 'utf8'));
                const post = postsData.posts.find(p => p.id === postId);
                if (post) {
                    post.selectedImage = imageId;
                    postsData.lastUpdate = new Date().toISOString();
                    fs.writeFileSync(POSTS_FILE, JSON.stringify(postsData, null, 2));
                }

                console.log(`[${new Date().toLocaleTimeString()}] Image selected for post #${postId}: ${imageId}`);

                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: true }));
            } catch (e) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: e.message }));
            }
        });
        return;
    }

    // 404
    res.writeHead(404);
    res.end('Not found');
});

server.listen(PORT, () => {
    console.log(`
╔════════════════════════════════════════════════════╗
║     🌊 Onde PR Dashboard Server                    ║
╠════════════════════════════════════════════════════╣
║  Dashboard: http://localhost:${PORT}                  ║
║  Feedback:  http://localhost:${PORT}/api/feedback     ║
║  Posts:     http://localhost:${PORT}/api/posts        ║
╠════════════════════════════════════════════════════╣
║  Files:                                            ║
║  - ${FEEDBACK_FILE}     ║
║  - ${POSTS_FILE}           ║
╚════════════════════════════════════════════════════╝
    `);
});
