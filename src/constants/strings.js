// Centralización de textos, mensajes de error y estados del sistema MPS
// Cero textos quemados en vistas y componentes.

export const STRINGS = {
  // Autenticación y Acceso
  AUTH: {
    TITLE: 'Acceso Restringido',
    SUBTITLE: 'Escuela MPS - Dashboard de Administración',
    USERNAME_LABEL: 'Usuario',
    PASSWORD_LABEL: 'Contraseña',
    SUBMIT_BUTTON: 'Entrar al Dashboard',
    INVALID_CREDENTIALS: 'Usuario o contraseña incorrectos.',
    INVALID_OR_EXPIRED_TOKEN: 'Token inválido o expirado.',
    SESSION_EXPIRED: 'Tu sesión ha expirado por inactividad.',
    LOGOUT_BUTTON: 'Cerrar sesión',
    LOADING: 'Iniciando sesión...',
  },

  // Estados Generales
  STATUS: {
    LOADING: 'Cargando...',
    SAVING: 'Guardando cambios...',
    SUCCESS: 'Operación realizada con éxito.',
    ERROR_GENERIC: 'Ocurrió un error inesperado. Por favor intenta nuevamente.',
    NETWORK_ERROR: 'Error de conexión. Verifica tu conexión a internet.',
    NO_DATA: 'No se encontraron registros disponibles.',
  },

  // Módulo de Tarifas y Costos
  TARIFAS: {
    TITLE: 'Gestión de Tarifas y Precios',
    SUBTITLE: 'Configuración dinámica de precios oficiales, paquetes de clases individuales, grupales y a domicilio.',
    LOADING: 'Cargando tarifas oficiales...',
    SAVE_SUCCESS: 'Tarifas actualizadas correctamente.',
    SAVE_ERROR: 'No se pudieron actualizar las tarifas. Intenta nuevamente.',
  },

  // Módulo de Planillas Docentes
  PLANILLAS: {
    TITLE: 'Planillas y Clases MPS',
    SUBTITLE: 'Registro de planillas docentes, firmas y seguimiento de Clases MPS.',
    LOADING: 'Cargando registros de planillas...',
    DELETE_ERROR: 'No se pudo eliminar el registro en el sistema.',
    NO_RECORDS: 'Aún no hay planillas registradas.',
  },

  // Checkout y Pagos
  CHECKOUT: {
    LOADING: 'Cargando Checkout Seguro...',
    VERIFYING: 'Verificando tu pago...',
    SUCCESS_TITLE: '¡Pago Confirmado!',
    SECURITY_NOTE: 'Transacción encriptada y protegida por la Escuela MPS.',
  }
};

export default STRINGS;
