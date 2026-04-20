# How to Test Spaceship Journey (Step by Step)

**Want fewer steps?** Use **QUICK_START.md** — same setup in a short checklist (one trip to Finder for scripts, rest stays in Unity).

Below is the same process with more detail if you get stuck.

---

## Part 1: Open Unity and Set Up the Project

1. **Open Unity Hub** and click **New project**.
2. Pick **Unity 6** or **2022 LTS**, template **2D (Core)**. Name: **SpaceshipJourney**. Click **Create project**.
3. Wait until the editor finishes loading (no spinning icon).

---

## Part 2: Folders and Scripts

4. In the **Project** window at the bottom, right‑click **Assets** → **Create** → **Folder**. Name it **Scripts**.
5. Right‑click **Assets** again → **Create** → **Folder**. Name it **Scenes**. Repeat for **Prefabs**.
6. **Add the scripts to Unity (use drag and drop—Unity has no “Paste” here):**
   - Open **Finder** (Mac) or **File Explorer** (Windows).
   - Go to the folder where this guide lives. It’s usually something like:
     - **Mac:** `iCloud Drive → Cursor → SpaceshipJourney → Scripts`
     - Or wherever you opened this project in Cursor (e.g. **Documents** or **Desktop**).
   - Open the **Scripts** folder. You should see all the `.cs` files (e.g. `SpaceshipController.cs`, `Bullet.cs`, etc.).
   - **Select all** of them (e.g. **Ctrl+A** / **Cmd+A**).
   - **Drag** the selected files from Finder/Explorer and **drop** them onto the **Scripts** folder in Unity’s **Project** window (the one under Assets). Unity will copy them in.
7. Wait a few seconds. At the bottom of Unity, check the **Console** window (Window → General → Console if you don’t see it). There should be **no red errors**. If there are, fix the script names or paths and try again.

---

## Part 3: Save the Scene

8. Save your current scene so you don’t lose work:
   - At the **top** of Unity, click **File**.
   - Click **Save As**.
   - In the save window, **double‑click** the **Scenes** folder (so you’re saving inside it).
   - In the box where you type the name, type **GameScene**.
   - Click **Save**.
   - In the **Project** window (bottom), under **Assets → Scenes**, you should now see **GameScene**. That’s your saved scene.

---

## Part 4: Create the Spaceship (Player)

9. Menu: **GameObject → 2D Object → Sprite**. In the **Hierarchy** (left), the new object appears. Click its name and rename it to **Spaceship**.
10. In the **Inspector** (right), click **Add Component**. Search for **Rigidbody 2D**. Add it. Set **Body Type** to **Kinematic** (so gravity doesn’t pull it).
11. Click **Add Component** again. Search **Spaceship Controller**. Add it. Set **Move Speed** to **5**.
12. Add component **Player Shooter**.
13. Add component **Circle Collider 2D** (so asteroids and monsters can hit the ship). Leave **Is Trigger** unchecked.
14. In the **Scene** view, move the Spaceship somewhere you like (e.g. left side). You can drag the colored arrows on the object to move it.

---

## Part 5: Create the Target (Goal)

15. **GameObject → 2D Object → Sprite**. Rename it to **Target**.
16. Add component **Target Goal** (Script). Set **Distance In Light Years** to **5**, **Reach Distance** to **3**.
17. In the Scene, move the **Target** to the **right** of the Spaceship (so you have to fly right to reach it).

---

## Part 6: Create the Bullet (So You Can Shoot)

18. **GameObject → 2D Object → Sprite**. Rename to **Bullet**. In the Inspector, set its **Scale** to (0.3, 0.3, 1) so it’s small.
19. Add component **Bullet** (Script). Set **Speed** to **12**, **Damage** to **15**.
20. Add component **Circle Collider 2D**. Check **Is Trigger**.
21. Add component **Rigidbody 2D**. Set **Body Type** to **Kinematic**.
22. In the **Project** window, open the **Prefabs** folder. **Drag** the **Bullet** object from the **Hierarchy** into the **Prefabs** folder. A prefab is created. Delete the **Bullet** from the Hierarchy (right‑click → Delete).
23. Click the **Spaceship** in the Hierarchy. In the Inspector, find **Player Shooter**. Drag the **Bullet** prefab from the Project into the **Bullet Prefab** slot.

---

## Part 7: Create the Game Manager

24. **GameObject → Create Empty**. Rename to **GameManager**.
25. Add component **Game Manager** (Script).
26. In the Inspector, you’ll see empty slots: **Player**, **Target**. From the **Hierarchy**, drag **Spaceship** into **Player** and **Target** into **Target**. Leave **Asteroid Spawner** and **Monster Spawner** empty for this first test.

---

## Part 8: One Asteroid (To Test Dodging / Damage)

27. **GameObject → 2D Object → Sprite**. Rename to **Asteroid**.
28. Add component **Asteroid** (Script). Set **Speed** to **2**, **Damage** to **10**. Set **Move Direction** to (-1, 0) so it moves left.
29. Add component **Circle Collider 2D** (uncheck **Is Trigger**).
30. Put the Asteroid somewhere between the Spaceship and the Target in the Scene. Don’t make it a prefab yet; leave it in the scene so you can see it when you play.

---

## Part 9: One Planet (To Test Collecting Coins)

31. **GameObject → 2D Object → Sprite**. Rename to **PlanetCoin**.
32. Add component **Planet Collectible** (Script). Set **Value** to **1**.
33. Add component **Circle Collider 2D** and **check Is Trigger**.
34. Place it somewhere in the scene (e.g. between ship and target).

---

## Part 10: Simple UI (So You See Distance and Planets)

35. **GameObject → UI → Canvas**. If Unity asks to create an Event System, click **Yes**.
36. Right‑click **Canvas** in the Hierarchy → **UI → Text - Legacy**. Rename it to **DistanceText**. Move the text to the top‑left of the Game view (use Rect tool and anchors).
37. Right‑click **Canvas** again → **UI → Text - Legacy**. Rename to **PlanetsText**. Put it under the distance text.
38. Click **Canvas** in the Hierarchy. **Add Component** → search **Gameplay UI**. Add it.
39. Drag **DistanceText** into **Distance Text** and **PlanetsText** into **Planets Text**. Leave Combo and Tricks empty if you want; they’re optional.

---

## Part 11: Press Play and Test

40. Click the **Play** button at the **top center** of the Unity editor (or press **Ctrl+P** / **Cmd+P**). The Game view should become active and the scene will run.

**What you should see:**
- The spaceship in the scene.
- The target (goal) and the asteroid moving.
- The planet (coin) sitting still.
- UI text showing something like “Target 1 — X.X ly” and “Planets: 0”.

**Test each of these:**

| Test | What to do | What should happen |
|------|------------|---------------------|
| **Move** | Press **W A S D** (or Arrow keys) | Ship moves up, left, down, right. |
| **Shoot** | Hold **Space** or **Left mouse** | Bullets fly to the right. |
| **Barrel roll** | Press **Q** or **E** | Ship spins briefly; you’re invincible during it. |
| **Boost** | Hold **Shift** | Ship moves faster for a short time. |
| **Collect planet** | Fly into the planet sprite | Planet disappears; “Planets: 1” (or more) in UI. |
| **Reach target** | Fly to the Target until you’re very close | In the Console it may say “Level 1 complete!” (if you didn’t set up a Level Complete scene). |
| **Get hit by asteroid** | Let the asteroid touch the ship | You take damage (if you added a health bar it goes down; otherwise check Console). |

41. Click **Play** again to **stop** the game. Any changes you make while playing are lost when you stop—that’s normal.

---

## Part 12: Optional — One Monster (To Test Shooting Enemies)

42. Stop Play if it’s running. **GameObject → 2D Object → Sprite**. Rename to **Monster**.
43. Add **Monster** (Script). Set **Planet Drop Count** to **2**. You need a **Planet Coin prefab**: drag your **PlanetCoin** from the scene into the **Prefabs** folder to make a prefab, then assign that prefab to **Monster → Planet Coin Prefab**.
44. Add **Circle Collider 2D** to the Monster (not trigger).
45. Put the Monster in the scene. Press Play, shoot it until it dies—it should drop planet coins and your combo should go up if you have Combo text on the UI.

---

## Quick Test Checklist (When Something’s Wrong)

- **Ship doesn’t move** → Spaceship has **SpaceshipController** and **Rigidbody2D** (Kinematic). No errors in Console.
- **No bullets** → **Player Shooter** has **Bullet Prefab** assigned. Bullet prefab has **Bullet** script and **Collider 2D** set to **Trigger**.
- **Planet doesn’t disappear** → Planet has **Planet Collectible** and **Circle Collider 2D** with **Is Trigger** checked.
- **Target never “reached”** → **Target Goal** has **Reach Distance** (e.g. 3). **Game Manager** has **Player** and **Target** assigned. Fly the ship very close to the target.
- **UI is empty** → **Gameplay UI** script is on Canvas; **Distance Text** and **Planets Text** are assigned. Game view is visible (click the Game tab).

---

## Optional: Health Bar

1. Right‑click **Canvas** → **UI → Image**. Rename to **HealthBarBg**. Resize and place it (e.g. top‑left).
2. Right‑click **HealthBarBg** → **UI → Image**. Rename to **HealthBarFill**. Stretch it to match the background.
3. Select **HealthBarFill**. In Inspector, set **Image Type** to **Filled**, **Fill Method** to **Horizontal**, **Fill Origin** to **Left**, **Fill Amount** to **1**.
4. Add component **Health Bar UI** (Script) to **HealthBarFill**. Drag **HealthBarFill** into **Fill Image** (or leave empty—script will use GetComponent). The script will find the player automatically.

---

## After This Works

- Add **Asteroid Spawner** and **Monster Spawner** (see **GETTING_STARTED.md**) so asteroids and monsters spawn automatically.
- Build the game: **File → Build Settings**, add **GameScene**, click **Build and Run**.

You’re done. You now know how to test the game.
