# How to Add Image Assets

You can replace the default shapes (ship, monsters, target, etc.) with your own images.

## 1. Create an `images` folder

In the **web** folder (same place as `index.html` and `game.js`), create a folder named **images**:

```
web/
  index.html
  game.js
  images/     ← create this folder
    ship.png
    monster.png
    monster1.png, monster2.png, monster3.png, monster4.png
    target.png
    asteroid.png
    planet.png
    fairy.png
    bullet.png
```

## 2. Image file names

Put your image files in **images** with these **exact names** (the game looks for them):

| File name     | Used for              | Suggested size (pixels) |
|---------------|------------------------|--------------------------|
| **background.gif** | Game background (full canvas; animated GIF supported) | 900×560 or any size (stretched to fit) |
| **timer.png** | Timer pickup (grab to add +5 seconds; floats around, 2–3 per round) | about 44×44 |
| **life.png** | Life pickup (grab to add +2 allowed hits; floats around, 3–4 per round) | about 44×44 |
| **ship.png**  | Player spaceship      | about 48×32 (or 24×16)   |
| **monster.png** | Red enemies (fallback) | about 32×32   |
| **monster1.png** – **monster4.png** | Monster variants (picked at random) | about 32×32 |
| **target.png**  | Green goal circle   | about 48×48              |
| **asteroid.png** | Gray obstacles     | about 40×40              |
| **planet.png**  | Gold coins          | about 24×24              |
| **fairy.png**   | Fairy that follows the ship       | about 24×24   |
| **fairy.png**   | Helper fairy (top of screen; click for +2 hits, max 2 per game) | about 60×60 or 48×48 |
| **showering_stars.png** | Star burst when you click the helper fairy (optional; otherwise drawn with canvas) | about 80×80 to 120×120 |
| **bullet.png**  | Yellow bullets      | about 16×8               |
| **buzz.png**    | Crash effect when a monster hits the ship | about 48×48 or 64×64 |

You don’t need all of them. If a file is missing, the game keeps using the default shape for that thing.

## 3. Image format and style

- **Format:** PNG (with transparency) or JPG.
- **Transparency:** PNG with a transparent background works best so the game background doesn’t show a rectangle.
- **Nose direction:** For **ship.png**, draw the ship with the **nose at the top** of the image. The game rotates it so the nose points in the direction you move, and bullets fire from the front.

## 4. Where to get images

- Draw your own in any image editor (e.g. Piskel, Aseprite, GIMP).
- Use free game art sites (e.g. itch.io, OpenGameArt.org) and rename the file to match the table above.
- Export from Unity/other tools as PNG and put them in **images** with the right names.

## 5. Test

1. Save your images in **web/images/** with the names above.
2. Refresh the game in the browser (F5 or Cmd+R).
3. If an image doesn’t show, check the browser console (F12) for errors and that the file name and folder name are exactly **images** (lowercase).

The game loads images from the **images** folder next to **index.html**. If you open the game by double‑clicking **index.html**, the page URL might be `file:///...`. Some browsers block loading other local files; if images don’t load, try running a simple local server (e.g. open a terminal in the **web** folder and run `python3 -m http.server 8000`, then go to `http://localhost:8000`).

---

## Game music

1. Create a folder named **sounds** in the **web** folder (same level as **images**).
2. Add a music file named **music.mp3** (or **music.ogg**) inside **sounds**.
3. The game will start playing it when you first press a key or click anywhere (browsers require a user action before audio). A hint says “Click or press any key to start music” until you do.
4. Music loops and volume is set to 50%. Use any royalty-free or your own track; MP3 or OGG both work.
5. **If you don’t hear music:** Browsers often block audio when the game is opened as a file (`file://`). Run a local server instead (e.g. in the **web** folder run `python3 -m http.server 8000` and open `http://localhost:8000`). See HOW_TO_TEST.md for details.

## Sound effects

Put these in the **sounds** folder with these exact names:

| File           | When it plays   |
|----------------|-----------------|
| **shoot.mp3**  | Every time you fire a bullet |
| **hit.mp3**   | Fallback if crash.mp3 is missing |
| **crash.mp3** | When an **asteroid** touches the ship (crash sound) |
| **monster_ship_crash.mp3** | When a **monster** touches the ship |
| **game_over.mp3** | When you get game over (too many hits or time runs out) |
| **win_sound.mp3** | When you complete a round (reach required kills in time) |

If a file is missing, the game just skips that sound. Volume is set to 60% for these effects.
