import { Router } from 'express'
import { UserandClientController } from '../controllers/userandclient.controller.js'
import { checkRole } from '../middlewares/roles.middleware.js'
import { rolesArray } from '../models/roles.model.js'

const router = new Router()

router.post('/register', checkRole(rolesArray.admin), UserandClientController.register)
router.get('/unrelatedrole/:userId', checkRole(rolesArray.admin), UserandClientController.unrelatedrol)
router.post('/asigrol', checkRole(rolesArray.admin), UserandClientController.asigrol)
router.get('/profile', checkRole(rolesArray.client), UserandClientController.profile)
router.put('/update/:id', checkRole(rolesArray.admin), UserandClientController.updateuser)
router.get('/tableclients', checkRole(rolesArray.admin), UserandClientController.tableclients)
router.get('/tableadmin', checkRole(rolesArray.admin), UserandClientController.tableadmin)
router.put('/inactiveuser', checkRole(rolesArray.admin), UserandClientController.inactiveUsers)
export const RouteUsers = router
