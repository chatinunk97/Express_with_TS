import { Request, Response, NextFunction } from "express";
import { get, controller, use } from "./decorators";

function requireAuth(req: Request, res: Response, next: NextFunction): void {
  if (req.session && req.session.loggedIn) {
    next();
    return;
  } else {
    res.status(403);
    res.send("Not premitted");
  }
}
@controller("")
class RooteController {
  @get("/")
  getRoot(req: Request, res: Response) {
    if (req.session && req.session.loggedIn) {
      res.send(`
          <div>
              <div>
                  You are logged in
                  <a href="/auth/logout">Logout</a>
              </div>
          </div>
          `);
    } else {
      res.send(`
          <div>
          <div>
              You are NOT logged in
              <a href="/auth/login">Login</a>
          </div>
      </div>`);
    }
  }

  @get("/protected")
  @use(requireAuth)
  getProtected(req: Request, res: Response) {
    res.send("Welcome to the protected Route , Logged in user !");
  }
}
