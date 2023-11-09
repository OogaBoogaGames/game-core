import { Game, GameStage } from "./GameBase";
import { Player } from "./Player";

export class LobbyStage extends GameStage {
  prompt = "__obg__.lobby.prompt";
  responses: Map<Player, boolean>; // Map of player readiness for lobby stage
  onstart(game: Game): void {
    console.log("Starting lobby stage");
    this.responses = new Map();
    this.onend(game);
  }
  onresponse(game: Game, player: Player, response: any): void {
    throw new Error("Method not implemented.");
  }

  constructor(game: Game, onend: (game: Game) => void) {
    super(game, onend);
    this.responses = new Map();
  }
}
