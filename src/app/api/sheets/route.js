import { google } from 'googleapis';
import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');

  if (!type || (type !== 'matriculas' && type !== 'activos' && type !== 'recitales' && type !== 'planillas')) {
    return NextResponse.json({ error: 'Parámetro type inválido. Usa ?type=matriculas, ?type=activos o ?type=planillas' }, { status: 400 });
  }

  try {
    let privateKey = process.env.GOOGLE_SHEETS_PRIVATE_KEY || '';
    
    // 1. Quitar comillas si las tiene
    if (privateKey.startsWith('"') && privateKey.endsWith('"')) {
      privateKey = privateKey.slice(1, -1);
    }
    
    // 2. Reemplazar "\\n" literales por saltos de línea reales
    privateKey = privateKey.replace(/\\n/g, '\n');
    
    // 3. Si Vercel aplanó todo quitando los saltos de línea (causa del DECODER error)
    if (!privateKey.includes('\n') && privateKey.includes('-----BEGIN PRIVATE KEY-----')) {
      const match = privateKey.match(/-----BEGIN PRIVATE KEY-----(.*)-----END PRIVATE KEY-----/s);
      if (match) {
        const core = match[1].replace(/\s+/g, '');
        privateKey = `-----BEGIN PRIVATE KEY-----\n${core}\n-----END PRIVATE KEY-----\n`;
      }
    }

    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
        private_key: privateKey,
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    
    let spreadsheetId = '';
    let range = '';

    if (type === 'matriculas') {
      spreadsheetId = '17wVemsUOXN0sOAKbYC2SBjUPrjovZNDguNWI5-AsAnI';
      range = "'Respuestas de formulario 1'!A1:Z1000"; 
    } else if (type === 'planillas') {
      spreadsheetId = '19rXAPfclrzBe62DOXoKz0oADtgOT_N4vUYe77KRLMfw';
      range = "'Respuestas de formulario 1'!A1:EM600";
    } else {
      spreadsheetId = '1BrHEVJ3HHJysm1nPmbdsjVBwTmLce-m_pSRFNag2SAo';
      range = "'Base de datos estudiantes 2026 - 2'!A1:K200"; 
    }

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
    });

    const rows = response.data.values || [];

    if (type === 'planillas' && rows.length > 1) {
      const headers = rows[0];
      const TEACHER_INSTRUMENTS = {
        'Jorge Garcia': 'Guitarra / Piano',
        'Sebastian Vergara': 'Guitarra / Producción',
        'Andres Bernal': 'Piano',
        'Carlos Macia': 'Violín / Piano',
        'Jenny Rojas': 'Iniciación Musical',
        'William Buitrago': 'Canto',
        'Laura Mendoza': 'Piano / Violín',
        'Shalom Prieto': 'Canto'
      };

      const parsedPlanillas = [];
      rows.slice(1).forEach((row, i) => {
        if (!row || row.length < 3 || !row[2]) return;
        const rawDate = row[0] || '';
        const teacher = (row[2] || '').trim();
        if (!teacher) return;

        let classDate = '';
        let student = '';
        let firmaUrl = '';
        let duration = '';

        row.forEach((cell, idx) => {
          if (!cell || typeof cell !== 'string') return;
          const val = cell.trim();
          const header = (headers[idx] || '').trim();

          if (val.includes('drive.google.com')) {
            firmaUrl = val;
          }
          if (/fecha de clase/i.test(header) && val) {
            classDate = val;
          }
          if (/la sesion fue de/i.test(header) && val) {
            duration = val;
          }

          const bracketMatch = header.match(/\[(.*?)\]/);
          if (bracketMatch && val && val !== '0' && val !== 'No') {
            if (!student) student = bracketMatch[1].trim();
          }

          if (/^clases dictadas$/i.test(header) && val && !val.includes('drive.google.com')) {
            if (!student) student = val;
          }
        });

        if (!classDate && rawDate) {
          classDate = rawDate.split(' ')[0];
        }
        const classTime = (rawDate.split(' ')[1] || '12:00:00').slice(0, 5);

        if (!student) student = 'Clase General';

        parsedPlanillas.push({
          id: `sheet-${i + 2}`,
          profesor: teacher,
          estudiante: student,
          fecha: classDate,
          hora: classTime,
          duracion: duration,
          instrumento: TEACHER_INSTRUMENTS[teacher] || 'Música General',
          contenido: `Clase de ${student} con ${teacher} (${duration || '1 hr'})`,
          firma: firmaUrl,
          source: 'google_sheets'
        });
      });

      return NextResponse.json({ data: parsedPlanillas });
    }

    return NextResponse.json({ data: rows });
  } catch (error) {
    console.error('Sheets Error:', error.message);
    return NextResponse.json({ error: 'Error al consultar Google Sheets: ' + error.message }, { status: 500 });
  }
}


export async function POST(request) {
  try {
    const body = await request.json();
    const { type, rowNumber, values } = body;

    if (!type || (type !== 'matriculas' && type !== 'activos')) {
      return NextResponse.json({ error: 'Parámetro type inválido.' }, { status: 400 });
    }
    if ((type !== 'recitales' && !rowNumber) || !values) {
      return NextResponse.json({ error: 'Faltan parámetros rowNumber o values.' }, { status: 400 });
    }

    let privateKey = process.env.GOOGLE_SHEETS_PRIVATE_KEY || '';
    if (privateKey.startsWith('"') && privateKey.endsWith('"')) {
      privateKey = privateKey.slice(1, -1);
    }
    privateKey = privateKey.replace(/\\n/g, '\n');
    if (!privateKey.includes('\n') && privateKey.includes('-----BEGIN PRIVATE KEY-----')) {
      const match = privateKey.match(/-----BEGIN PRIVATE KEY-----(.*)-----END PRIVATE KEY-----/s);
      if (match) {
        const core = match[1].replace(/\s+/g, '');
        privateKey = `-----BEGIN PRIVATE KEY-----\n${core}\n-----END PRIVATE KEY-----\n`;
      }
    }

    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
        private_key: privateKey,
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    
    let spreadsheetId = '';
    let rangeToUpdate = '';

    
    if (type === 'recitales') {
      spreadsheetId = process.env.SHEET_NOCHES_MPS_ID;
      if(!spreadsheetId) throw new Error("Falta el ID del Excel de Noches MPS");
      
      const response = await sheets.spreadsheets.values.append({
        spreadsheetId,
        range: 'Recitales!A:F', // Hoja 3
        valueInputOption: 'USER_ENTERED',
        insertDataOption: 'INSERT_ROWS',
        requestBody: {
          values: [values]
        }
      });
      return NextResponse.json({ success: true, updatedRange: response.data.updates?.updatedRange });
    }

    if (type === 'matriculas') {
      spreadsheetId = '17wVemsUOXN0sOAKbYC2SBjUPrjovZNDguNWI5-AsAnI';
      rangeToUpdate = `'Respuestas de formulario 1'!A${rowNumber}:Z${rowNumber}`; 
    } else if (type === 'activos') {
      spreadsheetId = '1BrHEVJ3HHJysm1nPmbdsjVBwTmLce-m_pSRFNag2SAo';
      rangeToUpdate = `'Base de datos estudiantes 2026 - 2'!A${rowNumber}:K${rowNumber}`; 
    }

    const response = await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: rangeToUpdate,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [values]
      }
    });

    return NextResponse.json({ success: true, updatedRange: response.data.updatedRange });
  } catch (error) {
    console.error('Sheets Update Error:', error.message);
    return NextResponse.json({ error: 'Error al actualizar Google Sheets: ' + error.message }, { status: 500 });
  }
}
