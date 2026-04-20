using UnityEngine;

/// <summary>
/// Handles player shooting: fire rate, bullet prefab, direction. Damage scales with level.
/// Attach to same GameObject as SpaceshipController or as child.
/// </summary>
public class PlayerShooter : MonoBehaviour
{
    [Header("Prefab")]
    [SerializeField] private GameObject bulletPrefab;
    [SerializeField] private Transform firePoint; // optional; if null uses transform.position + right

    [Header("Shooting")]
    [SerializeField] private float fireRate = 0.2f;
    [SerializeField] private float baseDamage = 12f;
    [SerializeField] private float damagePerLevel = 2f;
    [SerializeField] private Vector2 fireDirection = Vector2.right;
    [SerializeField] private bool aimTowardTarget = false;
    [SerializeField] private Transform targetToAimAt;

    [Header("Spread (higher levels)")]
    [SerializeField] private int bulletsPerShot = 1;
    [SerializeField] private float spreadAngle = 0f; // degrees between bullets
    [SerializeField] private int levelForTripleShot = 5;

    private float nextFireTime;
    private int currentLevel = 1;

    private void Start()
    {
        if (GameManager.Instance != null)
            currentLevel = GameManager.Instance.CurrentLevel;
    }

    public void SetLevel(int level)
    {
        currentLevel = Mathf.Max(1, level);
    }

    private void Update()
    {
        if (bulletPrefab == null) return;
        if (Input.GetButton("Fire1") || Input.GetKey(KeyCode.Space))
        {
            if (Time.time >= nextFireTime)
                Fire();
        }
    }

    private void Fire()
    {
        nextFireTime = Time.time + fireRate;

        Vector2 dir = fireDirection;
        if (aimTowardTarget && targetToAimAt != null)
            dir = (targetToAimAt.position - (firePoint != null ? firePoint.position : transform.position)).normalized;

        int count = currentLevel >= levelForTripleShot ? 3 : bulletsPerShot;
        float totalSpread = (count - 1) * spreadAngle * Mathf.Deg2Rad;
        float startAngle = -totalSpread / 2f;

        for (int i = 0; i < count; i++)
        {
            float angle = startAngle + i * spreadAngle * Mathf.Deg2Rad;
            Vector2 bulletDir = RotateVector(dir, angle);
            SpawnBullet(bulletDir);
        }
    }

    private void SpawnBullet(Vector2 dir)
    {
        Vector3 pos = firePoint != null ? firePoint.position : transform.position + (Vector3)fireDirection.normalized * 0.5f;
        GameObject go = Instantiate(bulletPrefab, pos, Quaternion.identity);
        float angle = Mathf.Atan2(dir.y, dir.x) * Mathf.Rad2Deg;
        go.transform.rotation = Quaternion.Euler(0, 0, angle);

        var bullet = go.GetComponent<Bullet>();
        if (bullet != null)
        {
            bullet.SetDirection(dir);
            bullet.SetDamage(baseDamage + (currentLevel - 1) * damagePerLevel);
        }
    }

    private static Vector2 RotateVector(Vector2 v, float rad)
    {
        float c = Mathf.Cos(rad), s = Mathf.Sin(rad);
        return new Vector2(v.x * c - v.y * s, v.x * s + v.y * c);
    }
}
