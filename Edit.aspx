<%@ Page Title="LSC Calender Editor V3" Language="C#" MasterPageFile="~/Site.master" AutoEventWireup="true"
    CodeBehind="Edit.aspx.cs" Inherits="LSCAGENDA._Default" %>

<asp:Content ID="HeaderContent" runat="server" ContentPlaceHolderID="HeadContent">
</asp:Content>
<asp:Content ID="BodyContent" runat="server" ContentPlaceHolderID="MainContent">
<asp:Panel ID="pnLogin" runat="server" >
<p>Please enter a reddit username and password with moderator rights to London Social Club</p>
<table>
<tr>
<td>Username: </td>
<td><asp:TextBox ID="tbUserName" runat="server"></asp:TextBox></td>
</tr>
<tr>
<td>Pasword: </td>
<td><asp:TextBox ID="tbPassword" TextMode="Password" runat="server"></asp:TextBox></td>
</tr>
<tr><td></td><td><asp:Button runat="server" ID="btLogin" Text="Login" 
        onclick="btLogin_Click" /></td></tr>
</table>
<asp:Label runat="server" ID="lbLogin" ForeColor="Red" EnableViewState="false"></asp:Label>
</asp:Panel>
<asp:Panel ID="pnEdit" runat="server" Visible="false">
    <asp:Literal runat=server ID="ltSuccess" EnableViewState="false"></asp:Literal><h2>
        Upcoming Events</h2>
    <p>
        <asp:DataList ID="dlEvents" runat="server" oneditcommand="dlEvents_EditCommand" 
            onupdatecommand="dlEvents_UpdateCommand" 
            AlternatingItemStyle-BackColor="#DDDDDD" 
            onitemdatabound="dlEvents_ItemDataBound">
            <ItemTemplate>
            <table><tr><td class="date"><%#Eval("Date","{0:dd/MM/yyyy}") %></td><td class="eventtitle"><a target="_top" href='http://www.reddit.com<%#Eval("URL") %>' ><%#Eval("Title") %></a></td><td class="status"> </td><td class="status"><%#Eval("Status") %></td><td class="eventedit">
                <asp:LinkButton ID="linkbutton1" runat="server" CommandName="Edit">edit</asp:LinkButton>
                </td></tr></table>
            </ItemTemplate>
            <EditItemTemplate>
            <table><tr><td class="date"><%#Eval("Date","{0:dd/MM/yyyy}") %>
                </td><td class="eventtitle">
                    <asp:TextBox ID="tbTitle" runat="server" Text='<%# Bind("Title") %>' Width="450px"></asp:TextBox><br />
                    <asp:CheckBox ID="cbFeatured" runat="server" Checked='<%# Bind("Featured") %>'
                        Text="Featured" />
                    <asp:CheckBox ID="cbBold" runat="server" Checked='<%# Bind("IsBold") %>'
                        Text="Bold" />
                    <asp:CheckBox ID="cbDeleted" runat="server" Checked='<%# Bind("IsDeleted") %>'
                        Text="Deleted" />

                </td><td class="status"> 

                </td><td class="status">

                </td><td class="eventedit">
                <asp:LinkButton ID="LinkButton1" runat="server" CommandName="Update" >save</asp:LinkButton>
                </td></tr></table>
            </EditItemTemplate>
        </asp:DataList>

    </p>
    <h2>Automatically update the sidebar</h2>
    
        <asp:Button runat="server" id="btUpdate" Text="Update" 
            onclick="btUpdate_Click" /></p>
    <h2>Manually copy the code into the sidebar</h2>
    <p>
    <asp:Label ID="lbSize" runat="server"></asp:Label><br />
    <asp:TextBox ID="tbCode" TextMode="MultiLine" runat="server" Width="700" 
            Height="400" ontextchanged="tbCode_TextChanged" ReadOnly="True"></asp:TextBox>
    </p>
</asp:Panel>

</asp:Content>
