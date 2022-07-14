const Joi = require('joi');

function GlobalValidator(schemaobject, validator) {

    const keys = Object.keys(schemaobject)

    let obj = [];

    let map = keys.map(s => {
        obj.push({
            name: s,
            type: validator[s].type,
            minimum: validator[s].min || 0,
            maximum: validator[s].max || 0,
            required: validator[s].required || false,
            email: validator[s].email || false
        });
    });

    let schema = [];

    obj.map(obj => {

        let minimum = obj.minimum;
        let maximum = obj.maximum;

        switch (obj.type) {

            case 'String':

                if (obj.required == true) {

                    if (obj.minimum != 0 && obj.maximum != 0 && obj.email == true) {

                        schema[obj.name] = Joi
                            .string()
                            .required()
                            .min(minimum)
                            .max(maximum)
                            .email();

                    } else if (obj.minimum == 0 && obj.maximum == 0 && obj.email == true) {

                        schema[obj.name] = Joi
                            .string()
                            .required()
                            .email();

                    } else if (obj.minimum != 0 && obj.maximum == 0 && obj.email == true) {

                        schema[obj.name] = Joi
                            .string()
                            .required()
                            .min(minimum)
                            .email();

                    } else if (obj.minimum == 0 && obj.maximum != 0 && obj.email == true) {

                        schema[obj.name] = Joi
                            .string()
                            .required()
                            .max(maximum)
                            .email();

                    } else if (obj.minimum != 0 && obj.maximum != 0) {

                        schema[obj.name] = Joi
                            .string()
                            .required()
                            .min(minimum)
                            .max(maximum)

                    } else if (obj.minimum != 0 && obj.maximum == 0) {

                        schema[obj.name] = Joi
                            .string()
                            .required()
                            .min(minimum)

                    } else if (obj.minimum == 0 && obj.maximum != 0) {

                        schema[obj.name] = Joi
                            .string()
                            .required()
                            .max(maximum)

                    } else {

                        schema[obj.name] = Joi
                            .string()
                            .required()

                    }

                } else if (obj.required == false) {

                    if (obj.minimum != 0 && obj.maximum != 0 && obj.email == true) {

                        schema[obj.name] = Joi
                            .string()
                            .min(minimum)
                            .max(maximum)
                            .email();

                    } else if (obj.minimum == 0 && obj.maximum == 0 && obj.email == true) {

                        schema[obj.name] = Joi
                            .string()
                            .email();

                    } else if (obj.minimum != 0 && obj.maximum == 0 && obj.email == true) {

                        schema[obj.name] = Joi
                            .string()
                            .min(minimum)
                            .email();

                    } else if (obj.minimum == 0 && obj.maximum != 0 && obj.email == true) {

                        schema[obj.name] = Joi
                            .string()
                            .max(maximum)
                            .email();

                    }
                    if (obj.minimum != 0 && obj.maximum != 0) {

                        schema[obj.name] = Joi
                            .string()
                            .min(minimum)
                            .max(maximum)

                    }
                    if (obj.minimum != 0 && obj.maximum == 0) {

                        schema[obj.name] = Joi
                            .string()
                            .min(minimum)

                    }
                    if (obj.minimum == 0 && obj.maximum != 0) {

                        schema[obj.name] = Joi
                            .string()
                            .max(maximum)

                    } else {

                        schema[obj.name] = Joi.string()

                    }

                }
                break;

        }
    })

    const JoiSchema = Object.assign({}, schema);

    return Joi.validate(schemaobject, JoiSchema);

}

exports.GlobalValidator = GlobalValidator;