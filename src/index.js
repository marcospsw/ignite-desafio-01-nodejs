const express = require("express");
const cors = require("cors");
const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find((user) => user.username === username);

  if (!user) {
    return response.status(400).send({
      errorStatus: 400,
      errorMessage: "User not exists",
    });
  }

  request.user = user;

  return next();
}

app.post("/users", (request, response) => {
  const { username, name } = request.body;

  const userAlreadyExists = users.find((user) => user.username === username);
  if (userAlreadyExists) {
    return response.status(400).json({
      error: "User already exists",
    });
  }

  const user = {
    name,
    username,
    id: uuidv4(),
    todos: [],
  };

  users.push(user);

  return response.status(201).send(user);
});

app.get("/todos", checksExistsUserAccount, (request, response) => {
  const { user } = request;

  return response.status(201).send(user.todos);
});

app.post("/todos", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;

  const todo = {
    id: uuidv4(),
    title,
    deadline: new Date(deadline),
    done: false,
    created_at: new Date(),
  };

  user.todos.push(todo);

  return response.status(201).json(todo);
});

app.put("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;
  const { id } = request.params;

  let todo = user.todos.find((todo) => todo.id === id);
  if (!todo) {
    return response.status(404).json({
      error: "Todo not exists",
    });
  }

  todo = { ...todo, title, deadline };

  return response.status(201).json(todo);
});

app.patch("/todos/:id/done", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  let todo = user.todos.find((todo) => todo.id === id);
  if (!todo) {
    return response.status(404).json({
      error: "Todo not exists",
    });
  }

  todo = { ...todo, done: true };

  return response.status(201).json(todo);
});

app.delete("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  let todo = user.todos.find((todo) => todo.id === id);
  if (!todo) {
    return response.status(404).json({
      error: "Todo not exists",
    });
  }

  user.todos.splice(todo, 1);

  return response.status(204).send();
});

module.exports = app;
