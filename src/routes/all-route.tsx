import React from "react";
import { Route, Routes } from "react-router-dom";
import LoginPage from "../pages/login";
import Dashboard from "../pages/dashboard";
import { ProtectedRoute } from "./protected-route";


export interface IRouteItem {
  path: string;
  component: any;
};

const IndexRoute = () => {
    return (
        <React.Fragment>
            <Routes>
                <Route>
                    <Route path="/login" element={<LoginPage/>}/>
                    <Route path="" element={<LoginPage/>}/>
                </Route>
                <Route>
                    <Route path="/dashboard" element={<ProtectedRoute><Dashboard/></ProtectedRoute>}/>
                </Route>
            </Routes>
        </React.Fragment>
    )
};

export default IndexRoute;