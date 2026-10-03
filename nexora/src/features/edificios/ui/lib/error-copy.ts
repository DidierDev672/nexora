export function edificioErrorCopy(status: number): string {
  switch (status) {
    case 400:
      return 'Revisa los datos del edificio: hay algo que el sistema no llegó a entender. Vuelve a mirar el nombre, los pisos y la sede, y prueba de nuevo.'
    case 422:
      return 'Casi: recibimos todo, pero algún dato no cumple las reglas. Revisa el nombre, el número de pisos y la sede, y vuelve a intentarlo.'
    case 409:
      return 'Ya existe un edificio con esos datos en esa sede. Prueba con otro nombre para distinguirlo.'
    case 500:
      return 'No fue tu culpa: algo se nos escapó del lado del servidor y no pudimos guardar el edificio. Lo que escribiste sigue intacto; vuelve a intentarlo en un momento.'
    default:
      return 'No pudimos guardar el edificio en este momento. Revisa tu conexión y vuelve a intentarlo en unos segundos.'
  }
}