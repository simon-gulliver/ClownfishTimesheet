using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using Newtonsoft.Json.Linq;
using Timesheet.Helpers;

namespace Timesheet.Controllers
{
    [AjaxOnlyWebApi]
    public class SynchroniseController : ApiController
    {
        // only POST is supported for this API
        public Timesheet.Models.Synchronise Post([FromBody]JObject json)
        {
            return Synchroniser.Synchronise (json.ToObject<Timesheet.Models.Synchronise>());
        }


    }
}