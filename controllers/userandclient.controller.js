/* eslint-disable padded-blocks */
import { UserandClientModel } from '../models/usersandclient.model.js'
import bcryptjs from 'bcryptjs'

const register = async (req, res) => {
  try {
    // // Imprime el cuerpo de la solicitud para depuración
    // console.log(req.body);

    const { name, lastname, user, password, direccion, telefono, identificacion } = req.body

    // Verifica que los campos obligatorios estén presentes
    if (!name || !lastname || !password || !telefono || !identificacion || !direccion) {
      return res.status(400).json({ error: 'Faltan campos obligatorios: nombre, apellido, contraseña, teléfono, identificación y dirección.' })
    }

    // Verifica que el correo electrónico no sea demasiado largo
    if (user.length >= 51) {
      return res.status(400).json({ error: 'El username es demasiado largo.' })
    }

    // Expresión regular para validar contraseñas
    const passwordregex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[$@$!%*?&])([A-Za-z\d$@$!%*?&]|[^ ]){8,15}$/

    // Verifica que la contraseña cumpla con los requisitos
    if (!passwordregex.test(password)) {
      return res.status(400).json({ error: 'La contraseña debe tener entre 8 y 15 caracteres, incluir al menos un dígito, una letra minúscula, una mayúscula, y al menos un carácter especial.' })
    }

    // Verifica si ya existe un usuario con el mismo nombre de usuario
    const existingUsername = await UserandClientModel.findOneUsername(user)
    if (existingUsername) {
      return res.status(409).json({ error: 'Usuario existente' })
    }

    const existingIdentity = await UserandClientModel.findOneIdentificacion(identificacion)
    if (existingIdentity) {
      return res.status(409).json({ error: 'numero de identificación existente' })
    }

    // Genera un hash de la contraseña utilizando bcrypt
    const salt = await bcryptjs.genSalt(10)
    const hashedPassword = await bcryptjs.hash(password, salt)

    // Crea el nuevo usuario y su rol
    const newUser = await UserandClientModel.create({
      name,
      lastname,
      user,
      password: hashedPassword,
      direccion,
      telefono,
      identificacion
    })

    return res.status(201).json(newUser)
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: error.message })
  }
}

const updateuser = async (req, res) => {
  try {
    const { id } = req.params
    const { name, lastname, direccion, telefono, identificacion, user } = req.body

    // Verifica que los campos obligatorios estén presentes
    if (!name || !lastname || !telefono || !identificacion || !direccion) {
      return res.status(400).json({ error: 'Faltan campos obligatorios: nombre, apellido, contraseña, teléfono, identificación y dirección.' })
    }

    if (isNaN(id)) {
      return res.status(400).json({ error: 'El ID del usuario no es válido.' })
    }

    // Verifica que el correo electrónico no sea demasiado largo
    if (user.length >= 51) {
      return res.status(400).json({ error: 'El username es demasiado largo.' })
    }

    // Buscar el usuario actual para obtener su id actual
    const Userupdate = await UserandClientModel.findById(id)
    if (!Userupdate) {
      return res.status(404).json({ error: 'User not found' })
    }

    // Verifica si ya existe un usuario con el mismo nombre de usuario
    if (Userupdate.usu_usuario !== user) {
      const existingUsername = await UserandClientModel.findOneUsername(user)
      if (existingUsername) {
        return res.status(409).json({ error: 'Usuario existente' })
      }
    }

    if (Userupdate.usu_identificacion !== identificacion) {
      const existingIdentity = await UserandClientModel.findOneIdentificacion(identificacion)
      if (existingIdentity) {
        return res.status(409).json({ error: 'numero de identificación existente' })
      }
    }
    const UpdateUser = await UserandClientModel.update({
      name,
      lastname,
      user,
      direccion,
      telefono,
      identificacion,
      id
    })

    return res.status(201).json(UpdateUser)
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: error.message })
  }
}

const unrelatedrol = async (req, res) => {
  const { userId } = req.params

  // Validar el userId
  if (isNaN(userId)) {
    return res.status(400).json({ error: 'El ID del usuario no es válido.' })
  }

  try {
    // Verifica si el usuario existe
    const user = await UserandClientModel.findOneUserId(userId)
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado.' })
    }

    // Obtiene los roles no asignados
    const roles = await UserandClientModel.UnrelatedRolesandUser(userId)

    // Verifica si roles está definido y si tiene elementos
    if (!roles || roles.length === 0) {
      return res.status(200).json({ message: 'El usuario ya tiene todos los roles asignados.' })
    }

    return res.status(200).json(roles)
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: error.message })
  }
}

const asigrol = async (req, res) => {
  const { roleId } = req.body
  const { id } = req.params

  if (!roleId) {
    return res.status(400).json({ error: 'Faltan campos obligatorios: roleId.' })
  }
  if (isNaN(id)) {
    return res.status(400).json({ error: 'El ID del usuario no es válido.' })
  }
  if (isNaN(roleId)) {
    return res.status(400).json({ error: 'El ID del rol no es válido.' })
  }

  // Verifica si el usuario existe
  const user = await UserandClientModel.findOneUserId(id)
  if (!user) {
    return res.status(404).json({ error: 'Usuario no encontrado.' })
  }
  // Verifica si el usuario existe
  const rol = await UserandClientModel.findOneRolId(roleId)
  if (!rol) {
    return res.status(404).json({ error: 'Rol no encontrado.' })
  }

  const existingrolanduser = await UserandClientModel.RoleasigUserOne(id, roleId)
  if (existingrolanduser) {
    return res.status(409).json({ error: 'El usuario ya tiene este rol' })
  }

  try {
    UserandClientModel.RoleasigUser(id, roleId)
    return res.status(201).json({ message: 'Rol asignado al usuario exitosamente.' })
  } catch (error) {
    console.error('Error al asignar rol al usuario:', error.message)
    return res.status(500).json({ error: error.message })
  }
}

const profile = async (req, res) => {
  try {
    // Buscar el usuario en la base de datos usando el email proporcionado en la solicitud
    const user = await UserandClientModel.findOneUsername(req.username)
    const rol = req.rol

    // Verifica si el usuario existe
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' })
    }

    // Crea la variable profile con los datos del usuario
    const profile = {
      username: user.usu_usuario,
      name: user.usu_nombre,
      lastname: user.usu_apellido,
      direccion: user.usu_direccion,
      telefono: user.usu_telefono,
      identificacion: user.usu_identificacion,
      rol
    }

    // Devuelve el perfil
    return res.json(profile)
  } catch (error) {
    // Imprimir el error en la consola para depuración
    console.error(error.message)

    // En caso de error, se devuelve un estado 500 con el mensaje del error
    return res.status(500).json({ error: error.message })
  }
}
// Tabla que me devuelve todos los usuario con rol de cliente
const tableclients = async (req, res) => {
  try {
    const result = await UserandClientModel.tableclients()
    const clients = result.rows

    // Mapeo y Formateo de datos para devolverlos como una lista de objetos
    const formattedClients = clients.map(client => ({
      id: client.usu_id,
      identificacion: client.usu_identificacion,
      name: client.usu_nombre,
      lastname: client.usu_apellido,
      user: client.usu_usuario,
      direccion: client.usu_direccion,
      telefono: client.usu_telefono,
      estado: client.usu_estado,
      idrol: client.rol_id,
      rol_nombre: client.rol_nombre
    }))

    // Devuelve la tabla clientes
    return res.json(formattedClients)
  } catch (error) {
    // Imprimir el error en la consola para depuración
    console.error(error.message)

    // En caso de error, se devuelve un estado 500 con el mensaje del error
    return res.status(500).json({ error: error.message })
  }
}

// Tabla que me devuelve todos los usuario con rol de admin
const tableadmin = async (req, res) => {
  try {
    const result = await UserandClientModel.tableadmin()
    const admins = result.rows

    // Mapeo y Formateo de datos para devolverlos como una lista de objetos
    const formattedAdmin = admins.map(admin => ({
      id: admin.usu_id,
      identificacion: admin.usu_identificacion,
      name: admin.usu_nombre,
      lastname: admin.usu_apellido,
      user: admin.usu_usuario,
      direccion: admin.usu_direccion,
      telefono: admin.usu_telefono,
      estado: admin.usu_estado,
      idrol: admin.rol_id,
      rol_nombre: admin.rol_nombre
    }))

    // Devuelve la tabla admin
    return res.json(formattedAdmin)
  } catch (error) {
    // Imprimir el error en la consola para depuración
    console.error(error.message)

    // En caso de error, se devuelve un estado 500 con el mensaje del error
    return res.status(500).json({ error: error.message })
  }
}

const changestateUsers = async (req, res) => {
  try {
    const { state } = req.body
    const { id } = req.params

    // Verifica que los campos obligatorios estén presentes
    if (!id || !state) {
      return res.status(400).json({ error: 'Faltan campos obligatorios: id y estado' })
    }

    if (isNaN(id)) {
      return res.status(400).json({ error: 'El ID del usuario no es válido.' })
    }

    // Verifica si el usuario existe
    const user = await UserandClientModel.findOneUserId(id)
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado.' })
    }

    // Verifica que el estado sea 'activo' o 'inactivo'
    if (state !== 'activo' && state !== 'inactivo') {
      return res.status(400).json({ error: 'El estado solo puede ser activo o inactivo.' })
    }

    // Aquí puedes agregar la lógica para cambiar el estado del usuario
    await UserandClientModel.inactiveUsers(state, id)

    return res.json('Estado cambiado con éxito')
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: error.message })
  }
}

export const UserandClientController = {
  register,
  updateuser,
  unrelatedrol,
  asigrol,
  profile,
  tableclients,
  tableadmin,
  changestateUsers

}
