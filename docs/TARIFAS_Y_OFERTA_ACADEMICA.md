# Documentación del Sistema Dinámico de Tarifas y Oferta Académica MPS

Esta documentación detalla la arquitectura, el modelo de datos en Firestore, la nomenclatura oficial de programas y el flujo de compra en el Checkout tras la eliminación de datos quemados y la integración de las tarifas oficiales.

---

## 1. Nomenclatura y Oferta Académica Oficial

La oferta formativa de la Escuela MPS se rige por las siguientes definiciones institucionales:

### A. Modalidades Principales
| Modalidad | Nombre Oficial | Formato y Características |
| :--- | :--- | :--- |
| **Grupal / Semipersonalizado** | **MPS Link** | Grupos reducidos (6 cátedras de instrumentos). 1.5 horas a la semana. Proceso trimestral con Google Classroom y concierto de cierre de ciclo. |
| **Individual Personalizado** | **MPS One (En Sede)** | Clases 1 a 1 en las instalaciones de la academia. Paquetes de 4, 8 o 12 clases con horario flexible. |
| **Individual a Domicilio** | **MPS One (A Domicilio)** | Clases personalizadas 1 a 1 en la residencia del estudiante con docente asignado MPS. Paquetes de 4, 8 o 12 clases. |

### B. Matrícula Institucional Anual ($50.000)
La matrícula **no es un curso independiente**. Es un concepto de registro estudiantil que se adiciona a la compra de cualquier programa para estudiantes de primer ingreso o renovación anual.
* **Inversión:** **$50.000 COP anuales**.
* **Beneficios incluidos:**
  * Código oficial y carné de estudiante MPS.
  * Reserva ilimitada de salas insonorizadas y equipadas para estudio personal.
  * Acceso a convenios institucionales y beneficios Yamaha.

### C. Nuevo Programa: Taller de Actuación
* **Identificador interno:** `taller-actuacion`
* **Inversión:** **$600.000 COP** por el trimestre completo (3 meses).
* **Módulos:** Arte Dramático, Expresión Corporal, Manejo de Voz, Manejo Creativo, Improvisación, Creación de Personaje e Interpretación.
* **Cierre:** Muestra escénica final y montaje en vivo en auditorio oficial ante público.

---

## 2. Tarifario Oficial Vigente (Base de Datos)

| Identificador Firestore | Concepto / Plan | Modalidad | Valor Oficial (COP) |
| :--- | :--- | :--- | :--- |
| `individual_sede_4` | 4 Clases Presenciales en Sede | MPS One | **$280.000** |
| `individual_sede_8` | 8 Clases Presenciales en Sede | MPS One | **$520.000** |
| `individual_sede_12` | 12 Clases Presenciales en Sede | MPS One | **$720.000** |
| `individual_domicilio_4` | 4 Clases a Domicilio | MPS One | **$305.000** |
| `individual_domicilio_8` | 8 Clases a Domicilio | MPS One | **$590.000** |
| `individual_domicilio_12` | 12 Clases a Domicilio | MPS One | **$830.000** |
| `grupal_semipersonalizado_mes` | Clases Grupales Semipersonalizadas | MPS Link | **$180.000 / mes** |
| `grupal_semipersonalizado_trimestre` | Clases Grupales Semipersonalizadas | MPS Link | **$540.000 / trimestre** |
| `taller_actuacion_trimestre` | Taller de Actuación (3 Meses) | Especial | **$600.000 / trimestre** |
| `matricula_institucional` | Matrícula Anual Institucional | Registro | **$50.000 / año** |

---

## 3. Arquitectura de Datos Dinámicos

1. **Sin redespliegues:** Cada documento en `tarifas` contiene `{ id, name, precio, tipo, modalidad, descripcion, actualizadoEn, actualizadoPor }`. Al editar un precio en `/admin/tarifas`, la base de datos se actualiza al instante.
2. **Escucha activa en el cliente (`onSnapshot`):** La página de `/checkout` tiene un listener reactivo abierto. Si la dirección de la escuela actualiza un precio mientras un estudiante está en el checkout, el valor se actualiza en pantalla automáticamente.
3. **Resiliencia offline:** Si Firestore o la conexión fallan, la web carga de forma segura los valores por defecto desde `src/data/programs.js`, garantizando disponibilidad del 100%.

---

## 4. Guía Operativa para la Dirección de la Escuela

### ¿Cómo actualizar un precio desde el panel?
1. Iniciar sesión en `/admin` con credenciales de **Dirección**, **Coordinación** o **Administración**.
2. Hacer clic en la tarjeta verde **"Tarifas y Costos"** (`/admin/tarifas`).
3. Ubicar el paquete que se desea modificar (ej. *4 Clases Individuales en Sede*).
4. Cambiar el número en el campo de texto (ej. cambiar `280000` por `290000`).
5. Presionar el botón verde **"Guardar"**.
6. Aparecerá una notificación de confirmación verde y el nuevo precio estará activo en toda la web y la app móvil.

Si en algún momento se desea volver a las tarifas de los volantes físicos originales, al final de `/admin/tarifas` hay un botón que dice **"Restaurar todos los precios a valores oficiales de volante"**.
