import { RouteUsers } from './users.route.js'
import { Router } from 'express'
import { checkRole } from '../middlewares/roles.middleware.js'
import { rolesArray } from '../models/roles.model.js'
import { RouteProducts } from './products.route.js'
import { RouteVntContado } from './VentaContado.route.js'
import { RouteVentacredito } from './VentaCredito.route.js'
import { RouteAbonos } from './abonos.route.js'
import { RouteFilter } from './filter.route.js'

const router = new Router()

router.use('/users', RouteUsers)
router.use('/products', checkRole(rolesArray.admin), RouteProducts)
router.use('/vntcontado', checkRole(rolesArray.admin), RouteVntContado)
router.use('/vntcredito', checkRole(rolesArray.admin), RouteVentacredito)
router.use('/abonos', checkRole(rolesArray.admin), RouteAbonos)
router.use('/filter', checkRole(rolesArray.admin), RouteFilter)

export const Indexroute = router
