using Microsoft.AspNetCore.Mvc.Filters;

namespace CareerApi.Auth;

public class AdminAuthAttribute : ActionFilterAttribute
{
    public override void OnActionExecuting(ActionExecutingContext context)
    {
        var header = context.HttpContext.Request.Headers.Authorization.ToString();
        var token = header.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase)
            ? header["Bearer ".Length..].Trim()
            : null;

        if (!AdminTokenStore.IsValid(token))
        {
            context.Result = new Microsoft.AspNetCore.Mvc.UnauthorizedObjectResult(
                new { error = "Admin session expired or invalid. Please log in again." });
        }
    }
}
