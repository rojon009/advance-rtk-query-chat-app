const auth = require("json-server-auth");
const jsonServer = require("json-server");
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();

const server = http.createServer(app);
const router = jsonServer.router("db.json");

const middlewares = jsonServer.defaults();
const port = process.env.PORT || 9001;

const io = new Server(server);

// Bind the router db to the app
app.db = router.db;

app.use(middlewares);

const rules = auth.rewriter({
  users: 640,
  conversations: 660,
  messages: 660,
});

app.use(rules);
app.use(auth);
app.use(router);

io.on("connection", (socket) => {
  console.log(socket.id);
});

// response middleware
router.render = (req, res) => {
  const path = req.path;
  const method = req.method;

  if (
    path.includes("/conversations") &&
    (method === "POST" || method === "PATCH")
  ) {
    io.emit("conversation", res.locals.data);
  }

  if (path.includes("/messages") && (method === "POST" || method === "PATCH")) {
    io.emit("message", res.locals.data);
  }

  res.json(res.locals.data);
};

server.listen(port);
