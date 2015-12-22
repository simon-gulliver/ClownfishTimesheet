using System;
using System.Collections.Generic;

namespace Timesheet.Models
{
    public class Timesheet
    {
        public DateTime when;                   // day of timesheet
        public long timestamp;                  // when last updated
        public List<TimesheetEntry> entries;
    }
    public class TimesheetEntry
    {
        public int  activityId;                 
        public byte timeblock;                  // minutes / 15 (max 48 per day)
    }
}