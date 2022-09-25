const Op = require('Sequelize').Op;

const aggregateBelongingContracts = (profileId) => {
    return {
        [Op.or]: [
            {
                ClientId: profileId,
            },
            {
                ContractorId: profileId,
            },
        ],
    };
};

module.exports = {
    getContract: async (req, res) => {
        try {
            const { Contract } = req.app.get('models');
            const { id } = req.params;
            const { id: profileId } = req.profile;
            const contract = await Contract.findOne({
                where: {
                    id,
                    ...aggregateBelongingContracts(profileId),
                },
            });
            if (!contract) return res.status(404).end();
            res.json(contract);
        } catch (error) {
            res.status(403).json(error);
        }
    },

    getContracts: async (req, res) => {
        try {
            const { Contract } = req.app.get('models');
            const { id: profileId } = req.profile;
            const contracts = await Contract.findAll({
                where: {
                    ...aggregateBelongingContracts(profileId),
                    [Op.not]: [{ status: 'terminated' }],
                },
            });
            if (!contracts) return res.status(404).end();
            res.json(contracts);
        } catch (error) {
            res.status(403).json(error);
        }
    },
};
