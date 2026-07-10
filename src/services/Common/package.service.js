const httpStatus = require('http-status');
const { Package } = require('../../models');
const ApiError = require('../../utils/ApiError');

const createPackage = async (reqBody) => {
    try {
        const pkg = await Package.create(reqBody);

        if (!pkg) {
            throw new ApiError(
                httpStatus.INTERNAL_SERVER_ERROR,
                'Package creation failed'
            );
        }

        return pkg;
    } catch (error) {
        throw new ApiError(
            error.statusCode ? error.statusCode : httpStatus.INTERNAL_SERVER_ERROR,
            error.message
        );
    }
};

const getAllPackages = async () => {
    try {
        const packages = await Package.findAll({
            where: { is_active: true },
        });

        if (!packages) {
            throw new ApiError(
                httpStatus.INTERNAL_SERVER_ERROR,
                'Failed to fetch packages'
            );
        }

        return packages;
    } catch (error) {
        throw new ApiError(
            error.statusCode ? error.statusCode : httpStatus.INTERNAL_SERVER_ERROR,
            error.message
        );
    }
};

const findPackageById = async (id) => {
    try {
        const pkg = await Package.findByPk(id);
        return pkg;
    } catch (error) {
        throw new ApiError(error.statusCode ? error.statusCode : httpStatus.INTERNAL_SERVER_ERROR, error.message);
    }
};

const updatePackage = async (id, reqBody) => {
    try {
        const pkg = await Package.findByPk(id);

        if (!pkg) {
            throw new ApiError(httpStatus.NOT_FOUND, 'Package not found');
        }

        await pkg.update(reqBody);
        return pkg;
    } catch (error) {
        throw new ApiError(
            error.statusCode ? error.statusCode : httpStatus.INTERNAL_SERVER_ERROR,
            error.message
        );
    }
};

const deletePackage = async (id) => {
    try {
        const pkg = await Package.findByPk(id);

        if (!pkg) {
            throw new ApiError(httpStatus.NOT_FOUND, 'Package not found');
        }

        await pkg.destroy();
        return true;
    } catch (error) {
        throw new ApiError(
            error.statusCode ? error.statusCode : httpStatus.INTERNAL_SERVER_ERROR,
            error.message
        );
    }
};

module.exports = {
    createPackage,
    getAllPackages,
    findPackageById,
    updatePackage,
    deletePackage,
};
