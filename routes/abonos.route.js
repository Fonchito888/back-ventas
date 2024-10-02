import { Router } from 'express'
import { AbonosController } from '../controllers/abonos.controller.js'

const router = new Router()

router.post('/register/:id', AbonosController.register)
router.get('/verabn/:id', AbonosController.tableabonos)
router.put('/update/:id', AbonosController.updateabn)

export const RouteAbonos = router
