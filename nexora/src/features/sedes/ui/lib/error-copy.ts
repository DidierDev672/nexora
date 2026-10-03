export function sedesListLoadError(status?: number): string {
  if (status === 400) {
    return 'Las sedes no pudieron cargarse esta vez, pero tranqui: no es tu culpa. El servidor pidió una pausa y tus datos siguen a salvo. Respira, espera un momento y reintenta; casi siempre vuelve a fluir en el segundo intento.'
  }
  return 'Ups, las sedes no quisieron aparecer. Suele ser un descanso de los servidores; nada se perdió. Revisa tu conexión y reintenta cuando quieras: a veces el primer intento es solo el ensayo.'
}