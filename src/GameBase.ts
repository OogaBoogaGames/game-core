import { ErrorStage } from "./ErrorStage";
import { Player } from "./Player";

export class GameState<T> {
  // Game state can either be complete or incomplete.
  // If complete, the data is structure is filled properly and the state can
  // be processed accordingly. (Next turn entered, game responses presented, etc.)
  // If incomplete, the data structure is not entirely filled out and the game loop
  // is still waiting on responses.

  complete: boolean;
  data: T;

  constructor(data: T) {
    this.complete = false;
    this.data = data;
  }
}

export abstract class GameStage {
  game: Game;

  constructor(game: Game, onend: (game: Game) => void) {
    this.game = game;
    this.onend = onend;
  }

  abstract prompt: string; // Resource token for the prompt
  abstract responses: Map<Player, any>; // Map of player responses for given stage

  abstract onstart(game: Game): void; // Function to run when stage starts
  abstract onresponse(game: Game, player: Player, response: any): void; // Function to run when player responds

  onend: (game: Game) => void; // Callback to run when stage ends
}

export abstract class Game {
  abstract name: string;

  abstract maxPlayers: number;
  abstract minPlayers: number;

  abstract stages: GameStage[];

  players: Player[];
  gameId: string;

  gamestate: GameState<any>;

  constructor() {
    this.gameId = "<uninitialized>";
    this.players = [];
    this.gamestate = new GameState<any>(null);
  }

  gotoStage(stage: number, recoverErrors: boolean = false) {
    try {
      this.stages[stage].onstart(this);
    } catch (e) {
      let nextStage: number | "unrecoverable" = recoverErrors
        ? stage + 1
        : "unrecoverable";
      let errorStage: ErrorStage;
      if (e instanceof Error) {
        errorStage = new ErrorStage(this, [nextStage, e]);
      } else {
        errorStage = new ErrorStage(this, [
          nextStage,
          new Error(JSON.stringify(e)),
        ]);
      }
      errorStage.onstart(this);
    }
  }

  addPlayer(id: string, name: string): Player {
    return new Player(id, name, this);
  }

  addPlayerRaw(player: Player) {
    this.players.push(player);
  }

  start(gameId: string): void {
    this.gameId = gameId;
    this.stages[0].onstart(this);
  }

  abstract end(): void;

  getPlayers(): Player[] {
    return this.players;
  }

  getPlayerCount(): number {
    return this.players.length;
  }

  getPlayer(id: string) {
    return this.players.find((player) => player.id === id);
  }

  removePlayer(id: string) {
    this.players = this.players.filter((player) => player.id !== id);
  }

  updatePlayer(id: string, data: any) {
    const player = this.getPlayer(id);
    if (player) {
      Object.assign(player, data);
    }
  }
}
