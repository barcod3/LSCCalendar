<%@ Page Title="" Language="C#" MasterPageFile="~/Site.Master" AutoEventWireup="true" CodeBehind="Default.aspx.cs" Inherits="LSCAGENDA.Default" %>
<asp:Content ID="Content1" ContentPlaceHolderID="HeadContent" runat="server">
</asp:Content>
<asp:Content ID="Content2" ContentPlaceHolderID="MainContent" runat="server">
    <h2>
        Add new items to the LSC Calendar</h2>
    <p>
    If there are any new events in the list below, please hit "Update Calendar". If your event isnt in the list, please check back later. 
    </p>
        <p>
        <asp:DataList ID="dlEvents" runat="server"  onitemdatabound="dlEvents_ItemDataBound">
            <ItemTemplate>
            <table><tr><td class="date"><%#Eval("Date","{0:dd/MM/yyyy}") %></td><td class="eventtitle"><a href='http://www.reddit.com<%#Eval("URL") %>' target=top><%#Eval("Title") %></a></td><td class="status"><%#Eval("Status") %></td></tr></table>
            </ItemTemplate>
            
        </asp:DataList>
        <br/>
        <asp:Button runat="server" ID="btUpdate" Text="Update Calendar" 
                onclick="btUpdate_Click" />
    </p>
    <p>
       <b><asp:Literal ID="ltMessage" runat="server"></asp:Literal></b>
    </p>
</asp:Content>

