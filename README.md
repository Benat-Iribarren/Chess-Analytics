# Chess-Analytics


# Endpoints

## Endpoint 1: Get All top 10

**Chess Endpoint url:** https://lichess.org/api/player

**Our Endpoint Url:** /chess/top10

**Method:** GET

### Result 200 ✅

```json
{
  "bullet": [
    {
      "id": "rodosfatihi",
      "username": "RoDoSfAtiHi",
      "modes": {
        "bullet": {
          "rating": 3302,
          "progress": -10
        }
      }
    },
    {
      "id": "aqua_blazing",
      "username": "Aqua_Blazing",
      "modes": {
        "bullet": {
          "rating": 3300,
          "progress": -19
        }
      }
    }, 
    ... 
  ],
    
  "blitz": [ ... ], 
	 ...
}
```

### Result 500 ❌

```json
{
	"error": "Internal server error."
}
```

---

## Endpoint 2: Get User By Id

**Chess Endpoint url:** [https://lichess.org/api/user](https://lichess.org/api/users)s?id=

**Our Endpoint Url:** /chess/user?id=123
**Method:** POST en Lichess y GET en la nuestra

*Get up to 300 users by their IDs. Users are returned in the same order as the IDs.*

<aside>
⚠️

We do not provide a full download of the Lichess users. This endpoint is limited to 8,000 users every 10 minutes, and 120,000 every day.

</aside>

### Result 200 ✅

```json
{
	"id": "thibault",
	"username": "thibault",
	"modes": {...},
	"flair": "symbols.vim-logo",
	"patron": true,
	"verified": true,
	"createdAt": 1290415680000,
	"profile": {...},
	"seenAt": 1745095382270,
	"playTime": {...}
}
```

### Result 400 ❌

```json
{
	"error": "Invalid or missing 'id' parameter."
}
```

### Result 404 ❌

```json
{
	"error": "User not found."
}
```

### Result 500 ❌

```json
{
	"error": "Internal server error."
}
```

---

## Endpoint 3: Enriched User (Get users by ID + Get performance statistics)

**Endpoint:** /chess/user/enriched?id={id}&mode={mode}

**Method:** GET

**Parameters:** 

- id: user’s ID. String
- mode: chess game mode. String in {"ultraBullet" "bullet" "blitz" "rapid" "classical" "chess960" "crazyhouse" "antichess" "atomic" "horde" "kingOfTheHill" "racingKings" "threeCheck”}

This endpoint returns detailed info about a user combining both “Get users by ID” and “Get performance statistics” from [Lichess.org](http://Lichess.org) API.

### Result 200 ✅

```json
{
	"id": "thibault",
	"username": "thibault",
	"profile": {},
	"playTime": {},
	"rank": 45,
	"resultStreak": {
		"wins": 
			"current": 0,
			"max": 2
		},
		"losses": {
			"current": 0,
			"max": 1
		}
	}
}
```

### Result 400 ❌

```json
{
	"error": "Invalid or missing 'id' or 'mode' parameter."
}
```

### Result 404 ❌

```json
{
	"error": "User or Game Mode not found."
}
```

### Result 500 ❌

```json
{
	"error": "Internal server error."
}
```

---

## Endpoint 4: Top Player History (Get one leaderboard  + Get rating history of a user)

This endpoint returns the rating history of a user from the leaderboard rankings.

**Chess Endpoint url: [](https://lichess.org/player/top/200/bullet)**[https://lichess.org/api/player/top/20](https://lichess.org/api/player/top/100/bullet)0/{mode}& [https://lichess.org/api/user/{username}/rating-history](https://lichess.org/api/user/%7Busername%7D/rating-history)

**Our Endpoint Url:** /chess/topPlayerHistory?mode={mode}&top={top}

**Parameters:** 
mode- String with the name of the type of leaderboard ("ultraBullet" "bullet" "blitz" "rapid" "classical" "chess960" "crazyhouse" "antichess" "atomic" "horde" "kingOfTheHill" "racingKings" "threeCheck”).
top- Integer between 1 and 200 with the ranking of the user in the leaderboard.

### Result 200 ✅

```json
{
  "username": "jaime",
  "history": [
    {
      "date": "2025-03-13",
      "rating": 854
    },
    {
      "date": "2025-03-15",
      "rating": 872
    },
    {
      "date": "2025-03-17",
      "rating": 910
    },
    {
      "date": "2025-03-20",
      "rating": 880
    }
  ]
}

```

### Result 400 ❌

```json
{
	"error": "Invalid or missing 'top' or 'mode' parameter."
}
```

### Result 404 ❌

```json
{
	"error": "Game Mode not found."
}
```

### Result 500 ❌
