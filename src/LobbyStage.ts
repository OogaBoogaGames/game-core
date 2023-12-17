import { Game, GameStage, StageState } from "./GameBase";
import { Player } from "./Player";

export class LobbyStage extends GameStage {
  prompt = "__obg__.lobby.prompt";
  responses: Map<Player, boolean>; // Map of player readiness for lobby stage

  hooks: {
    name: keyof Game;
    method: Function;
  }[] = [
    {
      name: "addPlayer",
      method: (player: Player) => {
        this.responses.set(player, false);
      },
    },
    {
      name: "removePlayer",
      method: (player: Player) => {
        if (player.id === this.game.owner) {
          console.error("Owner left the game, ending.");
          this.game.end();
        } else {
          this.responses.set(player, false);
          setTimeout(() => {
            if (!this.responses.get(player)) {
              console.log("Player disconnected for too long");
              this.game.removePlayer(player.id);
            }
          }, 3e5);
        }
      },
    },
  ];

  onstart(game: Game): void {
    console.log("Starting lobby stage");
    this.responses = new Map();
    // Lobby hooks
    this.hooks.forEach((hook) => {
      game.hooks.set(hook.name, hook.method);
    });
  }

  onresponse(game: Game, player: Player, _: any): StageState<any> {
    this.responses.set(player, true);
    let ownerReady = this.responses.get(game.getPlayer(game.owner)!);
    if (ownerReady) {
      let readyAmount = Array.from(this.responses.values()).filter(
        (ready) => ready
      ).length;
      if (readyAmount >= game.minPlayers) {
        console.log("Enough players ready, starting game");
        this.hooks.forEach((hook) => {
          game.hooks.delete(hook.name);
        });
        this.responses.forEach((_, player) => {
          player.softlyPresent = false;
          game.addPlayer(player);
        });
        this.onend(game);
        return {
          complete: true,
          data: this.responses,
        };
      }
    }
    return {
      complete: false,
      data: this.responses,
    };
  }

  onWithdrawResponse(game: Game, player: Player): StageState<any> {
    this.responses.set(player, false);
    return {
      complete: false,
      data: this.responses,
    };
  }

  constructor(game: Game, onend: (game: Game) => void) {
    super(game, onend);
    this.responses = new Map();
  }
}
