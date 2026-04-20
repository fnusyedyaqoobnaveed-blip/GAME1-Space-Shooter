using UnityEngine;

/// <summary>
/// Spawns asteroid prefabs at an interval. Increase spawn rate with difficulty.
/// </summary>
public class AsteroidSpawner : MonoBehaviour
{
    [Header("Prefab")]
    [SerializeField] private GameObject asteroidPrefab;

    [Header("Spawn")]
    [SerializeField] private float spawnInterval = 2f;
    [SerializeField] private float minSpeed = 2f;
    [SerializeField] private float maxSpeed = 5f;
    [SerializeField] private Vector2 spawnAreaMin = new Vector2(-10f, -5f);
    [SerializeField] private Vector2 spawnAreaMax = new Vector2(10f, 5f);

    [Header("Difficulty")]
    [SerializeField] private float difficultyMultiplier = 1f;

    private float nextSpawnTime;

    private void Update()
    {
        if (asteroidPrefab == null) return;
        if (Time.time >= nextSpawnTime)
        {
            SpawnOne();
            nextSpawnTime = Time.time + spawnInterval / difficultyMultiplier;
        }
    }

    private void SpawnOne()
    {
        float x = Random.Range(spawnAreaMin.x, spawnAreaMax.x);
        float y = Random.Range(spawnAreaMin.y, spawnAreaMax.y);
        Vector3 pos = new Vector3(x, y, 0f);

        GameObject go = Instantiate(asteroidPrefab, pos, Quaternion.identity);
        var asteroid = go.GetComponent<Asteroid>();
        if (asteroid != null)
        {
            float s = Random.Range(minSpeed, maxSpeed) * difficultyMultiplier;
            asteroid.SetSpeed(s);
            float angle = Random.Range(0f, 360f) * Mathf.Deg2Rad;
            asteroid.SetDirection(new Vector2(Mathf.Cos(angle), Mathf.Sin(angle)));
        }
    }

    public void SetDifficultyMultiplier(float mult)
    {
        difficultyMultiplier = Mathf.Max(0.1f, mult);
    }
}
