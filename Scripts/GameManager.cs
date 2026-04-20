using UnityEngine;
using UnityEngine.SceneManagement;

/// <summary>
/// Manages level, difficulty, distance to target, and win/lose.
/// Assign player, target, and optionally spawners in the Inspector.
/// </summary>
public class GameManager : MonoBehaviour
{
    public static GameManager Instance { get; private set; }

    [Header("References")]
    [SerializeField] private SpaceshipController player;
    [SerializeField] private TargetGoal target;
    [SerializeField] private AsteroidSpawner asteroidSpawner;
    [SerializeField] private MonsterSpawner monsterSpawner;
    [SerializeField] private FairyHelper fairy;
    [SerializeField] private PlayerShooter playerShooter;

    [Header("Level")]
    [SerializeField] private int currentLevel = 1;
    [SerializeField] private float startingLightYears = 5f;
    [SerializeField] private float difficultyScalePerLevel = 1.2f;

    [Header("Speed scaling (per level)")]
    [Tooltip("Player move speed multiplier as levels increase (e.g. 1.1 = 10% faster each level).")]
    [SerializeField] private float playerSpeedScalePerLevel = 1.08f;

    [Header("UI (optional)")]
    [SerializeField] private string levelCompleteSceneName = "LevelComplete";
    [SerializeField] private string gameOverSceneName = "GameOver";

    public int CurrentLevel => currentLevel;
    public float DistanceToTarget => target != null ? target.GetDistanceToPlayer() : 0f;
    public float TargetLightYears => target != null ? target.DistanceInLightYears : 0f;
    public int PlanetsCollected => player != null ? player.PlanetsCollected : 0;
    public bool GameOver { get; private set; }

    private void Awake()
    {
        if (Instance != null && Instance != this)
        {
            Destroy(gameObject);
            return;
        }
        Instance = this;
    }

    private void Start()
    {
        if (target != null && player != null)
            target.SetPlayer(player.transform);
        if (target != null)
            target.SetGameManager(this);
        ApplyDifficulty();
    }

    private void Update()
    {
        if (GameOver) return;
        if (player != null && !player.IsAlive)
            OnPlayerDeath();
    }

    private void ApplyDifficulty()
    {
        float mult = Mathf.Pow(difficultyScalePerLevel, currentLevel - 1);
        if (asteroidSpawner != null)
            asteroidSpawner.SetDifficultyMultiplier(mult);
        if (monsterSpawner != null)
            monsterSpawner.SetDifficultyMultiplier(mult);

        float playerSpeedMult = Mathf.Pow(playerSpeedScalePerLevel, currentLevel - 1);
        if (player != null)
            player.SetSpeedMultiplier(playerSpeedMult);

        if (playerShooter != null)
            playerShooter.SetLevel(currentLevel);
    }

    public void OnTargetReached(TargetGoal reachedTarget)
    {
        if (GameOver) return;
        GameOver = true;
        if (!string.IsNullOrEmpty(levelCompleteSceneName) && Application.CanStreamedLevelBeLoaded(levelCompleteSceneName))
            SceneManager.LoadScene(levelCompleteSceneName);
        else
            Debug.Log($"Level {currentLevel} complete! Planets: {PlanetsCollected}");
    }

    public void OnPlayerDeath()
    {
        if (GameOver) return;
        GameOver = true;
        if (!string.IsNullOrEmpty(gameOverSceneName) && Application.CanStreamedLevelBeLoaded(gameOverSceneName))
            SceneManager.LoadScene(gameOverSceneName);
        else
            Debug.Log("Game Over!");
    }

    public void LoadNextLevel()
    {
        currentLevel++;
        // Optionally set target distance for next level:
        if (target != null)
            target.SetDistanceInLightYears(startingLightYears * Mathf.Pow(difficultyScalePerLevel, currentLevel - 1));
        GameOver = false;
        SceneManager.LoadScene(SceneManager.GetActiveScene().buildIndex);
    }

    private void OnDestroy()
    {
        if (Instance == this)
            Instance = null;
    }
}
