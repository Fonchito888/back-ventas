import { Router } from 'express'
import { FilterController } from '../controllers/filter.controller.js'

const router = new Router()

// ---------------------------------------------------------------FILTRO PRODUCTOS----------------------------------------------------------------------
router.get('/productgastos', FilterController.filterproductsgasto)
router.get('/productgains', FilterController.filterproducts)
router.get('/productgainsbystate', FilterController.filterproductsbystate)

// ---------------------------------------------------------------FILTRO VENTACONTADO----------------------------------------------------------------------
router.get('/ventascont', FilterController.filtervntcont)

// ---------------------------------------------------------------FILTRO VENTACREDITO----------------------------------------------------------------------
router.get('/ventascre', FilterController.filtervntcre)

export const RouteFilter = router
