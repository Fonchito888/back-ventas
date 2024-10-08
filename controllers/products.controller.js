import { ProductsModel } from '../models/products.model.js'
import { UserandClientModel } from '../models/usersandclient.model.js'
import moment from 'moment'

// Función para validar que la fecha proporcionada sea válida en formato ISO 8601.
const isValidDate = (date) => {
  return moment(date, moment.ISO_8601, true).isValid()
}

// Función para registrar un nuevo producto
const register = async (req, res) => {
  try {
    // Desestructura los datos del cuerpo de la solicitud
    const { marca, reference, productname, date, price, priceventa } = req.body

    // Verifica que todos los campos obligatorios estén presentes
    if (!marca || !reference || !productname || !date || !price || !priceventa) {
      return res.status(400).json({ error: 'Faltan campos obligatorios: marca, referencia, nombre del producto, fecha, precio, precio de venta' })
    }
    if (isNaN(price)) {
      return res.status(400).json({ error: 'El precio debe ser valor numerico.' })
    }
    if (price < 0) {
      return res.status(409).json({ error: 'El precio no puede ser negativo' })
    }
    if (isNaN(priceventa)) {
      return res.status(400).json({ error: 'El precio de venta debe ser valor numerico.' })
    }
    if (priceventa < 0) {
      return res.status(409).json({ error: 'precio de venta no puede ser negativo' })
    }

    // Busca si la referencia ya existe en la base de datos
    const referencebyid = await ProductsModel.findOnebyReference(reference)

    // Si la referencia ya existe, devuelve un error de conflicto
    if (referencebyid) {
      return res.status(409).json({ error: 'La referencia ya existe' })
    }

    // Valida que las fechas proporcionadas sean correctas en formato ISO 8601.
    if (!isValidDate(date)) {
      return res.status(400).json({ error: 'La fecha no tiene un formato válido.' })
    }

    // Convierte la fecha a un objeto Date para las comparaciones
    const fecha = new Date(date)
    const fechaLimite = new Date('1900-01-01')
    const hoy = new Date()

    // Ajusta la fecha de hoy para que tenga la misma hora, minutos y segundos
    hoy.setHours(0, 0, 0, 0)

    // Verifica que la fecha no sea posterior a la fecha actual
    if (fecha > hoy) {
      return res.status(400).json({ error: 'La fecha no puede ser posterior a la fecha actual.' })
    }

    // Verifica que la fecha no sea anterior a 1900
    if (fecha < fechaLimite) {
      return res.status(400).json({ error: 'La fecha no puede ser anterior a 1900.' })
    }

    // Obtiene el ID del usuario desde la solicitud
    const userid = req.username
    // Busca el usuario en la base de datos
    const user = await UserandClientModel.findOneUsername(userid)

    // Crea un nuevo producto en la base de datos
    const newProduct = await ProductsModel.create({
      marca,
      reference,
      productname,
      date,
      price,
      priceventa,
      prousuid: user.usu_id // Asocia el producto con el ID del usuario
    })

    // Prepara la respuesta con los detalles del producto creado
    const product = {
      marca: newProduct.pro_marca,
      productname: newProduct.pro_nombreproducto,
      date: newProduct.pro_fecha,
      price: newProduct.pro_precio,
      priceventa: newProduct.pro_precioventa
    }

    // Devuelve la respuesta con el producto creado
    return res.status(201).json(product)
  } catch (error) {
    console.error(error) // Registra el error en la consola
    // Devuelve un error interno si ocurre un problema
    return res.status(500).json({ error: 'Error al registrar el producto' })
  }
}

// Función para actualizar un producto existente
const updateproduct = async (req, res) => {
  try {
    const { id } = req.params
    const { marca, reference, productname, date, price, priceventa } = req.body

    if (isNaN(id)) {
      return res.status(400).json({ error: 'El ID del producto no es válido.' })
    }

    // Verifica que todos los campos obligatorios estén presentes
    if (!marca || !reference || !productname || !date || !price || !priceventa) {
      return res.status(400).json({ error: 'Faltan campos obligatorios: marca, referencia, nombre del producto, fecha, precio, precio de venta' })
    }
    if (isNaN(price)) {
      return res.status(400).json({ error: 'El precio debe ser valor numerico.' })
    }
    if (price < 0) {
      return res.status(409).json({ error: 'El precio no puede ser negativo' })
    }
    if (isNaN(priceventa)) {
      return res.status(400).json({ error: 'El precio de venta debe ser valor numerico.' })
    }
    if (priceventa < 0) {
      return res.status(409).json({ error: 'precio de venta no puede ser negativo' })
    }
    // Busca el producto actual para obtener su id
    const Productupdate = await ProductsModel.findById(id)
    if (!Productupdate) {
      return res.status(409).json({ error: 'Producto no encontrado' })
    }

    // Verificar si ya existe un producto con la misma referencia
    if (Productupdate.pro_referencia !== reference) {
      const referencebyid = await ProductsModel.findOnebyReference(reference)
      if (referencebyid) {
        return res.status(409).json({ error: 'La referencia ya existe' })
      }
    }

    // Verificar si ya ha sido entregado el producto
    const productentregado = await ProductsModel.findById(id)
    if (productentregado.pro_estado === 'E') {
      return res.status(409).json({ error: 'El producto ya ha sido entregado a una venta credito' })
    }
    // Verificar si ya ha sido finalizado el producto
    const productfinalizado = await ProductsModel.findById(id)
    if (productfinalizado.pro_estado === 'F') {
      return res.status(409).json({ error: 'El producto ya ha finalizado' })
    }
    // Valida que las fechas proporcionadas sean correctas en formato ISO 8601.
    if (!isValidDate(date)) {
      return res.status(400).json({ error: 'La fecha no tiene un formato válido.' })
    }

    // Convierte la fecha a un objeto Date para las comparaciones
    const fecha = new Date(date)
    const fechaLimite = new Date('1900-01-01')
    const hoy = new Date()

    // Ajusta la fecha de hoy para que tenga la misma hora, minutos y segundos
    hoy.setHours(0, 0, 0, 0)

    // Verifica que la fecha no sea posterior a la fecha actual
    if (fecha > hoy) {
      return res.status(400).json({ error: 'La fecha no puede ser posterior a la fecha actual.' })
    }

    // Verifica que la fecha no sea anterior a 1900
    if (fecha < fechaLimite) {
      return res.status(400).json({ error: 'La fecha no puede ser anterior a 1900.' })
    }

    // Actualiza el producto en la base de datos
    const Updateproduct = await ProductsModel.update({
      id,
      marca,
      reference,
      productname,
      date,
      price,
      priceventa
    })

    // Prepara la respuesta con los detalles del producto actualizado
    const product = {
      marca: Updateproduct.pro_marca,
      reference: Updateproduct.pro_referencia,
      productname: Updateproduct.pro_nombreproducto,
      date: Updateproduct.pro_fecha,
      price: Updateproduct.pro_precio,
      priceventa: Updateproduct.pro_precioventa
    }

    return res.status(201).json(product)
  } catch (error) {
    // Maneja el error y devuelve una respuesta adecuada
    return res.status(500).json({ error: error.message })
  }
}

// Tabla que me devuelve todos los productos
const tableproducts = async (req, res) => {
  try {
    const result = await ProductsModel.tableproducts()
    const product = result.rows

    const formattedProduct = product.map(pro => ({
      id: pro.pro_id,
      marca: pro.pro_marca,
      reference: pro.pro_referencia,
      productname: pro.pro_nombreproducto,
      date: pro.pro_fecha,
      price: pro.pro_precio,
      priceventa: pro.pro_precioventa,
      state: pro.pro_estado,
      profit: pro.pro_ganancia,
      utility: pro.pro_utilidad
    }))

    return res.status(200).json(formattedProduct)
  } catch (error) {
    console.error(error)
    // Maneja el error y devuelve una respuesta adecuada
    return res.status(500).json({ error: error.message })
  }
}

export const ProductsController = {
  register,
  updateproduct,
  tableproducts
}
