import { Router } from "express";
import { getListUser } from "../controllers/user.controlers";

class UserRoutes {
  router = Router();

  constructor() {
    this.intializeRoutes();
  }

  intializeRoutes() {
    this.router.get("/users", getListUser);
  }
}

export default new UserRoutes().router;
