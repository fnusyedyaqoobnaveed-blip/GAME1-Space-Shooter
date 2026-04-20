using UnityEngine;

/// <summary>
/// Represents the level target. Player must get within reachDistance to complete.
/// Distance in "light years" is used for display and difficulty.
/// </summary>
public class TargetGoal : MonoBehaviour
{
    [Header("Target")]
    [SerializeField] private float distanceInLightYears = 5f;
    [SerializeField] private float reachDistance = 2f;
    [SerializeField] private int targetIndex = 1;

    [Header("Optional")]
    [SerializeField] private Transform player;
    [SerializeField] private GameManager gameManager;

    public float DistanceInLightYears => distanceInLightYears;
    public int TargetIndex => targetIndex;
    public bool Reached { get; private set; }

    public float GetDistanceToPlayer()
    {
        if (player == null) return float.MaxValue;
        return Vector3.Distance(transform.position, player.position);
    }

    public void SetDistanceInLightYears(float ly)
    {
        distanceInLightYears = ly;
    }

    public void SetPlayer(Transform p)
    {
        player = p;
    }

    public void SetGameManager(GameManager gm)
    {
        gameManager = gm;
    }

    private void Update()
    {
        if (Reached || player == null) return;
        if (GetDistanceToPlayer() <= reachDistance)
        {
            Reached = true;
            gameManager?.OnTargetReached(this);
        }
    }

#if UNITY_EDITOR
    private void OnDrawGizmosSelected()
    {
        Gizmos.color = Color.green;
        Gizmos.DrawWireSphere(transform.position, reachDistance);
    }
#endif
}
