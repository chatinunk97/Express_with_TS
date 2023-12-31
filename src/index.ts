import express, { Request, Response } from "express";
import { router } from "./routes/loginRoutes";
import cookieSession from "cookie-session";
const app = express();
//Middlewares
app.use(express.urlencoded({ extended: true }));
app.use(express.json())
app.use(cookieSession({keys : ['zxc']}))

app.use(router);
app.listen(3000, () => {
  console.log("Listening on port 3000");
});
