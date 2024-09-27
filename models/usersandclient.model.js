import { db } from '../database/connection.js'

/**
 * Crea un nuevo usuario en la base de datos.
 * @param {Object} userData - Datos del nuevo usuario.
 * @param {string} userData.name - Nombre de usuario.
 * @param {string} userData.lastname - Apellido del usuario.
 * @param {string} userData.user - Correo electrónico del usuario.
 * @param {string} userData.password - Contraseña del usuario.
 * @param {string} userData.direccion - Dirección del usuario.
 * @param {string} userData.telefono - Teléfono del usuario.
 * @param {string} userData.identificacion - Identificación del usuario.
 * @returns {Promise<Object>} - Datos del usuario recién creado.
 */
const create = async ({ name, lastname, user, password, direccion, telefono, identificacion }) => {
  // Inicia una transacción
  const client = await db.connect()
  await client.query('BEGIN')

  try {
    // Inserta el nuevo usuario
    const insertUserQuery = {
      text: `INSERT INTO USUARIO (USU_NOMBRE, USU_APELLIDO, USU_DIRECCION, USU_TELEFONO, 
              USU_IDENTIFICACION, USU_USUARIO, USU_PASSWORD) 
              VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING USU_ID`,
      values: [name, lastname, direccion, telefono, identificacion, user, password]
    }

    const { rows: userRows } = await client.query(insertUserQuery)
    const newUserId = userRows[0].usu_id

    // Inserta el rol del nuevo usuario
    const insertRoleQuery = {
      text: `INSERT INTO ROLESUSUARIO (USR_USU_ID, USR_ROL_ID) 
              VALUES ($1, 2)`,
      values: [newUserId]
    }

    await client.query(insertRoleQuery)

    // Confirma la transacción
    await client.query('COMMIT')

    return { name, lastname, user }
  } catch (error) {
    // Si hay un error, revierte la transacción
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release() // Libera el cliente de la conexión
  }
}

/**
 * Busca un usuario en la base de datos por su nombre de usuario.
 * @param {string} user - Nombre de usuario.
 * @returns {Promise<Object|null>} - Datos del usuario encontrado o null si no existe.
 */
const findOneUsername = async (user) => {
  const query = {
    text: 'SELECT * FROM USUARIO WHERE USU_USUARIO = $1',
    values: [user]
  }

  const { rows } = await db.query(query)
  return rows[0] || null
}

/**
 * Busca un usuario en la base de datos por su identificación.
 * @param {string} identificacion - Identificación del usuario a buscar.
 * @returns {Promise<Object|null>} - Datos del usuario encontrado o null si no existe.
 */
const findOneIdentificacion = async (identificacion) => {
  const query = {
    text: 'SELECT * FROM USUARIO WHERE USU_IDENTIFICACION = $1',
    values: [identificacion]
  }

  const { rows } = await db.query(query)
  return rows[0] || null
}

/**
 * Busca un usuario en la base de datos por su ID.
 * @param {number} userId - ID del usuario.
 * @returns {Promise<Object|null>} - Datos del usuario encontrado o null si no existe.
 */
const findOneUserId = async (userId) => {
  const query = {
    text: 'SELECT * FROM USUARIO WHERE USU_ID = $1',
    values: [userId]
  }

  const { rows } = await db.query(query)
  return rows[0] || null
}

/**
 * Busca un Rol en la base de datos por su ID.
 * @param {number} rolId - ID del usuario.
 * @returns {Promise<Object|null>} - Datos del usuario encontrado o null si no existe.
 */
const findOneRolId = async (rolId) => {
  const query = {
    text: 'SELECT * FROM ROLES WHERE ROL_ID = $1',
    values: [rolId]
  }

  const { rows } = await db.query(query)
  return rows[0] || null
}
/**
 * Busca un usuario en la base de datos por su ID.
 * @param {number} id - ID del usuario.
 * @returns {Promise<Object|null>} - Datos del usuario encontrado o null si no existe.
 */
const findById = async (id) => {
  const query = {
    text: 'SELECT * FROM USUARIO WHERE USU_ID = $1',
    values: [id]
  }

  const { rows } = await db.query(query)
  return rows[0] || null
}

/**
 * Asigna un rol a un usuario en la base de datos.
 * @param {number} userId - ID del usuario al que se le asignará el rol.
 * @param {number} roleId - ID del rol que se asignará al usuario.
 * @returns {Promise<Object>} - Datos del rol asignado.
 */
const RoleasigUser = async (userId, roleId) => {
  const query = {
    text: 'INSERT INTO ROLESUSUARIO (USR_USU_ID, USR_ROL_ID) VALUES ($1, $2)',
    values: [userId, roleId]
  }
  await db.query(query)
}

/**
 * Verifica si un rol ya está asignado a un usuario en la base de datos.
 * @param {number} userId - ID del usuario al que se le verificará el rol.
 * @param {number} roleId - ID del rol que se le verificará al usuario.
 * @returns {Promise<Object|null>} - Datos del rol si existe, o null si no.
 */
const RoleasigUserOne = async (userId, roleId) => {
  const query = {
    text: 'SELECT * FROM ROLESUSUARIO WHERE USR_USU_ID = $1 AND USR_ROL_ID = $2',
    values: [userId, roleId]
  }

  const { rows } = await db.query(query)
  return rows[0] || null
}

/**
 * Obtiene los roles que no están asignados a un usuario específico.
 * @param {number} userId - ID del usuario.
 * @returns {Promise<Array>} - Lista de roles no asignados al usuario.
 */
const UnrelatedRolesandUser = async (userId) => {
  const query = {
    text: ` SELECT * 
            FROM ROLES 
            WHERE ROL_ID NOT IN (
                SELECT USR_ROL_ID 
                FROM ROLESUSUARIO 
                WHERE USR_USU_ID = $1
            );
        `,
    values: [userId]
  }

  const { rows } = await db.query(query)
  return rows
}

/**
 * Verifica las credenciales de inicio de sesión de un usuario.
 * @param {string} username - Nombre de usuario.
 * @param {string} rol - Rol del usuario.
 * @returns {Promise<Object|null>} - Datos del usuario si las credenciales son correctas, o null si no.
 */
const LoginOneUsername = async (username, rol) => {
  const query = {
    text: `SELECT * FROM USUARIO 
               JOIN ROLESUSUARIO ON USU_ID = USR_USU_ID
               JOIN ROLES ON USR_ROL_ID = ROL_ID 
               WHERE USU_USUARIO = $1 AND ROL_NOMBRE = $2`,
    values: [username, rol]
  }

  const { rows } = await db.query(query)
  return rows[0] || null
}

/**
 * Actualiza un usuario en la base de datos.
 * @param {Object} userData - Datos del usuario a actualizar.
 * @param {string} userData.name - Nuevo nombre del usuario.
 * @param {string} userData.lastname - Nuevo apellido del usuario.
 * @param {string} userData.user - Nuevo correo electrónico del usuario.
 * @param {string} userData.direccion - Nueva dirección del usuario.
 * @param {string} userData.telefono - Nuevo teléfono del usuario.
 * @param {string} userData.identificacion - Nueva identificación del usuario.
 * @param {number} id - ID del usuario a actualizar.
 * @returns {Promise<Object>} - Datos del usuario actualizado.
 * @throws {Error} - Lanza un error si ocurre un problema durante la actualización.
 */
const update = async ({ name, lastname, user, direccion, telefono, identificacion, id }) => {
  // Inicia una transacción
  const client = await db.connect()
  await client.query('BEGIN')

  try {
    // Actualiza la información del usuario
    const updateUserQuery = {
      text: `UPDATE USUARIO 
             SET USU_NOMBRE = $1, USU_APELLIDO = $2, USU_DIRECCION = $3, 
                 USU_TELEFONO = $4, USU_IDENTIFICACION = $5, USU_USUARIO = $6 
             WHERE USU_ID = $7`,
      values: [name, lastname, direccion, telefono, identificacion, user, id]
    }

    await client.query(updateUserQuery)

    // Confirma la transacción
    await client.query('COMMIT')

    // Devuelve los nuevos datos del usuario
    return { name, lastname, user, direccion, telefono, identificacion }
  } catch (error) {
    // Si hay un error, revierte la transacSión
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release() // Libera el cliente de la conexión
  }
}

/**
 * Obtiene todos los clientes de la base de datos.
 * @returns {Promise<Array>} - Lista de clientes que tienen el rol de 'cliente'.
 */
const tableclients = async () => {
  const query = {
    text: `SELECT *
          FROM USUARIO
          JOIN ROLESUSUARIO ON USU_ID = USR_USU_ID
          JOIN ROLES ON USR_ROL_ID = ROL_ID
          WHERE ROL_NOMBRE = 'cliente'`
  }
  const rows = await db.query(query)
  return rows // Devuelve el array de clientes
}

/**
 * Obtiene todos los administradores de la base de datos.
 * @returns {Promise<Array>} - Lista de administradores que tienen el rol de 'administrador'.
 */
const tableadmin = async () => {
  const query = {
    text: `SELECT *
          FROM USUARIO
          JOIN ROLESUSUARIO ON USU_ID = USR_USU_ID
          JOIN ROLES ON USR_ROL_ID = ROL_ID
          WHERE ROL_NOMBRE = 'administrador'`
  }
  const rows = await db.query(query)
  return rows // Devuelve el array de administradores
}

/**
 * Actualiza el estado de un usuario en la base de datos.
 * @param {Object} params - Parámetros para la actualización.
 * @param {string} params.state - Nuevo estado del usuario (por ejemplo, 'activo' o 'inactivo').
 * @param {number} params.id - ID del usuario a actualizar.
 * @returns {Promise<void>} - Una promesa que se resuelve cuando se completa la actualización.
 */
const inactiveUsers = async (state, id) => {
  const query = {
    text: `UPDATE USUARIO 
             SET USU_ESTADO = $1 
             WHERE USU_ID = $2`,
    values: [state, id]
  }
  await db.query(query)
}

export const UserandClientModel = {
  create,
  findOneUsername,
  findById,
  LoginOneUsername,
  RoleasigUser,
  RoleasigUserOne,
  UnrelatedRolesandUser,
  findOneUserId,
  findOneRolId,
  findOneIdentificacion,
  update,
  tableclients,
  tableadmin,
  inactiveUsers

}
