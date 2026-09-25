const fs = require('fs');

// 1. Fix Nosotros (Teachers)
let nos = fs.readFileSync('src/app/admin/nosotros/page.js', 'utf8');
nos = nos.replace(/birthDate: birthDate,\n          birthDate: birthDate,/, 'birthDate: birthDate,');
nos = nos.replace(
  "documentId: documentId,\n          subjects: subjectsArray,",
  "documentId: documentId,\n          birthDate: birthDate,\n          subjects: subjectsArray,"
);
fs.writeFileSync('src/app/admin/nosotros/page.js', nos);

// 2. Fix Contabilidad (Students)
let cont = fs.readFileSync('src/app/admin/contabilidad/page.js', 'utf8');

// Add instrument state
cont = cont.replace(
  "const [studentBirthDate, setStudentBirthDate] = useState('');",
  "const [studentBirthDate, setStudentBirthDate] = useState('');\n  const [studentInstrument, setStudentInstrument] = useState('');"
);

cont = cont.replace(
  "setStudentBirthDate(student.birthDate || '');",
  "setStudentBirthDate(student.birthDate || '');\n    setStudentInstrument(student.instrument || '');"
);

cont = cont.replace(
  "setStudentBirthDate('');",
  "setStudentBirthDate('');\n      setStudentInstrument('');"
);

// Fix UpdateDoc
cont = cont.replace(
  "name: `\\${studentFirstName} \\${studentLastName}`",
  "name: `\\${studentFirstName} \\${studentLastName}`,\n          birthDate: studentBirthDate,\n          instrument: studentInstrument"
);

// Fix SetDoc
cont = cont.replace(
  "name: `\\${studentFirstName} \\${studentLastName}`,\n          email: email,\n          role: 'student'",
  "name: `\\${studentFirstName} \\${studentLastName}`,\n          email: email,\n          role: 'student',\n          birthDate: studentBirthDate,\n          instrument: studentInstrument"
);

// Add Instrument Input
const instrumentHtml = `
                <div>
                  <label style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Instrumento</label>
                  <input type="text" value={studentInstrument} onChange={e => setStudentInstrument(e.target.value)} placeholder="Ej. Piano, Guitarra..." style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', background: 'var(--bg-primary)', color: 'var(--text-primary)', border: '1px solid var(--glass-border)' }} />
                </div>
`;
cont = cont.replace(
  "<div>\n                  <label style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Fecha de Nacimiento</label>",
  instrumentHtml + "\n                <div>\n                  <label style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Fecha de Nacimiento</label>"
);

// Terminology replacements
cont = cont.replace(/Alumno/g, 'Estudiante');
cont = cont.replace(/Alumnos/g, 'Estudiantes');
cont = cont.replace(/alumnos/g, 'estudiantes');
cont = cont.replace(/alumno/g, 'estudiante');

// Put back "alumno-" in email prefix (it should be 'estudiante-' now? Better ask or just change email prefix? Let's leave email prefix as "estudiante-")
cont = cont.replace(/email = \`estudiante-\$\{studentFirstName/g, "email = \`estudiante-${studentFirstName"); // It was "alumno-". After replace it became "estudiante-". That's fine!

// Add instrument to Card
cont = cont.replace(
  "<Mail size={14}/> {student.email?.replace(/@.*$/, \"\")}</p>",
  "<Mail size={14}/> {student.email?.replace(/@.*$/, \"\")}</p>\n                  <p style={{ color: 'var(--accent)', fontSize: '0.85rem', marginTop: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.3rem', fontWeight: 'bold' }}>🎸 {student.instrument || 'Sin instrumento'}</p>"
);

fs.writeFileSync('src/app/admin/contabilidad/page.js', cont);
