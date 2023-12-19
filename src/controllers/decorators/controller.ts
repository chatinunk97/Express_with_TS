import "reflect-metadata";
import { Request, Response, NextFunction } from "express";
import { AppRouter } from "../../AppRouter";
import { Methods } from "./Method";
import { MetadataKeys } from "./MetadetaKeys";
import { RequestHandler } from "express";

function bodyValidators(keys: string[]): RequestHandler {
  return function (req: Request, res: Response, next: NextFunction) {
    if (!req.body) {
      res.status(422).send("Invalid request");
      return;
    }

    for (let key of keys) {
      if (!req.body[key]) {
        res.status(422).send(`Missing property "${key}"`);
        return;
      }
    }
    next();
  };
}

export function controller(routePrefix: string) {
  //This is taking in a target which is the class , which is technically a class constructor function
  return function (target: Function) {
    /////  ES2016  class methods are no longer enumerable.
    // for (let key in target.prototype) {
    //   const routeHandler = target.prototype[key];
    //   const path = Reflect.getMetadata("path", target.prototype, key);
    //   if (path) {
    //     router.get(`${routePrefix}${path}`, routeHandler);
    //   }
    // }
    const router = AppRouter.getInstance();
    Object.getOwnPropertyNames(target.prototype).forEach((key) => {
      const routeHandler = target.prototype[key];
      const path = Reflect.getMetadata(
        MetadataKeys.path,
        target.prototype,
        key
      );
      const middlewares =
        Reflect.getMetadata(MetadataKeys.middleware, target.prototype, key) ||
        [];
      //Adding annotation here make router[method] work
      //because the router's TS definition file has a list of method that is available
      // which when we used the variable method which is linked to ENUM Methods
      // TS knows for sure that it will be a function what is workable
      const method: Methods = Reflect.getMetadata(
        MetadataKeys.method,
        target.prototype,
        key
      );
      const RequiredBodyProps =
        Reflect.getMetadata(MetadataKeys.validator, target.prototype, key) ||
        [];
      const validator = bodyValidators(RequiredBodyProps);
      if (path) {
        router[method](
          `${routePrefix}${path}`,
          ...middlewares,
          validator,
          routeHandler
        );
      }
    });
  };
}
