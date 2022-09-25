const Op = require('Sequelize').Op;
const { sequelize } = require('../model');

const getAllUnpaidActiveJobs = async ({ Job, Contract, profileId }) => {
    return Job.findAll({
        where: {
            paid: false,
            '$Contract.status$': 'in_progress',
            [Op.or]: [
                {
                    '$Contract.ClientId$': profileId,
                },
                {
                    '$Contract.ContractorId$': profileId,
                },
            ],
        },
        include: [
            {
                model: Contract,
                attributes: [],
            },
        ],
    });
};

const getUnpaidActiveJobById = async ({
    Job,
    Contract,
    jobId,
    profileId,
    t,
}) => {
    return Job.findOne(
        {
            where: {
                id: jobId,
                paid: false,
                '$Contract.status$': 'in_progress',
                '$Contract.ClientId$': profileId,
            },
            attributes: ['id', 'price'],
            include: [
                {
                    model: Contract,
                    attributes: ['ContractorId'],
                },
            ],
        },
        { transaction: t }
    );
};

const getUserBalance = async ({ Profile, profileId, t }) => {
    const user = await Profile.findOne(
        {
            where: {
                id: profileId,
            },
            attributes: ['balance'],
        },
        { transaction: t }
    );
    return user?.balance;
};

const makeTransaction = async ({ Profile, Job, t, profileId, jobId, job }) => {
    await Profile.decrement('balance', {
        by: job.price,
        where: { id: profileId },
        transaction: t,
    });

    const contractor = await Profile.increment('balance', {
        by: job.price,
        where: { id: job.Contract.ContractorId },
        transaction: t,
    });

    if (!contractor[0][1]) throw 'Contactor does not exist';

    await Job.update(
        { paid: true, paymentDate: Date.now() },
        { where: { id: jobId }, transaction: t }
    );
};

module.exports = {
    unpaid: async (req, res) => {
        try {
            const { Job } = req.app.get('models');
            const { Contract } = req.app.get('models');
            const { id: profileId } = req.profile;
            const jobs = await getAllUnpaidActiveJobs({
                Job,
                Contract,
                profileId,
            });
            if (!jobs) return res.status(404).end();
            res.json(jobs);
        } catch (error) {
            res.status(403).json(error);
        }
    },

    pay: async (req, res) => {
        try {
            const { Job } = req.app.get('models');
            const { Contract } = req.app.get('models');
            const { Profile } = req.app.get('models');
            const { job_id } = req.params;
            const { id: profileId } = req.profile;
            const result = await sequelize.transaction(async (t) => {
                // find contract belonging to the client and check if it's active and unpaid.
                const job = await getUnpaidActiveJobById({
                    Job,
                    Contract,
                    profileId,
                    jobId: job_id,
                    t,
                });
                if (!job)
                    throw `Cannot find unpaid active contract with id ${job_id} belonging to the user`;

                // return user balance and check if it's higher than job price
                const userBalance = await getUserBalance({
                    Profile,
                    profileId,
                    t,
                });
                if (userBalance < job.price) throw `Insufficient funds`;

                // deduct money from client balance, add it to contractor balance, set job as paid
                await makeTransaction({
                    Profile,
                    Job,
                    t,
                    profileId,
                    jobId: job_id,
                    job,
                });

                return 'Payment was successful';
            });
            res.json(result);
        } catch (error) {
            res.status(403).json(error);
        }
    },
};
