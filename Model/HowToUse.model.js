function HowToUse(sequelize, Sequelize) {
    const Howtouse = {
        title: {
            type: Sequelize.STRING
        },
        description: {
            type: Sequelize.TEXT
        },
        videoPath: {
            type: Sequelize.STRING
        },
        isActive : {
            type: Sequelize.BOOLEAN,
            defaultValue : 1    
        },
        isDeleted : {
            type: Sequelize.BOOLEAN,
            defaultValue : 0  
        }
    };

    let howtouse = sequelize.define("howtouse", Howtouse);

    return howtouse;
}

exports.HowToUse = HowToUse;
