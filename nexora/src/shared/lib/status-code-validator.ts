export type HttpStatusCategory = 'success' | 'info' | 'warning' | 'error'

export interface StatusCodeValidationResult {
  /** Indica si la petición fue exitosa (código HTTP 2xx) */
  isValid: boolean
  /** Código de estado HTTP evaluado */
  status: number
  /**
   * Mensaje empático redactado con psicología del usuario.
   * Regla de negocio: para el código 200 es estrictamente `null` (sin mensaje).
   */
  message: string | null
  /** Categoría semántica para determinar el tono visual (toasts, alertas o modales) */
  category: HttpStatusCategory
  /** Título sugerido para el componente de retroalimentación */
  title: string | null
}

/**
 * Valida el código de estado HTTP (status code) de un endpoint y genera una respuesta
 * comprensiva y empática siguiendo principios de psicología del usuario:
 * - Nunca culpa al usuario de los fallos.
 * - Brinda certidumbre (los datos siguen seguros).
 * - Ofrece un próximo paso claro y tranquilizador.
 * - **Para el código 200: no genera mensaje (`null`).**
 *
 * Utiliza un `switch` para mapear de manera predecible y extensible cada status code.
 *
 * @param status Código numérico de estado HTTP retornado por el servidor o endpoint.
 * @returns Objeto `StatusCodeValidationResult` con estado, validez, categoría y mensaje.
 */
export function validateStatusCode(status: number): StatusCodeValidationResult {
  switch (status) {
    // --- ÉXITO ---
    case 200:
      // Requisito estricto: el código 200 no tiene mensaje.
      return {
        isValid: true,
        status: 200,
        message: null,
        category: 'success',
        title: null,
      }

    case 201:
      return {
        isValid: true,
        status: 201,
        message:
          '¡Excelente! La información se registró con éxito y ya está disponible en el sistema.',
        category: 'success',
        title: 'Registro completado',
      }

    case 202:
      return {
        isValid: true,
        status: 202,
        message:
          'Tu solicitud fue recibida y se está procesando en segundo plano. Puedes continuar trabajando con tranquilidad.',
        category: 'info',
        title: 'Procesando en segundo plano',
      }

    case 204:
      return {
        isValid: true,
        status: 204,
        message:
          'Acción realizada con éxito. Los cambios solicitados ya se aplicaron en el sistema.',
        category: 'success',
        title: 'Operación realizada',
      }

    // --- ERRORES DEL CLIENTE (4XX) ---
    case 400:
      return {
        isValid: false,
        status: 400,
        message:
          'Parece que algunos datos necesitan ajuste o están incompletos. Tranquilo(a), tu información no se ha perdido: verifica los campos requeridos y vuelve a intentar.',
        category: 'warning',
        title: 'Revisión necesaria',
      }

    case 401:
      return {
        isValid: false,
        status: 401,
        message:
          'Tu sesión se pausó por seguridad para proteger tu cuenta. Inicia sesión nuevamente para retomar tus tareas justo donde las dejaste.',
        category: 'warning',
        title: 'Sesión protegida',
      }

    case 403:
      return {
        isValid: false,
        status: 403,
        message:
          'Esta acción o sección requiere permisos adicionales. Si consideras que deberías tener acceso, tu administrador de equipo puede habilitarlo en unos segundos.',
        category: 'warning',
        title: 'Permiso requerido',
      }

    case 404:
      return {
        isValid: false,
        status: 404,
        message:
          'No pudimos encontrar la información solicitada en este momento. Puede haber cambiado de ubicación o ya no encontrarse disponible.',
        category: 'info',
        title: 'Elemento no encontrado',
      }

    case 408:
      return {
        isValid: false,
        status: 408,
        message:
          'La conexión tardó un poco más de lo habitual en responder. Todo sigue intacto; por favor revisa tu señal de red y reintenta en breve.',
        category: 'warning',
        title: 'Tiempo de espera alcanzado',
      }

    case 409:
      return {
        isValid: false,
        status: 409,
        message:
          'Existe una coincidencia con información ya registrada (como un código, habitación o reserva existente). Verifica los datos para evitar duplicados.',
        category: 'warning',
        title: 'Conflicto de registros',
      }

    case 422:
      return {
        isValid: false,
        status: 422,
        message:
          'Recibimos tu solicitud, pero algunos datos no cumplen con las reglas requeridas por el sistema. Revisa las indicaciones y vuelve a probar.',
        category: 'warning',
        title: 'Datos no procesables',
      }

    case 429:
      return {
        isValid: false,
        status: 429,
        message:
          'Hemos recibido muchas peticiones en pocos segundos. Tómate un pequeño respiro de unos instantes y vuelve a intentar; enseguida estará listo.',
        category: 'warning',
        title: 'Pausa preventiva',
      }

    // --- ERRORES DEL SERVIDOR (5XX) ---
    case 500:
      return {
        isValid: false,
        status: 500,
        message:
          'Nuestros servidores experimentaron un contratiempo temporal. No es tu culpa y tus datos están seguros. Danos unos segundos y reintenta la acción.',
        category: 'error',
        title: 'Contratiempo temporal',
      }

    case 502:
      return {
        isValid: false,
        status: 502,
        message:
          'Hubo una interrupción breve en la comunicación entre servidores. El sistema se está reconectando automáticamente; reintenta en unos instantes.',
        category: 'error',
        title: 'Reconectando servicios',
      }

    case 503:
      return {
        isValid: false,
        status: 503,
        message:
          'El servicio se encuentra en una breve pausa de mantenimiento para mejorar la plataforma. Estará disponible nuevamente muy pronto; gracias por tu paciencia.',
        category: 'error',
        title: 'Mantenimiento preventivo',
      }

    case 504:
      return {
        isValid: false,
        status: 504,
        message:
          'El servidor tardó más de lo esperado en procesar la respuesta. No te preocupes, nada se ha dañado; intenta nuevamente en unos momentos.',
        category: 'error',
        title: 'Servidor demorado',
      }

    // --- CASO POR DEFECTO ---
    default: {
      const isSuccessful = status >= 200 && status < 300
      return {
        isValid: isSuccessful,
        status,
        message: isSuccessful
          ? 'Operación realizada correctamente.'
          : 'Ocurrió un evento inesperado al comunicarnos con el servidor. Tu información permanece a salvo; por favor reintenta en un momento.',
        category: isSuccessful ? 'success' : 'error',
        title: isSuccessful ? 'Operación exitosa' : 'Aviso del sistema',
      }
    }
  }
}

/**
 * Función auxiliar para obtener exclusivamente el mensaje psicológico
 * de un status code.
 *
 * @param status Código de estado HTTP.
 * @returns Mensaje de texto empático o `null` si el código es 200.
 */
export function getStatusCodeMessage(status: number): string | null {
  return validateStatusCode(status).message
}
