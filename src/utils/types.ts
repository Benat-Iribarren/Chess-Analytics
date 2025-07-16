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
  
