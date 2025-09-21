#!/usr/bin/env node

import { spawn } from 'child_process';
import { platform } from 'os';

const openInEdge = (url) => {
  const isWindows = platform() === 'win32';
  
  if (isWindows) {
    // Try different possible Edge executable paths
    const edgePaths = [
      'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
      'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
      'msedge' // System PATH
    ];
    
    let edgeOpened = false;
    
    for (const edgePath of edgePaths) {
      try {
        spawn(edgePath, [url], { 
          detached: true, 
          stdio: 'ignore' 
        }).unref();
        console.log(`✅ Opening ${url} in Microsoft Edge`);
        edgeOpened = true;
        break;
      } catch (error) {
        continue;
      }
    }
    
    if (!edgeOpened) {
      console.log('⚠️ Could not find Microsoft Edge, opening in default browser');
      // Fallback to default browser
      spawn('cmd', ['/c', 'start', url], { 
        detached: true, 
        stdio: 'ignore' 
      }).unref();
    }
  } else {
    console.log('Not on Windows, using default browser');
    spawn('open', [url], { detached: true, stdio: 'ignore' }).unref();
  }
};

// Get URL from command line arguments
const url = process.argv[2] || 'http://localhost:5173';

// Wait 3 seconds for the Vite server to start before opening browser
console.log('⏳ Waiting for Vite server to start...');
setTimeout(() => {
  openInEdge(url);
}, 3000);