using UnityEngine;

/// <summary>
/// Enemy monster: has health, damages player on contact, can be killed.
/// Spawn like asteroids; player can shoot or ram to reduce health.
/// </summary>
public class Monster : MonoBehaviour
{
    [Header("Stats")]
    [SerializeField] private float maxHealth = 30f;
    [SerializeField] private float damageToPlayer = 15f;
    [SerializeField] private float moveSpeed = 2f;
    [SerializeField] private int planetDropCount = 2;
    [SerializeField] private float healthScalePerLevel = 1.15f;

    [Header("Prefabs")]
    [SerializeField] private GameObject planetCoinPrefab;

    private float currentHealth;
    private Transform playerTarget;

    public bool IsAlive => currentHealth > 0f;

    private void Start()
    {
        int level = GameManager.Instance != null ? GameManager.Instance.CurrentLevel : 1;
        float levelMult = Mathf.Pow(healthScalePerLevel, level - 1);
        currentHealth = maxHealth * levelMult;
        float speedMult = Mathf.Pow(1.1f, level - 1);
        moveSpeed *= speedMult;
        var player = FindFirstObjectByType<SpaceshipController>();
        if (player != null)
            playerTarget = player.transform;
    }

    private void Update()
    {
        if (!IsAlive) return;
        if (playerTarget != null)
        {
            Vector3 dir = (playerTarget.position - transform.position).normalized;
            transform.position += dir * moveSpeed * Time.deltaTime;
        }
    }

    public void TakeDamage(float amount)
    {
        currentHealth = Mathf.Max(0f, currentHealth - amount);
        if (currentHealth <= 0f)
            Die();
    }

    private void Die()
    {
        var player = FindFirstObjectByType<SpaceshipController>();
        if (player != null)
            player.AddKillToCombo();
        if (planetCoinPrefab != null && planetDropCount > 0)
        {
            for (int i = 0; i < planetDropCount; i++)
            {
                Vector3 offset = Random.insideUnitCircle * 1.5f;
                Instantiate(planetCoinPrefab, transform.position + offset, Quaternion.identity);
            }
        }
        Destroy(gameObject);
    }

    private void OnCollisionEnter2D(Collision2D other)
    {
        var sc = other.gameObject.GetComponent<SpaceshipController>();
        if (sc != null && sc.IsAlive)
        {
            sc.TakeDamage(damageToPlayer);
        }
    }

    // Call this from player bullet script if you add shooting:
    // other.GetComponent<Monster>()?.TakeDamage(bulletDamage);
}
