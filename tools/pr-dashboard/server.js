const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3333;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Serve videos from piccole-rime
app.use('/videos', express.static(path.join(__dirname, '../../books/piccole-rime/videos')));
app.use('/images', express.static(path.join(__dirname, '../../books/piccole-rime/images')));

// Data file path
const POSTS_FILE = path.join(__dirname, 'data/posts.json');

// Get all posts
app.get('/api/posts', (req, res) => {
  try {
    const data = JSON.parse(fs.readFileSync(POSTS_FILE, 'utf8'));
    res.json(data);
  } catch (error) {
    res.json({ posts: [] });
  }
});

// Approve a post
app.post('/api/posts/:id/approve', (req, res) => {
  try {
    const data = JSON.parse(fs.readFileSync(POSTS_FILE, 'utf8'));
    const post = data.posts.find(p => p.id === req.params.id);
    if (post) {
      post.status = 'approved';
      post.approvedAt = new Date().toISOString();
      fs.writeFileSync(POSTS_FILE, JSON.stringify(data, null, 2));
      res.json({ success: true, post });
    } else {
      res.status(404).json({ error: 'Post not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Reject a post
app.post('/api/posts/:id/reject', (req, res) => {
  try {
    const data = JSON.parse(fs.readFileSync(POSTS_FILE, 'utf8'));
    const post = data.posts.find(p => p.id === req.params.id);
    if (post) {
      post.status = 'rejected';
      post.rejectedAt = new Date().toISOString();
      fs.writeFileSync(POSTS_FILE, JSON.stringify(data, null, 2));
      res.json({ success: true, post });
    } else {
      res.status(404).json({ error: 'Post not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add new post
app.post('/api/posts', (req, res) => {
  try {
    let data = { posts: [] };
    try {
      data = JSON.parse(fs.readFileSync(POSTS_FILE, 'utf8'));
    } catch (e) {}

    const newPost = {
      id: `post_${Date.now()}`,
      ...req.body,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    data.posts.push(newPost);
    fs.writeFileSync(POSTS_FILE, JSON.stringify(data, null, 2));
    res.json({ success: true, post: newPost });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Feedback system
const FEEDBACK_FILE = path.join(__dirname, 'data/feedback.json');

// Get feedback
app.get('/api/feedback', (req, res) => {
  try {
    const data = JSON.parse(fs.readFileSync(FEEDBACK_FILE, 'utf8'));
    res.json(data);
  } catch (error) {
    res.json({ feedback: [], generalNotes: '' });
  }
});

// Add feedback for a post
app.post('/api/feedback/:postId', (req, res) => {
  try {
    let data = { feedback: [], generalNotes: '' };
    try {
      data = JSON.parse(fs.readFileSync(FEEDBACK_FILE, 'utf8'));
    } catch (e) {}

    const newFeedback = {
      postId: req.params.postId,
      date: new Date().toISOString(),
      status: req.body.status || 'note',
      note: req.body.note || ''
    };
    data.feedback.push(newFeedback);
    fs.writeFileSync(FEEDBACK_FILE, JSON.stringify(data, null, 2));
    res.json({ success: true, feedback: newFeedback });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update general notes
app.post('/api/feedback/general', (req, res) => {
  try {
    let data = { feedback: [], generalNotes: '' };
    try {
      data = JSON.parse(fs.readFileSync(FEEDBACK_FILE, 'utf8'));
    } catch (e) {}

    data.generalNotes = req.body.notes || '';
    data.lastUpdated = new Date().toISOString();
    fs.writeFileSync(FEEDBACK_FILE, JSON.stringify(data, null, 2));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`
  =============================================
     ONDE PR DASHBOARD
     Museum-style content approval system
  =============================================

  Dashboard: http://localhost:${PORT}

  Ready for content approval!
  `);
});
