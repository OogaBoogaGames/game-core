import { Game } from "./GameBase";

export class Player {
  id: string;
  name: string;
  game: Game;
  constructor(id: string, name: string, game: Game) {
    this.id = id;
    this.name = name;
    this.game = game;
  }
}
