import express from 'express'
import 'dotenv/config'
import { Indexroute } from './routes/index.route.js'
import { verifyToken } from './middlewares/jwt.middleware.js'
import { UserandClientModel } from './models/usersandclient.model.js'
import bcryptjs from 'bcryptjs'
import jwt from 'jsonwebtoken'
const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use('/ventas', verifyToken, Indexroute)

const PORT = process.env.PORT || 3000

app.listen(PORT, () => console.log('Server running on port ' + PORT))

app.get('/', (req, res) => {
  // Envía un "OK" como respuesta
  res.send('OK')
})
app.post('/login', async (req, res) => {
  try {
    // Extrae el email y la contraseña del cuerpo de la solicitud
    const { username, password, rol, name } = req.body

    // Verifica que los campos obligatorios estén presentes
    if (!username || !password || !rol) {
      return res.status(400).json({ error: 'Missing required fields: username, password, rol' })
    }

    // Verifica que el correo electrónico no sea demasiado largo
    if (username.length >= 51) {
      return res.status(400).json({ error: 'El username es demasiado largo.' })
    }

    const loginuser = await UserandClientModel.LoginOneUsername(username, rol, name)
    // Verifica si el usuario no existe
    if (!loginuser) {
      return res.status(404).json({ error: 'Usuario y/o contraseña incorrectos o rol incorrecto' })
    }

    // Compara la contraseña proporcionada con la almacenada en la base de datos
    const isMatch = await bcryptjs.compare(password, loginuser.usu_password)
    // Verifica si la contraseña no coincide
    if (!isMatch) {
      return res.status(404).json({ error: 'Usuario y/o contraseña incorrectos o rol incorrecto' })
    }

    // Genera un token JWT para el usuario autenticado
    const token = jwt.sign({ username: loginuser.usu_usuario, rol: loginuser.rol_nombre }, process.env.JWT_SECRET, { expiresIn: '1h' })

    // Devuelve el token en la respuesta
    return res.status(200).json({ token })
  } catch (error) {
    // Imprime el error para depuración
    console.error(error.message)

    // Devuelve una respuesta de error en caso de excepción
    return res.status(500).json({ error: error.message })
  }
})
