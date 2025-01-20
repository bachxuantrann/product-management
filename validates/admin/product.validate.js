module.exports.createPost = (req, res, next) => {
    if (!req.body.title) {
        req.flash("error", "Vui long nhap tieu de !");
        res.redirect("back");
        return;
    }
    if (req.body.title.length < 6) {
        req.flash("error", "Tieu de san pham phai co it nhat 6 ky tu!");
        res.redirect("back");
        return;
    }
    next();
};
