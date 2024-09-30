import { Router } from 'express'
import { UserandClientController } from '../controllers/userandclient.controller.js'
import { checkRole } from '../middlewares/roles.middleware.js'
import { rolesArray } from '../models/roles.model.js'

const router = new Router()

router.post('/register', checkRole(rolesArray.admin), UserandClientController.register)
router.get('/unrelatedrole/:userId', checkRole(rolesArray.admin), UserandClientController.unrelatedrol)
router.post('/asigrol/:id', checkRole(rolesArray.admin), UserandClientController.asigrol)
router.get('/profile', checkRole(rolesArray.client), UserandClientController.profile)
router.put('/update/:id', checkRole(rolesArray.admin), UserandClientController.updateuser)
router.get('/tableclients', checkRole(rolesArray.admin), UserandClientController.tableclients)
router.get('/tableadmin', checkRole(rolesArray.admin), UserandClientController.tableadmin)
router.put('/stateuser/:id', checkRole(rolesArray.admin), UserandClientController.changestateUsers)
export const RouteUsers = router
