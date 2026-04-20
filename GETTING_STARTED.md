# Getting Started with Unity — Spaceship Journey

## Step 1: Create a New Project

1. Open **Unity Hub**.
2. Click **New project**.
3. Select **Unity 6** or **2022 LTS** (or latest LTS).
4. Choose **2D (Core)** for a simpler start, or **3D (Core)** if you want 3D space.
5. Name the project **SpaceshipJourney** and choose a folder.
6. Click **Create project**.

---

## Step 2: Create Folder Structure

In the **Project** window (bottom), right‑click in **Assets** and create:

```
Assets/
├── Scenes/
├── Scripts/
├── Prefabs/
├── Sprites/        (2D) or Models/ (3D)
└── Materials/
```

---

## Step 3: Copy the Scripts

1. Copy all `.cs` files from the **SpaceshipJourney/Scripts** folder (from this repo) into your Unity project’s **Assets/Scripts** folder.
2. Wait for Unity to compile (no red errors in the Console).

---

## Step 4: Create Your First Scene

### A. Save the scene
- **File → Save As** → save in `Scenes/` as `GameScene`.

### B. Create the player (spaceship)
1. **GameObject → 2D Object → Sprite** (or **3D Object → Cube** for 3D). Rename to **Spaceship**.
2. Add **Rigidbody2D** (2D) or **Rigidbody** (3D); set to Kinematic if you prefer no physics.
3. Add **SpaceshipController** and **PlayerShooter** (Script). Set **Move Speed** (e.g. 5).
4. Add a **Collider2D** (e.g. Circle Collider 2D) so asteroids/monsters can hit you.
5. (Optional) Create empty child **FirePoint** in front of the ship; assign to **PlayerShooter → Fire Point**.

### C. Create the camera boundary (optional)
- Create an **Empty GameObject**, name it **GameBounds**. You can use it later for spawn limits.

### D. Create a simple target
1. **GameObject → 2D Object → Sprite** (or **3D Object → Sphere**). Rename to **Target**.
2. Add component **TargetGoal** (Script).
3. Place it somewhere in the scene. Set **Distance In Light Years** (e.g. 5).

### E. Bullet prefab (for shooting)
1. **GameObject → 2D Object → Sprite** (small square/circle). Rename **Bullet**.
2. Add **Bullet** (Script). Set **Speed** (e.g. 12), **Damage** (e.g. 15).
3. Add **Collider2D** (e.g. Circle), check **Is Trigger**. Add **Rigidbody2D** → **Body Type: Kinematic**.
4. Drag **Bullet** into **Prefabs**; delete from scene. Assign this prefab to **Spaceship → PlayerShooter → Bullet Prefab**.

### F. Test movement and shooting
- Press **Play**. **WASD** to move, **Space** or **Left click** to shoot. **Q** or **E** = barrel roll, **Shift** = boost.

---

## Step 5: Add Asteroids (Prefabs)

1. Create **GameObject → 2D Object → Sprite** (or **3D Object → Sphere**). Rename **Asteroid**.
2. Add component **Asteroid** (Script). Set **Speed** and **Damage**.
3. Add a **Collider** (2D: Box Collider 2D / Circle Collider 2D; 3D: Sphere Collider). Check **Is Trigger** if you want trigger-based damage.
4. Drag **Asteroid** from Hierarchy into **Assets/Prefabs** to make a prefab. Delete it from the scene.
5. Create an **Empty GameObject**, name **SpawnManager**. Add **AsteroidSpawner** script and assign the asteroid prefab. Set spawn rate and limits.

### Monsters (enemies to shoot)
1. Create **Sprite** or **3D Object**, name **Monster**. Add **Monster** (Script) and **Collider2D** (not trigger for collision).
2. Assign **Planet Coin Prefab** so monsters drop planets when killed. Make prefab.
3. Create empty **MonsterSpawner**; add **MonsterSpawner** (Script), assign monster prefab. In **GameManager**, assign **Monster Spawner**.

---

## Step 6: Add Planets (Coins)

1. Create a **Sprite** or **Sphere**, name **PlanetCoin**.
2. Add **PlanetCollectible** (Script).
3. Add a **Collider** (Trigger). Optional: add **Rigidbody2D** / **Rigidbody** and set to Kinematic.
4. Make it a **Prefab**. Use **SpawnManager** or a separate spawner to place coins in the level.

---

## Step 7: Add the Fairy (Helper)

1. Create a **Sprite** or **3D Object**, name **Fairy**.
2. Add **FairyHelper** (Script). Assign **Player** (Spaceship) and **Target** (TargetGoal) in the Inspector.
3. Adjust **Follow Distance** and **Help Mode** (Guide / Shield / Heal) as you like.

---

## Step 8: Game Manager & Difficulty

1. Create **Empty GameObject**, name **GameManager**.
2. Add **GameManager** (Script). Assign **Player**, **Target**, **Asteroid Spawner**, **Monster Spawner** (if used), **Fairy**, **Player Shooter**.
3. Set **Player Speed Scale Per Level** (e.g. 1.08) so the ship gets faster each level. **Difficulty Scale Per Level** affects asteroids and monsters.
4. Use **GameManager** to load next scene when target is reached (e.g. level complete).

---

## Step 9: UI (Distance, Coins, Combo, Tricks)

1. **GameObject → UI → Canvas** (and **EventSystem** if prompted).
2. Add **Text** (Legacy) for: **Distance**, **Planets**, **Combo**, **Tricks** (cooldowns).
3. Add **GameplayUI** (Script) to the Canvas or a UI manager object. Assign the Text fields and it will show distance, planets, combo, and trick cooldowns.

---

## Step 10: Build & Run

- **File → Build Settings** → add **GameScene** to **Scenes In Build**.
- Choose **PC, Mac & Linux** or **WebGL**.
- Click **Build and Run**.

---

## Next Steps

- See **CONTROLS.md** for shooting (Space/mouse), barrel roll (Q/E), and boost (Shift).
- Add **sound effects** and **background music**.
- Use **combo** in a later update for bonus planets or score.
- Use **GAME_DESIGN.md** for full mechanics and **CONTROLS.md** for all inputs and scaling.

You’re ready to build **Spaceship Journey** in Unity. Have fun!
