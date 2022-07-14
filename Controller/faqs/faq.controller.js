const db = require("../../Model");
const _ = require("lodash");
const FindPermission = require("../extras/FindPermission");
const { limit } = require("../extras/DataLimit");
const FAQs = db.Faqs;

class FAQS {
    create = async (req, res) => {
        try {
            let getPermission = await FindPermission(req.user.id);
            if (getPermission && getPermission.canCreateFaqs) {
                const faqs = _.pick(req.body, ["question", "answer", "isActive"]);
                let Faqs = await FAQs.create(faqs);
                return res.status(200).send({ success: true, Faqs });
            }
            return res.status(200).send({
                code: 401,
                success: false,
                message: "You don't have permission to perform this action!",
            });
        } catch (err) {
            return res
                .status(500)
                .send({ message: err.message || "Something Went Wrong" });
        }
    };

    getSpecificFaqs = async (req, res) => {
        try {
            let getPermission = await FindPermission(req.user.id);
            if (getPermission && getPermission.canReadFaqs) {
                let foundFaqs = await FAQs.findOne({ where: { id: req.params.id, isActive: true } });
                if (foundFaqs) {
                    return res.status(200).send({ success: true, foundFaqs });
                } else {
                    return res.status(200).send({ code: 404, success: true, message: "Not Found!" });
                }
            }
            return res.status(200).send({
                code: 401,
                success: false,
                message: "You don't have permission to perform this action!",
            });
        } catch (err) {
            return res
                .status(500)
                .send({ success: false, message: err.message || "Something Went Wrong" });
        }
    };

    getAllFaqsApp = async (req, res) => {

        let faqs = await FAQs.findAll({
            offset: parseInt(req.query.page) * limit.limit ?
                parseInt(req.query.page) * limit.limit :
                0,
            limit: req.query.page ? limit.limit : 1000000,
            where: {
                isActive: true
            }
        });
        if (!faqs.length) return res.status(200).send({
            code: 404,
            success: false, 
            message: "Faqs Not Found"
        });
        let countData = {
            page: parseInt(req.query.page),
            pages: Math.ceil(faqs.length / limit.limit),
            totalRecords: faqs.length
        }
        return res.send({
            success: true, 
            faqs,
            countData
        });

    }

    updateFaqs = async (req, res) => {
        try {
            let getPermission = await FindPermission(req.user.id);
            if (getPermission && getPermission.canEditFaqs) {
                const terms = _.pick(req.body, ["question", "answer", "isActive"]);
                let foundFaqs = await FAQs.findOne({ where: { id: req.params.id } });
                if (foundFaqs) {
                    let faqs = await FAQs.update(terms, {
                        where: {
                            id: req.params.id,
                        }
                    });
                    return res.status(200).send({ success: true, message: "Successfully updated" });
                } else {
                    return res.status(200).send({ code: 404, success: true, message: "Not found!" });
                }
            }
            return res.status(200).send({
                code: 401,
                success: false,
                message: "You don't have permission to perform this action!",
            });
        } catch (err) {
            return res
                .status(500)
                .send({ success: false, message: err.message || "Something Went Wrong" });
        }
    };

    deleteFaqs = async (req, res) => {
        try {
            let getPermission = await FindPermission(req.user.id);
            if (getPermission && getPermission.canDeleteFaqs) {
                let foundFaqs = await FAQs.findOne({ where: { id: req.params.id } });
                if (foundFaqs) {
                    let updatedFaqs = await FAQs.update({ isActive: false }, {
                        where: {
                            id: req.params.id
                        }
                    });
                    return res.status(200).send({ success: true, message: "Successfully deleted" });
                }
                else {
                    return res.status(200).send({ code: 404, success: true, message: "Not found!" });
                }
            }
            return res.status(200).send({
                code: 401,
                success: false,
                message: "You don't have permission to perform this action!",
            });
        } catch (err) {
            return res
                .status(500)
                .send({ success: false, message: err.message || "Something Went Wrong" });
        }
    };
}
module.exports = FAQS;
