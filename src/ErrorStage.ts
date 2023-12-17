import { Game, GameStage } from "./GameBase";
import { Player } from "./Player";

export type ErrorType = [next: number | "unrecoverable", error: Error];

export class ErrorStage extends GameStage {
  prompt: string;
  responses: Map<Player, null>; // We don't care about responses for error stage
  errorType: ErrorType;

  onstart(game: Game): void {
    console.log("Error stage started");
    this.responses = new Map();
    setTimeout(() => {
      this.onend(game);
    }, 5000);
  }
  onresponse(game: Game, player: Player, response: any): void {
    throw new Error("Method not implemented.");
  }

  constructor(game: Game, errortype: ErrorType) {
    super(game, (game) => {
      if (errortype[0] === "unrecoverable") {
        // Unrecoverable error
        game.end();
      } else {
        // Recoverable error
        game.stages[errortype[0]].onstart(game);
      }
    });
    this.errorType = errortype;
    this.prompt = `__obg__.error.prompt.prefix ${errortype[1].message} __obg__.error.prompt.suffix`;
    this.responses = new Map();
  }
}

export function gotoStageSafe(
  game: Game,
  stage: number,
  recoverErrors: boolean = false
) {
  try {
    game.stages[stage].onstart(game);
  } catch (e) {
    let nextStage: number | "unrecoverable" = recoverErrors
      ? stage + 1
      : "unrecoverable";
    let errorStage: ErrorStage;
    if (e instanceof Error) {
      errorStage = new ErrorStage(game, [nextStage, e]);
    } else {
      errorStage = new ErrorStage(game, [
        nextStage,
        new Error(JSON.stringify(e)),
      ]);
    }
    errorStage.onstart(game);
  }
}
