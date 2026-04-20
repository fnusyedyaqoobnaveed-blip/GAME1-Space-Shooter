# Spaceship Journey — Controls & Features

## Controls

| Input | Action |
|-------|--------|
| **WASD** or **Arrow keys** | Move up / down / left / right |
| **Space** or **Left mouse** | Shoot (forward) |
| **Q** or **E** | Barrel roll (brief invincibility + spin) |
| **Shift** (hold) | Boost (short speed burst) |

---

## Shooting

- **Fire rate** and **damage** are set on **PlayerShooter**. Damage increases with level.
- From **level 5** onward you get **triple shot** (3 bullets per shot with spread).
- Create a **Bullet** prefab: small sprite/cube, **Bullet** script, **Collider2D** as **Trigger**. Assign to **PlayerShooter → Bullet Prefab**.
- Optional: create a child **Fire Point** empty GameObject in front of the ship and assign to **Fire Point** for spawn position.

---

## Tricks

- **Barrel roll (Q/E)**  
  - Short spin; you are **invincible** during the roll.  
  - Cooldown: 2 s (configurable on **SpaceshipController**).

- **Boost (Shift)**  
  - Short burst of higher speed.  
  - Cooldown: 1.5 s (configurable).

- After taking damage you get **invincibility frames** (~1.5 s) so you don’t get hit again instantly.

---

## Speed & difficulty by level

- **Player speed** increases each level (**GameManager → Player Speed Scale Per Level**, default 1.08 = 8% faster per level).
- **Asteroid** spawn rate and speed scale with **Difficulty Scale Per Level**.
- **Monsters** spawn from **MonsterSpawner**; their health and speed also scale with level.
- **Bullet damage** scales with level (**PlayerShooter → Damage Per Level**).

---

## Combo

- Killing **monsters** in quick succession builds a **combo** (resets if you don’t get a kill within ~2 s).
- Combo is shown on the **GameplayUI** (e.g. “Combo x3”).
- **Bonus:** Every 3 kills in a row grants **1 extra planet** (configurable on SpaceshipController → Combo Kills For Bonus Planet).

---

## Optional: bullets destroy asteroids

On the **Bullet** script, enable **Destroy Asteroids** if you want shots to break asteroids instead of only dodging them.
