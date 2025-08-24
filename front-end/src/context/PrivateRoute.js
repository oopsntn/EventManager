import { createElement } from "react";
import { Navigate, Route } from "react-router-dom";

const { useAuth } = require("./AuthContext");

const PrivateRoute = ({children, allowedRoles}) => {
    const user = JSON.parse(localStorage.getItem("user"));

    if (!user){
        return <Navigate to="/login" replace/>
    }

    if(!allowedRoles.includes(user.role)){
        return <Navigate to="/unathorized" replace/>
    }

    return children;
};

export default PrivateRoute