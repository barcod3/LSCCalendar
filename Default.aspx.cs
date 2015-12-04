using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;

namespace LSCAGENDA
{
    public partial class Default : System.Web.UI.Page
    {
        List<Event> events;
        protected void Page_Load(object sender, EventArgs e)
        {
            try
            {
                if (Session["newevents"] == null)
                {
                    events = Event.GetNewEvents();
                    Session["newevents"] = events;
                }
                else
                {
                    events = (List<Event>)Session["newevents"];
                }
                dlEvents.DataSource = events;
                dlEvents.DataBind();
                if (events.Count == 0)
                {
                    btUpdate.Enabled = false;
                    ltMessage.Text = "No new events";
                }
                else
                {
                    btUpdate.Enabled = true;
                }
            }
            catch (Exception ex)
            {
                ltMessage.Text = "Error getting events: " + ex.Message;
            }

        }
        DateTime rowdate = DateTime.MinValue;
        bool rowalt = false;
        protected void dlEvents_ItemDataBound(object sender, DataListItemEventArgs e)
        {
            if (events[e.Item.ItemIndex].Date != rowdate)
            {
                rowalt = !rowalt;
                rowdate = events[e.Item.ItemIndex].Date;
            }
            if (rowalt)
            {
                e.Item.BackColor = System.Drawing.Color.FromArgb(240, 240, 240);
            }
            else
            {
                e.Item.BackColor = System.Drawing.Color.White;
            }
        }

        protected void btUpdate_Click(object sender, EventArgs e)
        {
            Cache.Remove("Events");
            try
            {
                var evs = Event.GetEvents();
                string cal = Event.Generate(evs);
                var settings = new Properties.Settings();
                Event.UpdateReddit(settings.AdminUser, settings.AdminPassword, cal);
                ltMessage.Text = "Success";
                Session["newevents"] = null;
                btUpdate.Enabled = false;

            }
            catch (Exception ex)
            {
                ltMessage.Text = "Error updating calendar: " + ex.Message;
            }
        }
    }
}
