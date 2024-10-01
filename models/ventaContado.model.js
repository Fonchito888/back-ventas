import { db } from '../database/connection.js'

/**
 * Crea una nueva venta al contado.
 * @param {Object} params - Parámetros de la venta.
 * @param {number} params.cardnum - Número de carta de la venta.
 * @param {Date} params.date - Fecha de la venta.
 * @param {number} params.IdCli - ID del cliente.
 * @param {number} params.IdPro - ID del producto.
 * @param {number} params.IdAdm - ID del administrador.
 * @returns {Promise<Object>} - Detalles de la venta creada.
 */
const create = async ({ cardnum, date, IdCli, IdPro, IdAdm }) => {
  const vntcontado = await db.connect()
  await vntcontado.query('BEGIN')

  try {
    const insertvntcont = {
      text: `INSERT INTO VENTACONTADO (VNT_NUMCARTA, VNT_FECHA, VNT_CLI_ID, VNT_PRO_ID, VNT_USU_ID) 
    VALUES ($1, $2, $3, $4, $5) RETURNING VNT_PRO_ID`,
      values: [cardnum, date, IdCli, IdPro, IdAdm]
    }
    const { rows: vntRows } = await vntcontado.query(insertvntcont)
    const vntcontadoId = vntRows[0].vnt_pro_id

    const insertnewstatepro = {
      text: 'UPDATE PRODUCTOS SET PRO_ESTADO = \'F\' WHERE PRO_ID = $1',
      values: [vntcontadoId]
    }
    await vntcontado.query(insertnewstatepro)
    await vntcontado.query('COMMIT')
    return { cardnum, date }
  } catch (error) {
    console.error(error)
    await vntcontado.query('ROLLBACK')
    throw error
  } finally {
    vntcontado.release()
  }
}

/**
 * Busca una venta al contado por el número de carta.
 * @param {number} cardnum - Número de carta de la venta.
 * @returns {Promise<Object|null>} - Detalles de la venta o null si no se encuentra.
 */
const findByIdnumcard = async (cardnum) => {
  const query = {
    text: 'SELECT * FROM VENTACONTADO WHERE VNT_NUMCARTA = $1',
    values: [cardnum]

  }
  const { rows } = await db.query(query)
  return rows[0] || null
}

/**
 * Busca una venta al contado por el ID de la venta.
 * @param {number} id - ID de la venta.
 * @returns {Promise<Object|null>} - Detalles de la venta o null si no se encuentra.
 */
const findByVntId = async (id) => {
  const query = {
    text: 'SELECT * FROM VENTACONTADO WHERE VNT_ID = $1',
    values: [id]

  }
  const { rows } = await db.query(query)
  return rows[0] || null
}

/**
 * Busca una venta al contado por el ID
 * @param {number} id - ID de la venta.
 * @returns {Promise<Object|null>} - Detalles de la venta o null si no se encuentra.
 */
const findByProVCId = async (id) => {
  const query = {
    text: 'SELECT * FROM VENTACONTADO WHERE VNT_ID = $1',
    values: [id]

  }
  const { rows } = await db.query(query)
  return rows[0] || null
}

// Método en VentaContadoModel
const findContbyproId = async (productId, excludeId) => {
  // Prepara la consulta SQL para buscar en la tabla VENTACONTADO
  const query = {
    text: 'SELECT * FROM VENTACONTADO WHERE VNT_PRO_ID = $1 AND VNT_ID <> $2', // $2 es el ID de la venta que estamos editando, asegura que no se incluya en los resultados
    values: [productId, excludeId]
  }

  // Ejecuta la consulta en la base de datos y almacena el resultado
  const result = await db.query(query)

  // Devuelve el primer registro encontrado si hay alguna coincidencia,
  // o null si no hay ventas activas asociadas al producto que no sean la venta actual.
  return result.rows.length > 0 ? result.rows[0] : null
}

const findCredbyproId = async (productId) => {
  const query = {
    text: 'SELECT * FROM VENTACREDITO WHERE VNC_PRO_ID = $1',
    values: [productId]
  }

  const result = await db.query(query)
  return result.rows.length > 0 ? result.rows[0] : null // Retorna la primera venta activa si existe
}

/**
 * Elimina una venta al contado
 * @param {number} id - ID de la venta.
 * @returns {Promise<Object>} - Detalles de la venta eliminada.
 */
const deletevntcont = async (id) => {
  const vntcontado = await db.connect()
  await vntcontado.query('BEGIN')

  try {
    const selectvntcont = {
      text: 'SELECT * FROM VENTACONTADO WHERE VNT_ID = $1',
      values: [id]
    }

    const { rows: vntcontRows } = await vntcontado.query(selectvntcont)

    if (vntcontRows.length === 0) {
      throw new Error('VENTACONTADO not found')
    }

    const vncontproId = vntcontRows[0].vnt_pro_id

    const Deletevntcont = {
      text: 'DELETE FROM VENTACONTADO WHERE VNT_ID = $1 RETURNING VNT_PRO_ID',
      values: [id]
    }
    await vntcontado.query(Deletevntcont)

    const changeprostate = {
      text: 'UPDATE PRODUCTOS SET PRO_ESTADO = \'PE\' WHERE PRO_ID = $1',
      values: [vncontproId]
    }
    await vntcontado.query(changeprostate)
    await vntcontado.query('COMMIT')
    return { id }
  } catch (error) {
    console.error(error)
    await vntcontado.query('ROLLBACK')
    throw error
  } finally {
    vntcontado.release()
  }
}

/**
 * Actualiza un registro de venta y los estados de los productos relacionados.
 *
 * @param {Object} params - Los parámetros para actualizar la venta.
 * @param {string} params.cardnum - El nuevo número de tarjeta.
 * @param {string} params.date - La fecha de la venta.
 * @param {number} params.IdCli - El ID del cliente asociado a la venta.
 * @param {number} params.IdPro - El ID del producto asociado a la venta.
 * @param {number} params.id - El ID del registro de venta a actualizar.
 * @returns {Promise<void>} - Una promesa que se resuelve cuando la actualización se completa.
 * @throws {Error} - Lanza un error si la actualización falla.
 */
const update = async ({ cardnum, date, IdCli, IdPro, id }) => {
  const vtnupdatecontado = await db.connect()
  await vtnupdatecontado.query('BEGIN')

  try {
    const selectvntcon = {
      text: 'SELECT VNT_PRO_ID FROM VENTACONTADO WHERE VNT_ID = $1',
      values: [id]
    }
    const { rows: vntRows } = await vtnupdatecontado.query(selectvntcon)
    const vntcontadoid = vntRows[0].vnt_pro_id

    const updatevtncont = {
      text: `UPDATE VENTACONTADO
             SET VNT_NUMCARTA = $1, VNT_FECHA = $2, VNT_CLI_ID = $3, VNT_PRO_ID = $4 
             WHERE VNT_ID = $5`,
      values: [cardnum, date, IdCli, IdPro, id]
    }

    await vtnupdatecontado.query(updatevtncont)

    // Actualizar el estado del producto correspondiente a vtncontadoidupdate a 'F'
    const updatestatepro = {
      text: 'UPDATE PRODUCTOS SET PRO_ESTADO = \'PE\' WHERE PRO_ID = $1',
      values: [vntcontadoid]
    }
    await vtnupdatecontado.query(updatestatepro)

    // Actualizar el estado del producto correspondiente a IdPro a 'PE'
    const updatestateproIdPro = {
      text: 'UPDATE PRODUCTOS SET PRO_ESTADO = \'F\' WHERE PRO_ID = $1',
      values: [IdPro]
    }
    await vtnupdatecontado.query(updatestateproIdPro)

    await vtnupdatecontado.query('COMMIT')
  } catch (error) {
    await vtnupdatecontado.query('ROLLBACK')
    throw error
  } finally {
    vtnupdatecontado.release()
  }
}

const tablevnt = async () => {
  const query = {

    text: `SELECT 
    VNT_ID,
    VNT_NUMCARTA,
    VNT_FECHA,
    VNT_USU_ID,
    A.USU_NOMBRE AS nombreadministrador, 
    A.USU_APELLIDO AS apellidoadministrador,
    A.USU_ESTADO AS estadoadministrador,
    PRO_ID,
    PRO_NOMBREPRODUCTO,
    PRO_ESTADO,
    PRO_PRECIOVENTA,
    VNT_CLI_ID,
    C.USU_NOMBRE AS nombrecliente,
    C.USU_APELLIDO AS apellidocliente,
    C.USU_IDENTIFICACION AS identificacioncliente,
    C.USU_TELEFONO AS telefonocliente,
    C.USU_ESTADO AS estadocliente

FROM 
    PRODUCTOS
JOIN 
    VENTACONTADO ON PRO_ID = VNT_PRO_ID
JOIN 
    USUARIO AS C ON VNT_CLI_ID = C.USU_ID
JOIN 
    USUARIO AS A ON VNT_USU_ID = A.USU_ID`
  }
  const rows = await db.query(query)
  return rows
}

export const VentaContadoModel = {
  create,
  deletevntcont,
  findByIdnumcard,
  findByProVCId,
  findByVntId,
  update,
  tablevnt,
  findContbyproId,
  findCredbyproId

}
