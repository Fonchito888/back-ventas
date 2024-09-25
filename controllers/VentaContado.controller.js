import { VentaContadoModel } from '../models/ventaContado.model.js'
import { UserandClientModel } from '../models/usersandclient.model.js'
import { ProductsModel } from '../models/products-model.js'

// registrar venta
const register = async (req, res) => {
  try {
    // Desestructura los datos del cuerpo de la solicitud
    const { cardnum, date, IdCli, IdPro } = req.body

    // Verifica que todos los campos obligatorios estén presentes
    if (!cardnum || !date || !IdCli || !IdPro) {
      return res.status(400).json({ error: 'Faltan campos obligatorios: cardnum, date, IdCli, IdPro' })
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

    // Verifica si la tarjeta ya ha sido utilizada
    const numcard = await VentaContadoModel.findByIdnumcard(cardnum)
    if (numcard) {
      return res.status(409).json({ error: 'La tarjeta ya ha sido utilizada' })
    }

    // Verifica si el producto ya ha sido entregado
    if (product.pro_estado === 'E') {
      return res.status(409).json({ error: 'El producto ya ha sido entregado' })
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

    // Prepara la respuesta con los detalles de la nueva venta
    const VntCont = {
      cardnum: newVentacontado.cardnum,
      date: newVentacontado.date
    }

    // Devuelve la respuesta con estado 201 (creado)
    res.status(201).json(VntCont)
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
      return res.status(404).json({ error: 'Venta de contadp no encontrada.' })
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

export const VentaContadoController = {
  register,
  deleteventa
}
