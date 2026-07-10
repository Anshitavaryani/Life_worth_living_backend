const httpStatus = require('http-status');
const catchAsync = require('../../utils/catchAsync');
const responseWrapper = require('../../config/responseWrapper');
const { packageService } = require('../../services');

const createPackage = catchAsync(async (req, res) => {
    const data = await packageService.createPackage(req.body);
    return responseWrapper(res, data, 'Package Created', httpStatus.CREATED);
});

const getAllPackages = catchAsync(async (req, res) => {
    const data = await packageService.getAllPackages();
    return responseWrapper(res, data, '', httpStatus.OK);
});

const findPackageById = catchAsync(async (req, res) => {
    const packageDoc = await packageService.findPackageById(req.params.id);
    return responseWrapper(res, packageDoc, '');
});

const updatePackage = catchAsync(async (req, res) => {
    const packageDoc = await packageService.updatePackage(req.body, req.params.id);
    return responseWrapper(res, packageDoc, 'Package Updated Successfully', httpStatus.OK);
});


const deletePackage = catchAsync(async (req, res) => {
    await packageService.deletePackage(req.params.id);
    return responseWrapper(res, '', 'Delete Successfull.');
});

module.exports = {
    createPackage,
    getAllPackages,
    findPackageById,
    updatePackage,
    deletePackage
};
