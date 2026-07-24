export function processMessage(incomingText) {
  const text = incomingText.toLowerCase().trim();

  // Menú Principal
  if (text === 'hola' || text === 'menu' || text === 'menú' || text === 'inicio') {
    return `¡Hola! 👋 Bienvenido a la *Academia MPS* (Music and Production School).\n\nSoy tu asistente virtual. Por favor, responde con el número de la opción que deseas consultar:\n\n1️⃣ Horarios de Clases\n2️⃣ Tarifas de Clases\n3️⃣ Planes de Alquiler de Espacios\n4️⃣ Preguntas Frecuentes`;
  }

  // Opción 1: Horarios
  if (text === '1') {
    return `🕒 *Horarios de Clases*\n\nNuestras clases son flexibles y se adaptan a ti:\n- Lunes a Viernes: 2:00 PM a 8:00 PM\n- Sábados: 8:00 AM a 4:00 PM\n\n¿Quieres agendar una clase de prueba? Escribe *Humano* para que un asesor te contacte.\n\n_(Escribe *Menu* para volver al inicio)_`;
  }

  // Opción 2: Tarifas
  if (text === '2') {
    return `💰 *Tarifas de Clases*\n\nTenemos diferentes planes según tu nivel:\n\n*Área de Música (Piano, Canto, Guitarra, etc.):*\n- Plan Mensual (4 clases): $150.000 COP\n- Plan Trimestral: $400.000 COP\n\n*Producción Musical & DJ:*\n- Curso Completo (6 meses): $1.200.000 COP\n\n_(Escribe *Menu* para volver al inicio)_`;
  }

  // Opción 3: Alquiler
  if (text === '3') {
    return `🎙️ *Planes de Alquiler de Espacios*\n\nContamos con estudios profesionales totalmente equipados:\n\n- *Sala de Ensayo:* $30.000 COP / hora\n- *Estudio de Grabación:* $50.000 COP / hora\n- *Estudio de Fotografía:* $40.000 COP / hora\n\n_(Escribe *Menu* para volver al inicio)_`;
  }

  // Opción 4: FAQ
  if (text === '4') {
    return `❓ *Preguntas Frecuentes*\n\n*¿Desde qué edad reciben niños?*\nDesde los 2 años en estimulación temprana.\n\n*¿Debo llevar mi instrumento?*\nNo es necesario, la academia te presta los instrumentos durante la clase.\n\n*¿Dónde están ubicados?*\nBarrio Teusaquillo, Bogotá.\n\n_(Escribe *Menu* para volver al inicio)_`;
  }
  
  if (text === 'humano') {
     return `Entendido. 🧑‍💻 En un momento uno de nuestros asesores reales tomará este chat para hablar contigo directamente. ¡Gracias por tu paciencia!`;
  }

  // Respuesta por defecto
  return `No entendí tu mensaje. 😔\n\nPor favor, escribe *Hola* o *Menu* para ver las opciones disponibles, o escribe *Humano* si deseas hablar con un asesor.`;
}
