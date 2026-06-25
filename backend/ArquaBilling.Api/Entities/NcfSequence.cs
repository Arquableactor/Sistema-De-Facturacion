namespace ArquaBilling.Api.Entities;

public class NcfSequence
{
    public int Id { get; set; }
    public string Type { get; set; } = null!; // Prefijo NCF, ej. "B01"
    public int CurrentNumber { get; set; }
    public int MaxNumber { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
}
