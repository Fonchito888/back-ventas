import { RouteUsers } from './users.route.js'
import { Router } from 'express'
import { checkRole } from '../middlewares/roles.middleware.js'
import { rolesArray } from '../models/roles.model.js'
import { RouteProducts } from './products.route.js'

const router = new Router()

router.use('/users', RouteUsers)
router.use('/products', checkRole(rolesArray.admin), RouteProducts)

export const Indexroute = router
