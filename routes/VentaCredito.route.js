import { Router } from 'express'
import { VentaCreditoController } from '../controllers/VentaCredito.controller.js'

const router = new Router()

router.post('/register', VentaCreditoController.register)
router.delete('/delete/:id', VentaCreditoController.deleteventa)
router.put('/update/:id', VentaCreditoController.updatevntcre)

export const RouteVentacredito = router
