export const checkRole = (tiporol) => {
  return (req, res, next) => {
    const { rol } = req // Obtén el rol del req

    if (!rol) {
      return res.status(401).json({ error: 'No autorizado' })
    }

    // Comprobar si el rol del usuario está en la lista de roles permitidos
    if (tiporol.includes(rol)) {
      return next()
    }

    return res.status(403).json({ error: 'Acceso denegado, rol no autorizado' })
  }
}
