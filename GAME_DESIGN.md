# Spaceship Journey — Game Design Document

## Core Loop

1. Player sees **target** (e.g. "Target 1 — 5 light years").
2. Fly toward target: **dodge asteroids**, **kill monsters**, **collect planets (coins)**.
3. **Fairy** helps (shows path, shields, or hints).
4. Reach target → next level: **harder**, **farther target**, new obstacles.

---

## Mechanics

### Spaceship
- Move: up / down / left / right (and diagonal).
- Optional: “smart tricks” (barrel roll, boost) for extra points or invincibility frames.
- Health; game over when health = 0 (or lives = 0).

### Target
- Shown on HUD or in world: “Target 1 — N light years”.
- Distance can decrease as player moves (simple “distance to goal”).
- Reaching target = level complete → next level.

### Asteroids
- Obstacles to **dodge** (no shooting).
- Size/speed vary; bigger = more damage if hit.
- Spawn in path; more and faster as difficulty increases.

### Monsters
- Enemies to **hit/kill** (shoot or ram, as you prefer).
- Drop coins (planets) or power-ups.
- More types and faster as difficulty rises.

### Fairy
- Follows or leads toward target.
- Possible roles: path hint, short shield, healing, or “magnet” for coins.
- Unlock or upgrade as player progresses.

### Planets (Coins)
- Collectibles in space.
- Used for: score, shop, upgrades, or unlocks.

---

## Difficulty Progression

| Level / Phase | Target distance | Asteroids | Monsters | Fairy |
|---------------|-----------------|-----------|----------|--------|
| 1–2           | 3–5 ly          | Few, slow | 1 type   | Basic help |
| 3–5           | 8–12 ly         | More, faster | 2 types | Better ability |
| 6+            | 15+ ly          | Many, patterns | 3+ types | Full helper |

---

## Suggested Unity Structure

- **Scenes**: MainMenu, Game, LevelComplete, GameOver.
- **Managers**: GameManager (level, difficulty, score), SpawnManager (asteroids, monsters, planets).
- **Objects**: Player (spaceship), Target (goal), Asteroid, Monster, Planet (coin), Fairy.

Use the **Scripts** in this repo as a starting point and adjust to 2D or 3D and your art style.
