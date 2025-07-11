const errorSchema = {
    type: 'object',
    properties: {
      error: { type: 'string' }
    },
    required: ['error']
  };
  
export const userSchema = {
    200: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          username: { type: 'string' },
          modes: { type: 'object', additionalProperties: true },
          flair: { type: 'string' },
          patron: { type: 'boolean' },
          verified: { type: 'boolean' },
          createdAt: { type: 'number' },
          profile: { type: 'object', additionalProperties: true },
          seenAt: { type: 'number' },
          playTime: { type: 'object', additionalProperties: true }
        },
        required: ['id', 'username', 'playTime']
    },
    400: errorSchema,
    404: errorSchema,
    500: errorSchema
}
export const enrichedSchema = {
    200: {
        type: 'object',
        properties: {
            id: { type: 'string' },
            username: { type: 'string' },
            profile: { type: 'object', additionalProperties: true },
            playTime: { type: 'object', additionalProperties: true },
            rank: { type:'number', nullable: true },
            resultStreak: { type: 'object', additionalProperties: true }
        }
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
