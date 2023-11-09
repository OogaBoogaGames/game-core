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

  gamestate: GameState<any>;

  constructor() {
    this.players = [];
    this.gamestate = new GameState<any>(null);
  }

  addPlayer(player: Player) {
    this.players.push(player);
  }

  start(): void {
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
