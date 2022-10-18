const express = require("express");
const app = express();
const port = 5000;
const CreateRoute = require("./routes/token");
const cors = require("cors");

app.use(cors());

//Routes
app.use("/token", CreateRoute);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

//Server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
