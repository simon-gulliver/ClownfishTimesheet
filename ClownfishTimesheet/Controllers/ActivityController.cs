using System.Collections.Generic;
using System.Linq;
using System.Web.Http;
using Newtonsoft.Json;
using Timesheet.Models;
using Timesheet.Helpers;

namespace Timesheet.Controllers
{
    [AjaxOnlyWebApi]
    public class ActivityController : ApiController
    {
       // GET api/<controller>
        public IEnumerable<Activity> Get()
        {
            return Synchroniser.activities;
        }

        // GET api/<controller>/5
        public Activity Get(long id)
        {
            return Synchroniser.activities.FirstOrDefault(a => a.id == id);
        }

        // POST api/<controller>
        public void Post([FromBody]string jsonValue)
        {
            var activity = JsonConvert.DeserializeObject<Activity>(jsonValue);
            // add in sorted order
            var sortPoint = Synchroniser.activities
               .Select((value, index) => new { value, index })
               .FirstOrDefault(x => string.Compare(x.value.name, activity.name) > 0);

            if (sortPoint == null)
            {
                  Synchroniser.activities.Add(activity);
            }
            else
            {
               Synchroniser.activities.Insert(sortPoint.index, activity);
            }
        }

        // DELETE api/<controller>/5
        public void Delete(long id)
        {
            Synchroniser.activities.RemoveAll(x => x.id == id);
        }
    }
}