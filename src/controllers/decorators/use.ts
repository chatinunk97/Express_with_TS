import "reflect-metadata";
import { MetadataKeys } from "./MetadetaKeys";
import { RequestHandler } from "express";

export function use(middleware: RequestHandler) {
  return function (target: any, key: string, desc: PropertyDescriptor) {
    //What's happening here is  we are constructing a decorator
    //Which it takes in a middleware and we are creating an array that stores those midleware
    //If it's already exist we can just get the data from Metadata
    //But if not we create a new array and push the new one into it then store it in Metadata
    const middlewares =
      Reflect.getMetadata(MetadataKeys.middleware, target, key) || [];
    // middlewares.push(middleware);

    Reflect.defineMetadata(
      MetadataKeys.middleware,
      [...middlewares, middleware],
      target,
      key
    );
  };
}
