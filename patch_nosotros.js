const fs = require('fs');
let content = fs.readFileSync('src/app/admin/nosotros/page.js', 'utf8');

// Add Calendar icon if missing
if (!content.includes('Calendar,')) {
    content = content.replace('import { Users, FileText, UserPlus', 'import { Users, FileText, UserPlus, Calendar');
}

// Add state for birthDate
content = content.replace(
  "const [documentId, setDocumentId] = useState('');",
  "const [documentId, setDocumentId] = useState('');\n  const [birthDate, setBirthDate] = useState('');"
);

// Populate state in openEditForm
content = content.replace(
  "setDocumentId(teacher.documentId || '');",
  "setDocumentId(teacher.documentId || '');\n    setBirthDate(teacher.birthDate || '');"
);

// Add to updateData
content = content.replace(
  "documentId: documentId,",
  "documentId: documentId,\n          birthDate: birthDate,"
);

// Add to new teacher creation
content = content.replace(
  "documentId: documentId,",
  "documentId: documentId,\n          birthDate: birthDate,"
);

// Clear in close form (or creation success)
content = content.replace(
  "setDocumentId('');",
  "setDocumentId('');\n      setBirthDate('');"
);

// Add input to form
const inputHTML = `
              <div>
                <label style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Fecha de Nacimiento</label>
                <div style={{ position: 'relative' }}>
                  <Calendar size={16} color="var(--text-secondary)" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input type="date" value={birthDate} onChange={e => setBirthDate(e.target.value)} style={{ width: '100%', padding: '0.8rem 0.8rem 0.8rem 2.2rem', borderRadius: '8px', background: 'var(--bg-primary)', color: 'var(--text-primary)', border: '1px solid var(--glass-border)' }} />
                </div>
              </div>
`;

content = content.replace(
  "<div>\n                <label style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Número de Documento</label>",
  inputHTML + "<div>\n                <label style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Número de Documento</label>"
);

// Add to Card UI
content = content.replace(
  "<p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}><FileText size={14}/> {teacher.documentId}</p>",
  "<p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}><FileText size={14}/> {teacher.documentId}</p>\n                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Calendar size={14}/> {teacher.birthDate || 'Sin fecha'}</p>"
);

fs.writeFileSync('src/app/admin/nosotros/page.js', content);
