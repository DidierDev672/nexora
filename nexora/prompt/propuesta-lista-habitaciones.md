# Listado de habitaciones con Infinite Scroll (React + Axios)

## 1. Objetivo

Mostrar una tabla de habitaciones consumiendo `GET /room`, enriquecida con datos de tipo de cama (`GET /types-bed/{id}`) y edificio (`GET /building/{id}`), con carga incremental (infinite scroll) a medida que el usuario se desplaza.

---

## 2. Problema de diseño principal: N+1 requests

El endpoint `/room` no devuelve el nombre del tipo de cama ni del edificio, solo sus IDs (`room_types_id`, `building_id`). Si por cada habitación se llama a `/types-bed/{id}` y `/building/{id}` de forma individual, con 20 habitaciones por página se generarían hasta 40 peticiones adicionales, repitiendo llamadas para IDs que se repiten entre habitaciones (varias habitaciones comparten edificio o tipo de cama).

**Solución propuesta: deduplicar y cachear.**

1. Al recibir una página de `/room`, extraer los `room_types_id` y `building_id` **únicos** de ese lote.
2. Comparar contra un caché en memoria (`Map<id, data>`) ya resuelto en páginas anteriores.
3. Solo pedir los IDs que faltan, en paralelo (`Promise.all` o `Promise.allSettled`).
4. Guardar el resultado en el caché para que páginas futuras no repitan la petición si el mismo edificio o tipo de cama vuelve a aparecer.
   Esto evita crecimiento lineal de peticiones a medida que se hace scroll, y mantiene la tabla fluida.

---

## 3. Estructura de datos en el frontend

Se propone un estado derivado (no la respuesta cruda) para pintar la tabla:

```
RoomRow {
  id
  number
  floor
  status              // available | occupied | maintenance | etc.
  priceOverride       // null o número
  bed: {
    name              // "Matrimonial" o "Cargando..." o "No disponible"
    capacityPeople
  }
  building: {
    name               // "Edificio A"
    floorNumber
    headquartersId
    subHeadquartersId
  }
}
```

Cada fila se pinta **de inmediato** con los datos de `/room` (número, piso, estado) y los campos de cama/edificio se muestran como placeholder (`skeleton` o "Cargando...") hasta que resuelva la petición enriquecida. Esto evita que la tabla se sienta bloqueada esperando las llamadas secundarias.

---

## 4. Infinite scroll

### 4.1 Paginación

El endpoint `/room` tal como está descrito no indica parámetros de paginación. Se proponen dos escenarios:

- **Si el backend soporta `?limit=&offset=` o `?page=&page_size=`**: usarlos directamente, pidiendo lotes de 20–30 habitaciones.
- **Si el backend no pagina aún** (devuelve todo el arreglo): implementar paginación **en cliente** sobre el arreglo ya recibido, cargando visualmente por lotes para no romper la experiencia de scroll. En este caso se recomienda dejarlo documentado como deuda técnica, porque cargar todas las habitaciones de una sola vez no escala si la lista crece.
  Se recomienda **confirmar con backend si ya existe paginación**, ya que cambia la implementación real. La propuesta de UI funciona igual en ambos casos.

### 4.2 Mecanismo de disparo

- Usar un `IntersectionObserver` sobre un elemento centinela ubicado en la última fila de la tabla, en lugar de escuchar el evento `scroll` del contenedor (mejor rendimiento, sin cálculos manuales de `scrollTop`).
- Al entrar en el viewport ese centinela, se dispara la carga de la siguiente página, siempre que:
  - No haya una carga en curso (evita duplicar peticiones).
  - Existan más páginas (`hasMore = true`).

### 4. Estados de la carga

| Estado                      | Qué se muestra                                                              |
| --------------------------- | --------------------------------------------------------------------------- |
| Carga inicial               | Skeleton de 5–8 filas mientras llega la primera página                      |
| Cargando más                | Fila spinner al final de la tabla ("Cargando más habitaciones...")          |
| Sin más resultados          | Mensaje sutil al final: "No hay más habitaciones"                           |
| Error en la página actual   | Fila con mensaje de error y botón "Reintentar" (no se pierde lo ya cargado) |
| Lista vacía (primera carga) | Estado vacío centrado: "No hay habitaciones registradas"                    |

---

## 5. Diseño visual de la tabla

### Columnas propuestas

| Columna      | Origen                 | Notas                                                                                                          |
| ------------ | ---------------------- | -------------------------------------------------------------------------------------------------------------- |
| Número       | `/room.number`         | Texto destacado (identificador principal)                                                                      |
| Piso         | `/room.floor`          | Numérico                                                                                                       |
| Edificio     | `/building.name`       | Con tooltip mostrando sede/subsede si aplica                                                                   |
| Tipo de cama | `/types-bed.name`      | Con badge de capacidad (ej. "Matrimonial · 2 pers.")                                                           |
| Estado       | `/room.status`         | Badge de color: disponible (verde), ocupada (rojo), mantenimiento (amarillo)                                   |
| Precio       | `/room.price_override` | Si es `null`, mostrar "Precio base" (sin override); si tiene valor, mostrarlo resaltado como "Precio especial" |
| Actualizado  | `/room.updated_at`     | Formateado, ej. "hace 2 días", con tooltip de fecha exacta                                                     |

### Comportamiento responsivo

- En pantallas anchas: tabla completa con las columnas anteriores.
- En pantallas angostas (tablet/móvil): colapsar a tarjetas apiladas (una por habitación) en lugar de tabla con scroll horizontal, para mantener la legibilidad.

### Filtros superior (Opcional, recomendado)

Barra sobre la tabla con:

- Bsucador por numero de habitacion.
- Filtro por estado.
- Filtro por edificio (una vez cargado el catálogo de edificios).

Estos filtros, si se resuelven en cliente sobre lo ya cargado, deben advertir que solo filtran lo visible ("Mostrando resultados de las habitaciones cargadas"). Si se resuelven en servidor, reinician el scroll infinito desde la página 1.

---

## 6. Menejo de errores y resilencia

- Si `/types-bed/{id}` o `/building/{id}` fallan para una habitación puntual, no debe bloquear el renderizado de la fila: mostrar "No disponible" en esa celda con un ícono de advertencia y permitir reintentar solo esa consulta (no toda la página).
- Reintentos automáticos (1–2 intentos con backoff corto) para las llamadas de enriquecimiento, ya que son más propensas a fallos transitorios al dispararse en paralelo.
- Cancelar peticiones en vuelo (`AbortController`) si el componente se desmonta o si el usuario aplica un filtro que invalida la página actual.

---

## 7. Redimiento con lista largas

- Si se prevé que la lista crezca a cientos de habitaciones visibles simultáneamente, considerar **virtualización** (renderizar solo las filas visibles en el viewport) además del infinite scroll, para que el DOM no crezca indefinidamente.
- Mantener el caché de edificios y tipos de cama fuera del ciclo de vida de la tabla (por ejemplo, en un store global o contexto), para que si el usuario navega y vuelve, no se repitan peticiones ya resueltas.

---

## 8. Librerias sugerencias (sin codigos)

- Manejo de datos remotos y caché: una librería de _data fetching_ con soporte de queries y caché (ej. React Query) simplifica mucho el patrón de "pedir solo lo que falta" y el manejo de estados de carga/error.
- Infinite scroll: un hook basado en `IntersectionObserver` (ya sea propio o de una librería ligera) en vez de escuchar el scroll manualmente.
- Virtualización (si aplica): una librería de listas virtualizadas para tablas grandes.

---

## 9. Flujo resumido

1. Se monta la tabla -> se pide la primera pagina de `/room`.
2. Se pintan las filas de inmediato con los datos propios de cada habitacion.
3. En parelelo, se resuelve los `building_id` y `room_types_id` únicos de esa página (usando caché).
4. Cuando resuelven, se actualizan solo las celdas de edificio y tipo de cama (sin re-renderizar toda la tabla).
5. El usuario hace scroll → el centinela entra en viewport → se pide la siguiente página → se repite el proceso 2–4.
6. Cuando el backend indica que no hay más páginas, se muestra el mensaje de fin de lista.

---

## 10. Supuesto a confirmar con backend

Esta propuesta asume que `/room` puede paginarse. Si actualmente no soporta parámetros de paginación, es el primer punto a resolver con el equipo backend, ya que condiciona si el infinite scroll es real (con carga bajo demanda) o simulado (todo cargado de una vez y mostrado por lotes en cliente).
