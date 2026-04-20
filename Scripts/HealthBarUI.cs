using UnityEngine;
using UnityEngine.UI;

/// <summary>
/// Shows player health as a filled bar. Add to a UI Image (Image Type: Filled, Fill Method: Horizontal).
/// </summary>
public class HealthBarUI : MonoBehaviour
{
    [SerializeField] private Image fillImage;
    [SerializeField] private SpaceshipController player;

    private void Start()
    {
        if (player == null) player = FindFirstObjectByType<SpaceshipController>();
        if (fillImage == null) fillImage = GetComponent<Image>();
    }

    private void Update()
    {
        if (fillImage == null || player == null) return;
        fillImage.fillAmount = player.MaxHealth > 0 ? player.CurrentHealth / player.MaxHealth : 0f;
    }
}
