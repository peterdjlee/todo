const express = require("express")
const exphbs = require("express-handlebars")
const axios = require("axios")
const path = require("path")
const cookierParser = require("cookie-parser")

const app = express()

app.use(cookierParser())

app.use(express.urlencoded())

app.engine("handlebars", exphbs())
app.set("view engine", "handlebars")
app.use(express.static(path.join(__dirname, "/public")))

app.get("/", function (req, res) {
  if (req.cookies.token === undefined) {
    res.render("home")
  } else {
    var token = req.cookies.token
    var header = { headers: { "Authorization": token } }
    axios.get(TODO_API_URL + "/todo-item",
      header
    ).then(function (response) {
      console.log(response.data)
      res.render("todo", { "todo-items": response.data })
    }).catch(function (error) {
      console.log(error.response.status)
      if (error.response.status == 404) {
        res.render("todo")
      } else {
        res.render("home")
      }
    })
  }
})

const TODO_API_URL = "https://hunter-todo-api.herokuapp.com"

app.get("/users", function (req, res) {
  axios.get(TODO_API_URL + "/user").then(function (response) {
    res.render("user-list", { users: response.data })
  })
})

app.get("/register", function (req, res) {
  res.render("register")
})

app.get("/logout", function (req, res) {
  res.clearCookie("token")
  res.redirect("/")
})

// Create a new todo item.
app.post("/add-todo-item", function (req, res) {
  var item = req.body.todo
  if (item == '' || item === undefined) {
    res.redirect("/")
  } else {
    axios({
      method: 'post',
      url: 'https://hunter-todo-api.herokuapp.com/todo-item',
      headers: {
        Authorization: req.cookies.token,
        'content-type': 'application/json',
      },
      data: {
        "content": item
      }
    })
      .then(function (response) {
        res.redirect("/");
      })
      .catch(function (error) {
        console.log("error :", error.response.status);
        res.send("Invalid action. Try again.");
      })
  }
})

// Complete a todo item
app.post("/update-todo-item", function (req, res) {
  var id = req.body.item_id
  if (id == '' || id === undefined) {
    res.redirect("/")
  } else {
    console.log("complete todo item")
    axios({
      method: 'put',
      url: `https://hunter-todo-api.herokuapp.com/todo-item/${id}`,
      headers: {
        Authorization: req.cookies.token,
        'content-type': 'application/json',
      },
      data: {
        "completed": true
      }
    })
      .then(function (response) {
        console.log(req.body.item_id + " completed")
        res.redirect("/");
      })
      .catch(function (error) {
        console.log("error :", error.response.status);
        res.send("Invalid action. Try again.");
      })
  }
})

// Delete a todo item
app.post("/delete-todo-item", function (req, res) {
  var id = req.body.item_id
  if (id == '' || id === undefined) {
    res.redirect("/")
  } else {
    axios({
      method: 'delete',
      url: `https://hunter-todo-api.herokuapp.com/todo-item/${id}`,
      headers: {
        Authorization: req.cookies.token,
      },
    })
      .then(function (response) {
        res.redirect("/");
      })
      .catch(function (error) {
        console.log("error :", error.response.status);
        res.send("Invalid action. Try again.");
      })
  }
})

app.post("/user", function (req, res) {
  axios.post(TODO_API_URL + "/user", {
    username: req.body["username"]
  }).then(function () {
    axios.get(TODO_API_URL + "/user").then(function (response) {
      res.render("home")
    })
  }).catch(function (error) {
    console.log("Error: " + error.response.data["error"])
  })
})

app.post("/auth", function (req, res) {
  axios.post(TODO_API_URL + "/auth", {
    username: req.body["username"]
  }).then(function (response) {
    res.cookie("token", response.data["token"])
    res.redirect("/")
  }).catch(function (error) {
    console.log(error)
    res.send("Error 404:")
  })
})
const PORT = process.env.PORT || 3000;

app.listen(PORT)