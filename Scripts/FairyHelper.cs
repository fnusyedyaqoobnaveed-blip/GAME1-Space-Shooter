using UnityEngine;

/// <summary>
/// Fairy helper: follows player and can guide toward target or provide other help.
/// </summary>
public class FairyHelper : MonoBehaviour
{
    public enum HelpMode { Guide, Shield, Heal }

    [Header("References")]
    [SerializeField] private Transform player;
    [SerializeField] private Transform target;

    [Header("Follow")]
    [SerializeField] private float followDistance = 2f;
    [SerializeField] private float followSpeed = 4f;

    [Header("Help")]
    [SerializeField] private HelpMode helpMode = HelpMode.Guide;
    [SerializeField] private float healAmountPerSecond = 2f;
    [SerializeField] private float healRadius = 3f;

    private void Update()
    {
        if (player == null) return;

        Vector3 desiredPos = player.position + (target != null && helpMode == HelpMode.Guide
            ? (target.position - player.position).normalized * followDistance
            : Vector3.up * followDistance);

        transform.position = Vector3.Lerp(transform.position, desiredPos, followSpeed * Time.deltaTime);

        if (helpMode == HelpMode.Heal)
        {
            float dist = Vector3.Distance(transform.position, player.position);
            if (dist <= healRadius)
            {
                var sc = player.GetComponent<SpaceshipController>();
                if (sc != null && sc.IsAlive)
                    sc.Heal(healAmountPerSecond * Time.deltaTime);
            }
        }
    }

    public void SetPlayer(Transform p) => player = p;
    public void SetTarget(Transform t) => target = t;
    public void SetHelpMode(HelpMode mode) => helpMode = mode;
}
