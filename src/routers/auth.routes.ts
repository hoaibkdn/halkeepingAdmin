import { Router } from "express";
import { login } from "../controllers/auth.controllers";

class AuthRoutes {
  router = Router();

  constructor() {
    this.intializeRoutes();
  }

  intializeRoutes() {
    this.router.post("/login", login);
  }
}

export default new AuthRoutes().router;
