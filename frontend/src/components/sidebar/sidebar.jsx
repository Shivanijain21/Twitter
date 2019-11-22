import React, { Component } from 'react';
import { NavLink } from "react-router-dom";
import twitter_icon from "../../twitter_icon.png";
import "./sidebar.css";
import "@fortawesome/fontawesome-free/css/all.css";

class Sidebar extends Component {
    state = {}
    render() {
        return (
            <div className="row sidebar">
                <div className="col-sm-12">
                    <div className="col-sm-12 pt-3">
                        <img src={twitter_icon} className="twitter_icon" />
                    </div>
                    <div className="col-sm-12 py-3 sidebarItem">
                        <NavLink className="p-2 pr-3" to="/home" exact={true} >
                            <i className="fas fa-home pr-2"></i>
                            Home
                        </NavLink>
                    </div>
                    <div className="col-sm-12 py-3 sidebarItem">
                        <NavLink className="p-2 pr-3" to="/messages" exact={true} >
                            <i className="fas fa-envelope pr-2"></i>
                            Messages</NavLink>
                    </div>
                    <div className="col-sm-12 py-3 sidebarItem">
                        <NavLink className="p-2 pr-3" to="/bookmarks" exact={true}>
                            <i className="far fa-bookmark pr-2"></i>
                            Bookmarks</NavLink>
                    </div>
                    <div className="col-sm-12 py-3 sidebarItem">
                        <NavLink className="p-2 pr-3" to="/lists" exact={true}>
                            <i className="far fa-list-alt pr-2"></i>Lists</NavLink>
                    </div>
                    <div className="col-sm-12 py-3 sidebarItem">
                        <NavLink className="p-2 pr-3" to="/profile" exact={true}>
                            <i className="far fa-user pr-2"></i>
                            Profile</NavLink>
                    </div>
                    <div className="col-sm-12 py-3 sidebarItem">
                        <NavLink className="p-2 pr-3" to="/analytics" exact={true}>
                            <i className="far fa-chart-bar pr-2"></i>Analytics</NavLink>
                    </div>
                </div>
            </div >
        );
    }
}

export default Sidebar;