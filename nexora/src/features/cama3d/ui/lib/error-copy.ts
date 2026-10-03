export function tipoCamaErrorCopy(status: number): string {
  switch (status) {
    case 400:
      return 'Se nos hizo un nudo el catálogo de tipos de cama. Respirá hondo: ya estamos deshaciéndolo para que elijas con calma.'
    case 404:
      return 'No encontramos el catálogo de tipos de cama por ahora. Volvé en unos instantes y lo tendrás a la vista.'
    case 500:
      return 'No fue tu culpa: algo se nos escapó del lado del servidor y el catálogo quedó a medio traer. Volvé a intentarlo en unos segundos.'
    default:
      return 'No pudimos cargar los tipos de cama por el momento. Revisá tu conexión e inténtalo de nuevo: las camas te están esperando.'
  }
}

export function tipoCamaCreateErrorCopy(status: number): string {
  switch (status) {
    case 400:
      return 'El formulario se nos resistió y no pudimos guardar el nuevo tipo de cama. Repasalo con calma: seguro que solo falta un detalle.'
    case 404:
      return 'No encontramos dónde guardar el nuevo tipo de cama por ahora. Volvé en unos instantes y reintentá.'
    case 500:
      return 'No fue tu culpa: algo se nos escapó del lado del servidor y tu tipo de cama quedó en el tintero. Volvé a intentarlo en unos segundos.'
    default:
      return 'No pudimos guardar el tipo de cama por el momento. Revisá tu conexión e inténtalo de nuevo: quedó en tus manos.'
  }
}

export const modelosNoDisponiblesCopy =
  'Despegó la sorpresa: los modelos 3D de las camas y los sofás quedaron en el taller. No fue tu culpa, a veces el motor se queda sin aire. Reintentá y los volvemos a armar en un abrir y cerrar de ojos.'