using UnityEngine;

/// <summary>
/// Planet acting as a coin. When player touches (trigger), adds value to player and destroys this.
/// </summary>
public class PlanetCollectible : MonoBehaviour
{
    [SerializeField] private int value = 1;
    [SerializeField] private bool collected;

    public int Value => value;

    public void Collect(SpaceshipController player)
    {
        if (collected || player == null) return;
        collected = true;
        player.AddPlanets(value);
        Destroy(gameObject);
    }

    private void OnTriggerEnter2D(Collider2D other)
    {
        if (collected) return;
        var p = other.GetComponent<SpaceshipController>();
        if (p != null)
            Collect(p);
    }
}
