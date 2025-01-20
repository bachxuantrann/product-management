const express = require("express");
const methodOverride = require("method-override");
const bodyParser = require("body-parser");
const flash = require("express-flash");
const cookieParser = require("cookie-parser");
const session = require("express-session");
require("dotenv").config();
const database = require("./config/database");
database.connect();
const app = express();
app.use(methodOverride("_method"));
// Flash
app.use(cookieParser("keyboard cat"));
app.use(session({ cookie: { maxAge: 6000 } }));
app.use(flash());
// End Flash

app.use(bodyParser.urlencoded({ extended: false }));
const port = process.env.PORT;
const route = require("./routes/clients/index.route");
const routeAdmin = require("./routes/admin/index.route");

app.set("views", `${__dirname}/views`);
app.set("view engine", "pug");

app.use(express.static(`${__dirname}/public`));
// App local variable
const systemConfig = require("./config/system");
app.locals.prefixAdmin = systemConfig.prefixAdmin;
// Route
route(app);
routeAdmin(app);
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
