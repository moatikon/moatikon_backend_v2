import { Tikon } from "../entity/tikon.entity";

export class TikonFindAllResponse {
  tikons: Tikon[];

  constructor(tikons: Tikon[]){
    this.tikons = tikons;
  }
}