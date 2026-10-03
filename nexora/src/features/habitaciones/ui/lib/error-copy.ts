export function roomTypeErrorCopy(status: number): string {
  switch (status) {
    case 400:
      return 'Revisa los datos: hay algo que el sistema no llegó a entender. Vuelve a mirar el nombre, la capacidad y el precio base, y prueba de nuevo.'
    case 422:
      return 'Casi: recibimos todo, pero algún dato no cumple las reglas. Revisa la capacidad y asegúrate de que el precio base sea mayor a 0.'
    case 409:
      return 'Ya existe un registro con esos datos. Prueba con otro número o nombre para distinguirlo de los demás.'
    case 500:
      return 'No fue tu culpa: algo se nos escapó del lado del servidor y no pudimos guardar la habitación. Lo que escribiste sigue intacto; vuelve a intentarlo en un momento.'
    default:
      return 'No pudimos guardar la habitación en este momento. Revisa tu conexión y vuelve a intentarlo en unos segundos.'
  }
}
