import { Router } from 'express'
import { VentaContadoController } from '../controllers/VentaContado.controller.js'

const router = new Router()

router.post('/register', VentaContadoController.register)
router.delete('/delete/:id', VentaContadoController.deleteventa)
router.put('/update/:id', VentaContadoController.updatevntcnt)
router.get('/tablevntcnt', VentaContadoController.tableventascnt)

export const RouteVntContado = router
