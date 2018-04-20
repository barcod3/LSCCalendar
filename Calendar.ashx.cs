using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

using System.Web.Script.Serialization;
using System.Xml.Serialization;
using System.ServiceModel.Syndication;
using System.Xml;
using System.Text;
using System.Net;

using Newtonsoft.Json;

namespace LSCAGENDA
{
    /// <summary>
    /// Summary description for Calender
    /// </summary>
    public class Calender : IHttpHandler
    {

        string DateFormat
        {
            get
            {
                return "yyyyMMddTHHmmssZ"; // 20060215T092000Z
            }
        }


        public void ProcessRequest(HttpContext context)
        {
            string format = context.Request.QueryString["format"];
            string ics = context.Request.QueryString["ics"];
            string eventid = context.Request.QueryString["eventid"];

            if (eventid != null)
            {
                using (WebClient wc = new WebClient())
                {
                    string json = wc.DownloadString("http://www.reddit.com/r/LondonSocialClub/comments/" + eventid + ".json");


                    context.Response.Clear();
                    context.Response.ContentType = "application/json";
                    context.Response.Output.Write(json);

                    context.Response.End();
                }
            }

            List<Event> events;
            if (!string.IsNullOrEmpty(context.Request.QueryString["force"]) || context.Cache["Events"] == null)
            {
                events = Event.GetEvents();
                context.Cache.Insert("Events", events);

            }
            else
            {
                events = (List<Event>)context.Cache["Events"];
            }
            
            if (ics != null)
            {
                var ev = events.Single(e => e.URL == ics);

                DateTime startDate = ev.Date;
                DateTime endDate = ev.Date;
                string organizer = "London Social Club";
                string location = "";
                string summary = ev.Title;
                string description = ev.Description;

                context.Response.ContentType = "text/calendar";
                context.Response.AddHeader("Content-disposition", "attachment; filename=appointment.ics");

                context.Response.Write("BEGIN:VCALENDAR");
                context.Response.Write("\nVERSION:2.0");
                context.Response.Write("\nMETHOD:PUBLISH");
                context.Response.Write("\nBEGIN:VEVENT");
                context.Response.Write("\nORGANIZER:MAILTO:" + organizer);
                context.Response.Write("\nDTSTART:" + startDate.ToUniversalTime().ToString(DateFormat));
                context.Response.Write("\nDTEND:" + endDate.ToUniversalTime().ToString(DateFormat));
                context.Response.Write("\nLOCATION:" + location);
                context.Response.Write("\nUID:" + DateTime.Now.ToUniversalTime().ToString(DateFormat) + "@lsccalendar.azurewebsite.net");
                context.Response.Write("\nDTSTAMP:" + DateTime.Now.ToUniversalTime().ToString(DateFormat));
                context.Response.Write("\nSUMMARY:" + summary);
                context.Response.Write("\nDESCRIPTION:" + description);
                context.Response.Write("\nPRIORITY:5");
                context.Response.Write("\nCLASS:PUBLIC");
                context.Response.Write("\nEND:VEVENT");
                context.Response.Write("\nEND:VCALENDAR");
                context.Response.End();

            }
            if (format == "json")
            {
                JavaScriptSerializer serializer = new JavaScriptSerializer();
                string eventsstring = JsonConvert.SerializeObject(events);
                context.Response.Write(eventsstring);
                context.Response.ContentType = "application/json";
                
            }
            else if (format == "rss")
            {

                List<SyndicationItem> feedItems = new List<SyndicationItem>(); 

                foreach (var ev in events)
                {
                    if (ev.Date.Date >= DateTime.Now.Date)
                    {
                        SyndicationItem item = new SyndicationItem();
                        item.Title = new TextSyndicationContent("[" + ev.Date.ToShortDateString() + "] " + ev.Title);
                        item.PublishDate = DateTime.Now;
                        item.Links.Add(SyndicationLink.CreateAlternateLink(new Uri("http://reddit.com" + ev.URL)));
                        item.Id = ev.URL.Remove(0);
                        item.Authors.Add(new SyndicationPerson(ev.Organiser));
                        item.Summary = new TextSyndicationContent(ev.Description);
                        feedItems.Add(item);
                    }

                }
                var feed = new SyndicationFeed(feedItems);
                feed.Description = new TextSyndicationContent("Upcoming events from http://www.reddit.com/r/londonsocialclub");
                feed.Title = new TextSyndicationContent("LSC Calendar");
                var settings = new XmlWriterSettings
                {
                    CheckCharacters = true,
                    CloseOutput = true,
                    ConformanceLevel = ConformanceLevel.Document,
                    Encoding = Encoding.UTF8,
                    Indent =  true,
                    IndentChars = "    ",
                    NamespaceHandling = NamespaceHandling.OmitDuplicates,
                    NewLineChars = "\r\n",
                    NewLineHandling = NewLineHandling.Replace,
                    NewLineOnAttributes = true,
                    OmitXmlDeclaration = false
                };


                var buffer = new StringBuilder();
                var output = string.Empty;
                var formatter = new Rss20FeedFormatter(feed);
                using(var writer = XmlWriter.Create(context.Response.OutputStream,settings))
                {
                    formatter.WriteTo(writer);
                    writer.Flush();
                    writer.Close();


                }

                

                context.Response.ContentType = "application/rss+xml";
            }
            else
            {
                XmlSerializer xs = new XmlSerializer(typeof(List<Event>));
                xs.Serialize(context.Response.OutputStream, events);
                context.Response.ContentType = "text/xml";
            }
            
            


        }

        public bool IsReusable
        {
            get
            {
                return false;
            }
        }
    }
}
