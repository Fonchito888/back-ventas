import { db } from '../database/connection.js'

/**
 * Crea un nuevo abono y actualiza el saldo correspondiente.
 *
 * @param {Object} params - Los parámetros para crear un abono.
 * @param {number} params.abnvalor - El valor del abono.
 * @param {string} params.date - La fecha del abono.
 * @param {number} params.id - El ID del VNC asociado.
 * @param {number} params.IdAdm - El ID del usuario que crea el abono.
 * @returns {Promise<Object>} Los detalles del abono creado, incluyendo el saldo anterior y el nuevo saldo.
 * @throws Lanzará un error si la transacción de la base de datos falla.
 */
const create = async ({ abnvalor, date, id, IdAdm }) => {
  const abnreg = await db.connect()
  await abnreg.query('BEGIN')

  try {
    // Recupera los detalles actuales del abono
    const selectabn = {
      text: 'SELECT * FROM ABONOS WHERE ABN_VNC_ID = $1',
      values: [id]
    }
    const { rows: abnrows } = await abnreg.query(selectabn)

    const IdResabn = abnrows[0].abn_rab_id
    const IdCli = abnrows[0].abn_cli_id
    const IdPro = abnrows[0].abn_pro_id

    // Obtiene el saldo actual de RESTAR_ABONOS
    const obtenerabn = {
      text: 'SELECT RAB_SALDO FROM RESTAR_ABONOS WHERE RAB_ID = $1',
      values: [IdResabn]
    }
    const { rows: rabRows } = await abnreg.query(obtenerabn)
    const saldoRab = rabRows[0].rab_saldo
    const saldoPro = saldoRab - abnvalor

    // Actualiza el saldo en RESTAR_ABONOS
    const updateRab = {
      text: 'UPDATE RESTAR_ABONOS SET RAB_SALDO = $1 WHERE RAB_ID = $2',
      values: [saldoPro, IdResabn]
    }
    await abnreg.query(updateRab)

    if (saldoPro === 0) {
      const updatevntcre = {
        text: 'UPDATE VENTACREDITO SET VNC_ESTADO = $1 WHERE VNC_ID = $2',
        values: ['finalizado', id]
      }
      await abnreg.query(updatevntcre)

      const updatepro = {
        text: 'UPDATE PRODUCTOS SET PRO_ESTADO = $1 WHERE PRO_ID = $2',
        values: ['F', IdPro]
      }
      await abnreg.query(updatepro)
    }

    // Inserta el nuevo abono
    const insertAbn = {
      text: `INSERT INTO ABONOS
      (ABN_VALOR, ABN_FECHA, ABN_SALDO_ANTERIOR, ABN_RAB_ID, ABN_VNC_ID, ABN_CLI_ID, ABN_PRO_ID, ABN_USU_ID)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      values: [abnvalor, date, saldoPro, IdResabn, id, IdCli, IdPro, IdAdm]
    }
    await abnreg.query(insertAbn)
    await abnreg.query('COMMIT')

    return { abnvalor, date, saldoAnterior: saldoRab, saldoNuevo: saldoPro }
  } catch (error) {
    await abnreg.query('ROLLBACK')
    throw error
  } finally {
    abnreg.release()
  }
}

/**
 * Busca el numero de abonos en la base de datos por su ID.
 * @param {number} id - ID de la ventacredito.
 * @returns {Object} - Datos del abono encontrado o null si no existe.
 */
const findBynumabnId = async (id) => {
  const query = {
    text: 'SELECT * FROM ABONOS WHERE ABN_VNC_ID = $1 ORDER BY ABN_NUMABONO DESC LIMIT 1',
    values: [id]
  }
  const { rows } = await db.query(query)
  return rows[0]
}

/**
 * Busca el numero de abonos y  en la base de datos por su ID.
 * @param {number} id - ID de la ventacredito.
 * @returns {Object} - Datos del abono encontrado o null si no existe.
 */
// acceder al abono anterior
const findBynumabnIdant = async (id) => {
  const query = {
    text: 'SELECT * FROM ABONOS WHERE ABN_VNC_ID = $1 ORDER BY ABN_NUMABONO DESC',
    values: [id]
  }
  const { rows } = await db.query(query)
  return rows[1]// la query muestra desde el ultimo abn hecho y yo accedo a la antepenultima fila
}

/**
 * Busca el restar abono en la base de datos por su ID.
 * @param {number} id - ID de la ventacredito.
 * @returns {Object} - Datos del restar abono encontrado o null si no existe.
 */
const findByrestabnId = async (id) => {
  const query = {
    text: 'SELECT * FROM RESTAR_ABONOS WHERE RAB_VNC_ID = $1',
    values: [id]
  }

  const { rows } = await db.query(query)
  return rows[0]
}

const tableabono = async (id) => {
  const query = {
    text: `SELECT
    C.USU_NOMBRE AS NOMBRECLIENTE,
    C.USU_APELLIDO AS APELLIDOCLIENTE,
    C.USU_IDENTIFICACION AS IDENTIFICACIONCLIENTE,
    PRO_NOMBREPRODUCTO,
    ABN_NUMABONO,
    ABN_VALOR,
    ABN_SALDO_ANTERIOR,
    A.USU_NOMBRE AS NOMBREADMINISTRADOR,
    A.USU_APELLIDO AS APELLIDOADMINISTRADOR,
    A.USU_IDENTIFICACION AS IDENTIFICACIONADMINISTRADOR
    FROM
    ABONOS
    INNER JOIN VENTACREDITO ON VNC_ID = ABN_VNC_ID
    INNER JOIN RESTAR_ABONOS ON RAB_ID = ABN_RAB_ID
    INNER JOIN PRODUCTOS ON PRO_ID = ABN_PRO_ID
    INNER JOIN USUARIO AS C ON ABN_CLI_ID = C.USU_ID
    INNER JOIN USUARIO AS A ON ABN_USU_ID = A.USU_ID
    WHERE
    VNC_ID = $1
    ORDER BY
    ABN_NUMABONO ASC`,
    values: [id]
  }
  const rows = await db.query(query)
  return rows
}

const updateabn = async ({ abnvalor, date, id, numabn }) => {
  const abnupd = await db.connect()
  await abnupd.query('BEGIN')

  try {
    // Recupera los detalles actuales del abono
    const selectabn = {
      text: 'SELECT * FROM ABONOS WHERE ABN_NUMABONO = $1 AND ABN_VNC_ID = $2',
      values: [numabn, id]
    }
    const { rows: abnrows } = await abnupd.query(selectabn)

    const IdResabn = abnrows[0].abn_rab_id
    const valorAnterior = parseFloat(abnrows[0].abn_valor) // Convertir a número
    const IdPro = abnrows[0].abn_pro_id

    // Obtiene el saldo actual de RESTAR_ABONOS
    const obtenerabn = {
      text: 'SELECT RAB_SALDO FROM RESTAR_ABONOS WHERE RAB_ID = $1',
      values: [IdResabn]
    }
    const { rows: rabRows } = await abnupd.query(obtenerabn)

    const saldoRab = parseFloat(rabRows[0].rab_saldo) // Convertir a número

    const nuevoValor = parseFloat(abnvalor) // Convertir a número

    // Calcular el nuevo saldo
    const saldoPro = saldoRab + valorAnterior - nuevoValor

    // Actualiza el saldo en RESTAR_ABONOS
    const updateRab = {
      text: 'UPDATE RESTAR_ABONOS SET RAB_SALDO = $1 WHERE RAB_ID = $2',
      values: [saldoPro, IdResabn]
    }
    await abnupd.query(updateRab)

    // Verificar si el saldo se ha vuelto cero
    if (saldoPro === 0) {
      const updatevntcre = {
        text: 'UPDATE VENTACREDITO SET VNC_ESTADO = $1 WHERE VNC_ID = $2',
        values: ['finalizado', id]
      }
      await abnupd.query(updatevntcre)

      const updatepro = {
        text: 'UPDATE PRODUCTOS SET PRO_ESTADO = $1 WHERE PRO_ID = $2',
        values: ['F', IdPro]
      }
      await abnupd.query(updatepro)
    }

    // Actualiza el abono
    const updateAbn = {
      text: 'UPDATE ABONOS SET ABN_VALOR = $1, ABN_FECHA = $2 WHERE ABN_NUMABONO = $3 AND ABN_VNC_ID = $4',
      values: [nuevoValor, date, numabn, id]
    }
    await abnupd.query(updateAbn)
    await abnupd.query('COMMIT')

    // Retorna el resultado final
    return { abnvalor: nuevoValor, date, saldoAnterior: saldoRab, saldoNuevo: saldoPro }
  } catch (error) {
    await abnupd.query('ROLLBACK')
    throw error
  } finally {
    abnupd.release()
  }
}

export const AbonosModel = {
  create,
  findByrestabnId,
  findBynumabnId,
  tableabono,
  updateabn,
  findBynumabnIdant
}
