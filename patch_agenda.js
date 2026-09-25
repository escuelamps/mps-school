const fs = require('fs');
let content = fs.readFileSync('src/app/admin/agenda/page.js', 'utf8');

// Replace the end of the Edit Mode block to include the "Aceptar" button
content = content.replace(
  "<button onClick={() => handleDeleteSlot(selectedSlot.id)} style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', background: 'transparent', color: '#ef4444', fontWeight: 'bold', border: '1px solid #ef4444', cursor: 'pointer' }}>Eliminar Cupo</button>",
  "<div style={{ display: 'flex', gap: '1rem' }}>\n                    <button onClick={() => setShowSlotModal(false)} style={{ flex: 1, padding: '0.8rem', borderRadius: '8px', background: '#00DE85', color: '#111', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}>Aceptar</button>\n                    <button onClick={() => handleDeleteSlot(selectedSlot.id)} style={{ flex: 1, padding: '0.8rem', borderRadius: '8px', background: 'transparent', color: '#ef4444', fontWeight: 'bold', border: '1px solid #ef4444', cursor: 'pointer' }}>Eliminar Cupo</button>\n                  </div>"
);

fs.writeFileSync('src/app/admin/agenda/page.js', content);
