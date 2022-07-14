function ContactUs(sequelize, Sequelize) {
  const Contact = {
    title: {
      type: Sequelize.TEXT,
    },
    desc: {
      type: Sequelize.TEXT,
    },
    isActive: {
      type: Sequelize.BOOLEAN,
      defaultValue: 1,
    },
  };

  let contactUs = sequelize.define("contact", Contact);

  return contactUs;
}

function ContactUsInfo(sequelize, Sequelize) {
  const ContactInfo = {
    message: {
      type: Sequelize.TEXT,
    },
    question: {
      type: Sequelize.TEXT,
    },
    service: {
      type: Sequelize.INTEGER,
      references: {
        model: "contactservices",
        key: "id",
      },
    },
    email: {
      type: Sequelize.TEXT,
    },
  };

  let contactUsInfo = sequelize.define("contactUsInfo", ContactInfo);

  return contactUsInfo;
}

exports.ContactUsInfo = ContactUsInfo;
exports.Contact = ContactUs;
