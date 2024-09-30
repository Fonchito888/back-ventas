import jwt from 'jsonwebtoken'

export const verifyToken = (req, res, next) => {
  let token = req.headers.authorization

  if (!token) {
    return res.status(401).json({ error: 'Token not provided' })
  }

  token = token.split(' ')[1] // Bearer token format
  console.log({ token })

  try {
    const { username, rol } = jwt.verify(token, process.env.JWT_SECRET)
    req.username = username
    req.rol = rol

    next()
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token has expired' })
    }
    return res.status(400).json({ error: 'Invalid token' })
  }
}
