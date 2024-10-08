import { Router } from 'express'
import { ProductsController } from '../controllers/products.controller.js'

const router = new Router()

router.post('/register', ProductsController.register)
router.put('/update/:id', ProductsController.updateproduct)
router.get('/tableproducts', ProductsController.tableproducts)

export const RouteProducts = router
