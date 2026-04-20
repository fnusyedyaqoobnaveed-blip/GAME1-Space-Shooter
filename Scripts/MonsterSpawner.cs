using UnityEngine;

/// <summary>
/// Spawns monster prefabs. Rate and speed scale with difficulty (level).
/// </summary>
public class MonsterSpawner : MonoBehaviour
{
    [Header("Prefab")]
    [SerializeField] private GameObject monsterPrefab;

    [Header("Spawn")]
    [SerializeField] private float spawnInterval = 4f;
    [SerializeField] private Vector2 spawnAreaMin = new Vector2(8f, -4f);
    [SerializeField] private Vector2 spawnAreaMax = new Vector2(12f, 4f);

    [Header("Difficulty")]
    [SerializeField] private float difficultyMultiplier = 1f;

    private float nextSpawnTime;

    private void Update()
    {
        if (monsterPrefab == null) return;
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

        Instantiate(monsterPrefab, pos, Quaternion.identity);
    }

    public void SetDifficultyMultiplier(float mult)
    {
        difficultyMultiplier = Mathf.Max(0.1f, mult);
    }
}
