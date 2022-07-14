const db = require("../../Model");
const imagedata = db.imageData;
const SliderData = db.Sliderdata;

exports.getAllimagesByTypeAndTypeId = async (type, typeid) => {
    let ids = [];
    let getImages = await imagedata.findAll({
        raw: true,
        where: {
            imageType: type,
            typeId: typeid
        }
    });
    getImages.map(x => ids.push(x.imageId));
    let getIndexs = await SliderData.findAll({
        raw: true,
        where: {
            imageId: ids
        },
        order : [
            ['sliderIndex','ASC']
        ]
    });
    return {
        getImages,
        getIndexs
    }

}