function Imagedata(sequelize, Sequelize) {
  const Image = {
    userId: {
      type: Sequelize.INTEGER,
      references: {
        model: "users",
        key: "id",
      },
    },
    imageType: {
      type: Sequelize.STRING,
    },
    typeId: {
      type: Sequelize.INTEGER,
    },
    imageId: {
      type: Sequelize.STRING,
    },
    imageUrl: {
      type: Sequelize.STRING,
    },
  };

  let img = sequelize.define("imagedata", Image);

  return img;
}

exports.ImageData = Imagedata;
