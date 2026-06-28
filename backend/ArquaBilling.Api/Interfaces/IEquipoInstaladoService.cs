using ArquaBilling.Api.Common;
using ArquaBilling.Api.DTOs.EquiposInstalados;

namespace ArquaBilling.Api.Interfaces;

public interface IEquipoInstaladoService
{
    // Registra un equipo físico instalado en un proyecto (serial único global).
    Task<ServiceResult<EquipoInstaladoResponse>> CreateAsync(int projectId, EquipoInstaladoCreateRequest request);

    // Equipos de un proyecto. NotFound si el proyecto no existe.
    Task<ServiceResult<IReadOnlyList<EquipoInstaladoResponse>>> GetByProjectAsync(int projectId);

    // Equipos de un cliente (a través de todos sus proyectos).
    Task<IReadOnlyList<EquipoInstaladoResponse>> GetByClientAsync(int clientId);
}
