const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3456;

app.use(express.json());
app.use(express.static('public'));
app.use('/images', express.static(path.join(__dirname, 'images')));

// Store approval state
const dataFile = path.join(__dirname, 'approvals.json');

function loadData() {
  if (fs.existsSync(dataFile)) {
    return JSON.parse(fs.readFileSync(dataFile, 'utf8'));
  }
  return { items: [] };
}

function saveData(data) {
  fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));
}

// Get all items
app.get('/api/items', (req, res) => {
  const data = loadData();
  res.json(data.items);
});

// Add new item
app.post('/api/items', (req, res) => {
  const data = loadData();
  const item = {
    id: Date.now(),
    title: req.body.title,
    description: req.body.description,
    prompt: req.body.prompt,
    image: req.body.image,
    status: 'pending',
    comment: '',
    createdAt: new Date().toISOString()
  };
  data.items.push(item);
  saveData(data);
  res.json(item);
});

// Update item status
app.patch('/api/items/:id', (req, res) => {
  const data = loadData();
  const item = data.items.find(i => i.id === parseInt(req.params.id));
  if (item) {
    if (req.body.status) item.status = req.body.status;
    if (req.body.comment !== undefined) item.comment = req.body.comment;
    saveData(data);
    res.json(item);
  } else {
    res.status(404).json({ error: 'Item not found' });
  }
});

// Delete item
app.delete('/api/items/:id', (req, res) => {
  const data = loadData();
  data.items = data.items.filter(i => i.id !== parseInt(req.params.id));
  saveData(data);
  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log(`Approval Dashboard running at http://localhost:${PORT}`);
});
