const express = require('express');
const bodyParser = require('body-parser');
const { sequelize } = require('./model');
/**
 * APIs
 */
const contractApi = require('./route/contract.route');
const jobsApi = require('./route/jobs.route');
const balancesApi = require('./route/balances.route');
const adminApi = require('./route/admin.route');

const app = express();
app.use(bodyParser.json());
app.set('sequelize', sequelize);
app.set('models', sequelize.models);

app.use('/contracts', contractApi);
app.use('/jobs', jobsApi);
app.use('/balances', balancesApi);
app.use('/admin', adminApi);

module.exports = app;
