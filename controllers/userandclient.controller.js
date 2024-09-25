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
  const { userId, roleId } = req.body

  if (!userId || !roleId) {
    return res.status(400).json({ error: 'Faltan campos obligatorios: userId y roleId.' })
  }

  // Verifica si el usuario existe
  const user = await UserandClientModel.findOneUserId(userId)
  if (!user) {
    return res.status(404).json({ error: 'Usuario no encontrado.' })
  }

  const existingrolanduser = await UserandClientModel.RoleasigUserOne(userId, roleId)
  if (existingrolanduser) {
    return res.status(409).json({ error: 'El usuario ya tiene este rol' })
  }

  try {
    UserandClientModel.RoleasigUser(userId, roleId)
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

export const UserandClientController = {
  register,
  updateuser,
  unrelatedrol,
  asigrol,
  profile

}
