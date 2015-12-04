using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;
using System.IO;

namespace LSCAGENDA
{
    public partial class _Default : System.Web.UI.Page
    {
        List<Event> events;
        protected void Page_Load(object sender, EventArgs e)
        {
            if (Session["LoggedIn"] != null)
            {
                pnLogin.Visible = false;
                pnEdit.Visible = true;
            }
            if (!IsPostBack)
            {
                if (Session["events"] == null)
                {
                    events = Event.GetEvents();
                    Session["events"] = events;
                }
                else
                {
                    events = (List<Event>)Session["events"];
                }
                dlEvents.DataSource = events;
                dlEvents.DataBind();

                tbCode.Text = Event.Generate(events);
                lbSize.Text = tbCode.Text.Length + " Characters";

                
            }
            else
            {
                events = (List<Event>)Session["events"];
            }
        }

        protected void dlEvents_EditCommand(object source, DataListCommandEventArgs e)
        {
            dlEvents.EditItemIndex = e.Item.ItemIndex;
            events = (List<Event>)Session["events"];
            dlEvents.DataSource = events;
            dlEvents.DataBind();
        }



        protected void dlEvents_UpdateCommand(object source, DataListCommandEventArgs e)
        {
            dlEvents.EditItemIndex = -1;
            events = (List<Event>)Session["events"];
            var tbTitle = (TextBox)(e.Item.FindControl("tbTitle"));
            var cbFeatured = (CheckBox)(e.Item.FindControl("cbFeatured"));
            var cbDeleted = (CheckBox)(e.Item.FindControl("cbDeleted"));
            var ev = (Event)events[e.Item.ItemIndex];

            ev.Title = tbTitle.Text;
            if (ev.IsDeleted != cbDeleted.Checked)
            {
                ev.IsDeleted = cbDeleted.Checked;
                List<Event> deleted = new List<Event>();
                foreach (var dev in events)
                {
                    if (dev.IsDeleted)
                    {
                        deleted.Add(dev);
                    }
                }
                Event.SaveDeleted(deleted);
            }
            

            if (!ev.IsDeleted && cbFeatured.Checked)
            {
                var de = from x in events
                         where x.Date == ev.Date
                         select x;
                foreach (var x in de.ToList())
                {
                    x.Featured = false;
                }
                ev.Featured = true;
                events = Event.Sort(events);
            }
            Session["events"] = events;
            dlEvents.DataSource = events;
            dlEvents.DataBind();
            tbCode.Text = Event.Generate(events);
            lbSize.Text = tbCode.Text.Length + " Characters";
            
        }

        protected void tbCode_TextChanged(object sender, EventArgs e)
        {
            
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
            
            if (e.Item.FindControl("linktitle") != null)
            {
                LinkButton lt = (LinkButton)e.Item.FindControl("linktitle");
                if (events[e.Item.ItemIndex].IsDeleted)
                {
                    lt.Font.Strikeout = true;
                }
                if (events[e.Item.ItemIndex].IsBold)
                {
                
                        lt.Font.Bold = true;
                }

            }

            if (events[e.Item.ItemIndex].Date == DateTime.Now.Date)
            {
                e.Item.BackColor = System.Drawing.Color.FromArgb(163,182,211);
            }
            else if (rowalt)
            {
                e.Item.BackColor = System.Drawing.Color.FromArgb(240,240,240);
            }
            else
            {
                e.Item.BackColor = System.Drawing.Color.White;
            }
        }

        protected void btUpdate_Click(object sender, EventArgs e)
        {
            Cache.Remove("Events");
            var settings = new Properties.Settings();
            bool r = Event.UpdateReddit(settings.AdminUser, settings.AdminPassword,tbCode.Text);
            if (r)
            {
                ltSuccess.Text = "Calendar Succesfully Updated";
            }
        }

        protected void LinkButton1_Click(object sender, EventArgs e)
        {

        }

        protected void btLogin_Click(object sender, EventArgs e)
        {
            bool r = Event.AuthUser(tbUserName.Text, tbPassword.Text);
            if (r)
            {
                pnLogin.Visible = false;
                pnEdit.Visible = true;
                Session["LoggedIn"] = true;
            }
            else
            {
                lbLogin.Text = "Either the login failed, or the user is not a moderator";
            }

        }
    }
}
