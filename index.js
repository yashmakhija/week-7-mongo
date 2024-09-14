const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const { UserModel, TodoModel } = require("./db");
const { auth, JWT_SECRET } = require("./auth");

mongoose.connect(
  "mongodb+srv://Yash:Hello%401234@cluster0.so8pmoa.mongodb.net/week-7"
);

const app = express();
app.use(express.json());

app.post("/signup", async function (req, res) {
  const { email, password, name } = req.body;

  try {
    const isExisting = await UserModel.findOne({ email });

    if (isExisting) {
      return res.status(400).send("Email Already Signed Up");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await UserModel.create({
      email,
      password: hashedPassword,
      name,
    });

    res.json({
      message: "You are signed up",
    });
  } catch (err) {
    res.status(500).send("Internal Server Error");
  }
});

app.post("/signin", async function (req, res) {
  const { email, password } = req.body;

  try {
    const existingUser = await UserModel.findOne({ email });

    if (!existingUser) {
      return res.status(404).json("User not found");
    }

    const match = await bcrypt.compare(password, existingUser.password);

    if (match) {
      const token = jwt.sign({ id: existingUser._id.toString() }, JWT_SECRET, {
        expiresIn: "1h",
      });

      res.json({
        token,
      });
    } else {
      res.status(403).json({
        message: "Incorrect credentials",
      });
    }
  } catch (err) {
    res.status(500).send("Internal Server Error");
  }
});

app.post("/todo", auth, async function (req, res) {
  const userId = req.userId;
  const { title, done } = req.body;

  try {
    await TodoModel.create({
      userId,
      title,
      done,
    });

    res.json({
      message: "Todo created",
    });
  } catch (err) {
    res.status(500).send("Internal Server Error");
  }
});

app.get("/todos", auth, async function (req, res) {
  const userId = req.userId;

  try {
    const todos = await TodoModel.find({ userId });

    res.json({
      todos,
    });
  } catch (err) {
    res.status(500).send("Internal Server Error");
  }
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
