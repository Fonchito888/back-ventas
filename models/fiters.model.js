import { db } from '../database/connection.js'

// ---------------------------------------------------------------FILTRO PRODUCTOS----------------------------------------------------------------------
const filterproducts = async ({ fechainicio, fechafin }) => {
  const query = {
    text: `SELECT 
    SUM(PRO_GANANCIA) AS TOTAL_GANANCIA,
    SUM(PRO_UTILIDAD) AS TOTAL_UTILIDAD
FROM 
    PRODUCTOS
WHERE 
    PRO_FECHA BETWEEN $1 AND $2 `,
    values: [fechainicio, fechafin]
  }
  const { rows } = await db.query(query)
  return rows
}

const filterproductbyspent = async ({ fechainicio, fechafin }) => {
  const query = {
    text: 'SELECT SUM(PRO_PRECIO) AS TOTALGASTADO FROM PRODUCTOS WHERE PRO_FECHA BETWEEN $1 AND $2',
    values: [fechainicio, fechafin]
  }
  const { rows } = await db.query(query)
  return rows
}

const filterproductbystate = async ({ state, fechainicio, fechafin }) => {
  const query = {
    text: `SELECT 
    SUM(PRO_GANANCIA) AS TOTAL_GANANCIA,
    SUM(PRO_UTILIDAD) AS TOTAL_UTILIDAD
FROM 
    PRODUCTOS
WHERE 
    PRO_ESTADO = $1
    AND PRO_FECHA BETWEEN $2 AND $3 `,
    values: [state, fechainicio, fechafin]
  }
  const { rows } = await db.query(query)
  return rows
}

// ---------------------------------------------------------------FILTRO VENTACONTADO----------------------------------------------------------------------

const filtervntcontado = async ({ fechainicio, fechafin }) => {
  const query = {
    text: `SELECT 
    SUM(P.PRO_GANANCIA) AS Total_Ganancia,
    SUM(P.PRO_UTILIDAD) AS Total_Utilidad
FROM 
    PRODUCTOS P
JOIN 
    VENTACONTADO V ON P.PRO_ID = V.VNT_PRO_ID
WHERE 
    P.PRO_ESTADO = 'F'
    AND V.VNT_FECHA BETWEEN $1 AND $2`,
    values: [fechainicio, fechafin]
  }
  const { rows } = await db.query(query)
  return rows
}

// ---------------------------------------------------------------FILTRO VENTACREDITO----------------------------------------------------------------------

const filtervntcredito = async ({ fechainicio, fechafin }) => {
  const filtervntcre = await db.connect()
  await filtervntcre.query('BEGIN')

  try {
    const gananciasfinalizadas = {
      text: `SELECT COALESCE(SUM(GREATEST(PRO_GANANCIA, 0)), 0) as gananciafinalizada
            FROM VENTACREDITO
            INNER JOIN PRODUCTOS ON VNC_PRO_ID = PRO_ID
            WHERE VNC_FECHA BETWEEN $1 AND $2

            AND VNC_ESTADO = 'finalizado'`,
      values: [fechainicio, fechafin]
    }
    const { rows: gananciasfinalizadasRows } = await filtervntcre.query(gananciasfinalizadas)

    const vntfin = parseFloat(gananciasfinalizadasRows[0].gananciafinalizada)// Convertir a número

    const gananciasactivos = {
      text: `SELECT 
        COALESCE(SUM(GREATEST(PRO_GANANCIA - RAB_SALDO, 0)), 0) AS gananciaactiva
    FROM 
        VENTACREDITO
    INNER JOIN 
        PRODUCTOS ON VNC_PRO_ID = PRO_ID
    LEFT JOIN 
        RESTAR_ABONOS ON VNC_ID = RAB_VNC_ID
    WHERE 
        VNC_FECHA BETWEEN $1 AND $2
        AND VNC_ESTADO = 'activa' `,
      values: [fechainicio, fechafin]
    }
    const { rows: gananciasactivasRows } = await filtervntcre.query(gananciasactivos)

    const vntact = parseFloat(gananciasactivasRows[0].gananciaactiva)// Convertir a número

    const total = vntfin + vntact

    await filtervntcre.query('COMMIT')
    return { ganancias_finalizadas: vntfin, ganancias_activas: vntact, total_ganancias: total }
  } catch (error) {
    console.error(error)
    await filtervntcre.query('ROLLBACK')
    throw error
  } finally {
    filtervntcre.release() // Libera el cliente de la conexión
  }
}

export const FilterModel = {
  // filtros productos
  filterproducts,
  filterproductbystate,
  filterproductbyspent,
  // filtros ventacontado
  filtervntcontado,
  // filtros ventacredito
  filtervntcredito

}
