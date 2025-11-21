// Simple Node.js server to save test results
// Run with: node server/save-results-server.js

const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3001;

// Enable CORS for local development
app.use(cors());
app.use(express.json());

// Directory to store test results
const RESULTS_DIR = path.join(__dirname, '..', 'test-results');

// Ensure directory exists
if (!fs.existsSync(RESULTS_DIR)) {
  fs.mkdirSync(RESULTS_DIR, { recursive: true });
}

app.post('/api/save-results', (req, res) => {
  try {
    const results = req.body;
    
    if (!Array.isArray(results) || results.length === 0) {
      return res.status(400).json({ error: 'Invalid data' });
    }

    const sessionId = results[0].session_id;
    const userId = results[0].user_id;
    const timestamp = new Date().toISOString().split('T')[0];
    
    // Save as CSV
    const csvPath = path.join(RESULTS_DIR, `results_${userId}_${sessionId}_${timestamp}.csv`);
    const headers = 'session_id,timestamp,user_id,task_id,selected_option,is_correct\n';
    const rows = results.map((r) => 
      `"${r.session_id}","${r.timestamp}","${r.user_id}","${r.task_id}","${r.selected_option.replace(/"/g, '""')}",${r.is_correct}`
    ).join('\n');
    
    fs.writeFileSync(csvPath, headers + rows, 'utf-8');

    // Also save as JSON
    const jsonPath = path.join(RESULTS_DIR, `results_${userId}_${sessionId}_${timestamp}.json`);
    fs.writeFileSync(jsonPath, JSON.stringify(results, null, 2), 'utf-8');

    console.log(`✓ Results saved: ${path.basename(csvPath)}`);

    res.json({ 
      success: true, 
      message: 'Results saved successfully',
      location: RESULTS_DIR
    });
  } catch (error) {
    console.error('Error saving results:', error);
    res.status(500).json({ error: 'Failed to save results' });
  }
});

app.listen(PORT, () => {
  console.log(`Results server running on http://localhost:${PORT}`);
  console.log(`Results will be saved to: ${RESULTS_DIR}`);
});
