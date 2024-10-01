import { VentaContadoModel } from '../models/ventaContado.model.js'
import { UserandClientModel } from '../models/usersandclient.model.js'
import { ProductsModel } from '../models/products.model.js'
import moment from 'moment'

// Función para validar que la fecha proporcionada sea válida en formato ISO 8601.
const isValidDate = (date) => {
  return moment(date, moment.ISO_8601, true).isValid()
}

// registrar venta
const register = async (req, res) => {
  try {
    // Desestructura los datos del cuerpo de la solicitud
    const { cardnum, date, IdCli, IdPro } = req.body

    // Verifica que todos los campos obligatorios estén presentes
    if (!cardnum || !date || !IdCli || !IdPro) {
      return res.status(400).json({ error: 'Faltan campos obligatorios: cardnum, date, IdCli, IdPro' })
    }
    // Verifica que la tarjeta sea un numero
    if (isNaN(cardnum)) {
      return res.status(400).json({ error: 'El número de tarjeta no es válido.' })
    }
    if (cardnum < 0) {
      return res.status(409).json({ error: 'numero de carta no puede ser negativo' })
    }

    // Verifica que el ID del cliente sea un número
    if (isNaN(IdCli)) {
      return res.status(400).json({ error: 'El ID del usuario no es válido.' })
    }

    // Verifica que el ID del producto sea un número
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
    // Verifica si el usuario esta inactivo
    const clientinactivo = await UserandClientModel.findById(IdCli)
    if (clientinactivo.usu_estado === 'inactivo') {
      return res.status(409).json({ error: 'El usuario está inactivo' })
    }

    // Valida que las fechas proporcionadas sean correctas en formato ISO 8601.
    if (!isValidDate(date)) {
      return res.status(400).json({ error: 'La fecha no tiene un formato válido.' })
    }

    // Verifica si la tarjeta ya ha sido utilizada
    const numcard = await VentaContadoModel.findByIdnumcard(cardnum)
    if (numcard) {
      return res.status(409).json({ error: 'La tarjeta ya ha sido utilizada' })
    }

    // Verifica si el producto ya ha sido entregado
    if (product.pro_estado === 'E') {
      return res.status(409).json({ error: 'El producto ya ha sido entregado a una venta credito' })
    }
    // Verifica si el producto ya ha finalizado
    if (product.pro_estado === 'F') {
      return res.status(409).json({ error: 'El producto ya ha finalizado' })
    }

    // Obtiene el ID del administrador desde el token del usuario
    const idadm = req.username

    // Verifica si el administrador existe
    const adm = await UserandClientModel.findOneUsername(idadm)

    // Crea una nueva venta al contado
    const newVentacontado = await VentaContadoModel.create({
      cardnum,
      date,
      IdCli,
      IdPro,
      IdAdm: adm.usu_id
    })

    // Devuelve la respuesta con estado 201 (creado)
    res.status(201).json(newVentacontado)
  } catch (error) {
    console.error(error) // Registra el error en la consola
    // Devuelve un error interno si ocurre un problema
    return res.status(500).json({ error: error.message })
  }
}

// eliminar ventacontado de la base de datos
const deleteventa = async (req, res) => {
  const { id } = req.params

  // Verifica que el ID sea un número
  if (isNaN(id)) {
    return res.status(400).json({ error: 'El ID de la venta no es válido.' })
  }

  try {
    // Busca la venta al contado por ID
    const ventaContado = await VentaContadoModel.findByProVCId(id)
    if (!ventaContado) {
      return res.status(404).json({ error: 'Venta de contado no encontrada.' })
    }

    // Elimina la venta al contado
    const deleteVenta = await VentaContadoModel.deletevntcont(id)

    // Verifica si la eliminación fue exitosa
    if (deleteVenta) {
      // Si la eliminación es exitosa, devolver una respuesta 200 (OK) con un mensaje de éxito
      return res.status(200).json({ message: 'Venta eliminada exitosamente' })
    }
  } catch (error) {
    console.error(error) // Registra el error en la consola
    return res.status(500).json({ error: error.message }) // Devuelve un error interno si ocurre un problema
  }
}

// editar ventas
const updatevntcnt = async (req, res) => {
  try {
    const { id } = req.params

    // Desestructura los datos del cuerpo de la solicitud
    const { cardnum, date, IdCli, IdPro } = req.body

    // Verifica que todos los campos obligatorios estén presentes
    if (!cardnum || !date || !IdCli || !IdPro) {
      return res.status(400).json({ error: 'Faltan campos obligatorios: numero de carta, fecha, IdCli, IdPro' })
    }

    // Verifica que el id de venta sea numero
    if (isNaN(id)) {
      return res.status(400).json({ error: 'El ID de la venta no es válido.' })
    }

    // Verifica que la tarjeta sea un numero
    if (isNaN(cardnum)) {
      return res.status(400).json({ error: 'El número de tarjeta no es válido.' })
    }

    if (cardnum < 0) {
      return res.status(409).json({ error: 'numero de carta no puede ser negativo' })
    }

    // Verifica que el ID del cliente sea un número
    if (isNaN(IdCli)) {
      return res.status(400).json({ error: 'El ID del usuario no es válido.' })
    }

    // Verifica que el ID del producto sea un número
    if (isNaN(IdPro)) {
      return res.status(400).json({ error: 'El ID del producto no es válido.' })
    }
    const numcardupdate = await VentaContadoModel.findByVntId(id)
    if (!numcardupdate) {
      return res.status(404).json({ error: 'No se ha encontrado la venta de contado.' })
    }

    // Verifica si el número de carta está cambiando
    if (numcardupdate.vnt_numcarta !== cardnum.toString()) {
      const numcard = await VentaContadoModel.findByIdnumcard(cardnum)
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

    // Verifica si el usuario esta inactivo
    const clientinactivo = await UserandClientModel.findById(IdCli)
    if (clientinactivo.usu_estado === 'inactivo') {
      return res.status(409).json({ error: 'El usuario está inactivo' })
    }

    // Verifica si el producto ya está asignado a otra venta de contado
    const existingSale = await VentaContadoModel.findContbyproId(IdPro, id)
    if (existingSale) {
      return res.status(409).json({ error: 'El producto ya está asignado a otra venta de contado' })
    }

    // Verifica si el producto está vinculado a una venta de crédito finalizada
    const existingCreditSale = await VentaContadoModel.findCredbyproId(IdPro)
    if (existingCreditSale) {
      return res.status(409).json({ error: 'El producto está vinculado a una venta de crédito' })
    }

    // Valida que las fechas proporcionadas sean correctas en formato ISO 8601.
    if (!isValidDate(date)) {
      return res.status(400).json({ error: 'La fecha no tiene un formato válido.' })
    }

    // Crea una nueva venta al contado
    await VentaContadoModel.update({
      id,
      cardnum,
      date,
      IdCli,
      IdPro
    })

    res.status(200).json('editado exitosamente')
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: error.message })
  }
}

const tableventascnt = async (req, res) => {
  try {
    const result = await VentaContadoModel.tablevnt()
    const vntcnt = result.rows

    const formattedVntContado = vntcnt.map(vnt => ({
      id: vnt.vnt_id,
      cardnum: vnt.vnt_numcarta,
      date: vnt.vnt_fecha,
      IdAdm: vnt.vnt_usu_id,
      adm_name: vnt.nombreadministrador,
      adm_last_name: vnt.apellidoadministrador,
      IdPro: vnt.pro_id,
      name_pro: vnt.pro_nombreproducto,
      state: vnt.pro_estado,
      price_sale: vnt.pro_precioventa,
      profit: vnt.pro_ganancia,
      IdCli: vnt.vnt_cli_id,
      cli_name: vnt.nombrecliente,
      cli_apellido: vnt.apellidocliente,
      identificacion: vnt.identificacioncliente,
      phone: vnt.telefonocliente,
      statecli: vnt.estadocliente

    }))
    return res.status(200).json(formattedVntContado)
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: error.message })
  }
}
export const VentaContadoController = {
  register,
  deleteventa,
  updatevntcnt,
  tableventascnt
}
