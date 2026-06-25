namespace ArquaBilling.Api.DTOs.Auth;

public record LoginResponse(string Token, string Email, string Role, DateTime ExpiresAt);
