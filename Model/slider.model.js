function Sliderdata(sequelize, Sequelize) {
  const Slider = {
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
    sliderIndex: {
      type: Sequelize.INTEGER,
    },
  };

  let slider = sequelize.define("slider", Slider);

  return slider;
}

exports.Sliderdata = Sliderdata;
