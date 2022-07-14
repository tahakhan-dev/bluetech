const moment = require('moment');

function ForgetPassword(sequelize, Sequelize) {
    

    const forgetPassword = sequelize.define("forgetPassword", {

        userId: {
            type: Sequelize.INTEGER,
            references: {
                model: "users",
                key: 'id'
            }
        },
        token: {
            type: Sequelize.STRING
        },
        start_time: {
            type: Sequelize.STRING
        },
        end_time: {
            type: Sequelize.STRING
        },
        isExpired: {
            type: Sequelize.BOOLEAN,
            defaultValue: false
        },
        tokenCreatedAt: {
            type: Sequelize.STRING,
            defaultValue: moment(new Date()).format("DD/MM/YYYY")
        }
    });
    return forgetPassword;
}

exports.ForgetPassword = ForgetPassword;
