import { ProductsModel } from '../models/products.model.js'
import { UserandClientModel } from '../models/usersandclient.model.js'
import { VentaCreditoModel } from '../models/VentaCredito.model.js'
import moment from 'moment'

// Función para validar que la fecha proporcionada sea válida en formato ISO 8601.
const isValidDate = (date) => {
  return moment(date, moment.ISO_8601, true).isValid()
}

// Función para registrar una nueva venta a crédito
const register = async (req, res) => {
  try {
    // Desestructuramos los campos necesarios del cuerpo de la solicitud
    const { cardnum, date, cuotainicial, IdCli, IdPro } = req.body

    // Verifica que todos los campos obligatorios estén presentes
    if (!cardnum || !date || !cuotainicial || !IdCli || !IdPro) {
      return res.status(400).json({ error: 'Faltan campos obligatorios: numero de tarjeta, fecha, cuotainicial, IdCli, IdPro' })
    }

    // Valida que el número de carta sea un número y no negativo
    if (isNaN(cardnum)) {
      return res.status(400).json({ error: 'El numero de carta no es válido.' })
    }
    if (cardnum < 0) {
      return res.status(409).json({ error: 'numero de carta no puede ser negativo' })
    }

    // Valida que la cuota inicial y los IDs sean números
    if (isNaN(cuotainicial)) {
      return res.status(400).json({ error: 'Por favor digite numero en cuota inicial.' })
    }
    if (isNaN(IdCli)) {
      return res.status(400).json({ error: 'El ID del usuario no es válido.' })
    }
    if (isNaN(IdPro)) {
      return res.status(400).json({ error: 'El ID del producto no es válido.' })
    }

    // Verifica si el usuario existe en la base de datos
    const user = await UserandClientModel.findOneUserId(IdCli)
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado.' })
    }

    // Verifica si el producto existe en la base de datos
    const product = await ProductsModel.findById(IdPro)
    if (!product) {
      return res.status(404).json({ error: 'Producto no encontrado.' })
    }

    // Verifica si el usuario está inactivo
    const clientinactivo = await UserandClientModel.findById(IdCli)
    if (clientinactivo.usu_estado === 'inactivo') {
      return res.status(409).json({ error: 'El usuario está inactivo' })
    }

    // Valida que la fecha tenga un formato válido
    if (!isValidDate(date)) {
      return res.status(400).json({ error: 'La fecha no tiene un formato válido.' })
    }

    // Verifica si la tarjeta ya ha sido utilizada
    const numcard = await VentaCreditoModel.findByIdnumcard(cardnum)
    if (numcard) {
      return res.status(409).json({ error: 'La tarjeta ya ha sido utilizada' })
    }

    // Verifica si el producto ya ha sido entregado
    if (product.pro_estado === 'E') {
      return res.status(409).json({ error: 'El producto ya ha sido entregado' })
    }

    // Valida que la cuota inicial no sea mayor que el precio del producto y no sea negativa
    if (cuotainicial > product.pro_precioventa) {
      return res.status(409).json({ error: 'Cuota inicial no puede ser mayor al precio del producto' })
    }
    if (cuotainicial < 0) {
      return res.status(409).json({ error: 'Cuota inicial no puede ser negativa' })
    }

    // Obtiene el ID del administrador que está realizando la operación
    const idadm = req.username
    const adm = await UserandClientModel.findOneUsername(idadm)

    // Crea una nueva venta a crédito
    const newVentacredito = await VentaCreditoModel.create({
      cardnum,
      date,
      cuotainicial,
      IdCli,
      IdPro,
      IdAdm: adm.usu_id
    })
    // Devuelve la respuesta con la nueva venta creada
    res.status(200).json(newVentacredito)
  } catch (error) {
    console.error(error) // Registra el error en la consola
    return res.status(500).json({ error: error.message }) // Devuelve un error interno si ocurre un problema
  }
}

// Función para eliminar una venta de crédito de la base de datos
const deleteventa = async (req, res) => {
  const { id } = req.params

  // Verifica que el ID sea un número
  if (isNaN(id)) {
    return res.status(400).json({ error: 'El ID de la venta no es válido.' })
  }

  try {
    // Busca la venta de crédito por ID
    const ventaCredito = await VentaCreditoModel.findByVCreId(id)
    if (!ventaCredito) {
      return res.status(404).json({ error: 'Venta de crédito no encontrada.' })
    }

    // Elimina la venta de crédito
    const deleteVenta = await VentaCreditoModel.deletevnccre(id)

    // Verifica si la eliminación fue exitosa
    if (deleteVenta) {
      // Devuelve una respuesta 200 (OK) con un mensaje de éxito
      return res.status(200).json({ message: 'Venta eliminada exitosamente' })
    }
  } catch (error) {
    console.error(error) // Registra el error en la consola
    return res.status(500).json({ error: error.message }) // Devuelve un error interno si ocurre un problema
  }
}

const updatevntcre = async (req, res) => {
  try {
    const { id } = req.params // Extrae el ID de la venta de los parámetros de la solicitud

    // Desestructuramos los campos necesarios del cuerpo de la solicitud
    const { cardnum, date, cuotainicial, IdCli, IdPro } = req.body

    // Verifica que todos los campos obligatorios estén presentes
    if (!cardnum || !date || !cuotainicial || !IdCli || !IdPro) {
      return res.status(400).json({ error: 'Faltan campos obligatorios: numero de tarjeta, fecha, cuotainicial, IdCli, IdPro' })
    }

    // Verifica que el ID de la venta sea un número
    if (isNaN(id)) {
      return res.status(400).json({ error: 'El ID de la venta no es válido.' })
    }

    // Valida que el número de carta sea un número y no negativo
    if (isNaN(cardnum)) {
      return res.status(400).json({ error: 'El numero de carta no es válido.' })
    }
    if (cardnum < 0) {
      return res.status(409).json({ error: 'numero de carta no puede ser negativo' })
    }

    // Valida que la cuota inicial y los IDs sean números
    if (isNaN(cuotainicial)) {
      return res.status(400).json({ error: 'Por favor digite numero en cuota inicial.' })
    }
    if (isNaN(IdCli)) {
      return res.status(400).json({ error: 'El ID del usuario no es válido.' })
    }
    if (isNaN(IdPro)) {
      return res.status(400).json({ error: 'El ID del producto no es válido.' })
    }

    // Busca la venta de crédito por su ID
    const numcardupdate = await VentaCreditoModel.findByVCreId(id)
    if (!numcardupdate) {
      return res.status(404).json({ error: 'Venta de crédito no encontrada.' })
    }

    // Verifica si el número de carta ha cambiado y si ya ha sido utilizada
    if (numcardupdate.vnc_numcarta !== cardnum.toString()) {
      const numcard = await VentaCreditoModel.findByIdnumcard(cardnum)
      if (numcard) {
        return res.status(409).json({ error: 'La tarjeta ya ha sido utilizada' })
      }
    }

    // Verifica si el usuario existe en la base de datos
    const user = await UserandClientModel.findOneUserId(IdCli)
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado.' })
    }

    // Verifica si el producto existe en la base de datos
    const product = await ProductsModel.findById(IdPro)
    if (!product) {
      return res.status(404).json({ error: 'Producto no encontrado.' })
    }

    // Verifica si el usuario está inactivo
    const clienteinactivo = await UserandClientModel.findById(IdCli)
    if (clienteinactivo.usu_estado === 'inactivo') {
      return res.status(409).json({ error: 'El usuario está inactivo' })
    }

    // Verifica si el producto ya ha sido entregado
    const proupdate = await VentaCreditoModel.findByVCreId(id)
    if (proupdate.vnc_pro_id !== IdPro.toString()) {
      const numpro = await VentaCreditoModel.findByProVCreId(IdPro)
      if (numpro) {
        return res.status(409).json({ error: 'El producto ya ha sido entregado' })
      }
    }

    // Valida que la fecha tenga un formato válido
    if (!isValidDate(date)) {
      return res.status(400).json({ error: 'La fecha no tiene un formato válido.' })
    }

    // Verifica que la cuota inicial no sea mayor que el precio del producto
    if (cuotainicial > product.pro_precioventa) {
      return res.status(409).json({ error: 'Cuota inicial no puede ser mayor al precio del producto' })
    }

    // Verifica que la cuota inicial no sea negativa
    if (cuotainicial < 0) {
      return res.status(409).json({ error: 'Cuota inicial no puede ser negativa' })
    }

    // Actualiza la venta de crédito con los nuevos datos
    await VentaCreditoModel.update({
      id,
      cardnum,
      date,
      cuotainicial,
      IdCli,
      IdPro
    })

    // Responde con un mensaje de éxito
    res.status(200).json({ message: 'Venta actualizada exitosamente' })
  } catch (error) {
    console.error(error) // Registra el error en la consola
    return res.status(500).json({ error: error.message }) // Devuelve un error interno si ocurre un problema
  }
}

export const VentaCreditoController = {
  register,
  deleteventa,
  updatevntcre
}
