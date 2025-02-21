// [GET] /admin/products
const Product = require("../../models/product.model");
const filterStatusHelper = require("../../helpers/filterStatus");
const searchHelper = require("../../helpers/search.js");
const paginationHelper = require("../../helpers/pagination.js");
const systemConfig = require("../../config/system.js");
module.exports.index = async (req, res) => {
    // Filter status
    const filterStatus = filterStatusHelper(req.query);
    let find = {
        deleted: false,
    };
    if (req.query.status) {
        find.status = req.query.status;
    }
    // End Filter status
    // Seach
    const objectSearch = searchHelper(req.query);
    if (objectSearch.regex) {
        find.title = objectSearch.regex;
    }
    // End Search
    // Pagination
    const countProducts = await Product.countDocuments(find);
    let objectPagination = paginationHelper(
        {
            currentPage: 1,
            litmitItems: 2,
        },
        req.query,
        countProducts
    );
    // End Pagination
    // Sort
    let sort = {};
    if (req.query.sortKey && req.query.sortValue) {
        sort[req.query.sortKey] = req.query.sortValue;
    } else {
        sort.position = "desc";
    }

    // Query Database
    const products = await Product.find(find)
        .sort(sort)
        .limit(objectPagination.litmitItems)
        .skip(objectPagination.skip);
    res.render("admin/pages/products/index.pug", {
        pageTitle: "Danh sach san pham",
        products: products,
        filterStatus: filterStatus,
        keyword: objectSearch.keyword,
        pagination: objectPagination,
    });
};
// [PATCH] /admin/products/change-status/:status/:id
module.exports.changeStatus = async (req, res) => {
    const status = req.params.status;
    const id = req.params.id;
    await Product.updateOne({ _id: id }, { status: status });
    req.flash("success", "Cap nhat trang thai san pham thanh cong !");

    res.redirect("back");
};
// [PATCH] /admin/products/change-multi
module.exports.changeMulti = async (req, res) => {
    const type = req.body.type;
    const ids = req.body.ids.split(", ");
    switch (type) {
        case "active":
            await Product.updateMany(
                {
                    _id: { $in: ids },
                },
                {
                    status: "active",
                }
            );
            req.flash(
                "success",
                `Cap nhat trang thai ${ids.length} san pham thanh cong  !`
            );
            break;
        case "inactive":
            await Product.updateMany(
                {
                    _id: { $in: ids },
                },
                {
                    status: "inactive",
                }
            );
            req.flash(
                "success",
                `Cap nhat trang thai ${ids.length} san pham thanh cong  !`
            );
            break;
        case "delete-all":
            await Product.updateMany(
                {
                    _id: { $in: ids },
                },
                { deleted: true, deletedAt: new Date() }
            );
            req.flash("success", `Da xoa ${ids.length} san pham thanh cong  !`);
            break;
        case "change-position":
            for (const item of ids) {
                let [id, position] = item.split("-");
                position = parseInt(position);
                await Product.updateOne({ _id: id }, { position: position });
            }
            req.flash(
                "success",
                `Da cap nhat vi tri ${ids.length} san pham thanh cong  !`
            );
        default:
            break;
    }

    res.redirect("back");
};
// [DELETE] /admin/products/delete/:id
module.exports.deleteItem = async (req, res) => {
    const id = req.params.id;
    // await Product.deleteOne({_id:id})
    await Product.updateOne(
        { _id: id },
        { deleted: true, deletedAt: new Date() }
    );
    res.redirect("back");
};

// [GET] /admin/products/create
module.exports.create = async (req, res) => {
    res.render("admin/pages/products/create.pug", {
        pageTitle: "Tao moi san pham",
    });
};
// [POST] /admin/products/create
module.exports.createPost = async (req, res) => {
    req.body.price = parseInt(req.body.price);
    req.body.discountPercentage = parseInt(req.body.discountPercentage);
    req.body.stock = parseInt(req.body.stock);
    if (req.body.position == "") {
        const countProducts = await Product.countDocuments();
        req.body.position = countProducts + 1;
    } else {
        req.body.position = parseInt(req.body.position);
    }
    const product = new Product(req.body);
    await product.save();
    res.redirect(`${systemConfig.prefixAdmin}/products`);
};
// [GET] /admin/products/edit/:id
module.exports.edit = async (req, res) => {
    try {
        const find = {
            deleted: false,
            _id: req.params.id,
        };
        const product = await Product.findOne(find);
        res.render("admin/pages/products/edit.pug", {
            pageTitle: "Sua san pham ",
            product: product,
        });
    } catch (err) {
        res.redirect(`${systemConfig.prefixAdmin}/products`);
    }
};
// [PATCH] /admin/products/edit/:id
module.exports.editPath = async (req, res) => {
    const id = req.params.id;
    req.body.price = parseInt(req.body.price);
    req.body.discountPercentage = parseInt(req.body.discountPercentage);
    req.body.stock = parseInt(req.body.stock);
    req.body.position = parseInt(req.body.position);
    if (req.file) {
        req.body.thumbnail = `/uploads/${req.file.filename}`;
    }
    try {
        await Product.updateOne({ _id: id }, req.body);
        req.flash("success", "Cap nhat san pham thanh cong!");
        res.redirect("back");
    } catch (err) {
        req.flash("error", "Cap nhat san pham that bai!");
        res.redirect(`${systemConfig.prefixAdmin}/products`);
    }
};
// [GET] /admin/products/detail/:id

module.exports.detail = async (req, res) => {
    try {
        const find = {
            deleted: false,
            _id: req.params.id,
        };
        const product = await Product.findOne(find);
        res.render("admin/pages/products/detail.pug", {
            pageTitle: product.title,
            product: product,
        });
    } catch (err) {
        res.redirect(`${systemConfig.prefixAdmin}/products`);
    }
};
