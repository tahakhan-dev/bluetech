function AboutUs(sequelize, Sequelize) {
  const About = {
    about: {
      type: Sequelize.TEXT,
    },
    isActive: {
      type: Sequelize.BOOLEAN,
      defaultValue: 1,
    },
  };

  let aboutUs = sequelize.define("about", About);

  return aboutUs;
}

exports.About = AboutUs;
