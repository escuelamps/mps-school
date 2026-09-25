import { google } from 'googleapis';
import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');

  if (!type || (type !== 'matriculas' && type !== 'activos')) {
    return NextResponse.json({ error: 'Parámetro type inválido. Usa ?type=matriculas o ?type=activos' }, { status: 400 });
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
        // Extraer el cuerpo y quitarle absolutamente todos los espacios que Vercel le haya puesto
        const core = match[1].replace(/\s+/g, '');
        // Reconstruir el formato PEM exacto que pide Google
        privateKey = `-----BEGIN PRIVATE KEY-----\n${core}\n-----END PRIVATE KEY-----\n`;
      }
    }

    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
        private_key: privateKey,
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    
    let spreadsheetId = '';
    let range = '';

    if (type === 'matriculas') {
      spreadsheetId = process.env.SHEET_MATRICULAS_ID;
      range = "'BASE MATRICULA 2026+ 1 (ACTIVOS)'!A1:Z1000"; 
    } else {
      spreadsheetId = process.env.SHEET_ACTIVOS_ID;
      range = "A1:Z1000"; 
    }

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
    });

    const rows = response.data.values || [];
    return NextResponse.json({ data: rows });
  } catch (error) {
    console.error('Sheets Error:', error.message);
    return NextResponse.json({ error: 'Error al consultar Google Sheets: ' + error.message }, { status: 500 });
  }
}
