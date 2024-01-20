import { Application } from "express";
import AuthRoutes from "./auth.routes";
import UserRoutes from "./user.routes";

export default class Routes {
  constructor(app: Application, path: string) {
    app.use(path, AuthRoutes);
    app.use(path, UserRoutes);
  }
}
