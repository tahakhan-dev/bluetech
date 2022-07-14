function ContactService(sequelize, Sequelize) {
  const contactService = {
    title: {
      type: Sequelize.STRING,
    },
    isActive: {
      type: Sequelize.BOOLEAN,
      defaultValue: true,
    },
    isDelete: {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    },
  };

  let Contact = sequelize.define("contactservice", contactService);

  return Contact;
}

exports.ContactService = ContactService;
