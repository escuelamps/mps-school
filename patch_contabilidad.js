const fs = require('fs');
let content = fs.readFileSync('src/app/admin/contabilidad/page.js', 'utf8');

// Add Calendar icon if missing (it might be there, let's check or just add if needed, wait, Calendar is used in payroll so it's there)

// Add state for studentBirthDate
content = content.replace(
  "const [studentPassword, setStudentPassword] = useState('');",
  "const [studentPassword, setStudentPassword] = useState('');\n  const [studentBirthDate, setStudentBirthDate] = useState('');"
);

// Populate state in openEditStudentForm
content = content.replace(
  "setStudentPassword('');",
  "setStudentPassword('');\n    setStudentBirthDate(student.birthDate || '');"
);

// Add to updateData in edit mode
content = content.replace(
  "name: `\\${studentFirstName} \\${studentLastName}`",
  "name: `\\${studentFirstName} \\${studentLastName}`,\n          birthDate: studentBirthDate"
);

// Add to creation data
content = content.replace(
  "name: `\\${studentFirstName} \\${studentLastName}`,\n          email: email,\n          role: 'student'",
  "name: `\\${studentFirstName} \\${studentLastName}`,\n          email: email,\n          role: 'student',\n          birthDate: studentBirthDate"
);

// Clear in close form (or creation success)
content = content.replace(
  "setStudentPassword('');",
  "setStudentPassword('');\n      setStudentBirthDate('');"
);

// Add input to form
const inputHTML = `
                <div>
                  <label style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Fecha de Nacimiento</label>
                  <div style={{ position: 'relative' }}>
                    <Calendar size={16} color="var(--text-secondary)" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
                    <input type="date" value={studentBirthDate} onChange={e => setStudentBirthDate(e.target.value)} style={{ width: '100%', padding: '0.8rem 0.8rem 0.8rem 2.2rem', borderRadius: '8px', background: 'var(--bg-primary)', color: 'var(--text-primary)', border: '1px solid var(--glass-border)' }} />
                  </div>
                </div>
`;

content = content.replace(
  "{!editingStudentId && (<div><label style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Contraseña de acceso",
  inputHTML + "\n                {!editingStudentId && (<div><label style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Contraseña de acceso"
);

// Add to Card UI
content = content.replace(
  "<p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Mail size={14}/> {student.email?.replace(/@.*$/, \"\")}</p>",
  "<p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Mail size={14}/> {student.email?.replace(/@.*$/, \"\")}</p>\n                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Calendar size={14}/> {student.birthDate || 'Sin fecha de nacimiento'}</p>"
);

fs.writeFileSync('src/app/admin/contabilidad/page.js', content);
