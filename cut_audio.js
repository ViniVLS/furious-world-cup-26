const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;

const audioDir = path.join(__dirname, 'public', 'assets', 'audio');
const originalsDir = path.join(audioDir, 'originals');

// Create originals directory if it doesn't exist
if (!fs.existsSync(originalsDir)) {
    fs.mkdirSync(originalsDir, { recursive: true });
}

// Map of user-defined cuts: [filename, startTime, endTime]
const cuts = [
    { file: 'login.mp3', start: '00:00:52.000', end: '00:01:08.000', duration: 16 },
    { file: 'pack_open.mp3', start: '00:00:42.000', end: '00:00:59.000', duration: 17 },
    { file: 'trade_success.mp3', start: '00:00:28.000', end: '00:00:43.000', duration: 15 },
    { file: 'ranking_enter.mp3', start: '00:01:27.000', end: '00:01:45.000', duration: 18 },
    { file: 'buy_pack.mp3', start: '00:01:28.000', end: '00:01:52.000', duration: 24 },
    { file: 'quiz_correct.mp3', start: '00:00:33.000', end: '00:00:51.000', duration: 18 },
    { file: 'quiz_wrong.mp3', start: '00:00:00.000', end: '00:00:23.000', duration: 23 },
    { file: 'mission_complete.mp3', start: '00:00:59.000', end: '00:01:22.000', duration: 23 },
    { file: 'album_enter.mp3', start: '00:01:02.000', end: '00:01:25.000', duration: 23 }
];

console.log('--- Starting Audio Slicing Process ---');

cuts.forEach(cutData => {
    const originalFile = path.join(audioDir, cutData.file);
    const backupFile = path.join(originalsDir, cutData.file);

    // Skip if the file doesn't exist (maybe user hasn't added it yet)
    if (!fs.existsSync(originalFile) && !fs.existsSync(backupFile)) {
        console.warn(`[SKIP] Missing audio file: ${cutData.file}`);
        return;
    }

    // Only backup if the file isn't already backed up
    if (fs.existsSync(originalFile) && !fs.existsSync(backupFile)) {
        console.log(`[BACKUP] Moving original ${cutData.file} to originals/`);
        fs.renameSync(originalFile, backupFile);
    }

    // Process the cut IF we have a backup to cut from
    if (fs.existsSync(backupFile)) {
        console.log(`[CUT] Processing ${cutData.file}... from ${cutData.start} to ${cutData.end}`);
        
        // Execute ffmpeg synchronously to cut the audio, copy the codec, and overwrite the file in root audio/
        // Added a 1.5s fade out at the end so it doesn't end abruptly
        const fadeStart = cutData.duration - 1.5;
        try {
            const command = `"${ffmpegPath}" -y -i "${backupFile}" -ss ${cutData.start} -to ${cutData.end} -af "afade=t=out:st=${fadeStart}:d=1.5" "${originalFile}"`;
            execSync(command, { stdio: 'pipe' }); // stdio pipe hides ffmpeg console spam
            console.log(`[SUCCESS] Generated optimized cut for ${cutData.file}`);
        } catch (error) {
            console.error(`[ERROR] Failed to cut ${cutData.file}. Error: ${error.message}`);
        }
    }
});

console.log('--- Audio Slicing Finished ---');
