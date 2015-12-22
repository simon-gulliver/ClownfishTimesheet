using System;
using System.Net;
using System.Net.Http;
using System.Web.Http;

namespace Timesheet.Controllers
{
    [AjaxOnlyWebApi]
    public class TimesheetController : ApiController
    {
        // only GET is supported for this API (to load an timesheet which is uncached at the client)
        public Timesheet.Models.Timesheet Get(string userKey, DateTime when)
        {
            // userId is unused, but we would need this in the real world
            int userId = AuthenticationController.GetAuthorisedWebApiUserId(userKey);

            return new Timesheet.Models.Timesheet ();
        }

    }
}

