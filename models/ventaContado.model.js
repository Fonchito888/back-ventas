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
      text: 'UPDATE PRODUCTOS SET PRO_ESTADO = \'E\' WHERE PRO_ID = $1',
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
 * @param {number} id - Número de carta de la venta.
 * @returns {Promise<Object|null>} - Detalles de la venta o null si no se encuentra.
 */
const findByIdnumcard = async (id) => {
  const query = {
    text: 'SELECT * FROM VENTACONTADO WHERE VNT_NUMCARTA = $1',
    values: [id]

  }
  const { rows } = await db.query(query)
  return rows[0] || null
}

/**
 * Busca una venta al contado por el ID del producto.
 * @param {number} id - ID del producto.
 * @returns {Promise<Object|null>} - Detalles de la venta o null si no se encuentra.
 */
const findByProVCId = async (id) => {
  const query = {
    text: 'SELECT * FROM VENTACONTADO WHERE VNT_PRO_ID = $1',
    values: [id]

  }
  const { rows } = await db.query(query)
  return rows[0] || null
}

/**
 * Elimina una venta al contado por el ID del producto.
 * @param {number} id - ID del producto asociado a la venta.
 * @returns {Promise<Object>} - Detalles de la venta eliminada.
 */
const deletevntcont = async (id) => {
  const vntcontado = await db.connect()
  await vntcontado.query('BEGIN')

  try {
    const Deletevntcont = {
      text: 'DELETE FROM VENTACONTADO WHERE VNT_PRO_ID = $1 RETURNING VNT_PRO_ID',
      values: [id]
    }
    const { rows: vntRows } = await vntcontado.query(Deletevntcont)
    const vntcontadoId = vntRows[0].vnt_pro_id
    const changeprostate = {
      text: 'UPDATE PRODUCTOS SET PRO_ESTADO = \'PE\' WHERE PRO_ID = $1',
      values: [vntcontadoId]
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

export const VentaContadoModel = {
  create,
  deletevntcont,
  findByIdnumcard,
  findByProVCId

}
