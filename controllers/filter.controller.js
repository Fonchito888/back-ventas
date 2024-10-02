import { FilterModel } from '../models/fiters.model.js'
import moment from 'moment'

// Función para validar que la fecha proporcionada sea válida en formato ISO 8601.
const isValidDate = (date) => {
  return moment(date, moment.ISO_8601, true).isValid()
}

// ---------------------------------------------------------------FILTRO PRODUCTOS----------------------------------------------------------------------

// Filtrar el valor gastado de productos en un rango de fechas.
const filterproductsgasto = async (req, res) => {
  try {
    const { fechainicio, fechafin } = req.body

    // Verifica que se hayan proporcionado ambos campos de fecha.
    if (!fechainicio || !fechafin) {
      return res.status(400).json({ error: 'Faltan campos obligatorios: fechainicio, fechafin' })
    }

    // Valida que las fechas proporcionadas sean correctas en formato ISO 8601.
    if (!isValidDate(fechainicio) || !isValidDate(fechafin)) {
      return res.status(400).json({ error: 'Fecha de inicio o fecha de fin no tienen un formato válido.' })
    }

    const FechaInicio = new Date(fechainicio)
    const FechaFin = new Date(fechafin)
    // Fecha límite de 1900 para validación.
    const fechaLimite = new Date('1900-01-01')

    // Verifica que la fecha de inicio no sea posterior a la de fin.
    if (FechaInicio > FechaFin) {
      return res.status(400).json({ error: 'La fecha de inicio no puede ser posterior a la fecha de fin.' })
    }

    // Verifica que la fecha de inicio no sea anterior a 1900.
    if (fechaLimite > FechaInicio) {
      return res.status(400).json({ error: 'La fecha de inicio no puede ser anterior a 1900.' })
    }

    // Llama al modelo para obtener los resultados basados en el rango de fechas.
    const resultados = await FilterModel.filterproductbyspent({ fechainicio, fechafin })

    // Si no se encuentran productos en el rango de fechas especificado, responde con un mensaje 404.
    if (resultados.length === 0) {
      return res.status(404).json({ message: 'No se encontraron productos en el rango de fechas especificado.' })
    }

    // Devuelve los resultados encontrados en una respuesta JSON con un estado 200.
    return res.status(200).json(resultados)
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: error.message })
  }
}
// Filtrar ganancias por todos los productos, ignorando los estados.
const filterproducts = async (req, res) => {
  try {
    const { fechainicio, fechafin } = req.body

    // Verifica que se hayan proporcionado ambos campos de fecha.
    if (!fechainicio || !fechafin) {
      return res.status(400).json({ error: 'Faltan campos obligatorios: fechainicio, fechafin' })
    }

    // Valida que las fechas proporcionadas sean correctas en formato ISO 8601.
    if (!isValidDate(fechainicio) || !isValidDate(fechafin)) {
      return res.status(400).json({ error: 'Fecha de inicio o fecha de fin no tienen un formato válido.' })
    }

    const FechaInicio = new Date(fechainicio)
    const FechaFin = new Date(fechafin)
    // Crea una fecha límite de 1900 para validación.
    const fechaLimite = new Date('1900-01-01')

    // Verifica que la fecha de inicio no sea anterior a 1900.
    if (fechaLimite > FechaInicio) {
      return res.status(400).json({ error: 'La fecha de inicio no puede ser anterior a 1900.' })
    }

    // Verifica que la fecha de inicio no sea posterior a la fecha de fin.
    if (FechaInicio > FechaFin) {
      return res.status(400).json({ error: 'La fecha de inicio no puede ser posterior a la fecha de fin.' })
    }

    // Llama al modelo para obtener los resultados basados en el rango de fechas.
    const resultados = await FilterModel.filterproducts({ fechainicio, fechafin })

    // Si no se encuentran productos en el rango de fechas especificado, responde con un mensaje 404.
    if (resultados.length === 0) {
      return res.status(404).json({ message: 'No se encontraron usuarios en el rango de fechas especificado.' })
    }

    // Devuelve los resultados encontrados en una respuesta JSON con un estado 200.
    return res.status(200).json(resultados)
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: error.message })
  }
}

// Filtrar ganancias de producto por estado específico.
const filterproductsbystate = async (req, res) => {
  try {
    const { state, fechainicio, fechafin } = req.body

    // Verifica que se hayan proporcionado los campos requeridos.
    if (!state || !fechainicio || !fechafin) {
      return res.status(400).json({ error: 'Faltan campos obligatorios: state, fechainicio, fechafin' })
    }

    // Valida que las fechas sean correctas en formato ISO 8601.
    if (!isValidDate(fechainicio) || !isValidDate(fechafin)) {
      return res.status(400).json({ error: 'Fecha de inicio o fecha de fin no tienen un formato válido.' })
    }

    const FechaInicio = new Date(fechainicio)
    const FechaFin = new Date(fechafin)
    // Fecha límite de 1900 para validación.
    const fechaLimite = new Date('1900-01-01')

    // Verifica que la fecha de inicio no sea posterior a la de fin.
    if (FechaInicio > FechaFin) {
      return res.status(400).json({ error: 'La fecha de inicio no puede ser posterior a la fecha de fin.' })
    }

    // Verifica que la fecha de inicio no sea anterior a 1900.
    if (fechaLimite > FechaInicio) {
      return res.status(400).json({ error: 'La fecha de inicio no puede ser anterior a 1900.' })
    }

    // Verifica que el estado sea uno de los permitidos: 'E', 'PE' o 'F'.
    if (state !== 'E' && state !== 'PE' && state !== 'F') {
      return res.status(400).json({ error: 'El estado solo puede ser entregado, por entregar, o finalizado.' })
    }

    // Llama al modelo para obtener los resultados basados en el rango de fechas y el estado del producto.
    const resultados = await FilterModel.filterproductbystate({ state, fechainicio, fechafin })

    // Si no se encuentran productos en el rango de fechas y estado especificado, responde con un mensaje 404.
    if (resultados.length === 0) {
      return res.status(404).json({ message: 'No se encontraron productos en el rango de fechas y el estado especificado.' })
    }

    // Devuelve los resultados encontrados en una respuesta JSON con un estado 200.
    return res.status(200).json(resultados)
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: error.message })
  }
}

// ---------------------------------------------------------------FILTRO VENTACONTADO----------------------------------------------------------------------
// Filtrar ganancias por todos los productos, ignorando los estados.
const filtervntcont = async (req, res) => {
  try {
    const { fechainicio, fechafin } = req.body

    // Verifica que se hayan proporcionado ambos campos de fecha.
    if (!fechainicio || !fechafin) {
      return res.status(400).json({ error: 'Faltan campos obligatorios: fechainicio, fechafin' })
    }

    // Valida que las fechas proporcionadas sean correctas en formato ISO 8601.
    if (!isValidDate(fechainicio) || !isValidDate(fechafin)) {
      return res.status(400).json({ error: 'Fecha de inicio o fecha de fin no tienen un formato válido.' })
    }

    const FechaInicio = new Date(fechainicio)
    const FechaFin = new Date(fechafin)
    // Crea una fecha límite de 1900 para validación.
    const fechaLimite = new Date('1900-01-01')

    // Verifica que la fecha de inicio no sea anterior a 1900.
    if (fechaLimite > FechaInicio) {
      return res.status(400).json({ error: 'La fecha de inicio no puede ser anterior a 1900.' })
    }

    // Verifica que la fecha de inicio no sea posterior a la fecha de fin.
    if (FechaInicio > FechaFin) {
      return res.status(400).json({ error: 'La fecha de inicio no puede ser posterior a la fecha de fin.' })
    }

    // Llama al modelo para obtener los resultados basados en el rango de fechas.
    const resultados = await FilterModel.filtervntcontado({ fechainicio, fechafin })

    // Si no se encuentran productos en el rango de fechas especificado, responde con un mensaje 404.
    if (resultados.length === 0) {
      return res.status(404).json({ message: 'No se encontraron usuarios en el rango de fechas especificado.' })
    }

    // Devuelve los resultados encontrados en una respuesta JSON con un estado 200.
    return res.status(200).json(resultados)
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: error.message })
  }
}

// ---------------------------------------------------------------FILTRO VENTACREDITO----------------------------------------------------------------------
// Filtrar ganancias por todos los productos, ignorando los estados.
const filtervntcre = async (req, res) => {
  try {
    const { fechainicio, fechafin } = req.body

    // Verifica que se hayan proporcionado ambos campos de fecha.
    if (!fechainicio || !fechafin) {
      return res.status(400).json({ error: 'Faltan campos obligatorios: fechainicio, fechafin' })
    }

    // Valida que las fechas proporcionadas sean correctas en formato ISO 8601.
    if (!isValidDate(fechainicio) || !isValidDate(fechafin)) {
      return res.status(400).json({ error: 'Fecha de inicio o fecha de fin no tienen un formato válido.' })
    }

    const FechaInicio = new Date(fechainicio)
    const FechaFin = new Date(fechafin)
    // Crea una fecha límite de 1900 para validación.
    const fechaLimite = new Date('1900-01-01')

    // Verifica que la fecha de inicio no sea anterior a 1900.
    if (fechaLimite > FechaInicio) {
      return res.status(400).json({ error: 'La fecha de inicio no puede ser anterior a 1900.' })
    }

    // Verifica que la fecha de inicio no sea posterior a la fecha de fin.
    if (FechaInicio > FechaFin) {
      return res.status(400).json({ error: 'La fecha de inicio no puede ser posterior a la fecha de fin.' })
    }

    // Llama al modelo para obtener los resultados basados en el rango de fechas.
    const resultados = await FilterModel.filtervntcredito({ fechainicio, fechafin })

    // Si no se encuentran productos en el rango de fechas especificado, responde con un mensaje 404.
    if (resultados.length === 0) {
      return res.status(404).json({ message: 'No se encontraron usuarios en el rango de fechas especificado.' })
    }

    // Devuelve los resultados encontrados en una respuesta JSON con un estado 200.
    return res.status(200).json(resultados)
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: error.message })
  }
}
// Exporta el controlador de filtros.
export const FilterController = {

  // filtros productos
  filterproducts,
  filterproductsbystate,
  filterproductsgasto,

  // filtros ventacontado
  filtervntcont,

  // filtros ventacredito
  filtervntcre
}
