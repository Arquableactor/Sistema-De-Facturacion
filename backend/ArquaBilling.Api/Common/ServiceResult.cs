namespace ArquaBilling.Api.Common;

public enum ResultStatus
{
    Success,
    NotFound,
    Conflict,
    Validation
}

// Resultado de una operación de service sin payload (ej. Delete).
public class ServiceResult
{
    public ResultStatus Status { get; }
    public string? Error { get; }
    public bool IsSuccess => Status == ResultStatus.Success;

    protected ServiceResult(ResultStatus status, string? error)
    {
        Status = status;
        Error = error;
    }

    public static ServiceResult Success() => new(ResultStatus.Success, null);
    public static ServiceResult NotFound(string error) => new(ResultStatus.NotFound, error);
    public static ServiceResult Conflict(string error) => new(ResultStatus.Conflict, error);
    public static ServiceResult Validation(string error) => new(ResultStatus.Validation, error);
}

// Resultado con payload (ej. Get/Create/Update).
public sealed class ServiceResult<T> : ServiceResult
{
    public T? Value { get; }

    private ServiceResult(ResultStatus status, T? value, string? error)
        : base(status, error)
    {
        Value = value;
    }

    public static ServiceResult<T> Success(T value) => new(ResultStatus.Success, value, null);
    public static new ServiceResult<T> NotFound(string error) => new(ResultStatus.NotFound, default, error);
    public static new ServiceResult<T> Conflict(string error) => new(ResultStatus.Conflict, default, error);
    public static new ServiceResult<T> Validation(string error) => new(ResultStatus.Validation, default, error);
}
