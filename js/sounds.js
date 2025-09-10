const soundCache = {};

function loadSound(name, src) {
  return new Promise((resolve, reject) => {
    if (soundCache[name]) {
      resolve(soundCache[name]);
      return;
    }
    const audio = new Audio();
    audio.src = src;
    audio.volume = 0.3;
    audio.addEventListener('canplaythrough', () => {
      soundCache[name] = audio;
      resolve(audio);
    });
    audio.addEventListener('error', reject);
  });
}

async function playSound(name) {
  try {
    const audio = soundCache[name] || await loadSound(name, `audio/${name}.mp3`);
    const clone = audio.cloneNode();
    clone.volume = 0.3;
    clone.play().catch(e => console.warn("Звук не проигрался:", e));
  } catch (e) {
    console.warn(`Звук ${name} не загружен`);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  ['launch', 'cashout', 'crash'].forEach(name => {
    loadSound(name, `audio/${name}.mp3`).catch(console.warn);
  });
});
