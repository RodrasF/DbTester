namespace DbTester.Application.Common;

public class BaseResponse
{
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;

    public static BaseResponse SuccessResponse(string message = "Operation completed successfully")
    {
        return new BaseResponse
        {
            Success = true,
            Message = message
        };
    }

    public static BaseResponse FailureResponse(string message = "Operation failed")
    {
        return new BaseResponse
        {
            Success = false,
            Message = message
        };
    }
}