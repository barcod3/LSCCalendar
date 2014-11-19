using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

using System.Net;
using System.Xml;
using System.IO;
using System.Globalization;
using System.Collections.Specialized;
using System.Text;
using System.Xml.Serialization;

using System.Web.Script.Serialization;

using Newtonsoft.Json.Linq;

namespace LSCAGENDA
{
    [Serializable]
    public class Event
    {
        public string Title { get; set; }
        public DateTime Date { get; set; }
        public string URL { get; set; }
        public bool IsNew { get; set; }
        public bool IsDeleted { get; set; }
        public bool Featured { get; set; }
        public bool IsBold { get; set; }
        public string Description { get; set; }
        public string Organiser { get; set; }
        public string DisplayDate 
        {
            get
            {
                return TimeTill(this.Date);
            }
        }


        public string Status
        {
            get
            {
                if (IsDeleted)
                    return "Deleted";
                else if (IsNew)
                    return "New";
                else if (Featured)
                    return "Featured";
                else
                    return "";

            }
        }
        public static List<Event> GetNewEvents()
        {
            var events = GetEvents();
            var evs = from e in events
                      where e.IsNew
                      && e.IsDeleted == false
                      select e;
            events = evs.ToList();
            return events;
        }

        public static List<Event> GetDeleted()
        {
            var Deleted = new List<Event>();
            if (File.Exists(HttpContext.Current.Server.MapPath("Deleted.txt")))
            {
                using (FileStream str = new FileStream(HttpContext.Current.Server.MapPath("Deleted.txt"), FileMode.Open))
                {
                    XmlSerializer xs = new XmlSerializer(typeof(List<Event>));
                    Deleted = (List<Event>)xs.Deserialize(str);

                }
            }
            return Deleted;
        }

        public static void SaveDeleted(List<Event> Deleted)
        {

            using (FileStream str = new FileStream(HttpContext.Current.Server.MapPath("Deleted.txt"), FileMode.Create))
            {
                XmlSerializer xs = new XmlSerializer(typeof(List<Event>));
                xs.Serialize(str, Deleted);

            }

        }


        public static List<Event> GetEvents()
        {
            var deleted = GetDeleted();
            var events = new List<Event>();
            WebClient wc = new WebClient();

            string html = wc.DownloadString("http://www.reddit.com/r/LondonSocialClub/");
            XmlDocument doc = new XmlDocument();
            int st = html.IndexOf("<table>");
            int end = html.IndexOf("</table>") + 8;
            html = html.Substring(st, end - st);
            doc.LoadXml(html);
            var dates = doc.GetElementsByTagName("a");

            DateTime start = StartOfWeek(DateTime.Today, DayOfWeek.Monday);
            HttpWebRequest req = (HttpWebRequest)WebRequest.Create("http://lsc2cal.appspot.com");





            HttpWebResponse resp = (HttpWebResponse)req.GetResponse();
            StreamReader str = new StreamReader(resp.GetResponseStream());

            Event ev = new Event();
            while (!str.EndOfStream)
            {

                string line = str.ReadLine();
                if (line.StartsWith("SUMMARY:"))
                {
                    ev.Title = line.Replace("SUMMARY:", "");

                }
                if (line.StartsWith("DTSTART;VALUE=DATE:"))
                {
                    ev.Date = DateTime.ParseExact(line.Replace("DTSTART;VALUE=DATE:", ""), "yyyyMMdd", CultureInfo.CurrentCulture);
                }
                if (line.StartsWith("DESCRIPTION:"))
                {
                    do
                    {


                        ev.Description += line.Replace("DESCRIPTION:", "");
                        line = str.ReadLine();

                    } while (!line.StartsWith("ORGANIZER"));
                    ev.Organiser = line.Replace("ORGANIZER:", "");
                }
                if (line.StartsWith("URL:"))
                {

                    do
                    {


                        ev.URL += line.Replace("URL:", "");
                        line = str.ReadLine();

                    } while (!line.StartsWith("END:"));
                    if (ev.URL.Contains("/comments/"))
                    {
                        var s = ev.URL.Split(new char[] { '/' });
                        ev.URL = "/" + s[6];
                    }
                    ev.IsNew = true;
                    ev.IsDeleted = deleted.Any(d => d.URL == ev.URL && d.Date == ev.Date);
                    bool isvalid = true;
                    if(ev.Title.Contains(']'))
                    {
                        var s = ev.Title.Split(']');
                        int i;
                        isvalid = !int.TryParse(s[0],out i);
                    }
                    ev.Description = ev.Description.Replace("\n", "");
                    if(isvalid && ev.Date >= start)
                        events.Add(ev);
                    
                    ev = new Event();

                }
            }
            bool started = false;
            int daycount = 0;
            int dayold = 0;
            for (int a = 0;a < dates.Count;a++)
            {
                
                int day = int.Parse(dates[a].ParentNode.ChildNodes[0].InnerText);


                if (started == true || day == start.Day)
                {
                    started = true;
                }
                else
                {
                    continue;
                }
                if (day != dayold)
                {
                    dayold = day;
                    daycount++;

                }

                string searchurl = dates[a].Attributes["href"].Value;
                searchurl = "/" + searchurl.Replace("/", "");

                Event item = events.Find(e => e.URL == searchurl && e.Date.Day == day);
                if (item != null)
                {
                    item.IsNew = false;
                    item.Title = dates[a].Attributes["title"].Value;
                    int x = 0;
                    item.Featured = int.TryParse(dates[a].InnerText, out x);
                    item.IsBold = dates[a].ChildNodes[0].Name == "strong";
                    item.IsDeleted = deleted.Any(d => d.URL == item.URL && d.Date == item.Date);

                }
                else
                {
                    
                    for (int b = 0; b < 35; b++)
                    {
                        if (b >= daycount - 1 && start.AddDays(b).Day == day)
                        {
                            Event ne = new Event();
                            ne.Date = start.AddDays(b);
                            int x = 0;
                            ne.Featured = int.TryParse(dates[a].InnerText, out x);
                            ne.IsNew = false;
                            ne.Title = dates[a].Attributes["title"].Value;
                            ne.URL = dates[a].Attributes["href"].Value;
                            ne.IsDeleted = deleted.Any(d => d.URL == ne.URL && d.Date == ne.Date);
                            events.Add(ne);
                            break;
                        }
                    }
                }
            }

            events = Sort(events);
            return events;
        }

        public static string Generate(List<Event> events)
        {

            StringWriter sw = new StringWriter();
            sw.WriteLine("**{0}/{1}**",DateTime.Today.ToString("MMMM"),DateTime.Today.AddMonths(1).ToString("MMMM"));
            sw.WriteLine("");
            sw.WriteLine("MON|TUE|WED|THU|FRI|SAT|SUN");
            sw.WriteLine(":-:|:-:|:-:|:-:|:-:|:-:|:-:");
            DateTime start = StartOfWeek(DateTime.Today, DayOfWeek.Monday);
            for (int a = 0; a < 35; a++)
            {
                DateTime current = start.AddDays(a);
                string mm = "";
                if (current.Month != DateTime.Today.Month)
                    mm = "_";
                string pm = "";
                if (current < DateTime.Today)
                    pm = "~~";
                sw.Write(mm);
                var ag = from e in events
                         where e.Date == current
                         && !e.IsDeleted
                         select e;
                var agenda = ag.ToList();
                if (agenda.Count == 0)
                {
                    sw.Write(pm + current.Day.ToString() + pm);
                }
                else
                {
                    string bold = "";
                    if (agenda[0].IsBold)
                        bold = "**";
                    string marker = pm + "[" + bold + current.Day.ToString() + bold + "]";

                    foreach (var item in agenda)
                    {
                        sw.Write("{0}({1} \"{2}\")", marker, item.URL, item.Title);
                        if (agenda.Count <= 4)
                            marker = "[*]";
                        else
                            marker = "[.]";
                    }
                    sw.Write(pm);
                }
                sw.Write(mm);
                if (current.DayOfWeek == DayOfWeek.Sunday)
                {
                    sw.Write("\r\n");
                }
                else
                {
                    sw.Write("|");
                }


            }
            sw.WriteLine("");
            return sw.ToString();
        }

        public static List<Event> Sort(List<Event> events)
        {
            DateTime start = StartOfWeek(DateTime.Today, DayOfWeek.Monday);
            var se = from i in events
                     where i.Date >= start
                     && i.Date <= start.AddDays(35)
                     orderby i.Date, !i.Featured
                     select i;
            events = se.ToList();
            return events;
        }
        public static DateTime StartOfWeek(DateTime dt, DayOfWeek startOfWeek)
        {
            int diff = dt.DayOfWeek - startOfWeek;
            if (diff < 0)
            {
                diff += 7;
            }

            return dt.AddDays(-1 * diff).Date;
        }

        public static bool AuthUser(string UserName, string Password)
        {
            WebClient wc = new WebClient();


            NameValueCollection userdata = new NameValueCollection();
            userdata.Add("api_type", "json");
            userdata.Add("user", UserName);
            userdata.Add("passwd", Password);
            JavaScriptSerializer deserializer = new JavaScriptSerializer();
            
            byte[] byteResponse = wc.UploadValues("http://www.reddit.com/api/login/" + UserName, "POST", userdata);


            String stringJsonResponse = System.Text.Encoding.UTF8.GetString(byteResponse);

            Dictionary<string, object> dictJson = deserializer.Deserialize<Dictionary<string, object>>(stringJsonResponse);
            var json = (Dictionary<string, object>)dictJson["json"];
            var data = (Dictionary<string, object>)json["data"];
            string modhash = data["modhash"].ToString();
            string cookie = data["cookie"].ToString();
            wc = new WebClient();

            Encoding iso = Encoding.GetEncoding("iso-8859-9");
            wc.Headers.Add(HttpRequestHeader.Cookie, "reddit_session=" + HttpUtility.UrlEncode(cookie, iso));
            string XMLResponse = wc.DownloadString("http://www.reddit.com/subreddits/mine/moderator.xml");
            XmlDocument doc = new XmlDocument();
            doc.LoadXml(XMLResponse);
            var subs = doc.GetElementsByTagName("link");
            foreach (XmlElement sub in subs)
            {
                if (sub.InnerText == "/r/LondonSocialClub/")
                    return true;
            }

            return false;

        }

        public static bool UpdateReddit(string UserName, string Password,string Calendar)
        {

            WebClient wc = new WebClient();



            NameValueCollection userdata = new NameValueCollection();
            userdata.Add("api_type", "json");
            userdata.Add("user", UserName);
            userdata.Add("passwd", Password);
            JavaScriptSerializer deserializer = new JavaScriptSerializer();
            var lscdata = deserializer.Deserialize<SubRedditAbout>(wc.DownloadString("http://www.reddit.com/r/LondonSocialClub/about.json"));
            byte[] byteResponse = wc.UploadValues("http://www.reddit.com/api/login/" + UserName, "POST", userdata);


            String stringJsonResponse = System.Text.Encoding.UTF8.GetString(byteResponse);

            Dictionary<string, object> dictJson = deserializer.Deserialize<Dictionary<string, object>>(stringJsonResponse);
            var json = (Dictionary<string, object>)dictJson["json"];
            var data = (Dictionary<string, object>)json["data"];
            string modhash = data["modhash"].ToString();
            string cookie = data["cookie"].ToString();
            
            string desc = lscdata.data.description;
            desc = desc.Replace("&amp;", "&");
            desc = Calendar + desc.Substring(desc.IndexOf("----------"));
            if (desc.Length > 5120)
            {
                throw new OverflowException("Calendar is too long to fit in the sidebar, please message the LSC moderators or stop organising as many damn events");
            }
            Encoding iso = Encoding.GetEncoding("iso-8859-9");
            NameValueCollection settingsdata = new NameValueCollection();
            settingsdata.Add("allow_top", "true");
            settingsdata.Add("api_type", "json");
            settingsdata.Add("comment_score_hide_mins", lscdata.data.comment_score_hide_mins.ToString());
            settingsdata.Add("css_on_cname", "false");
            settingsdata.Add("description", desc);
            settingsdata.Add("domain", "");
            settingsdata.Add("exclude_banned_modqueue", "false");
            settingsdata.Add("header-title", lscdata.data.header_title);
            settingsdata.Add("lang", "en");
            settingsdata.Add("link_type", "self");
            settingsdata.Add("name", lscdata.data.display_name);
            settingsdata.Add("over_18", "false");

            settingsdata.Add("public_description", lscdata.data.public_description);
            settingsdata.Add("public_traffic", lscdata.data.public_traffic.ToString());
            settingsdata.Add("show_cname_sidebar", "true");
            settingsdata.Add("show_media", "false");
            settingsdata.Add("sr", lscdata.data.name);
            settingsdata.Add("submit_link_label",lscdata.data.submit_link_label);
            settingsdata.Add("submit_text_label", "");
            settingsdata.Add("title", lscdata.data.title);
            settingsdata.Add("type", "public");
            settingsdata.Add("uh", modhash);
            settingsdata.Add("wiki_edit_age", "0");
            settingsdata.Add("wiki_edit_karma", "1");
            settingsdata.Add("wikimode", "anyone");
            settingsdata.Add("spam_comments", "low");
            settingsdata.Add("spam_links", "low");
            settingsdata.Add("spam_selfposts", "low");


            wc = new WebClient();

            wc.Headers.Add(HttpRequestHeader.Cookie, "reddit_session=" + HttpUtility.UrlEncode(cookie,iso));
            byte[] byteJsonResponse = wc.UploadValues("http://www.reddit.com/api/site_admin",
                            "POST",
                            settingsdata);






            stringJsonResponse = System.Text.Encoding.UTF8.GetString(byteJsonResponse);

            if (stringJsonResponse.Contains(@"errors\"": []"))
            {
                throw new Exception("Reddit API Error:" + stringJsonResponse);
            }
            return true;
            
        }

        string TimeTill(DateTime date)
        {
            TimeSpan timeSince = date.Subtract(DateTime.Now.Date);
            if (timeSince.TotalDays < 0) return "k:Past";
            if (timeSince.TotalDays < 1) return "a:Today";
            if (timeSince.TotalDays < 2) return "b:Tomorrow";
            if (timeSince.TotalDays < 7) return string.Format("c:{0} days", timeSince.Days);
            if (timeSince.TotalDays < 14) return "d:Next Week";
            if (timeSince.TotalDays < 21) return "e:2 Weeks";
            if (timeSince.TotalDays < 28) return "f:3 Weeks";
            if (timeSince.TotalDays < 60) return "g:Next month";
            if (timeSince.TotalDays < 365) return string.Format("h:{0} Months", Math.Round(timeSince.TotalDays / 30));
            if (timeSince.TotalDays < 730) return "i:Next year"; //last but not least...
            return string.Format("j:{0} Years", Math.Round(timeSince.TotalDays / 365));
        }

    }



    public class SubRedditData
    {
        public object user_is_banned { get; set; }
        public string id { get; set; }
        public string display_name { get; set; }
        public string header_img { get; set; }
        public string description_html { get; set; }
        public object user_is_contributor { get; set; }
        public bool over18 { get; set; }
        public string header_title { get; set; }
        public string description { get; set; }
        public string submit_link_label { get; set; }
        public int accounts_active { get; set; }
        public bool public_traffic { get; set; }
        public object header_size { get; set; }
        public int subscribers { get; set; }
        public string submit_text_label { get; set; }
        public string name { get; set; }
        public double created { get; set; }
        public string url { get; set; }
        public string title { get; set; }
        public double created_utc { get; set; }
        public object user_is_moderator { get; set; }
        public string public_description { get; set; }
        public int comment_score_hide_mins { get; set; }
        public string subreddit_type { get; set; }
        public string submission_type { get; set; }
        public object user_is_subscriber { get; set; }
    }

    public class SubRedditAbout
    {
        public string kind { get; set; }
        public SubRedditData data { get; set; }
    }
}
