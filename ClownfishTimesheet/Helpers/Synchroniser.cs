using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using Timesheet.Controllers;
using Timesheet.Models;

namespace Timesheet.Helpers
{
    public class Synchroniser
    {
        #region Dummy Data  (would normally get this from a database)

        public static long lastServerSyncTime = DateTime.Now.Ticks;

        public static List<Timesheet.Models.Timesheet> timesheets = new List<Timesheet.Models.Timesheet>()
        {
            new Timesheet.Models.Timesheet () {when=DateTime.Today, timestamp=1, entries = new List<Timesheet.Models.TimesheetEntry> ()  {
                new Timesheet.Models.TimesheetEntry () {activityId=1, timeblock = 24},
                new Timesheet.Models.TimesheetEntry () {activityId=2, timeblock = 25}}},
            new Timesheet.Models.Timesheet () {when=DateTime.Today.AddDays(-1), timestamp=1, entries = new List<Timesheet.Models.TimesheetEntry> ()  {
                new Timesheet.Models.TimesheetEntry () {activityId=4, timeblock = 20}}}
        };

        public static List<Activity> activities = new List<Activity>()
        {
            new Activity () {id=4,name="Laze around",colour="#ff0000",deleted=0},    // red
            new Activity () {id=2,name="Sleep",colour="#ee82ee",deleted=0},          // violet
            new Activity () {id=1,name="Work",colour="#ffff00",deleted=0}            // yellow
        };
        #endregion




        public static Timesheet.Models.Synchronise Synchronise(Timesheet.Models.Synchronise sync)
        {
            // userId is unused, but we would need this in the real world
            int userId = AuthenticationController.GetAuthorisedWebApiUserId(sync.userKey);

            var now = DateTime.Now.Ticks;

            // first update changes from client (allowing server to decide whether this is the latest update)
            var newactivities = UpdateActivities(sync.lastServerSyncTime);
            var newsheets = UpdateTimesheets(sync.timesheets.ToList(), sync.lastServerSyncTime, now);

            Debug.WriteLine("---------------------------------");
            Debug.WriteLine(string.Format("Last sync = {0}", sync.lastServerSyncTime));
            foreach (var timesheet in sync.timesheets)
                Debug.WriteLine(string.Format("Sync timesheet from client - {0}", timesheet.when.ToShortDateString()));
            foreach (var activity in newactivities)
                Debug.WriteLine(string.Format("Sync activity to client - {0}", activity.name));
            foreach (var timesheet in newsheets)
                Debug.WriteLine(string.Format("Sync timesheet to client - {0}", timesheet.when.ToShortDateString()));

            return new Timesheet.Models.Synchronise
            {
                activities = newactivities,
                timesheets = newsheets,
                lastServerSyncTime = now
            };

        }

        // simple one-way sync (only server can update activities)
        private static Models.Activity[] UpdateActivities(long lastServerSyncTime)
        {
            return activities.Where(x => x.id > lastServerSyncTime).ToArray();
        }

        // two-way sync - multiple clients may have synced
        private static Models.Timesheet[] UpdateTimesheets(List<Timesheet.Models.Timesheet> changedTimesheets, long lastServerSyncTime, long now)
        {
            var syncBackToClient = timesheets.Where(e =>
                e.timestamp > lastServerSyncTime).ToList();

            foreach (var timesheet in changedTimesheets)
            {
                var race = syncBackToClient.SingleOrDefault(t => t.when == timesheet.when);
                if (race != null && race.timestamp < timesheet.timestamp)
                    syncBackToClient.Remove(race);
                else
                {
                    timesheets.RemoveAll(t => t.when == timesheet.when);
                    timesheets.Add(timesheet);
                }
            }

            return syncBackToClient.ToArray();
        }
    }
}