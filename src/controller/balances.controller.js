const { sequelize } = require('../model');

const getAllUnpaidActiveJobsBalance = async ({
    Job,
    Contract,
    profileId,
    t,
}) => {
    return Job.sum('price', {
        where: {
            paid: false,
            '$Contract.status$': 'in_progress',
            '$Contract.ClientId$': profileId,
        },
        transaction: t,
        include: [
            {
                model: Contract,
                attributes: [],
            },
        ],
    });
};

module.exports = {
    deposit: async (req, res) => {
        try {
            const { Job } = req.app.get('models');
            const { Profile } = req.app.get('models');
            const { Contract } = req.app.get('models');
            const { id: profileId } = req.profile;
            const { userId } = req.params;
            let { deposit } = req.body;

            // Normally I would use joi validator along with auth middleware to check post body. Not to extend this project too much I will just check type of deposit here.
            if (!deposit || typeof deposit !== 'number' || deposit < 0) {
                return res
                    .status(400)
                    .json(`'deposit' must be a number greater than 0`);
            }
            // also here I would just return error if there is more then 2 decimal values. For simplicity I will round it.
            deposit = Math.round((deposit + Number.EPSILON) * 100) / 100;

            if (+userId !== profileId)
                return res
                    .status(403)
                    .json(`Cannot deposit money for userId = ${userId}`);

            const result = await sequelize.transaction(async (t) => {
                const jobsBalance = await getAllUnpaidActiveJobsBalance({
                    Job,
                    Contract,
                    profileId,
                    t,
                });

                if (deposit >= 0.25 * jobsBalance)
                    throw 'User cannot deposit more than 25% his total of jobs to pay';

                await Profile.increment('balance', {
                    by: deposit,
                    where: { id: profileId },
                    transaction: t,
                });

                return 'Deposit was successful';
            });
            res.json(result);
        } catch (error) {
            res.status(403).json(error);
        }
    },
};
