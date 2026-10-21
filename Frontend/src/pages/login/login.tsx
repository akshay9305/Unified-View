import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AffineLogo from "../../assets/affineLogo.png";
import styles from "./login.module.css";
import RetravierLogo from "../../assets/ErylLogo.png";
import { trackPromise } from "react-promise-tracker";
import usercreditsService from "../../api/creditmanagementService";
import useCredit from "../../api/userCredit";
import userService from "../../api/userService";
import LoadingOverlay from "../../components/LoadingOverlay/LoadingOverlay";
import BgLogo from "../../assets/images/bg-img-1x.png";
import MicrosoftImg from "../../assets/images/microsoft.png";
import UnfiedLogo from "../../assets/uv-logo.png";
import fusionLogo from "../../assets/fusionLogo.png";



const Login = ({ setIsAdmin, setIsSuperAdmin, msalInstance }) => {
  const [loginFailed, setLoginFailed] = useState(false);
  const { setCreditBalance } = useCredit();
  const navigate = useNavigate();

  const emailRef = useRef('')
  const passwordRef = useRef('')
  const loaderMessage = "Please wait !!!"
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handleRedirect = async () => {
      try {
        const loginResponse = await msalInstance.handleRedirectPromise();
        if (loginResponse) {
          const userInformation = {
            name: loginResponse.account.name,
            email: loginResponse.account.username,
            accessToken: loginResponse.accessToken,
            expirationTime: loginResponse.expiresOn,
            lastLoggedIn: new Date().toISOString(),
          };
          localStorage.setItem('msalResponse', JSON.stringify(loginResponse));
          localStorage.setItem('accessToken', loginResponse.accessToken);
          localStorage.setItem('email', loginResponse.account.username);
          localStorage.setItem('name', loginResponse.account.name)
          localStorage.setItem("logintype", "sso");
          usercredits(userInformation);
        }
      } catch (error) {
        console.error("Redirect error: ", error);
      }
    };

    handleRedirect();
  }, []);

  const handleCustomLogin = () => {
    if (emailRef.current && passwordRef.current) {
      const email = emailRef.current.value || ''
      const password = passwordRef.current.value || ''
      if (email !== '' && password !== '') {
        setLoading(true)
        trackPromise(
          userService.loginUser({ email: email, password: password }).then((res: any) => {
            if (!res || res?.status != 200) {
              setLoading(false)
              alert('Login Failed')
            } else {
              localStorage.setItem('accessToken', res?.data?.jwt_token.token)
              localStorage.setItem('email', res?.data?.email);
              localStorage.setItem('name', res?.data?.name)
              localStorage.setItem("role", res?.data?.role);
              setIsSuperAdmin(res?.data?.role === "superAdmin")
              localStorage.setItem("logintype", "custom");
              setCreditBalance(res?.data?.balance);
              navigate("/layout/chatwindow")
            }
          }).catch(err => {
            console.log("errroororr", err)
            setLoading(false)
          })
        );
      }
    }
  }

  const submitHandler = async () => {

    let userAccount;
    try {
      const accounts = msalInstance.getAllAccounts();

      if (accounts.length > 0) {
        const userAccount = accounts[0];

        const silentRequest = {
          scopes: [
            // Scopes here
          ],
          account: userAccount,
        };

        try {
          const response = await msalInstance.acquireTokenSilent(silentRequest);
          // console.log(response)
          localStorage.setItem('msalResponse', JSON.stringify(response));
          localStorage.setItem('accessToken', response.accessToken);
          localStorage.setItem('email', response.account.username);
          localStorage.setItem('name', response.account.name)
          localStorage.setItem("logintype", "sso");
          // console.log(response.account?.name)
          // Extract user information
          const userInformation = {
            name: userAccount.name,
            email: userAccount.username, // Assuming the email is stored in the username field
            accessToken: response.accessToken,
            expirationTime: response.expiresOn,
            lastLoggedIn: new Date().toISOString(), // You can replace this with the actual last login time
          };

          // Call usercredits function with user information
          usercredits(userInformation);

        } catch (silentError) {
          console.error('Silent login failed:', silentError);

          // Handle silent login failure, you can fall back to interactive login if needed
          // ...
        }
      } else {
        try {
          await msalInstance.loginRedirect({
            scopes: [
              "user.read"
            ],
          });
        } catch (interactiveError) {
          console.error('Interactive login failed:', interactiveError);
        }
      }
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const usercredits = (userInfo) => {
    setLoading(true)
    trackPromise(
      usercreditsService
        .userdata(userInfo)
        .then((response) => {
          // Process the response if needed
          const { role, balance } = response.data;
          localStorage.setItem("role", role);
          // localStorage.setItem("status",status)
          if (response.data.status !== 1) {
            setLoginFailed(true);
            sessionStorage.clear();
            localStorage.clear();
          } else {
            setLoginFailed(false);
            setIsAdmin(role === "Admin");
            setCreditBalance(balance);
            navigate("/layout/chatwindow");
          }
          setLoading(false)
        })
        .catch((err) => {
          alert(err.response.data.error);
          setLoading(false)
          setLoginFailed(true);
          sessionStorage.clear();
          localStorage.clear();
        })
    );
  };

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
      <img src={BgLogo} style={{ width: "50%", overflow: "hidden" }}/>
      <div style={{ width: "50%", display: "flex", justifyContent: "center" }}>
      {/* <img src={UnfiedLogo} className="d-inline-block align-left uni-logo" style={{ marginLeft: "50%", width: "10%", height: "70%" }}/> */}

      {/* <header className={styles.header} role={"banner"}>
        {loading && <LoadingOverlay message={loaderMessage} />}
        <div className={styles.headerContainer}>
          <Link to="/" className={styles.headerTitleContainer}>
            <img
              src={AffineLogo}
              className="d-inline-block align-left"
              alt="Affine"
            />

          </Link>
        </div>
      </header> */}
      {loading && <LoadingOverlay message={loaderMessage} />}
      <div className="login-container mt-5">
       
        <div className="login-container">
          <div className="login1 div-wrapper d-flex justify-content-center mt-5">
            <div className={styles.logincard}>
            {/* <img src={fusionLogo}/> */}
              <h6 className="header-group mb-3" style={{ fontWeight: "600", fontSize: "1.5rem", position: "relative", right: "-74px", top: "4px" }}>Sign In</h6>
              <input ref={emailRef} type="email" placeholder="Enter Email" />
              <input ref={passwordRef} type="password" placeholder="Enter Password" />
              <button onClick={handleCustomLogin}>Sign In</button>
              <h5 style={{ position: "relative", right: "-74px", top: "4px"}}>OR</h5>
              <form autoComplete="off">
                <div className="form-group col-md-12 text-center">
                  <button
                    type="button"
                    className="btn login-btn mt-1"
                    style={{ height: "47px", backgroundColor: "#fff" }}
                    onClick={submitHandler}
                  >
                    <span style={{ color: "#000" }}>
                      <img src={MicrosoftImg} style={{ height:"25px",width: "32px", position: "absolute", marginLeft:"12px",marginTop:"-1px" }} />
                      Sign in with your Microsoft account
                    </span>
                  </button>
                  {loginFailed && (
                    <div style={{ color: "red", marginTop: "10px" }}>
                      You do not have access to this application, Please contact your Administrator.
                    </div>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
};

export default Login;
