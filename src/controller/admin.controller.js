const { Op, fn, col } = require('sequelize');
const { Job, Profile, Contract } = require('../model');

const getBestPayByProfileType = ({ start, end, type, limit }) => {
    return Job.findAll({
        raw: true,
        where: {
            paid: true,
            paymentDate: {
                [Op.gt]: start,
                [Op.lt]: end,
            },
        },
        attributes: [[fn('sum', col('price')), 'total_amount_earned']],
        include: [
            {
                model: Contract,
                as: 'Contract',
                attributes: [`${type}Id`],
                include: [
                    {
                        model: Profile,
                        as: `${type}`,
                        attributes: ['id', 'firstName', 'lastName', 'type'],
                    },
                ],
            },
        ],
        group: `${type}Id`,
        order: [['total_amount_earned', 'DESC']],
        limit,
    });
};

module.exports = {
    bestProffesion: async (req, res) => {
        try {
            const { start, end } = req.query;

            const jobs = await getBestPayByProfileType({
                start,
                end,
                type: 'Contractor',
                limit: 1,
            });

            res.json(jobs);
        } catch (error) {
            console.log(error);
            res.status(403).json(error);
        }
    },
    bestClients: async (req, res) => {
        try {
            const { start, end } = req.query;

            const jobs = await getBestPayByProfileType({
                start,
                end,
                type: 'Client',
                limit: 3,
            });

            res.json(jobs);
        } catch (error) {
            res.status(403).json(error);
        }
    },
};
