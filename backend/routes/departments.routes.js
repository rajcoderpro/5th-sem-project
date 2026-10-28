const express = require( 'express' );
const {authAdmin , authUser} = require( '../middlewares/auth.middleware' )
const router = express.Router();
const { registerDepartment, getAllDepartments, getDepartmentById, updateDepartment, deactivateDepartment , activateDepartment } = require( '../controllers/departments.controller' );

router.post( '/',authAdmin , registerDepartment );
router.get( '/' ,authUser , getAllDepartments );
router.get( '/:id' ,authUser , getDepartmentById );
router.put( '/:id',authAdmin , updateDepartment );
router.patch( '/:id/deactivate',authAdmin , deactivateDepartment );
router.patch( '/:id/activate', authAdmin , activateDepartment );

module.exports = router;