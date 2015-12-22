using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Timesheet.Models
{
    public class Activity
    {
        public long id;         // when created
        public string name;
        public string colour;
        public long deleted;    // when deleted
    }
}