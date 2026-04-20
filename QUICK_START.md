# Quick Start — Fewer Steps

**Tip:** Only leave Unity once (to drag in the scripts). Do everything else in Unity: **Hierarchy** (left) = click objects, **Inspector** (right) = add components & drag links, **Project** (bottom) = your folders.

---

## 1. Project + folders (in Unity)

- Unity Hub → **New project** → **2D (Core)** → name **SpaceshipJourney** → Create.
- In **Project** (bottom): right‑click **Assets** → Create → Folder → name **Scripts**. Repeat for **Scenes** and **Prefabs**.

## 2. Scripts (one trip to Finder)

- **Finder** → go to **SpaceshipJourney/Scripts** (same place as this file). Select all **.cs** files → **drag** into Unity’s **Scripts** folder in the Project window.
- Wait for compile (no red in **Console**).

## 3. Save scene (in Unity)

- **File → Save As** → double‑click **Scenes** → name **GameScene** → Save.

## 4. Spaceship (all in Inspector)

- **GameObject → 2D Object → Sprite**. Rename to **Spaceship**.  
  **Add Component:** Rigidbody 2D (Kinematic), **Spaceship Controller** (Move Speed 5), **Player Shooter**, **Circle Collider 2D**.

## 5. Target

- **GameObject → 2D Object → Sprite**. Rename **Target**. Move it to the right in the Scene.  
  **Add Component:** **Target Goal** (Reach Distance **3**).

## 6. Bullet → prefab → link to ship

- **GameObject → 2D Object → Sprite**. Rename **Bullet**. Scale **(0.3, 0.3, 1)**.  
  **Add Component:** **Bullet** (Speed 12, Damage 15), **Circle Collider 2D** ✓ Is Trigger, **Rigidbody 2D** Kinematic.  
  **Drag** Bullet from **Hierarchy** into **Project → Prefabs**. Delete Bullet from Hierarchy.  
  Click **Spaceship** → in Inspector **Player Shooter** → drag **Bullet** prefab into **Bullet Prefab**.

## 7. Game Manager

- **GameObject → Create Empty**. Rename **GameManager**. **Add Component:** **Game Manager**.  
  Drag **Spaceship** into **Player**, **Target** into **Target**.

## 8. One asteroid, one planet

- **GameObject → 2D Object → Sprite** → **Asteroid**. **Add:** **Asteroid** (Speed 2, Damage 10, Direction X=-1), **Circle Collider 2D**. Put it between ship and target.
- **GameObject → 2D Object → Sprite** → **PlanetCoin**. **Add:** **Planet Collectible** (Value 1), **Circle Collider 2D** ✓ Is Trigger. Put it in the middle.

## 9. UI (optional but quick)

- **GameObject → UI → Canvas** (Yes to Event System). Right‑click Canvas → **UI → Text - Legacy** twice; name them **DistanceText** and **PlanetsText**.  
  Click **Canvas** → **Add Component** → **Gameplay UI**. Drag the two texts into the slots.

## 10. Play

- Press **Play** (top center). **WASD** move, **Space** shoot, **Q/E** barrel roll, **Shift** boost. Fly to the planet (collect), then to the target (win).

---

**If something breaks:** Console (bottom) for red errors. **Ship no move** → Rigidbody2D Kinematic + SpaceshipController. **No bullets** → Bullet prefab on Player Shooter + Bullet has Trigger collider.
