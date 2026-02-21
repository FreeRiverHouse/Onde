import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

const api = {
  sendTranscriptionResult: (text: string) => ipcRenderer.send('transcription-result', text),
  sendAudioToMain: (buffer: ArrayBuffer) => ipcRenderer.invoke('process-audio', buffer),
  onToggleRecording: (callback: (isRecording: boolean) => void) => {
    ipcRenderer.on('toggle-recording', (_event, isRecording) => callback(isRecording))
  },
  removeToggleRecording: () => {
    ipcRenderer.removeAllListeners('toggle-recording')
  }
}

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore
  window.electron = electronAPI
  // @ts-ignore
  window.api = api
}
