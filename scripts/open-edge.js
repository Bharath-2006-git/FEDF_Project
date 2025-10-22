#!/usr/bin/env node

import { spawn } from 'child_process';
import { platform } from 'os';
import { createConnection } from 'net';

const findVitePort = async () => {
  // Common ports Vite uses
  const commonPorts = [5173, 5174, 5175, 5176, 5177];
  
  for (const port of commonPorts) {
    const isOpen = await new Promise((resolve) => {
      const socket = createConnection({ port, host: 'localhost' }, () => {
        socket.end();
        resolve(true);
      });
      socket.on('error', () => resolve(false));
      socket.setTimeout(500, () => {
        socket.destroy();
        resolve(false);
      });
    });
    
    if (isOpen) {
      return port;
    }
  }
  return 5173; // default fallback
};

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

// Wait for Vite server to start and detect its port
console.log('⏳ Waiting for Vite server to start...');
setTimeout(async () => {
  const port = await findVitePort();
  const url = process.argv[2] || `http://localhost:${port}`;
  console.log(`🌐 Detected Vite running on port ${port}`);
  openInEdge(url);
}, 3000);