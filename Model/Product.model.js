const Joi = require("joi");

function ProductModel(sequelize, Sequelize) {
    const productSchema = {
        name: {
            type: Sequelize.STRING
        },
        categoryId: {
            type: Sequelize.INTEGER,
            references: {
                model: "categories",
                key: 'id'
            }
        },
        subcategoryId: {
            type: Sequelize.INTEGER,
            references: {
                model: "subcategories",
                key: 'id'
            }
        },
        merchantId: {
            type: Sequelize.INTEGER,
            references: {
                model: "users",
                key: 'id'
            }
        },
        stock : {
            type: Sequelize.INTEGER  
        },
        short_title: {
            type: Sequelize.STRING
        },
        long_title: {
            type: Sequelize.STRING
        },
        short_description: {
            type: Sequelize.STRING
        },
        long_description: {
            type: Sequelize.STRING
        },
        isActive: {
            type: Sequelize.BOOLEAN
        },
        
    }
    let Product = sequelize.define("product", productSchema);
    return Product;
}

exports.ProductModel = ProductModel;

function validate(Product) {
    const schema = {
        name: Joi
            .string()
            .required()
            .min(4)
            .max(255)
    };
    return Joi.validate(Product, schema);
}

exports.validate = validate;
