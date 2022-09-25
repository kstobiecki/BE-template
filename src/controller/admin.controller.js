const { Op } = require('sequelize');

module.exports = {
    // unfinished
    bestProffesion: async (req, res) => {
        try {
            const { Contract } = req.app.get('models');
            const { Job } = req.app.get('models');
            const { start, end } = req.query;

            const jobs = await Job.findAll({
                where: {
                    paid: true,
                    paymentDate: {
                        [Op.gt]: start,
                        [Op.lt]: end,
                    },
                },
                include: [
                    {
                        model: Contract,
                        as: 'Contract',
                    },
                ],
            });

            res.json(jobs);
        } catch (error) {
            res.status(403).json(error);
        }
    },
};
