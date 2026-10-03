/**
 * Tipos de dominio y utilidades para el listado de tarifas registradas (GET /rates).
 * Diseñado con principios de psicología positiva, claridad y soporte de moneda colombiana (COP).
 */

export interface TarifaItemResponse {
  id: string;
  name: string;
  headquarter_id: string;
  subheadquarter_id: string | null;
  room_type_id: string | null;
  modality: string;
  price: number;
  duration_units: number;
  start_time: string | null;
  end_time: string | null;
  days_of_week: string;
  status: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export type ModalitySpanish =
  | 'Diario / Por día'
  | 'Por noche'
  | 'Por hora'
  | 'Semanal'
  | 'Mensual'
  | 'Pasante'
  | 'Mañana'
  | 'Tarde'
  | 'Personalizada';

export type StatusSpanish = 'Activa' | 'Inactiva' | 'Borrador' | 'Suspendida';

/**
 * Diccionario de traducción de modalidades en inglés al español para visualización del usuario.
 */
export const MODALITY_TRANSLATIONS: Record<string, string> = {
  daily: 'Por día',
  day: 'Por día',
  nightly: 'Por noche',
  night: 'Por noche',
  hourly: 'Por hora',
  hour: 'Por hora',
  hours: 'Por horas',
  weekly: 'Semanal',
  week: 'Semanal',
  monthly: 'Mensual',
  month: 'Mensual',
  passerby: 'Pasante',
  passing: 'Pasante',
  morning: 'Turno Mañana',
  afternoon: 'Turno Tarde',
  weekend: 'Fin de semana',
};

/**
 * Traduce cualquier modalidad (ingles/técnica) a un término amigable en español.
 */
export function translateModalityToSpanish(modality?: string | null): string {
  if (!modality) return 'No especificada';
  const key = modality.trim().toLowerCase();
  return (
    MODALITY_TRANSLATIONS[key] ||
    modality.charAt(0).toUpperCase() + modality.slice(1)
  );
}

/**
 * Diccionario de traducción de estados en inglés al español.
 */
export const STATUS_TRANSLATIONS: Record<string, string> = {
  active: 'Activa',
  inactive: 'Inactiva',
  draft: 'Borrador',
  suspended: 'Suspendida',
  pending: 'Pendiente',
  archived: 'Archivada',
};

/**
 * Traduce cualquier estado al español amigable.
 */
export function translateStatusToSpanish(status?: string | null): string {
  if (!status) return 'Inactiva';
  const key = status.trim().toLowerCase();
  return STATUS_TRANSLATIONS[key] || (key === 'active' ? 'Activa' : 'Inactiva');
}

/**
 * Formateador de moneda colombiana (COP).
 * Ejemplo: 120000 -> "$ 120.000" o "$ 120.000 COP"
 */
export function formatCurrencyCOP(price: number | null | undefined): string {
  if (price == null || Number.isNaN(price)) return '$ 0 COP';

  try {
    const formatted = new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(price);
    return `${formatted}`;
  } catch {
    return `$ ${Number(price).toLocaleString('es-CO')} COP`;
  }
}

/**
 * Formatea una hora en formato amigable de 12 o 24 horas.
 * Ejemplo: "20:00:00" -> "08:00 PM"
 */
export function formatHoraAmigable(timeString?: string | null): string {
  if (!timeString) return 'Flexible';
  const clean = timeString.trim();
  if (!clean || clean === 'null' || clean === 'undefined') return 'Flexible';

  const parts = clean.split(':');
  if (parts.length >= 2) {
    const hours = Number.parseInt(parts[0], 10);
    const minutes = parts[1];
    if (!Number.isNaN(hours)) {
      const period = hours >= 12 ? 'PM' : 'AM';
      const displayHours = hours % 12 || 12;
      return `${displayHours.toString().padStart(2, '0')}:${minutes} ${period}`;
    }
  }
  return clean;
}

/**
 * Estructura de retroalimentación psicológica por status code HTTP.
 */
export interface StatusCodePsychology {
  statusCode: number;
  type: 'success' | 'info' | 'warning' | 'error';
  title: string;
  message: string;
  subtext: string;
  suggestedActionLabel?: string;
}

/**
 * Switch de validación de status code que implementa psicología positiva,
 * no-culpabilidad, tranquilidad y empoderamiento del usuario.
 */
export function getStatusCodePsychology(
  statusCode: number,
  serverMessage?: string
): StatusCodePsychology | null {
  switch (statusCode) {
    case 200:
      // En status 200 no se presenta mensaje al usuario ya que la información se visualiza directamente
      return null;

    case 204:
      return {
        statusCode: 204,
        type: 'info',
        title: 'El catálogo está listo para comenzar',
        message:
          'Aún no se han configurado tarifas para esta sede o filtro. Esto es completamente normal en nuevas implementaciones.',
        subtext:
          'Puedes registrar tu primera tarifa comercial en cualquier momento para activar las reservas.',
        suggestedActionLabel: 'Registrar nueva tarifa',
      };

    case 400:
      return {
        statusCode: 400,
        type: 'warning',
        title: 'Ajustemos los parámetros de consulta',
        message:
          serverMessage ||
          'Algunos criterios de búsqueda necesitan ser revisados. No te preocupes: tus tarifas existentes están completamente seguras.',
        subtext:
          'Te sugerimos restablecer los filtros para volver a visualizar todo el catálogo sin restricciones.',
        suggestedActionLabel: 'Restablecer filtros',
      };

    case 401:
      return {
        statusCode: 401,
        type: 'warning',
        title: 'Sesión protegida por tu seguridad',
        message:
          'Por motivos de resguardo de las políticas financieras de tu hotel, tu sesión ha culminado de forma segura.',
        subtext:
          'Solo necesitas ingresar nuevamente tus credenciales para reanudar la gestión de tarifas con total tranquilidad.',
        suggestedActionLabel: 'Iniciar sesión nuevamente',
      };

    case 403:
      return {
        statusCode: 403,
        type: 'warning',
        title: 'Acceso reservado para administradores',
        message:
          'Tu cuenta cuenta con restricciones de consulta sobre este catálogo para preservar la gobernanza de precios.',
        subtext:
          'Si requieres auditar o visualizar estas tarifas, tu supervisor o administrador de sede puede habilitarte el rol en instantes.',
      };

    case 404:
      return {
        statusCode: 404,
        type: 'info',
        title: 'No encontramos tarifas con los filtros actuales',
        message:
          serverMessage ||
          'No se encontraron registros de tarifas para la sede seleccionada. Todo tu historial permanece seguro.',
        subtext:
          'Prueba cambiando de sede o creando un nuevo plan comercial adaptado a tus huéspedes.',
        suggestedActionLabel: 'Ver todas las sedes',
      };

    case 409:
      return {
        statusCode: 409,
        type: 'warning',
        title: 'Alineación de políticas tarifarias',
        message:
          'Se detectó una concurrencia momentánea al sincronizar los turnos. Tu información no se ha alterado.',
        subtext:
          'Pulsa el botón de actualizar para que el sistema armonice los registros automáticamente.',
        suggestedActionLabel: 'Actualizar catálogo',
      };

    case 422:
      return {
        statusCode: 422,
        type: 'warning',
        title: 'Formato de consulta no procesable',
        message:
          'El servidor de tarifas recibió un parámetro con valores fuera del rango esperado.',
        subtext:
          'Simplificamos la consulta para mostrarte los datos sin interrupciones.',
        suggestedActionLabel: 'Reintentar',
      };

    case 429:
      return {
        statusCode: 429,
        type: 'info',
        title: 'El sistema está tomando un breve respiro',
        message:
          'Hemos recibido múltiples consultas simultáneas en pocos segundos. Estamos garantizando la máxima precisión en cada tarifa.',
        subtext:
          'Por favor espera unos instantes antes de volver a pulsar actualizar.',
      };

    case 500:
      return {
        statusCode: 500,
        type: 'error',
        title: 'Nuestros servidores están en una breve pausa técnica',
        message:
          'Se presentó una interrupción temporal en el motor de tarifas. Tus tarifas activas continúan operando para tus huéspedes.',
        subtext:
          'Nuestro equipo monitoriza el servicio constantemente. Puedes pulsar reintentar en cualquier momento.',
        suggestedActionLabel: 'Reintentar sincronización',
      };

    case 502:
    case 503:
    case 504:
      return {
        statusCode: statusCode,
        type: 'error',
        title: 'Reconectando con el servicio de tarifas',
        message:
          'El canal de comunicación con la base de datos se está restableciendo en segundo plano.',
        subtext:
          'Verifica tu conexión de red o pulsa reintentar para enlazar de nuevo en un segundo.',
        suggestedActionLabel: 'Reintentar conexión',
      };

    default:
      return {
        statusCode: statusCode,
        type: 'error',
        title: `Respuesta de verificación (${statusCode})`,
        message:
          serverMessage ||
          'Se ha recibido un estado de respuesta no estándar del servidor. Toda tu información se mantiene a salvo.',
        subtext:
          'Pulsa en reintentar para sincronizar los datos más recientes con el servidor.',
        suggestedActionLabel: 'Reintentar',
      };
  }
}

/**
 * Switch de validación de status code para la actualización de tarifas (PUT /rates/{id}).
 * Diseñado con psicología de no-culpabilidad, tranquilidad, transparencia y orientación a la acción.
 */
export function getUpdateRateStatusPsychology(
  statusCode: number,
  rateName?: string,
  newStatus?: string,
  serverMessage?: string,
): StatusCodePsychology {
  const statusLabel = newStatus === 'active' ? 'Activa' : 'Inactiva';
  const nameLabel = rateName ? `«${rateName}»` : 'seleccionada';

  switch (statusCode) {
    case 200:
      return {
        statusCode: 200,
        type: 'success',
        title: '¡Tarifa actualizada con total éxito!',
        message:
          `La tarifa ${nameLabel} ahora se encuentra como ${statusLabel}. Los cambios se sincronizaron en el sistema y se aplicarán de inmediato a las nuevas reservaciones.`,
        subtext:
          'Tus recepcionistas y el motor comercial ya operan con esta política de disponibilidad actualizada.',
        suggestedActionLabel: 'Aceptar',
      };

    case 400:
      return {
        statusCode: 400,
        type: 'warning',
        title: 'Revisemos los parámetros de la tarifa',
        message:
          serverMessage ||
          'Detectamos que algunos valores del plan tarifario necesitan alinearse antes de guardarse. Pero no te preocupes: tu tarifa original permanece 100% segura e intacta.',
        subtext:
          'Verifica que los horarios, modalidad y precios de la tarifa cumplan con los rangos permitidos.',
        suggestedActionLabel: 'Revisar datos',
      };

    case 404:
      return {
        statusCode: 404,
        type: 'error',
        title: 'No localizamos la tarifa en el sistema central',
        message:
          serverMessage ||
          `No fue posible encontrar el registro de la tarifa ${nameLabel} en el servidor (pudo haber sido removida o reasignada recientemente). Todo tu catálogo de sedes sigue protegido.`,
        subtext:
          'Te recomendamos recargar la lista de tarifas para sincronizar los registros más recientes.',
        suggestedActionLabel: 'Recargar catálogo',
      };

    case 422:
      return {
        statusCode: 422,
        type: 'warning',
        title: 'Condición comercial no procesable',
        message:
          serverMessage ||
          `El estado ${statusLabel} no es compatible con las reglas actuales de la sede o el tipo de habitación asignado. Tu configuración previa no sufrió modificaciones.`,
        subtext:
          'Comprueba que el estado seleccionado no entre en conflicto con turnos vigentes o políticas de ocupación.',
        suggestedActionLabel: 'Verificar condiciones',
      };

    case 500:
      return {
        statusCode: 500,
        type: 'error',
        title: 'El servidor está tomando una breve pausa',
        message:
          serverMessage ||
          `Ocurrió una interrupción inesperada en el servidor al intentar actualizar la tarifa ${nameLabel}. Ten la total tranquilidad de que tu información previa está a salvo.`,
        subtext:
          'Nuestro equipo técnico ya está al tanto de este incidente. Espera unos momentos y presiona «Reintentar actualización».',
        suggestedActionLabel: 'Reintentar actualización',
      };

    default:
      return {
        statusCode,
        type: 'error',
        title: 'Pausa momentánea en la sincronización',
        message:
          serverMessage ||
          `El servidor respondió con código HTTP ${statusCode}. Tus datos están protegidos y ningún cambio inconsistente fue aplicado.`,
        subtext:
          'Intenta nuevamente en unos instantes o consulta con el administrador del sistema.',
        suggestedActionLabel: 'Reintentar',
      };
  }
}
