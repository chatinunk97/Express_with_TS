import express, { Request, Response } from "express";
import cookieSession from "cookie-session";
import { AppRouter } from "./AppRouter";
//The below line is just importing because
//All of the decorator gets executed when we define a class right ?
//So when this file run it already runs the declaring of the class so all decorators are already finished running
//Therefore the Router in this file has already been set
import "./controllers/LoginController";
import "./controllers/RootController";
const app = express();
//Middlewares
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieSession({ keys: ["zxc"] }));
app.use(AppRouter.getInstance());
app.listen(3000, () => {
  console.log("Listening on port 3000");
});
