import { Router } from 'express'
import { AbonosController } from '../controllers/abonos.controller.js'

const router = new Router()

router.post('/register/:id', AbonosController.register)

export const RouteAbonos = router
