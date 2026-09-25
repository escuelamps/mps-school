const fs = require('fs');
let content = fs.readFileSync('src/app/recitales/page.js', 'utf8');

// Añadir el estado errorMsg
content = content.replace(
  "const [success, setSuccess] = useState(false);",
  "const [success, setSuccess] = useState(false);\n  const [errorMsg, setErrorMsg] = useState('');"
);

// Reemplazar alertas por setErrorMsg
content = content.replace(
  /alert\("Por favor llena todos los datos\."\);/g,
  "setErrorMsg('Por favor llena todos los datos.');"
);

content = content.replace(
  /alert\("¡Oh no! Justo se acaban de agotar los cupos para esta fecha\."\);/g,
  "setErrorMsg('¡Oh no! Justo se acaban de agotar los cupos para esta fecha.');"
);

content = content.replace(
  /alert\("Hubo un error al registrarte\."\);/g,
  "setErrorMsg('Hubo un error al registrarte. Por favor intenta de nuevo.');"
);

// Inyectar el div de errorMsg encima del botón de enviar
const errorDiv = `
              {errorMsg && (
                <div style={{ background: 'rgba(255, 105, 97, 0.1)', color: '#ff6961', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(255, 105, 97, 0.3)', fontSize: '0.9rem', textAlign: 'center' }}>
                  {errorMsg}
                </div>
              )}
              <button`;

content = content.replace(/<button([^>]*)type="submit"/, errorDiv + " $1 type=\"submit\"");

// Limpiar el errorMsg cuando el usuario cambia la fecha
content = content.replace(
  /onChange=\{\(e\) => setFecha\(e\.target\.value\)\}/g,
  "onChange={(e) => { setFecha(e.target.value); setErrorMsg(''); }}"
);

// Limpiar el errorMsg cuando el usuario escribe en los inputs
content = content.replace(
  /onChange=\{e => setNombre\(e\.target\.value\)\}/g,
  "onChange={e => { setNombre(e.target.value); setErrorMsg(''); }}"
);

content = content.replace(
  /onChange=\{e => setTelefono\(e\.target\.value\)\}/g,
  "onChange={e => { setTelefono(e.target.value); setErrorMsg(''); }}"
);

fs.writeFileSync('src/app/recitales/page.js', content);
