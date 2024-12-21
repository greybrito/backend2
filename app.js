import express from "express";
import dotenv from "dotenv";
import usersRoutes from "./src/routes/user.routes.js";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import session from "express-session";
import initializePassport from "./src/config/passport.config.js";
import passport from "passport";
import productsRoutes from "./src/routes/products.routes.js";
import MongoStore from "connect-mongo";
import { generateToken } from "./src/utils/generatetoken.js";
import path, { dirname } from "path";

dotenv.config();
const app = express();
app.use("/static", express.static("public"));
app.use(express.json());
app.use(cookieParser());
initializePassport();
app.use(passport.initialize());

app.use(
  session({
    store: MongoStore.create({
      mongoUrl: process.env.MONGO,
    }),
    secret: process.env.SECRET_SESSION,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false,
      httpOnly: true,
    },
  })
);

const user = [];

app.post("registro", (req, res) => {
  const { name, email, password } = req.body;
  const exists = users.find(user.email === email);
  if (exists)
    return res
      .status(400)
      .send({ status: "error", error: " user already exists" });
  const user = {
    name,
    email,
    password,
  };
  user.push(user);
  const access_token = generateToken(user);
  res
    .cookie("CookieToken", access_token, {
      maxAge: 60 * 60 * 24,
      httpOnly: true,
      secure: false,
    })
    .send({ message: "Logged in!" });
});
app.post("/login", (req, res) => {
  const { email, password } = req.body;
  const user = users.find(
    (user) => user.email === email && user.password === password
  );
  if (!user)
    return res
      .status(400)
      .send({ status: "error", error: "Invalid credentials" });
  const access_token = generateToken(user);
  res
    .cookie("CookieToken", access_token, {
      maxAge: 60 * 60 * 24,
      httpOnly: true,
      secure: false,
    })
    .send({ message: "Logged in!" });
});

app.get("/logout", (req, res) => {
  res.clearCookie("CookieToken").send({ message: "Logged out successfully!" });
});
/*app.get("/current", authToken, (req, res) => {
  res.send({ status: "success" });
});*/

initializePassport();
app.use(passport.initialize());
app.use(passport.session());

app.use("/api/users", usersRoutes);
app.use("/api/products", productsRoutes);
mongoose.connect(process.env.MONGO);

app.listen(process.env.PORT, () =>
  console.log("server in port: " + process.env.PORT)
);
