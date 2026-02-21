import { spawn } from 'child_process'
import { join } from 'path'
import { app } from 'electron'

export async function transcribeAudio(audioPath: string): Promise<string> {
    return new Promise((resolve, reject) => {
        // In dev: process.cwd()/resources/whisper/build/bin/whisper-cli
        // In prod: app.getAppPath()/resources/...
        const isDev = !app.isPackaged;
        const baseDir = isDev
            ? join(__dirname, '../../resources/whisper')
            : join(process.resourcesPath, 'whisper');

        // whisper.cpp changed output binary to whisper-cli recently when built via cmake
        const whisperPath = join(baseDir, 'build/bin/whisper-cli');
        const modelPath = join(baseDir, 'models/ggml-base.en.bin');

        let output = '';
        const whisperProcess = spawn(whisperPath, [
            '-m', modelPath,
            '-f', audioPath,
            '-nt', // no timestamps
            '-pr', // print progress false
        ]);

        whisperProcess.stdout.on('data', (data) => {
            output += data.toString();
        });

        whisperProcess.stderr.on('data', (data) => {
            console.error('Whisper err:', data.toString());
        });

        whisperProcess.on('close', (code) => {
            if (code === 0) {
                resolve(output.trim());
            } else {
                console.error(`Whisper exited with ${code}. Stdout: ${output}`);
                reject(new Error(`Whisper exited with code ${code}`));
            }
        });

        whisperProcess.on('error', (err) => {
            console.error('Failed to spawn whisper', err);
            reject(err);
        });
    });
}
