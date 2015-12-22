using System;
using System.Linq;
using System.Net;
using System.Net.Http;

namespace Timesheet
{
    /// <summary>
    /// Here we create the [AjaxOnlyWebApi] attribute
    /// </summary>
    [AttributeUsage(AttributeTargets.Class | AttributeTargets.Method)]
    public sealed class AjaxOnlyWebApiAttribute : System.Web.Http.Filters.ActionFilterAttribute
    {
        public override void OnActionExecuting(System.Web.Http.Controllers.HttpActionContext actionContext)
        {
            var request = actionContext.Request;
            var headers = request.Headers;
            if (!headers.Contains("X-Requested-With") || headers.GetValues("X-Requested-With").FirstOrDefault() != "XMLHttpRequest")
                actionContext.Response = request.CreateResponse(HttpStatusCode.NotFound);
        }
    }

}