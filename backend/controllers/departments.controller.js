const departmentModel = require( '../models/department.model' )

const registerDepartment = async ( req, res ) => {
    const { name, code, description } = req.body;

    const normalizedName = typeof name === 'string' ? name.trim() : '';
    const normalizedCode = typeof code === 'string' ? code.trim().toUpperCase() : '';
    const normalizedDescription = typeof description === 'string' ? description.trim() : '';

    if ( !req.user || !req.user.id ) {
        return res.status( 401 ).json( {
            message: 'Unauthorized access'
        } )
    }

    if ( !normalizedName || !normalizedCode ) {
        return res.status( 400 ).json( {
            message: 'Department name and code are required'
        } )
    }

    const isDepartmentAlreadyExists = await departmentModel.findOne( {
        $or: [
            { name: normalizedName },
            { code: normalizedCode }
        ]
    } )

    if ( isDepartmentAlreadyExists ) {
        return res.status( 409 ).json( {
            message: `Department with the name "${ normalizedName }" or code "${ normalizedCode }" already exists`
        } )
    }

    const newDepartment = await departmentModel.create( {
        name: normalizedName,
        code: normalizedCode,
        description: normalizedDescription,
        createdBy: req.user.id
    } )

    return res.status( 201 ).json( {
        message: 'department created',
        name: newDepartment.name
    } )
}
const getAllDepartments = async ( req, res ) => {
    const departments = await departmentModel.find() 
    return res.status( 200 ).json( {
        message: 'departments fetched',
        departments
    } )
}
const getDepartmentById = async ( req, res ) => {
    const id = req.params.id 
    const department = await departmentModel.findOne( { _id: id } )
    if(!department){
        return res.status( 404 ).json( {
            message: 'department not found'
        } )
    }
    return res.status( 200 ).json( {
        message: 'department fetched',
        department
    } )
}
const updateDepartment = async ( req, res ) => {
    const id = req.params.id 
    const { name, code, description } = req.body;

    const normalizedName = typeof name === 'string' ? name.trim() : '';
    const normalizedCode = typeof code === 'string' ? code.trim().toUpperCase() : '';
    const normalizedDescription = typeof description === 'string' ? description.trim() : '';
    if ( !req.user || !req.user.id ) {
        return res.status( 401 ).json( {
            message: 'Unauthorized access'
        } )
    }
    if ( !normalizedName || !normalizedCode ) {
        return res.status( 400 ).json( {
            message: 'Department name and code are required'
        } )
    }
    const isDepartmentAlreadyExistsWithSameNameOrCode = await departmentModel.findOne( {
        _id: { $ne: id },
        $or: [
            { name: normalizedName },
            { code: normalizedCode }
        ]
    } )

    if ( isDepartmentAlreadyExistsWithSameNameOrCode ) {
        return res.status( 409 ).json( {
            message: `Department with the name "${ normalizedName }" or code "${ normalizedCode }" already exists`
        } )
    }
    const updatedDepartment = await departmentModel.findOneAndUpdate( { _id: id }, {
        name:normalizedName,
        code: normalizedCode,
        description: normalizedDescription,
        createdBy : req.user.id
    } )
    if(!updatedDepartment){
        return res.status( 404 ).json( {
            message: 'department not found'
        } )
    }
    return res.status( 200 ).json( {
        message: 'department updated',
        name: updatedDepartment.name
    } )

}
const deactivateDepartment = async ( req, res ) => {
    const id = req.params.id 
    const deactivatedDepartment = await departmentModel.findOneAndUpdate( { _id: id }, {
        isActive: false,
        createdBy: req.user.id
    } )
    if(!deactivatedDepartment){
        return res.status( 404 ).json( {
            message: 'department not found'
        } )
    }
    return res.status( 200 ).json( {
        message: 'department deactivated',
        name: deactivatedDepartment.name
    } )
}
const activateDepartment = async ( req, res ) => {
    const id = req.params.id 
    const activatedDepartment = await departmentModel.findOneAndUpdate( { _id: id }, {
        isActive: true,
        createdBy: req.user.id
    } )
    if(!activatedDepartment){
        return res.status( 404 ).json( {
            message: 'department not found'
        } )
    }
    return res.status( 200 ).json( {
        message: 'department activated',
        name: activatedDepartment.name
    } )
}
module.exports = { registerDepartment, getAllDepartments, getDepartmentById, updateDepartment, deactivateDepartment ,activateDepartment }