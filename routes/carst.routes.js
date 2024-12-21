import { Router } from "express";
import fs from "fs";
import path from "path";

const cartsFilePath = path.resolve("data", "carst.json");

const router = Router();

let carts = [];

// middleware a nivel de router
router.use(function (request, response, next) {
  console.log("Mi propio middleware a nivel de ROUTER!!.");
  console.log("Time: " + Date().toLocaleString());
  next();
});

// Aplicando Middleware
function miMiddleware(request, response, next) {
  console.log("llama a mi middleware..");
  next();
}

router.get("/middleware", miMiddleware, (req, res) => {
  console.log("Consumiendo api GET /api/carts..");
  console.log("Mascotas actuales: ");
  console.log(carts);
  res.send(carts);
});

// Endpoints
// GET ALL
router.get("/", (req, res) => {
  const limit = req.query.limit ? parseInt(req.query.limit) : false;
  fs.readFile(cartsFilePath, "utf8", (err, data) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: "Error al leer el archivo" });
      return;
    }
    if (limit) {
      data = JSON.parse(data).slice(0, limit);
    }
    res.send(JSON.parse(data));
  });
});

//GET by ID
router.get("/:cId", (req, res) => {
  let cartId = parseInt(req.params.cId);

  fs.readFile(cartsFilePath, "utf8", (err, data) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: "Error al leer el archivo" });
      return;
    }

    console.log(`Buscando carrito por id: ${cartId}`);
    const cart = JSON.parse(data).find((cart) => cart.id === cartId);

    if (!cart) {
      return res
        .status(404)
        .send({ status: "info", error: "carrito no encontrado" });
    }
    res.send(cart);
  });
});

// POST create a cart
router.post("/", (req, res) => {
  let cart = req.body;

  if (cart.products && cart.products.length > 0) {
    if (carts.length > 0) {
      cart.id = Math.max(...carts.map((cart) => cart.id)) + 1;
    } else {
      cart.id = 1;
    }
    carts.push(cart);
    fs.writeFile(cartsFilePath, JSON.stringify(carts, null, 2), (err) => {
      if (err) {
        console.log("error: ", err);
        res.status(500).json({ error: "Error al escribir en el archivo" });
        return;
      }
      res.send({ status: "success", msg: "Carrito Creado!" });
    });
  } else {
    return res
      .status(400)
      .send({ message: "Por favor agregue un producto para crear carrito" });
  }
});

//POST add product to cart
router.post("/:cid/product/:pid", (req, res) => {
  let cartId = parseInt(req.params.cid);
  let productId = parseInt(req.params.pid);
  let productBody = req.body;
  productBody.id = productId;

  fs.readFile(cartsFilePath, "utf8", (err, data) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: "Error al leer el archivo" });
      return;
    }

    console.log(`Buscando carrito por id: ${cartId}`);
    const carts = JSON.parse(data);

    const cartPosition = carts.findIndex((u) => u.id === cartId);
    if (cartPosition < 0) {
      return res
        .status(404)
        .send({ status: "info", error: "Carrito no encontrado" });
    }

    console.log(`Buscando producto por id: ${productId}`);
    const productPosition = carts[cartPosition].products.findIndex(
      (u) => u.id === productId
    );
    if (productPosition < 0) {
      console.log(`Agrego el producto al carrito`);
      carts[cartPosition].products.push(productBody);
    } else {
      console.log(`ya existe el producto en el carrito entonces sumo quantity`);
      let newQuantity =
        carts[cartPosition].products[productPosition].quantity +
        productBody.quantity;
      carts[cartPosition].products[productPosition].quantity = newQuantity;
    }
    fs.writeFile(cartsFilePath, JSON.stringify(carts, null, 2), (err) => {
      if (err) {
        console.log("error: ", err);
        res.status(500).json({ error: "Error al escribir en el archivo" });
        return;
      }
      return res
        .status(201)
        .send({ status: "info", error: "Producto agregado" });
    });
  });
});

//exportamos router
export default router;
