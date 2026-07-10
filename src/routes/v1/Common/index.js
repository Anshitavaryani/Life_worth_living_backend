const contactUsRoute = require('./contactUs.route');
const faqRoute = require('./faq.route');
const roleRoute = require('./role.route');
const departmentRoute = require('./department.route');
const countryRoute = require('./country.route');
const stateRoute = require('./state.route');
const cityRoute = require('./city.route');
// const paymentRoute = require('./payment.route');
const packageRoute = require('./package.route');
const videoRoute = require('./video.route');
const paypalRoute = require('./paypal.route');

const commonRoutes = [
    {
        path: '/contactUs',
        route: contactUsRoute,
    },
    {
        path: '/faq',
        route: faqRoute,
    },
    {
        path: '/role',
        route: roleRoute,
    },
    {
        path: '/department',
        route: departmentRoute,
    },
    {
        path: '/country',
        route: countryRoute,
    },
    {
        path: '/state',
        route: stateRoute,
    },
    {
        path: '/city',
        route: cityRoute,
    },
    {
        path: '/payment',
        route: paypalRoute,
    },
     {
        path: '/package',
        route: packageRoute,
    },
     {
        path: '/video',
        route: videoRoute,
    },
];

module.exports = commonRoutes;