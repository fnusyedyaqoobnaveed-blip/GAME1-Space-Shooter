using UnityEngine;
using UnityEngine.UI;

/// <summary>
/// Updates distance, planets, combo, and trick cooldowns on UI.
/// </summary>
public class GameplayUI : MonoBehaviour
{
    [Header("References")]
    [SerializeField] private GameManager gameManager;
    [SerializeField] private TargetGoal target;
    [SerializeField] private SpaceshipController player;

    [Header("UI Text")]
    [SerializeField] private Text distanceText;
    [SerializeField] private Text planetsText;
    [SerializeField] private Text comboText;
    [SerializeField] private Text tricksText;

    private void Start()
    {
        if (gameManager == null) gameManager = GameManager.Instance;
        if (target == null && gameManager != null)
            target = FindFirstObjectByType<TargetGoal>();
        if (player == null)
            player = FindFirstObjectByType<SpaceshipController>();
    }

    private void Update()
    {
        if (gameManager == null) return;

        string distStr = target != null
            ? $"Target {target.TargetIndex} — {target.GetDistanceToPlayer():F1} ly"
            : "—";
        if (distanceText != null) distanceText.text = distStr;

        if (planetsText != null) planetsText.text = $"Planets: {gameManager.PlanetsCollected}";

        if (comboText != null && player != null)
            comboText.text = player.CurrentCombo > 0 ? $"Combo x{player.CurrentCombo}" : "";

        if (tricksText != null && player != null)
        {
            float roll = player.BarrelRollCooldownRemaining;
            float boost = player.BoostCooldownRemaining;
            string tricks = "";
            if (roll > 0.01f) tricks += $"Roll: {roll:F1}s ";
            if (boost > 0.01f) tricks += $"Boost: {boost:F1}s";
            tricksText.text = tricks.Trim();
        }
    }
}
