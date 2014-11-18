<%@ Page Title="About LSC Calender Editor" Language="C#" MasterPageFile="~/Site.master" AutoEventWireup="true"
    CodeBehind="About.aspx.cs" Inherits="LSCAGENDA.About" %>

<asp:Content ID="HeaderContent" runat="server" ContentPlaceHolderID="HeadContent">
</asp:Content>
<asp:Content ID="BodyContent" runat="server" ContentPlaceHolderID="MainContent">
    <h2>
        About
    </h2>
    <p>
        The LSC Calender Editor is a tool to manage the sidebar calendar on <a href="http://www.reddit.com/r/londonsocialclub">/r/londonsocialclub</a>
    </p>
    <p>
        The tool reads in the current sidebar, and the iCal feed developed by <a href="http://www.reddit.com/u/dalore">/u/dalore</a> and cross references them. 
    </p>
    <p>
        Using the tool you can change the title of an event. Setting an event to "Featured" makes that event appear first in the day (given a number not an asterisk) You can also delete events, and make them bold.
    </p>
    <p>
        Any changes you make will only be visible to you and will be lost if you close the browser. To update the sidebar calendar the code at the bottom of the page must be copied and pasted into the subreddit settings page, which will still need to be performed by a moderator, or enter your mod username and password in the fields provided and click "Update". 
    </p>
    <p>
        If you wish to use the calendar data in your own application there is a feed here : <a href="calendar.ashx?format=json" target="_top">JSON</a> | <a href="calendar.ashx?format=xml"  target="_top">XML</a> | <a href="calendar.ashx?format=rss"  target="_top">RSS</a>.
    </p>
    <p>
        
        You can also access the mobile web app here : <a href="mobile.html" target="_top">LSC Mobile Calendar</a>.
    </p>
</asp:Content>
