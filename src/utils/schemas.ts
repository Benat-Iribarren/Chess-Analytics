const errorSchema = {
    type: 'object',
    properties: {
      error: { type: 'string' }
    },
    required: ['error']
  };

  export const top10Schema = {
    200: {
      type: 'object',
      additionalProperties: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            username: { type: 'string' },
            title: { type: 'string', nullable: true },
            patron: { type: 'boolean', nullable: true },
            online: { type: 'boolean', nullable: true },
            modes: {
              type: 'object',
              additionalProperties: {
                type: 'object',
                properties: {
                  rating: { type: 'number' },
                  progress: { type: 'number' }
                },
                required: ['rating', 'progress']
              }
            }
          },
          required: ['id', 'username', 'modes']
        }
      }
    },
    500: errorSchema
};

export const userSchema = {
  200: {
    type: 'object',
    properties: {
      id: { type: 'string' },
      username: { type: 'string' },
      playTime: {
        type: 'object',
        properties: {
          total: { type: 'number' },
          tv: { type: 'number' }
        },
        required: ['total', 'tv']
      },
      modes: {
        type: 'object',
        additionalProperties: {
          type: 'object',
          properties: {
            games: { type: 'number', nullable: true },
            runs: { type: 'number', nullable: true },
            score: { type: 'number', nullable: true },
            rating: { type: 'number', nullable: true },
            rd: { type: 'number', nullable: true },
            prog: { type: 'number', nullable: true },
            prov: { type: 'boolean', nullable: true }
          }
        }
      },
      flair: { type: 'string' },
      patron: { type: 'boolean' },
      verified: { type: 'boolean' },
      createdAt: { type: 'number' },
      profile: {
        type: 'object',
        properties: {
          bio: { type: 'string', nullable: true },
          realName: { type: 'string', nullable: true },
          links: { type: 'string', nullable: true }
        },
        required: []
      },
      seenAt: { type: 'number' }
    },
    required: ['id', 'username', 'playTime']
  },
  400: errorSchema,
  404: errorSchema,
  500: errorSchema
};

export const enrichedSchema = {
    200: {
        type: 'object',
        properties: {
            id: { type: 'string' },
            username: { type: 'string' },
            profile: {
              type: 'object',
              properties: {
                bio: { type: 'string', nullable: true },
                realName: { type: 'string', nullable: true },
                links: { type: 'string', nullable: true }
              },
            },
            playTime: {
              type: 'object',
              properties: {
                total: { type: 'number' },
                tv: { type: 'number' }
              },
              required: ['total', 'tv']
            },
            rank: { type: ['number', 'null'] },
            resultStreak: {
              type: 'object',
              properties: {
                wins: {
                  type: 'object',
                  properties: {
                    current: { type: 'number' },
                    max: { type: 'number' }
                  },
                  required: ['current', 'max']
                },
                losses: {
                  type: 'object',
                  properties: {
                    current: { type: 'number' },
                    max: { type: 'number' }
                  },
                  required: ['current', 'max']
                }
              },
              required: ['wins', 'losses']
            }
          },
        },
    400: errorSchema,
    404: errorSchema,
    500: errorSchema
}
export const topPlayerHistorySchema = {
    200: {
        type: 'object',
        properties: {
          username: { type: 'string' },
          history: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                date: { type: 'string' },
                rating: { type: 'number' }
              },
              required: ['date', 'rating']
            }
          }
        },
        required: ['username', 'history']
      },
      400: errorSchema,
      404: errorSchema,
      500: errorSchema
}
