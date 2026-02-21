import { app, shell, BrowserWindow, ipcMain, globalShortcut, clipboard } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { keyboard, Key } from '@nut-tree-fork/nut-js';
let mainWindow: BrowserWindow | null = null;
let isRecording = false;

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      backgroundThrottling: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow?.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

async function injectText(text: string) {
  try {
    const previousClipboard = clipboard.readText();
    clipboard.writeText(text);

    // Simulate Cmd+V (macOS) or Ctrl+V (Windows/Linux)
    const modifier = process.platform === 'darwin' ? Key.LeftCmd : Key.LeftControl;
    await keyboard.pressKey(modifier);
    await keyboard.pressKey(Key.V);
    await keyboard.releaseKey(Key.V);
    await keyboard.releaseKey(modifier);

    // Slight delay before restoring original clipboard
    setTimeout(() => {
      clipboard.writeText(previousClipboard);
    }, 500);
  } catch (err) {
    console.error('Error injecting text:', err);
  }
}

import { transcribeAudio } from './whisper/engine'
import { processTranscription } from './pipeline'
import { initDb, saveDictation } from './db'
import { v4 as uuidv4 } from 'uuid'
import * as fs from 'fs'
import { tmpdir } from 'os'

initDb() // initialize better-sqlite3

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.electron')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  ipcMain.on('ping', () => console.log('pong'))

  ipcMain.on('transcription-result', async (_event, text) => {
    await injectText(text);
  });

  ipcMain.handle('process-audio', async (_event, buffer: ArrayBuffer) => {
    console.log('Received audio buffer byteLength:', buffer.byteLength);
    const audioPath = join(tmpdir(), `frf-${Date.now()}.wav`);
    fs.writeFileSync(audioPath, Buffer.from(buffer));

    try {
      const start = Date.now();
      const rawText = await transcribeAudio(audioPath);
      const processedText = processTranscription(rawText);
      const end = Date.now();

      console.log('Processed text:', processedText);

      if (processedText.trim()) {
        await injectText(processedText);

        saveDictation({
          id: uuidv4(),
          user_id: 'local',
          device_id: 'local',
          raw_transcript: rawText,
          processed_text: processedText,
          started_at: new Date(start).toISOString(),
          ended_at: new Date(end).toISOString(),
          duration_ms: end - start,
          word_count: processedText.split(' ').length
        });
      }

      // Cleanup
      fs.unlinkSync(audioPath);
      return processedText;
    } catch (e) {
      console.error(e);
      if (fs.existsSync(audioPath)) fs.unlinkSync(audioPath);
      throw e;
    }
  });

  createWindow()

  // Register Global Hotkey
  const startHotkey = 'CommandOrControl+Shift+Space';
  globalShortcut.register(startHotkey, () => {
    console.log('Hotkey pressed!');
    isRecording = !isRecording;
    if (mainWindow) {
      mainWindow.webContents.send('toggle-recording', isRecording);
    }
  });

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('will-quit', () => {
  globalShortcut.unregisterAll()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
