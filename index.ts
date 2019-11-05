const http = require("http");
const app = require("./app");
const connectDB = require("./lib/connectDB");
const io = require("./io");

import * as express from "express";
const router = express.Router();

const server = http.createServer(app);
io(server);

const PORT = process.env.PORT || 4000;

connectDB()
  .then(() => {
    server.listen(PORT, () => {
      console.log(`App started on port ${PORT}`);
    });
  })
  .catch((e: any) => console.error(e));

router.get("/", (req: any, res: any) => {
  const date = new Date();
  res.send(date);
});

module.exports = router;
