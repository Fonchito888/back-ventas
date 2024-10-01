import { Router } from 'express'
import { AbonosController } from '../controllers/abonos.controller.js'

const router = new Router()

router.post('/register/:id', AbonosController.register)
router.get('/verabn/:id', AbonosController.tableabonos)

export const RouteAbonos = router
