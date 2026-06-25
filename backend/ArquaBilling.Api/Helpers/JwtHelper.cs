using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using ArquaBilling.Api.Entities;
using Microsoft.IdentityModel.Tokens;

namespace ArquaBilling.Api.Helpers;

// Construye y firma el token JWT (HS256). No toca la base de datos.
public class JwtHelper
{
    private readonly IConfiguration _config;

    public JwtHelper(IConfiguration config)
    {
        _config = config;
    }

    public (string Token, DateTime ExpiresAt) GenerateToken(User user)
    {
        var key = _config["Jwt:Key"]
            ?? throw new InvalidOperationException("Falta Jwt:Key (configúrala en user-secrets).");
        var issuer = _config["Jwt:Issuer"];
        var audience = _config["Jwt:Audience"];
        var hours = _config.GetValue<int?>("Jwt:ExpiresHours") ?? 8;

        var expiresAt = DateTime.UtcNow.AddHours(hours);

        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
            new Claim(JwtRegisteredClaimNames.Email, user.Email),
            new Claim(ClaimTypes.Role, user.Role.ToString()),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        };

        var credentials = new SigningCredentials(
            new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key)),
            SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: issuer,
            audience: audience,
            claims: claims,
            expires: expiresAt,
            signingCredentials: credentials);

        return (new JwtSecurityTokenHandler().WriteToken(token), expiresAt);
    }
}
