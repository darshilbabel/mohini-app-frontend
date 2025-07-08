import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';
import questions from './questions'; // Adjust this import path if needed

const API_URL = 'https://devqa-mohini.shikshalokam.org/api/text_to_speech/';
const OUTPUT_DIR = './../../../public/audio'; // Adjust if needed

// Ensure the output directory exists
fs.mkdirSync(OUTPUT_DIR, { recursive: true });

// Fetch base64 audio from the TTS API
async function fetchAudioBase64(text, lang) {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'https://dev.elevate-mitra.shikshalokam.org',
        'Referer': 'https://dev.elevate-mitra.shikshalokam.org/',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        text,
        source_language: lang,
        route: '/mega_ptm',
      }),
    });

    const data = await response.json();

    if (data?.audio) {
      return data.audio;
    } else {
      console.error(`API returned no audio for text: "${text}"`);
      return null;
    }
  } catch (err) {
    console.error(`Error fetching audio for: "${text}"`, err);
    return null;
  }
}

// Main logic to process questions and write files
(async () => {
  for (const key in questions) {
    const q = questions[key];
    for (const variant of q.questions) {
      for (const lang of ['en', 'te']) {
        const langObj = variant.title[lang];
        const text = langObj?.text;

        if (!langObj?.audio) {
          console.warn(`Skipping missing audio path for ${variant.variant_id} [${lang}]`);
          continue;
        }

        const filename = path.basename(langObj.audio); // e.g. q1v1_en.b64
        const fullPath = path.join(OUTPUT_DIR, filename);

        console.log(`Generating: ${filename} (${lang})`);

        const b64 = await fetchAudioBase64(text, lang);
        if (b64) {
          fs.writeFileSync(fullPath, b64);
          console.log(`Saved: ${fullPath}`);
        }
      }
    }
  }
})();
