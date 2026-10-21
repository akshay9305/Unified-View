import React, { lazy, useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { PublicClientApplication } from '@azure/msal-browser';
import { initializeIcons } from "@fluentui/react";
import Layout from "./pages/layout/Layout";
import Login from "./pages/login/login";
import Chat from "./pages/chat/Chat";
import DocumentsList from "./pages/upload/DocumentsList";
import Category from "./pages/category/CategoryList";
import ProtectedRoute from "./protectedroute";
import UsersList from "./pages/users/UsersList";
import Admin from "./pages/admin/Admin";
import CreditProvider from "./api/creditProvider";
import ToastProvider from "./contextProviders/toastProvider/toastProvider";
import Creditstemplate from "./pages/creditstemplate/credittemplate";
import msalConfig from "./config/msalConfig";
import { MsalProvider } from '@azure/msal-react';
import { ChakraProvider, defaultSystem } from "@chakra-ui/react";

import "./App.scss";
import "./index.css";
import Workflow from "./pages/workflow/Workflow";
import Service from "./pages/service/Service";
import AllServices from "./pages/service/AllServices";
import Inventory from "./pages/Inventory/Inventory";
import DetailedInventory from "./pages/Inventory/DetailedInventory";
import AllUtilities from "./pages/utilities/AllUtilities";
import Utilities from "./utilities/Utilities";
import '@fortawesome/fontawesome-free/css/all.min.css';
import ChatWindow from "./pages/chat/ChatWindow";


const NoPage = lazy(() =>
  import("./pages/NoPage").then((module) => ({ default: module.Component }))
);

initializeIcons();

const msalInstance = new PublicClientApplication(msalConfig);

const App = () => {
  const [isAdmin, setIsAdmin] = useState(
    localStorage.getItem("role") === "Admin"
  );
  const [isSuperAdmin, setIsSuperAdmin] = useState(
    localStorage.getItem("role") === "superAdmin"
  );
  console.log("line 49 isAdmin: ",isAdmin)
  console.log("line 49 isSuperAdmin: ",isSuperAdmin)
  console.log("isAdmin || isSuperAdmin: ",isAdmin || isSuperAdmin)



  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const initializeMsal = async () => {
      await msalInstance.initialize()
      await msalInstance.handleRedirectPromise();
      setInitialized(true);
    };

    initializeMsal();
  }, []);


  //const navigate = useNavigate();
  function signOutClickHandler() {
    let logintype = localStorage.getItem("logintype")
    sessionStorage.clear();
    localStorage.clear();
    if (logintype == 'sso') {
      msalInstance.logoutRedirect();
    }
    else {
      window.location.href = "/login";
    }

  }

  const router = createBrowserRouter([
    {
      path: "/",
      element: (
        <Login setIsAdmin={setIsAdmin} setIsSuperAdmin={setIsSuperAdmin} msalInstance={msalInstance} />
      ),
    },
    {
      path: "/login",
      element: (
        <Login setIsAdmin={setIsAdmin} setIsSuperAdmin={setIsSuperAdmin} msalInstance={msalInstance} />
      ),
    },
    {
      path: "layout",
      element: (
        <ProtectedRoute redirectTo={"/"}>
          <Layout isAdmin={isAdmin} isSuperAdmin={isSuperAdmin} signOutClickHandler={signOutClickHandler} />
        </ProtectedRoute>
      ),
      children: [
        {
          index: true,
          path: "chat",
          element: <Chat />,
        },
        {
          index: true,
          path: "chatwindow",
          element: <ChatWindow />,
        },
        {
          path: "qa",
          lazy: () => import("./pages/oneshot/OneShot"),
        },
        {
          path: "uploads",
          element: <DocumentsList />,
        },
        {
          path: "category",
          element: (isAdmin || isSuperAdmin) ? <Category /> : <NoPage />,
        },
        {
          path: "*",
          element: <NoPage />,
        },
        {
          path: "admin",
          element: (isAdmin || isSuperAdmin) ? <Admin /> : <NoPage />,
        },
        {
          path: "users",
          element: (isAdmin || isSuperAdmin) ? <UsersList setIsAdmin={setIsAdmin} signOutClickHandler={signOutClickHandler} /> : <NoPage />,
        },
        {
          path: "creditstemplate",
          element: <Creditstemplate />,
        },
        {
          path: "workflow",
          element: <Workflow />
        },
        {
          path: "services",
          element: <AllServices />
        },
        {
          path: "inventory",
          element: <Inventory />
        },
        {
          path: "detailedinventory",
          element: <DetailedInventory />
        },
        {
          path: "utilities",
          element: <AllUtilities />
        },
        {
          path: "cockpit",
          element: <Utilities />
        },
        {
          path: "service/:sr_num",
          element: <Service />
        },
      ],
    },
  ]);

  return (
    <React.StrictMode>
      {initialized && <MsalProvider instance={msalInstance}>
        <CreditProvider setIsAdmin={setIsAdmin}>
          <ChakraProvider value={defaultSystem}>
            <RouterProvider router={router} />
          </ChakraProvider>
        </CreditProvider>
      </MsalProvider>}
    </React.StrictMode>
  );
};




ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(<App />);