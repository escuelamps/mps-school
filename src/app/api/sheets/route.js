import { google } from 'googleapis';
import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');

  if (!type || (type !== 'matriculas' && type !== 'activos')) {
    return NextResponse.json({ error: 'Parámetro type inválido. Usa ?type=matriculas o ?type=activos' }, { status: 400 });
  }

  try {
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_SHEETS_PRIVATE_KEY?.replace(/\\n/g, '\n'),
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
