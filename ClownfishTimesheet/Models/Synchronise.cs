namespace Timesheet.Models
{
    public class Synchronise
    {
        public string userKey;
        public long lastServerSyncTime;
        public Timesheet [] timesheets;
        public Activity  [] activities; 
    }
}