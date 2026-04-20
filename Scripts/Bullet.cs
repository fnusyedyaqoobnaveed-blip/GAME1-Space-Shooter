using UnityEngine;

/// <summary>
/// Player bullet: moves forward, damages Monster (and optionally Asteroid), then destroys.
/// </summary>
public class Bullet : MonoBehaviour
{
    [SerializeField] private float speed = 12f;
    [SerializeField] private float damage = 15f;
    [SerializeField] private float lifetime = 3f;
    [SerializeField] private bool destroyAsteroids = false;

    private Vector2 direction = Vector2.right;
    private float spawnTime;

    public float Damage => damage;

    public void SetDirection(Vector2 dir)
    {
        direction = dir.normalized;
    }

    public void SetSpeed(float s) => speed = s;
    public void SetDamage(float d) => damage = d;

    private void Start()
    {
        spawnTime = Time.time;
    }

    private void Update()
    {
        transform.position += (Vector3)(direction * speed * Time.deltaTime);
        if (Time.time - spawnTime > lifetime)
            Destroy(gameObject);
    }

    private void OnTriggerEnter2D(Collider2D other)
    {
        var monster = other.GetComponent<Monster>();
        if (monster != null && monster.IsAlive)
        {
            monster.TakeDamage(damage);
            Destroy(gameObject);
            return;
        }

        if (destroyAsteroids)
        {
            var asteroid = other.GetComponent<Asteroid>();
            if (asteroid != null)
            {
                Destroy(asteroid.gameObject);
                Destroy(gameObject);
            }
        }
    }
}
