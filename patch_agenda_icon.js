const fs = require('fs');
let content = fs.readFileSync('src/app/admin/agenda/page.js', 'utf8');

const iconFunction = `
const getInstrumentIcon = (instrumentName) => {
  if (!instrumentName) return '🎵';
  const name = instrumentName.toLowerCase();
  if (name.includes('piano') || name.includes('teclado')) return '🎹';
  if (name.includes('guitarra') || name.includes('bajo') || name.includes('cuerda') || name.includes('ukelele')) return '🎸';
  if (name.includes('violín') || name.includes('violin') || name.includes('chelo')) return '🎻';
  if (name.includes('batería') || name.includes('bateria') || name.includes('percusi')) return '🥁';
  if (name.includes('vocal') || name.includes('canto') || name.includes('voz') || name.includes('técnica')) return '🎤';
  if (name.includes('actuación') || name.includes('actuacion') || name.includes('teatro')) return '🎭';
  if (name.includes('saxo') || name.includes('viento')) return '🎷';
  if (name.includes('producción') || name.includes('produccion') || name.includes('audio')) return '🎧';
  if (name.includes('marketing')) return '📈';
  return '🎵';
};

export default function`;

content = content.replace("export default function", iconFunction);
content = content.replace("<span>🎸 {selectedSlot.instrument}</span>", "<span>{getInstrumentIcon(selectedSlot.instrument)} {selectedSlot.instrument}</span>");

fs.writeFileSync('src/app/admin/agenda/page.js', content);
