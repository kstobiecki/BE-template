const { Router: expressRouter } = require('express');
const adminController = require('../controller/admin.controller');
const router = expressRouter();

/**
 * @returns the profession that earned the most money (sum of jobs paid) for any contactor that worked in the query time range.
 */
router.get('/best-profession', adminController.bestProffesion);
router.get('/best-clients', adminController.bestClients);

module.exports = router;
