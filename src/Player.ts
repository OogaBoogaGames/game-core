import { Game } from "./GameBase";

export class Player {
  softlyPresent: boolean = true; // If the player is still in the game, but not ready. This is used for lobby stage and when a player disconnects
  id: string;
  name: string;
  game: Game;

  prompt(input: string) {
    // TODO: Implement using embedded operations
    console.log("Prompting player", this.id, "with", input);
  }

  connectHandler: () => void = () => {
    console.log("Player connected");
  };

  disconnectHandler: () => void = () => {
    console.log("Player disconnected");
    this.softlyPresent = true;
    setTimeout(() => {
      if (this.softlyPresent) {
        console.log("Player disconnected for too long");
        this.game.removePlayer(this.id);
      }
    }, 60000);
  };

  constructor(id: string, name: string, game: Game) {
    this.id = id;
    this.name = name;
    this.game = game;
  }
}
