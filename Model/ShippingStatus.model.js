function ShippingModel(sequelize, Sequelize) {
    const Shipping = sequelize.define("shipping", {
      ShippingName: {
        type: Sequelize.STRING
      },
      curbsite : {
        type: Sequelize.BOOLEAN,
        defaultValue : false
      }
    });
  
    return Shipping;
  }
  
  exports.ShippingModel = ShippingModel;
