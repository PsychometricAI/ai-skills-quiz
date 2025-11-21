// API endpoint to save test results to local file
// This would typically be a serverless function (Vercel/Netlify)

import type { VercelRequest, VercelResponse } from '@vercel/node';
import fs from 'fs';
import path from 'path';

interface TestResult {
  session_id: string;
  timestamp: string;
  user_id: string;
  task_id: string;
  selected_option: string;
  is_correct: boolean;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const results: TestResult[] = req.body;
    
    if (!Array.isArray(results) || results.length === 0) {
      return res.status(400).json({ error: 'Invalid data' });
    }

    // Define storage directory in application root
    const storageDir = path.join(process.cwd(), 'test-results');
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(storageDir)) {
      fs.mkdirSync(storageDir, { recursive: true });
    }

    const sessionId = results[0].session_id;
    const userId = results[0].user_id;
    const timestamp = new Date().toISOString().split('T')[0];
    
    // Save as CSV
    const csvPath = path.join(storageDir, `results_${userId}_${sessionId}_${timestamp}.csv`);
    const headers = 'session_id,timestamp,user_id,task_id,selected_option,is_correct\n';
    const rows = results.map((r) => 
      `"${r.session_id}","${r.timestamp}","${r.user_id}","${r.task_id}","${r.selected_option.replace(/"/g, '""')}",${r.is_correct}`
    ).join('\n');
    
    fs.writeFileSync(csvPath, headers + rows, 'utf-8');

    // Also save as JSON for easier processing
    const jsonPath = path.join(storageDir, `results_${userId}_${sessionId}_${timestamp}.json`);
    fs.writeFileSync(jsonPath, JSON.stringify(results, null, 2), 'utf-8');

    return res.status(200).json({ 
      success: true, 
      message: 'Results saved successfully',
      files: {
        csv: csvPath,
        json: jsonPath
      }
    });
  } catch (error) {
    console.error('Error saving results:', error);
    return res.status(500).json({ error: 'Failed to save results' });
  }
}
