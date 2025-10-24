
const STYLES: Record<string, string> = {
  zoom: 'Slow gentle zoom into photograph, cinematic, nostalgic',
  pan: 'Smooth horizontal pan across photograph, cinematic',
  depth: 'Subtle parallax effect, depth revealed, cinematic',
  ambient: 'Gentle ambient motion, wind and light, cinematic',
  portrait: 'Zoom to face, emotional emphasis, cinematic portrait'
};

const ERAS: Record<string, string> = {
  vintage: 'vintage 1950s aesthetic, sepia tones',
  retro: '1970s retro aesthetic, warm analog colors, film grain',
  classic: '1990s aesthetic, faded colors, home video style',
  modern: 'modern digital look, vibrant, sharp details'
};

export function generatePrompt(style: string, year?: number): string {
  const motion = STYLES[style] || STYLES.zoom;
  
  let era = ERAS.modern;
  if (year) {
      if (year < 1960) era = ERAS.vintage;
      else if (year < 1980) era = ERAS.retro;
      else if (year < 2000) era = ERAS.classic;
  }
  
  return `${motion}, ${era}, high quality, high resolution, 8 seconds duration.`;
}
