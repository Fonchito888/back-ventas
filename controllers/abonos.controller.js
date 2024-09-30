import { AbonosModel } from '../models/abonos.model.js'
import { UserandClientModel } from '../models/usersandclient.model.js'
import { VentaCreditoModel } from '../models/VentaCredito.model.js'

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

export const AbonosController = {
  register
}
