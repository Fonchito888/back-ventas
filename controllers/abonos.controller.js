import { AbonosModel } from '../models/abonos.model.js'
import { UserandClientModel } from '../models/usersandclient.model.js'
import { VentaCreditoModel } from '../models/VentaCredito.model.js'
import moment from 'moment'

// Función para validar que la fecha proporcionada sea válida en formato ISO 8601.

const isValidDate = (date) => {
  return moment(date, moment.ISO_8601, true).isValid()
}

// Función para registrar un nuevo abono a una venta de crédito

const register = async (req, res) => {
  try {
    // Extrae el valor de abono y la fecha del cuerpo de la solicitud
    const { abnvalor, date } = req.body
    // Extrae el ID de la venta de crédito de los parámetros de la solicitud
    const { id } = req.params

    // Verifica que se hayan proporcionado los campos obligatorios
    if (!abnvalor || !date) {
      return res.status(400).json({ error: 'Faltan campos obligatorios: valor de abono, date' })
    }

    // Verifica que el ID proporcionado sea un número válido
    if (isNaN(id)) {
      return res.status(400).json({ error: 'El ID de la venta credito no es válido.' })
    }

    // Verifica que el valor de abono sea un número
    if (isNaN(abnvalor)) {
      return res.status(400).json({ error: 'El valor de abono no es un número.' })
    }

    // Verifica que el valor de abono sea positivo
    if (abnvalor <= 0) {
      return res.status(409).json({ error: 'El valor de abono debe ser positivo.' })
    }

    // Verifica que la venta de crédito con el ID proporcionado exista
    const ventaCredito = await VentaCreditoModel.findByVCreId(id)
    if (!ventaCredito) {
      return res.status(404).json({ error: 'Venta de crédito no encontrada.' })
    }

    // Verifica el estado de la venta de crédito
    const statevntcre = await VentaCreditoModel.findByVCreId(id)
    if (statevntcre.vnc_estado === 'finalizado') {
      return res.status(409).json({ error: 'La venta de crédito ha finalizado.' })
    }

    // Valida que las fechas proporcionadas sean correctas en formato ISO 8601.
    if (!isValidDate(date)) {
      return res.status(400).json({ error: 'La fecha no tiene un formato válido.' })
    }

    // Obtiene el abono relacionado con el ID de la venta de crédito
    const abn = await AbonosModel.findByrestabnId(id)

    // Verifica que el valor del abono no sea mayor que el saldo disponible
    if (abnvalor > abn.rab_saldo) {
      return res.status(409).json({ error: 'Valor del abono no puede ser mayor al valor del saldo' })
    }

    // Obtiene el ID del administrador que está realizando la operación
    const idadm = req.username
    // Busca la información del administrador en la base de datos
    const adm = await UserandClientModel.findOneUsername(idadm)

    // Crea un nuevo abono en la base de datos
    const newAbono = await AbonosModel.create({
      id,
      abnvalor,
      date,
      IdAdm: adm.usu_id
    })

    // Devuelve el nuevo abono creado con un estado 200 (OK)
    return res.status(200).json(newAbono)
  } catch (error) {
    // Captura cualquier error y devuelve un estado 500 (Error interno del servidor)
    console.error(error)
    return res.status(500).json({ error: error.message })
  }
}

const tableabonos = async (req, res) => {
  const { id } = req.params

  try {
    // Validar el userId
    if (isNaN(id)) {
      return res.status(400).json({ error: 'El ID de la venta no es válido.' })
    }
    // Verifica que la venta de crédito con el ID proporcionado exista
    const ventaCredito = await VentaCreditoModel.findByVCreId(id)
    if (!ventaCredito) {
      return res.status(404).json({ error: 'Venta de crédito no encontrada.' })
    }
    const result = await AbonosModel.tableabono(id)
    const abonos = result.rows

    const formattedAbonos = abonos.map(abn => ({
      cli_name: abn.nombrecliente,
      cli_last_name: abn.apellidocliente,
      identification: abn.identificacioncliente,
      name_pro: abn.pro_nombreproducto,
      num_abono: abn.abn_numabono,
      abono: abn.abn_valor,
      saldo: abn.abn_saldo_anterior,
      adm_name: abn.nombreadministrador,
      adm_last_name: abn.apellidoadministrador,
      adm_identificacion: abn.identificacionadministrador

    }))
    // Devuelve la lista de abonos con un estado 200 (OK)
    return res.status(200).json(formattedAbonos)
  } catch (error) {
    // Captura cualquier error y devuelve un estado 500 (Error interno del servidor)
    console.error(error)
    return res.status(500).json({ error: error.message })
  }
}

export const AbonosController = {
  register,
  tableabonos
}
