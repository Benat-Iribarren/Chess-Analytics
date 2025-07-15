export interface LichessLeaderboardPlayer {
    id: string;
    username: string;
    perfs: {
      [gameMode: string]: {
        rating: number;
        progress: number;
      };
    };
    title?: string;
    patron?: boolean;
  }
  
  export interface LichessLeaderboardResponse {
    [gameMode: string]: LichessLeaderboardPlayer[];
  }
  
  export interface TransformedPlayer {
    id: string;
    username: string;
    modes: {
      [gameMode:string]: {
        rating: number;
        progress: number;
      };
    };
    title?: string;
    patron?: boolean;
  }
  
  export interface Top10ApiResponse {
    [gameMode: string]: TransformedPlayer[];
  }
