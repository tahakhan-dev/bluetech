const db = require("../../../Model");
const Op = db.Sequelize.Op;
const Friends = db.friends;
const Block = db.blockUserModel;

const getCustomerAndSearchByUserName = async function ({ payloadId, userId }) {
  try {
    let _blockMember = await Block.findOne({
      raw: true,
      where: {
        [Op.or]: [
          {
            blockerId: {
              [Op.eq]: payloadId,
            },
          },
          {
            blockedId: {
              [Op.eq]: payloadId,
            },
          },
        ],
      },
    });

    let _res = await Friends.findOne({
      raw: true,
      where: {
        isPending: false,
        isFriend: true,
        [Op.or]: [
          {
            senderId: {
              [Op.eq]: userId,
            },
          },
          {
            receiverId: {
              [Op.eq]: userId,
            },
          },
        ],
      },
    });

    return { _blockMember, _res };
  } catch (err) {
    return err;
  }
};

module.exports.getCustomerAndSearchByUserName = getCustomerAndSearchByUserName;
