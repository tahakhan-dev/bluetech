const db = require("../../Model");
class VoucherSerivce {
  findCamaing(data) {
    return new Promise((resolve, reject) => {
      db.campaign
        .findOne({
          where: {
            id: data,
            isExpired: false,
            isActive: true,
          },
          include: [
            {
              model: db.campaignDetail,
            },
            {
              model: db.users,
             required: true,
              where: {
                isBlocked: 0,
                isDelete: 0,
              },
              include: [
                {
                  model: db.usersdetail,
                },
                {
                  model: db.MerchantDetails,
                },
              ],
            },
          ],
        })
        .then((result) => {
          resolve(result);
        })
        .catch((error) => reject(error));
    });
  }

  updateCamaing(data) {
    return new Promise((resolve, reject) => {
      db.campaign
        .update(
          {
            isExpired: true,
            isActive: false,
          },
          {
            where: {
              id: data,
            },
          }
        )
        .then((result) => resolve(result))
        .catch((error) => reject(error));
    });
  }
}

module.exports = new VoucherSerivce();
