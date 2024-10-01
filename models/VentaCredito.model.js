import { db } from '../database/connection.js'

/**
 * Crea una nueva venta a crédito.
 * @param {Object} params - Parámetros para crear la venta.
 * @param {number} params.cardnum - Número de carta de la venta.
 * @param {Date} params.date - Fecha de la venta.
 * @param {number} params.cuotainicial - Cuota inicial de la venta.
 * @param {number} params.IdCli - ID del cliente.
 * @param {number} params.IdPro - ID del producto.
 * @param {number} params.IdAdm - ID del administrador.
 * @returns {Promise<Object>} - Detalles de la venta creada.
 */
const create = async ({ cardnum, date, cuotainicial, IdCli, IdPro, IdAdm }) => {
  const ventacredito = await db.connect()
  await ventacredito.query('BEGIN')

  try {
    const insertVentCred = {
      text: `INSERT INTO VENTACREDITO 
      (VNC_NUMCARTA, VNC_FECHA, VNC_CUOTAINICIAL, VNC_CLI_ID, VNC_PRO_ID, VNC_USU_ID)
      VALUES ($1, $2, $3, $4, $5, $6) RETURNING VNC_SALDOINICIAL, VNC_ID`,
      values: [cardnum, date, cuotainicial, IdCli, IdPro, IdAdm]
    }
    const { rows: vncRows } = await ventacredito.query(insertVentCred)
    const vncSaldoInicial = vncRows[0].vnc_saldoinicial
    const vncId = vncRows[0].vnc_id

    // Actualizar el estado del producto correspondiente a vncId
    const updatestatepro = {
      text: 'UPDATE PRODUCTOS SET PRO_ESTADO = \'E\' WHERE PRO_ID = $1',
      values: [IdPro]
    }
    await ventacredito.query(updatestatepro)

    const insertrestabono = {
      text: 'INSERT INTO RESTAR_ABONOS (RAB_SALDO, RAB_CLI_ID, RAB_VNC_ID, RAB_USU_ID) VALUES ($1, $2, $3, $4) RETURNING RAB_ID',
      values: [vncSaldoInicial, IdCli, vncId, IdAdm]
    }

    const { rows: rabRows } = await ventacredito.query(insertrestabono)
    const rabVncId = rabRows[0].rab_id

    const insertabono = {
      text: `INSERT INTO ABONOS
        (ABN_FECHA, ABN_VALOR, ABN_NUMABONO, ABN_VNC_ID, ABN_SALDO_ANTERIOR, ABN_CLI_ID, ABN_PRO_ID, ABN_USU_ID, ABN_RAB_ID)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      values: [date, cuotainicial, 1, vncId, vncSaldoInicial, IdCli, IdPro, IdAdm, rabVncId]
    }
    await ventacredito.query(insertabono)
    await ventacredito.query('COMMIT')
    return { cardnum, date, cuotainicial }
  } catch (error) {
    await ventacredito.query('ROLLBACK')
    throw error
  } finally {
    ventacredito.release()
  }
}

/**
 * Busca una venta al contado por el número de carta.
 * @param {number} cardnum - Número de carta de la venta.
 * @returns {Promise<Object|null>} - Detalles de la venta o null si no se encuentra.
 */
const findByIdnumcard = async (cardnum) => {
  const query = {
    text: 'SELECT * FROM VENTACREDITO WHERE VNC_NUMCARTA = $1',
    values: [cardnum]
  }
  const { rows } = await db.query(query)
  return rows[0] || null
}

/**
 * Busca una venta credito por el ID del producto.
 * @param {number} id - ID del producto.
 * @returns {Promise<Object|null>} - Detalles de la venta o null si no se encuentra.
 */
const findByProVCreId = async (id) => {
  const query = {
    text: 'SELECT * FROM VENTACREDITO WHERE VNC_PRO_ID = $1',
    values: [id]

  }
  const { rows } = await db.query(query)
  return rows[0] || null
}

// Método en VentaCreditoModel
const findCredtbyproId = async (productId, excludeId) => {
  // Prepara la consulta SQL para buscar en la tabla VENTACREDITO
  const query = {
    text: 'SELECT * FROM VENTACREDITO WHERE VNC_PRO_ID = $1 AND VNC_ID <> $2', // $2 es el ID de la venta que estamos editando, asegura que no se incluya en los resultados
    values: [productId, excludeId]
  }

  // Ejecuta la consulta en la base de datos y almacena el resultado
  const result = await db.query(query)

  // Devuelve el primer registro encontrado si hay alguna coincidencia,
  // o null si no hay ventas activas asociadas al producto que no sean la venta actual.
  return result.rows.length > 0 ? result.rows[0] : null
}

const findConbyproId = async (productId) => {
  const query = {
    text: 'SELECT * FROM VENTACONTADO WHERE VNT_PRO_ID = $1',
    values: [productId]
  }

  const result = await db.query(query)
  return result.rows.length > 0 ? result.rows[0] : null // Retorna la primera venta activa si existe
}
/**
 * Busca una venta de crédito por el ID.
 * @param {number} id - ID de la venta.
 * @returns {Promise<Object|null>} - Detalles de la venta o null si no se encuentra.
 */
const findByVCreId = async (id) => {
  const query = {
    text: 'SELECT * FROM VENTACREDITO WHERE VNC_ID = $1',
    values: [id]
  }
  const { rows } = await db.query(query)
  return rows[0] || null
}

/**
 * Elimina una venta de crédito por su ID.
 * @param {number} id - ID de la venta a eliminar.
 * @returns {Promise<number>} - ID de la venta eliminada.
 * @throws {Error} - Si ocurre un error durante la eliminación.
 */
const deletevnccre = async (id) => {
  const vntcredito = await db.connect()
  await vntcredito.query('BEGIN')
  try {
    const selectvntcre = {
      text: 'SELECT * FROM VENTACREDITO WHERE VNC_ID = $1',
      values: [id]
    }
    const { rows: vntcreRows } = await vntcredito.query(selectvntcre)

    if (vntcreRows.length === 0) {
      throw new Error('VENTACREDITO not found')
    }

    const vncproId = vntcreRows[0].vnc_pro_id

    const deletevntcre = {
      text: 'DELETE FROM VENTACREDITO WHERE VNC_ID = $1 RETURNING VNC_PRO_ID',
      values: [id]
    }
    await vntcredito.query(deletevntcre)

    const updatestatepro = {
      text: 'UPDATE PRODUCTOS SET PRO_ESTADO = \'PE\' WHERE PRO_ID = $1',
      values: [vncproId]
    }
    await vntcredito.query(updatestatepro)
    await vntcredito.query('COMMIT')
    return id
  } catch (error) {
    await vntcredito.query('ROLLBACK')
    throw error
  } finally {
    vntcredito.release()
  }
}

/**
 * Actualiza una venta a crédito existente.
 * @param {Object} params - Parámetros para actualizar la venta.
 * @param {number} params.cardnum - Número de carta de la venta.
 * @param {Date} params.date - Nueva fecha de la venta.
 * @param {number} params.cuotainicial - Nueva cuota inicial de la venta.
 * @param {number} params.IdCli - ID del cliente.
 * @param {number} params.IdPro - ID del nuevo producto.
 * @param {number} params.id - ID de la venta a actualizar.
 * @returns {Promise<Object>} - Detalles de la venta actualizada.
 * @throws {Error} - Si ocurre un error durante la actualización.
 */
const update = async ({ cardnum, date, cuotainicial, IdCli, IdPro, id }) => {
  const updatevntcre = await db.connect()
  await updatevntcre.query('BEGIN')

  try {
    // Selecciona el VNC_PRO_ID
    const selectvntcre = {
      text: 'SELECT VNC_PRO_ID FROM VENTACREDITO WHERE VNC_ID = $1',
      values: [id]
    }
    const { rows: vntCreRows } = await updatevntcre.query(selectvntcre)

    const vncproId = vntCreRows[0].vnc_pro_id

    // Actualiza VENTACREDITO
    const Updatevntcre = {
      text: `UPDATE VENTACREDITO
      SET VNC_NUMCARTA=$1, VNC_FECHA=$2, VNC_CUOTAINICIAL=$3, VNC_CLI_ID=$4,
      VNC_PRO_ID=$5 WHERE VNC_ID=$6 RETURNING VNC_SALDOINICIAL`,
      values: [cardnum, date, cuotainicial, IdCli, IdPro, id]
    }
    const { rows: vntcreRows } = await updatevntcre.query(Updatevntcre)

    const vncSaldoInicial = vntcreRows[0].vnc_saldoinicial

    // Actualiza el estado del producto antiguo
    const updatestatepro = {
      text: 'UPDATE PRODUCTOS SET PRO_ESTADO = \'PE\' WHERE PRO_ID = $1',
      values: [vncproId]
    }
    await updatevntcre.query(updatestatepro)

    // Actualiza el estado del nuevo producto
    const updatestateproIdpro = {
      text: 'UPDATE PRODUCTOS SET PRO_ESTADO = \'E\' WHERE PRO_ID = $1',
      values: [IdPro]
    }
    await updatevntcre.query(updatestateproIdpro)

    // Actualiza el saldo en RESTAR_ABONOS
    const updaterestabono = {
      text: 'UPDATE RESTAR_ABONOS SET RAB_SALDO = $1, RAB_CLI_ID = $2 WHERE RAB_VNC_ID = $3',
      values: [vncSaldoInicial, IdCli, id]
    }
    await updatevntcre.query(updaterestabono)

    // Actualiza los registros en ABONOS
    const updateabono = {
      text: `UPDATE ABONOS
      SET ABN_FECHA = $1, ABN_VALOR = $2, ABN_SALDO_ANTERIOR = $3,
      ABN_CLI_ID = $4, ABN_PRO_ID = $5 WHERE ABN_VNC_ID = $6`,
      values: [date, cuotainicial, vncSaldoInicial, IdCli, IdPro, id]
    }
    await updatevntcre.query(updateabono)

    await updatevntcre.query('COMMIT')
    return { cardnum, date, cuotainicial }
  } catch (error) {
    await updatevntcre.query('ROLLBACK')
    console.error('Error en la actualización:', error)
    throw error
  } finally {
    updatevntcre.release()
  }
}

const tablevnc = async () => {
  const query = {

    text: `SELECT VNC_ID,
    VNC_NUMCARTA,
    VNC_FECHA,
    VNC_USU_ID,
    A.USU_NOMBRE AS nombreadministrador, 
    A.USU_APELLIDO AS apellidoadministrador,
    A.USU_ESTADO AS estadoadministrador,
    PRO_ID,
    PRO_NOMBREPRODUCTO,
    PRO_ESTADO,
    PRO_PRECIOVENTA,
    VNC_CUOTAINICIAL,
    VNC_SALDOINICIAL,
    VNC_ESTADO,
    VNC_CLI_ID,
    C.USU_NOMBRE AS nombrecliente,
    C.USU_APELLIDO AS apellidocliente,
    C.USU_IDENTIFICACION AS identificacioncliente,
    C.USU_TELEFONO AS telefonocliente,
    C.USU_ESTADO AS estadocliente,
    R.RAB_SALDO  AS saldorestante
FROM 
    PRODUCTOS
JOIN 
    VENTACREDITO ON PRO_ID = VNC_PRO_ID
JOIN 
    USUARIO AS C ON VNC_CLI_ID = C.USU_ID
JOIN 
    USUARIO AS A ON VNC_USU_ID = A.USU_ID
LEFT JOIN 
    RESTAR_ABONOS AS R ON R.RAB_VNC_ID = VNC_ID`
  }
  const rows = await db.query(query)
  return rows
}

export const VentaCreditoModel = {
  create,
  findByIdnumcard,
  findByVCreId,
  deletevnccre,
  update,
  findByProVCreId,
  tablevnc,
  findCredtbyproId,
  findConbyproId

}
