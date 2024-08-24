const express = require("express");
const bodyParser = require("body-parser");
const db = require("./models");
const app = express();

app.use(bodyParser.json());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: false }));

// Routes
app.use("/", require("./routes/index"));
app.use("/api/user", require("./routes/auth.route"));
app.use("/api/order", require("./routes/order.route"));
app.use("/api/cart", require("./routes/cart.route"));
app.use("/api/products", require("./routes/product.route"));

db.sequelize.sync({ alter: true }).then(() => {
  console.log("Database & tables are created and synced...!");
}).catch(err => console.log(err));

async function main() {
  try {
    await db.sequelize.authenticate();
    console.log("Connection has been established successfully.");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
}

main();
module.exports = app;