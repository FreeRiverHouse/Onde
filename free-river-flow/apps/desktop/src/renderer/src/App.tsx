import { useState, useEffect, useRef } from 'react'

function App() {
  const [isRecording, setIsRecording] = useState(false)
  const [transcription, setTranscription] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])

  useEffect(() => {
    // Setup listener for hotkey trigger from Main process
    // @ts-ignore
    window.api.onToggleRecording((recording: boolean) => {
      setIsRecording(recording)
    })

    return () => {
      // @ts-ignore
      window.api.removeToggleRecording()
    }
  }, [])

  useEffect(() => {
    if (isRecording) {
      startRecording()
    } else if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      stopRecording()
    }
  }, [isRecording])

  const startRecording = async () => {
    setTranscription('')
    setIsProcessing(false)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' })
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach(track => track.stop());
        setIsProcessing(true);

        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });

        // Convert to 16kHz PCM WAV right in the browser using AudioContext
        try {
          const arrayBuffer = await audioBlob.arrayBuffer();
          const audioCtx = new window.AudioContext({ sampleRate: 16000 });
          const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
          const wavBuffer = encodeWAV(audioBuffer);

          // Send to Main process for whisper.cpp transcription
          // @ts-ignore
          const text = await window.electron.ipcRenderer.invoke('process-audio', wavBuffer);
          setTranscription(text || '(No text detected)');
        } catch (e) {
          console.error(e);
          setTranscription('Error processing audio.');
        } finally {
          setIsProcessing(false);
        }
      }

      mediaRecorder.start(250)
      mediaRecorderRef.current = mediaRecorder
    } catch (err) {
      console.error('Failed to access mic:', err)
      setIsRecording(false)
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop()
    }
  }

  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center space-y-4 bg-gray-900 text-white font-sans p-6 rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold tracking-tight">Free River Flow</h1>
      <p className="text-gray-400">Push <kbd className="px-2 py-1 bg-gray-800 rounded">Ctrl+Shift+Space</kbd> to talk anywhere.</p>

      <div
        className={`w-32 h-32 rounded-full flex items-center justify-center transition-all duration-300 ${isRecording
          ? 'bg-red-500 animate-pulse shadow-[0_0_30px_rgba(239,68,68,0.7)]'
          : 'bg-gray-800'
          }`}
      >
        <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
        </svg>
      </div>

      <div className="text-center h-20 flex flex-col items-center justify-center w-full max-w-lg">
        {isProcessing && <div className="text-blue-400 font-medium animate-pulse">Processing local AI...</div>}
        {!isProcessing && transcription && (
          <div className="p-4 bg-gray-800 rounded-lg w-full">
            <p className="font-medium text-lg text-emerald-400">"{transcription}"</p>
            <p className="text-xs text-gray-400 mt-2">Injected via clipboard!</p>
          </div>
        )}
      </div>
    </div>
  )
}

function encodeWAV(audioBuffer: AudioBuffer): ArrayBuffer {
  const numChannels = 1;
  const sampleRate = audioBuffer.sampleRate;

  // Mix down strictly to Mono to be safe
  const left = audioBuffer.getChannelData(0);
  let channelData = left;
  if (audioBuffer.numberOfChannels > 1) {
    const right = audioBuffer.getChannelData(1);
    channelData = new Float32Array(left.length);
    for (let i = 0; i < left.length; i++) {
      channelData[i] = (left[i] + right[i]) / 2;
    }
  }

  const length = channelData.length * 2; // 16-bit PCM
  const buffer = new ArrayBuffer(44 + length);
  const view = new DataView(buffer);

  // RIFF identifier
  writeString(view, 0, 'RIFF');
  // RIFF chunk length
  view.setUint32(4, 36 + length, true);
  // RIFF type
  writeString(view, 8, 'WAVE');
  // format chunk identifier
  writeString(view, 12, 'fmt ');
  // format chunk length
  view.setUint32(16, 16, true);
  // sample format (raw)
  view.setUint16(20, 1, true);
  // channel count
  view.setUint16(22, numChannels, true);
  // sample rate
  view.setUint32(24, sampleRate, true);
  // byte rate (sample rate * block align)
  view.setUint32(28, sampleRate * numChannels * 2, true);
  // block align (channel count * bytes per sample)
  view.setUint16(32, numChannels * 2, true);
  // bits per sample
  view.setUint16(34, 16, true);
  // data chunk identifier
  writeString(view, 36, 'data');
  // data chunk length
  view.setUint32(40, length, true);

  // write PCM samples
  let offset = 44;
  for (let i = 0; i < channelData.length; i++, offset += 2) {
    let s = Math.max(-1, Math.min(1, channelData[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
  }

  return buffer;
}

function writeString(view: DataView, offset: number, string: string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}

export default App
