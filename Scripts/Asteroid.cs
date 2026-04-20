using UnityEngine;

/// <summary>
/// Asteroid obstacle: moves in a direction and damages player on contact.
/// Use with 2D or 3D; adjust movement and collision to match.
/// </summary>
public class Asteroid : MonoBehaviour
{
    [Header("Movement")]
    [SerializeField] private float speed = 3f;
    [SerializeField] private Vector2 moveDirection = Vector2.left;

    [Header("Damage")]
    [SerializeField] private float damage = 10f;

    public float Damage => damage;
    public float Speed => speed;

    public void SetDirection(Vector2 dir)
    {
        moveDirection = dir.normalized;
    }

    public void SetSpeed(float s)
    {
        speed = s;
    }

    private void Update()
    {
        transform.position += (Vector3)(moveDirection * speed * Time.deltaTime);
    }

    // Damage is applied in SpaceshipController.OnCollisionEnter2D by reading this.Damage
    // Optionally destroy asteroid on hit:
    private void OnCollisionEnter2D(Collision2D other)
    {
        if (other.gameObject.GetComponent<SpaceshipController>() != null)
            Destroy(gameObject);
    }
}
