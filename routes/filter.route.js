import { Router } from 'express'
import { FilterController } from '../controllers/filter.controller.js'

const router = new Router()

// ---------------------------------------------------------------FILTRO PRODUCTOS----------------------------------------------------------------------
router.post('/productgastos', FilterController.filterproductsgasto)
router.post('/productgains', FilterController.filterproducts)
router.post('/productgainsbystate', FilterController.filterproductsbystate)

// ---------------------------------------------------------------FILTRO VENTACONTADO----------------------------------------------------------------------
router.post('/ventascont', FilterController.filtervntcont)

// ---------------------------------------------------------------FILTRO VENTACREDITO----------------------------------------------------------------------
router.post('/ventascre', FilterController.filtervntcre)

export const RouteFilter = router
