import { Router } from 'express'
import { ProductsController } from '../controllers/products.controller.js'

const router = new Router()

router.post('/register', ProductsController.register)
router.put('/update/:id', ProductsController.updateproduct)

export const RouteProducts = router
