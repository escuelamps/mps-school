# 🎸 MPS (Music and Production School) - Proyecto Web

Documentación oficial del proyecto web creado para MPS (Music and Production School). Este documento detalla la arquitectura, tecnologías utilizadas, estructura del proyecto y guía de despliegue.

## 💻 Stack Tecnológico

El proyecto ha sido desarrollado utilizando tecnologías web modernas de alto rendimiento:

*   **Framework Principal:** [Next.js (App Router)](https://nextjs.org/) - Framework de React para aplicaciones web rápidas y optimizadas para SEO.
*   **Librería UI:** React 18
*   **Estilos y Tipografía:** CSS3 Puro (Vanilla CSS) con metodologías modernas. La tipografía oficial es **Montserrat**, cargada nativamente y optimizada en el servidor mediante `next/font/google` para evitar latencia (FOUC) y maximizar el rendimiento.
*   **Iconografía:** [Lucide React](https://lucide.dev/) - Sistema de íconos vectoriales ligeros y limpios.
*   **Despliegue (CI/CD):** [Vercel](https://vercel.com/) - Plataforma en la nube para despliegue automático desde GitHub.
*   **Control de Versiones:** Git & GitHub.
*   **Gestión de Dominio:** Hostinger (Alojamiento del dominio `escuelamps.com` enlazado mediante registros DNS (ALIAS/CNAME) a los servidores perimetrales de Vercel).

## 🏗️ Arquitectura y Estructura de Archivos

El proyecto sigue la estructura estándar recomendada por Next.js App Router:

```text
/mps
├── public/                 # Archivos estáticos públicos
│   └── images/             # Fotografías de docentes, logos y mockups de la academia
├── src/
│   └── app/                # Carpeta principal del App Router de Next.js
│       ├── globals.css     # Estilos globales, variables de color (--accent, --rich-black), utilidades responsive y de maquetación.
│       ├── layout.js       # Estructura principal de la aplicación (HTML base, Metadata de SEO).
│       ├── page.js         # Página Principal (Home) - Landing page, secciones de programas, sobre nosotros y testimonios.
│       └── docentes/       
│           └── page.js     # Página de Docentes - Galería interactiva del staff, con modales detallados de biografía y perfil profesional.
├── package.json            # Dependencias del proyecto y scripts de ejecución.
└── next.config.mjs         # Configuración del servidor de Next.js.
```

## ✨ Funcionalidades Principales

1.  **Landing Page Optimizada (Home):**
    *   Diseño Premium "Dark Mode" utilizando el verde vibrante institucional (`#00DE85`).
    *   Efectos de *Glassmorphism* (cristal esmerilado) para barras de navegación e interfaces flotantes.
    *   Secciones de "Programas", "Por qué elegirnos", y "Testimonios" con interacciones de *hover* suaves.

2.  **Sistema de Docentes Interactivo:**
    *   Directorio visual de profesores con imágenes optimizadas.
    *   **Modal de Perfil (Sidebar Dinámica):** Al hacer clic en un docente, se despliega una interfaz limpia lateral interactiva con su fotografía, cargo, perfil profesional detallado y enfoque pedagógico.

3.  **Diseño 100% Responsivo:**
    *   Adaptación perfecta a dispositivos móviles (Smartphones) y Tablets.
    *   Menús hamburguesa móviles interactivos programados a medida sin depender de librerías pesadas externas.
    *   Reestructuración automática de grillas de CSS (`grid-template-columns`) dependiendo del tamaño de pantalla.

4.  **Optimización SEO Avanzada:**
    *   Metadatos dinámicos generados del lado del servidor para asegurar que motores de búsqueda (Google) indexen correctamente a "MPS Music and Production School".

## 🚀 Despliegue y Mantenimiento (CI/CD)

El sitio web está completamente automatizado a través de la integración continua entre **GitHub** y **Vercel**.

### Flujo de Trabajo para Actualizaciones:
1.  **Edición de Código:** Se modifican los archivos locales (Ej. se actualiza un texto en `src/app/docentes/page.js` o se sube una nueva foto a `public/images/`).
2.  **Commit a Git:** Se guardan los cambios usando `git commit -am "Descripción del cambio"`.
3.  **Push a GitHub:** Se suben los cambios al repositorio central mediante `git push origin main`.
4.  **Despliegue Automático:** Vercel detecta la actualización en la rama `main` de GitHub, construye la aplicación y la pone en producción (en vivo) en un promedio de 60 a 90 segundos, actualizando automáticamente el dominio `escuelamps.com`.

## 🎨 Sistema de Diseño (Design System)

Las directrices estéticas del proyecto están centralizadas en `src/app/globals.css`. Si la directiva de la escuela desea modificar la paleta de colores en el futuro, la arquitectura permite hacerlo centralizadamente modificando la raíz:

```css
:root {
  --rich-black: #050505; /* Fondo principal oscuro profundo */
  --bg-secondary: #0A0A0A; /* Fondo secundario para tarjetas y modales */
  --accent: #00DE85; /* Verde neón institucional de MPS */
  --text-primary: #FFFFFF; /* Texto blanco principal para legibilidad */
  --text-secondary: #A0A0A0; /* Texto gris de apoyo para jerarquía visual */
}
```

La tipografía (Montserrat) está centralizada en `src/app/layout.js`, lo que asegura que envuelva globalmente la etiqueta `<html>` de la aplicación sin depender de llamadas externas lentas.

---
*Documentación técnica estructurada para la administración de MPS - 2026.*
