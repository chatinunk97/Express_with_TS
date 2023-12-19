import "reflect-metadata";
import { MetadataKeys } from "./MetadetaKeys";

export function bodyValidator(...keys: string[]) {
  return function (target: any, key: string, desc: PropertyDescriptor) {
    //We are adding ..keys in to the Metadata
    Reflect.defineMetadata(MetadataKeys.validator, keys, target, key);
  };
}
