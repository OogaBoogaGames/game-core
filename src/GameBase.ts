import { Player } from "./Player";

export type StageState<T> = {
  complete: boolean;
  data: T;
};

export type GameState = Map<GameStage, StageState<any>>;

export abstract class GameStage {
  game: Game;

  constructor(game: Game, onend: (game: Game) => void) {
    this.game = game;
    this.onend = onend;
  }

  setState(state: StageState<any>) {
    this.game.gamestate.set(this, state);
  }

  abstract prompt: string; // Resource token for the prompt
  abstract responses: Map<Player, any>; // Map of player responses for given stage

  abstract onstart(game: Game): void; // Function to run when stage starts
  abstract onresponse(
    game: Game,
    player: Player,
    response: any
  ): StageState<any>; // Function to run when player responds
  abstract onWithdrawResponse(game: Game, player: Player): StageState<any>; // Function to run when player withdraws response

  respond(player: Player, response: any): StageState<any> {
    this.responses.set(player, response);
    return this.onresponse(this.game, player, response);
  }

  withdrawResponse(player: Player) {
    this.responses.delete(player);
    return this.onWithdrawResponse(this.game, player);
  }

  onend: (game: Game) => void; // Callback to run when stage ends
}

export abstract class Game {
  abstract name: string;
  owner: string;

  abstract maxPlayers: number;
  abstract minPlayers: number;

  hooks: Map<keyof Game, Function> = new Map();

  hook<T>(key: keyof Game, ...args: any[]): [boolean, T | null] {
    let hook = this.hooks.get(key);
    if (hook) {
      return [true, hook(this, ...args)];
    }
    return [false, null];
  }

  abstract stages: GameStage[];

  players: Player[];
  gameId: string;

  currentStage: GameStage | null;

  gamestate: GameState;

  constructor() {
    this.gameId = "<uninitialized>";
    this.players = [];
    this.currentStage = null;
    this.gamestate = new Map();
    this.owner = "";
  }

  setState(stage: GameStage, state: StageState<any>) {
    this.gamestate.set(stage, state);
  }

  getState(stage: GameStage): StageState<any> {
    return this.gamestate.get(stage) || { complete: false, data: null };
  }

  setStage(stage: GameStage) {
    this.currentStage = stage;
  }

  getStage(): GameStage | Error {
    return this.currentStage || new Error("Game not yet initialized");
  }

  respond(player: Player, response: any) {
    let stage: GameStage;
    try {
      stage = this.getStage() as GameStage;
    } catch (e) {
      console.error(e);
      return;
    }
    let stageState = stage.respond(player, response);
    this.gamestate.set(stage, stageState);
  }

  withdrawResponse(player: Player) {
    let stage: GameStage;
    try {
      stage = this.getStage() as GameStage;
    } catch (e) {
      console.error(e);
      return;
    }
    let stageState = stage.withdrawResponse(player);
    this.gamestate.set(stage, stageState);
  }

  buildPlayer(id: string, name: string): Player {
    return new Player(id, name, this);
  }

  start(gameId: string, owner: string): void {
    this.gameId = gameId;
    this.owner = owner;

    let firstStage = this.stages[0];
    this.stages[0].onstart(this);
    this.currentStage = firstStage;
  }

  abstract end(): void;

  getPlayers(): Player[] {
    let [exists, value] = this.hook<Player[]>("getPlayers");
    if (!exists) {
      return this.players;
    }
    return value!;
  }

  getPlayerCount(): number {
    let [exists, value] = this.hook<number>("getPlayerCount");
    if (!exists) {
      return this.players.length;
    }
    return value!;
  }

  addPlayer(player: Player): void {
    let [exists, value] = this.hook<void>("addPlayer", player);
    if (!exists) {
      this.players.push(player);
    }
    return value!;
  }

  getPlayer(id: string): Player | undefined {
    let [exists, value] = this.hook<Player | undefined>("getPlayer", id);
    if (!exists) {
      return this.players.find((player) => player.id === id);
    }
    return value!;
  }

  removePlayer(id: string): void {
    let [exists, value] = this.hook<void>("removePlayer", id);
    if (!exists) {
      this.players = this.players.filter((player) => player.id !== id);
    }
    return value!;
  }
}
