module.exports = (query) => {
    let filterStatus = [
        { name: "Tat ca", status: "", class: "active" },
        {
            name: "Hoat dong",
            status: "active",
            class: "",
        },
        {
            name: "Dung hoat dong",
            status: "inactive",
            class: "",
        },
    ];

    if (query.status) {
        filterStatus.forEach((item) => {
            if (item.status == query.status) {
                item.class = "active";
            } else {
                item.class = "";
            }
        });
    }
    return filterStatus;
};
