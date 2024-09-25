import { db } from '../database/connection.js'

/**
 * Crea un nuevo producto en la base de datos.
 * @param {Object} producto - Los detalles del producto.
 * @param {string} producto.marca - La marca del producto.
 * @param {string} producto.reference - La referencia del producto.
 * @param {string} producto.productname - El nombre del producto.
 * @param {Date} producto.date - La fecha del producto.
 * @param {number} producto.price - El precio del producto.
 * @param {number} producto.priceventa - El precio de venta del producto.
 * @param {number} producto.prousuid - El ID del usuario asociado con el producto.
 * @returns {Promise<Object>} Los detalles del producto creado.
 */
const create = async ({ marca, reference, productname, date, price, priceventa, prousuid }) => {
  const query = {
    text: `INSERT INTO PRODUCTOS
     (PRO_MARCA, PRO_REFERENCIA, PRO_NOMBREPRODUCTO, PRO_FECHA, PRO_PRECIO, PRO_PRECIOVENTA, PRO_USU_ID) 
     VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING PRO_MARCA, PRO_NOMBREPRODUCTO, PRO_FECHA, PRO_PRECIO, PRO_PRECIOVENTA`,
    values: [marca, reference, productname, date, price, priceventa, prousuid]
  }
  const { rows } = await db.query(query)
  return rows[0]
}

/**
 * Busca un producto por su referencia.
 * @param {string} reference - La referencia del producto a buscar.
 * @returns {Promise<Object|null>} Los detalles del producto si se encuentra, o null si no se encuentra.
 */
const findOnebyReference = async (reference) => {
  const query = {
    text: 'SELECT * FROM PRODUCTOS WHERE PRO_REFERENCIA = $1',
    values: [reference]
  }
  const { rows } = await db.query(query)
  return rows[0] || null
}

/**
 * Busca un producto en la base de datos por su ID.
 * @param {number} id - ID del producto.
 * @returns {Object} - Datos del producto encontrado o null si no existe.
 */
const findById = async (id) => {
  const query = {
    text: 'SELECT * FROM PRODUCTOS WHERE PRO_ID = $1',
    values: [id]
  }

  const { rows } = await db.query(query)
  return rows[0]
}

/**
 * Actualiza un producto existente en la base de datos.
 * @param {Object} producto - Los detalles actualizados del producto.
 * @param {string} producto.marca - La marca del producto.
 * @param {string} producto.reference - La referencia del producto.
 * @param {string} producto.productname - El nombre del producto.
 * @param {Date} producto.date - La fecha del producto.
 * @param {number} producto.price - El precio del producto.
 * @param {number} producto.priceventa - El precio de venta del producto.
 * @param {number} producto.id - El ID del producto a actualizar.
 * @returns {Promise<Object>} Los detalles del producto actualizado.
 */
const update = async ({ marca, reference, productname, date, price, priceventa, id }) => {
  const query = {
    text: `UPDATE PRODUCTOS SET 
    PRO_MARCA=$1, PRO_REFERENCIA=$2, PRO_NOMBREPRODUCTO=$3, PRO_FECHA=$4, PRO_PRECIO=$5, PRO_PRECIOVENTA=$6 WHERE PRO_ID=$7 
    RETURNING PRO_MARCA, PRO_REFERENCIA, PRO_NOMBREPRODUCTO, PRO_FECHA, PRO_PRECIO, PRO_PRECIOVENTA`,
    values: [marca, reference, productname, date, price, priceventa, id]
  }
  const { rows } = await db.query(query)
  return rows[0]
}

export const ProductsModel = {
  create,
  findOnebyReference,
  update,
  findById
}
