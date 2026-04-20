using UnityEngine;

/// <summary>
/// Player spaceship: movement (WASD), health, tricks (barrel roll, boost), and planet coins.
/// Speed scales with level via SetSpeedMultiplier. Invincibility during roll and after hit.
/// </summary>
public class SpaceshipController : MonoBehaviour
{
    [Header("Movement")]
    [SerializeField] private float moveSpeed = 5f;
    [SerializeField] private bool useRigidbody = true;
    [Tooltip("Speed multiplier applied from GameManager by level (1 = base speed).")]
    [SerializeField] private float speedMultiplier = 1f;

    [Header("Health")]
    [SerializeField] private float maxHealth = 100f;
    [SerializeField] private float currentHealth;
    [SerializeField] private float invincibilityDurationAfterHit = 1.5f;
    private float invincibleUntil;

    [Header("Tricks")]
    [SerializeField] private float barrelRollDuration = 0.5f;
    [SerializeField] private float barrelRollCooldown = 2f;
    [SerializeField] private float boostSpeedMultiplier = 2f;
    [SerializeField] private float boostDuration = 0.4f;
    [SerializeField] private float boostCooldown = 1.5f;
    private float barrelRollEndTime = -999f;
    private float nextBarrelRollTime = -999f;
    private float boostEndTime = -999f;
    private float nextBoostTime = -999f;

    [Header("Coins & Combo")]
    [SerializeField] private int planetsCollected = 0;
    [SerializeField] private int currentCombo = 0;
    [SerializeField] private float comboTimeout = 2f;
    [Tooltip("Every N kills in a combo grants 1 bonus planet (0 = disabled).")]
    [SerializeField] private int comboKillsForBonusPlanet = 3;
    private float lastKillTime;

    private Rigidbody2D rb2D;
    private Rigidbody rb3D;
    private Vector2 input;
    private float rollRotation; // for visual spin during barrel roll

    public float CurrentHealth => currentHealth;
    public float MaxHealth => maxHealth;
    public int PlanetsCollected => planetsCollected;
    public int CurrentCombo => currentCombo;
    public bool IsAlive => currentHealth > 0f;
    public bool IsInvincible => Time.time < invincibleUntil || IsBarrelRolling;
    public bool IsBarrelRolling => Time.time < barrelRollEndTime;
    public bool IsBoosting => Time.time < boostEndTime;
    public bool CanBarrelRoll => Time.time >= nextBarrelRollTime && !IsBarrelRolling;
    public bool CanBoost => Time.time >= nextBoostTime && !IsBoosting;
    public float BarrelRollCooldownRemaining => Mathf.Max(0f, nextBarrelRollTime - Time.time);
    public float BoostCooldownRemaining => Mathf.Max(0f, nextBoostTime - Time.time);

    private void Awake()
    {
        currentHealth = maxHealth;
        rb2D = GetComponent<Rigidbody2D>();
        rb3D = GetComponent<Rigidbody>();
    }

    private void Update()
    {
        input.x = Input.GetAxisRaw("Horizontal");
        input.y = Input.GetAxisRaw("Vertical");
        input = input.normalized;

        // Trick inputs
        if (CanBarrelRoll && (Input.GetKeyDown(KeyCode.Q) || Input.GetKeyDown(KeyCode.E)))
        {
            barrelRollEndTime = Time.time + barrelRollDuration;
            nextBarrelRollTime = Time.time + barrelRollDuration + barrelRollCooldown;
            rollRotation = 0f;
        }
        if (CanBoost && (Input.GetKey(KeyCode.LeftShift) || Input.GetKey(KeyCode.RightShift)))
        {
            boostEndTime = Time.time + boostDuration;
            nextBoostTime = Time.time + boostDuration + boostCooldown;
        }

        // Combo timeout
        if (currentCombo > 0 && Time.time - lastKillTime > comboTimeout)
            currentCombo = 0;

        // Barrel roll visual (rotate child or self)
        if (IsBarrelRolling)
        {
            float t = 1f - (barrelRollEndTime - Time.time) / barrelRollDuration;
            rollRotation = Mathf.Lerp(0f, 360f, t);
            transform.rotation = Quaternion.Euler(0, 0, rollRotation);
        }
        else
            transform.rotation = Quaternion.identity;
    }

    private void FixedUpdate()
    {
        if (!IsAlive) return;

        float speed = moveSpeed * speedMultiplier;
        if (IsBoosting)
            speed *= boostSpeedMultiplier;

        if (useRigidbody && rb2D != null)
            rb2D.velocity = IsBarrelRolling ? Vector2.zero : input * speed;
        else if (useRigidbody && rb3D != null)
            rb3D.velocity = IsBarrelRolling ? Vector3.zero : new Vector3(input.x, 0f, input.y) * speed;
        else if (!IsBarrelRolling)
            transform.position += (Vector3)(input * speed * Time.deltaTime);
    }

    public void SetSpeedMultiplier(float mult)
    {
        speedMultiplier = Mathf.Max(0.1f, mult);
    }

    public void TakeDamage(float amount)
    {
        if (!IsAlive || IsInvincible) return;
        currentHealth = Mathf.Max(0f, currentHealth - amount);
        invincibleUntil = Time.time + invincibilityDurationAfterHit;
        currentCombo = 0;
        if (currentHealth <= 0f)
            OnDeath();
    }

    public void Heal(float amount)
    {
        currentHealth = Mathf.Min(maxHealth, currentHealth + amount);
    }

    public void AddPlanets(int count)
    {
        planetsCollected += count;
    }

    public void AddKillToCombo()
    {
        currentCombo++;
        lastKillTime = Time.time;
        if (comboKillsForBonusPlanet > 0 && currentCombo % comboKillsForBonusPlanet == 0)
            planetsCollected++;
    }

    private void OnDeath()
    {
        Debug.Log("Spaceship destroyed!");
    }

    private void OnCollisionEnter2D(Collision2D other)
    {
        var asteroid = other.gameObject.GetComponent<Asteroid>();
        if (asteroid != null)
            TakeDamage(asteroid.Damage);
    }

    private void OnTriggerEnter2D(Collider2D other)
    {
        var planet = other.gameObject.GetComponent<PlanetCollectible>();
        if (planet != null)
            planet.Collect(this);
    }
}
