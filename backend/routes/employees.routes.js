const express = require("express");
const router = express.Router();

const employeeController = require("../controllers/employees.controller");

const {
    authAdmin,
    authUser,
    authEmployee
} = require("../middlewares/auth.middleware");

router.post("/", authAdmin, employeeController.registerEmployee);
router.get("/", authAdmin, employeeController.getAllEmployees);
router.get("/me", authEmployee, employeeController.getMyProfile);
router.get("/:id", authUser, employeeController.getEmployeeById);
router.put("/:id", authAdmin, employeeController.updateEmployee);
router.patch("/:id/deactivate",authAdmin,employeeController.deactivateEmployee);
router.patch( "/:id/activate",authAdmin,employeeController.activateEmployee);

module.exports = router;
