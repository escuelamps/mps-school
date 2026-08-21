import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export const validatePaymentReceipt = async (base64Image, mimeType) => {
  if (!process.env.GEMINI_API_KEY) {
    console.warn('Falta GEMINI_API_KEY en .env.local');
    return null;
  }

  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const prompt = `
  Eres un sistema automatizado de validación financiera en Colombia.
  Analiza la siguiente imagen de un comprobante de transferencia bancaria (Nequi, Bancolombia, Bre-B, etc).
  Necesito que extraigas exactamente estos datos en un formato JSON estricto:
  {
    "monto": numero (solo el valor numérico, sin signos ni comas),
    "fecha": "YYYY-MM-DD",
    "referencia": "cadena de texto con el número de referencia o código de aprobación",
    "banco_origen": "nombre del banco",
    "es_valido": booleano (true si parece un comprobante legítimo y legible, false si es una imagen borrosa, un meme, o no se entiende)
  }
  
  Devuelve SOLO el JSON, sin texto adicional (sin bloques \`\`\`json).
  `;

  try {
    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: base64Image,
          mimeType
        }
      }
    ]);
    
    const responseText = result.response.text();
    // Limpiar posibles bloques markdown si el modelo los incluyó
    const cleanJson = responseText.replace(/```json\n?|```/g, '').trim();
    
    return JSON.parse(cleanJson);
  } catch (error) {
    console.error('Error validating receipt with Gemini:', error);
    return null;
  }
};
