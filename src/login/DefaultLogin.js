import React, { useEffect, useState } from "react";
import { isExistingUser, createNewUserAPI, test } from "../utils/api.js";
import ErrorMessage from "../common/ErrorMessage.js";
import ReturningUserMessage from "./ReturningUserMessage";
import DefaultLoginBtns from "./DefaultLoginBtns.js";
import NewUser from "./NewUser.js";
import "../App.css";
import "./LoginScreen.css";
import Header from "../common/Header";
import logo200 from "../images/logo200.png";
import LogInWithSocialMedia from "./LoginWithSocialMedia.js";
import * as EmailValidator from "email-validator";

function DefaultLogin({
  loginFormInfo,
  setLoginFormInfo,
  returningUserIsValidated,
  setReturningUserIsValidated,
  showPassword,
  setShowPassword,
  passwordInputType,
  setPasswordInputType,
  theme_id,
  setThemeId,
  loading,
  setLoading,
  emailError,
  setEmailError,
  theme,
  setTheme,
  loginType,
  setLoginType,
  socialMediaLoginData,
  setSocialMediaLoginData,
  loggedIn,
  setLoggedIn,
  newUserPreferences,
  setNewUserPreferences,
  newUserProfileInfo,
  setNewUserProfileInfo,
}) {
  const [routeToLogin, setRouteToLogin] = useState(false);
  const [createNewUser, setCreateNewUser] = useState(false);
  const [loginEmailIsTaken, setLoginEmailIsTaken] = useState(false);
  const roundedCorners = { borderRadius: "3px" };

  useEffect(() => {
    setLoading(true);
    handleThemeChange().then(createPageContent()).then(setLoading(false));
  }, [theme_id, setLoading]);

  useEffect(() => {
    console.log("useEffect", createNewUser, loginType);
    if (createNewUser) {
      submitLogin();
    }
  }, [createNewUser]);

  const handleThemeChange = () => {
    return new Promise((res) => {
      switch (theme_id) {
        case "bw":
          setTheme({
            bkgd: "",
            fontColor: "",
            secBkgd: "",
            btnColor: "secondary",
            headerBkgd: "",
            navBkgd: "",
            container: "",
          });
          break;
        case "sunset":
          setTheme({
            bkgd: "sunsetMainBkgd",
            fontColor: "sunsetFont",
            secBkgd: "sunsetSecBkgd",
            btnColor: "sunsetButton",
            headerBkgd: "sunsetHeader",
            navBkgd: "sunsetNav",
            container: "sunsetContainer",
          });
          break;
        case "forest":
          setTheme({
            bkgd: "forestMainBkgd",
            fontColor: "forestFont",
            secBkgd: "forestSecBkgd",
            btnColor: "forestButton",
            headerBkgd: "forestHeader",
            navBkgd: "forestNav",
            container: "forestContainer",
          });
          break;
        default:
          break;
      }
    });
  };

  const handleShowPassword = (event) => {
    event.preventDefault();
    setShowPassword(!showPassword);
    if (!showPassword) {
      setPasswordInputType("text");
    } else {
      setPasswordInputType("password");
    }
  };

  function handleChange({ target: { id, value } }) {
    if (routeToLogin || emailError || loginEmailIsTaken) {
      setRouteToLogin(false);
      setEmailError(false);
      setLoginEmailIsTaken(false);
    }
    switch (loginType) {
      case "existing":
        setLoginFormInfo({ ...loginFormInfo, [id]: value });
        break;
      case "new":
        setLoginFormInfo({ ...loginFormInfo, [id]: value });
        setNewUserProfileInfo({
          ...newUserProfileInfo,
          ...loginFormInfo,
          [id]: value,
        });
        break;
      default:
        break;
    }
  }

  async function checkForReturningUser(submitType) {
    console.log(
      "checkforexistinguser",
      submitType,
      socialMediaLoginData,
      loginFormInfo
    );
    const abortController = new AbortController();
    let validationKey;
    let validationType;
    if (loginType === "social-media") {
      switch (socialMediaLoginData.type) {
        case "facebook":
          validationType = "fb_login_id";
          validationKey = socialMediaLoginData.id;
          console.log("facebook");
          break;
        case "google":
          validationType = "email";
          validationKey = socialMediaLoginData.email;
          console.log("google");
          break;
        default:
          console.error("default social media login submission was called");
          break;
      }
    } else {
      validationType = "email";
      validationKey = loginFormInfo.email;
    }

    await isExistingUser(validationType, validationKey, abortController.signal)
      .then((response) => {
        console.log("responsing");
        console.log(response);
        setLoginEmailIsTaken(true);
        //first submit if : user is simply logging in with valid information
        if(socialMediaLoginData){
          console.log(true, socialMediaLoginData, loginType, loginFormInfo)
        } else {
          console.log(false, socialMediaLoginData, loginType, loginFormInfo)
        }
        if (
          !socialMediaLoginData &&
          response.password === loginFormInfo.password &&
          submitType === "existing"
        ) {
          setReturningUserIsValidated(true);
          setLoggedIn(true);
        }
        //second submit if: user is trying to create a new user with valid login information
        else if (
          response.password === loginFormInfo.password &&
          submitType === "new"
        ) {
          setReturningUserIsValidated(true);
          setRouteToLogin(true);
        }
        // third submit if: password is incorrect on a simple login for an existing user
        else if (
          response.password !== loginFormInfo.password &&
          submitType === "existing"
        ) {
          setEmailError({ message: "Incorrect password" });
        }
        // fourth submit if : user is trying to create an account with an existing email and password is incorrect
        else if (submitType === "new" && !emailError && !loginEmailIsTaken) {
          setRouteToLogin(true);
        }
      })
      .catch((res) => {
        console.log("caught");
        console.log(submitType);
        if (submitType !== "new") {
          setEmailError(res);
        } else {
          setLoginType("new");
        }
      });
  }

  const submitLogin = (event) => {
    //the "login" button is the only button that will call submit login with an event
    console.log("submitLogin", loginFormInfo, loginType, socialMediaLoginData);
    if (event && event.target.id === "login-form") {
      event.preventDefault();
      console.log(event.target.id)
      const validEmail = EmailValidator.validate(loginFormInfo.email);
      if (validEmail) {
        checkForReturningUser("existing");
      } else {
        setRouteToLogin(false);
        setEmailError({ message: "Incorrect email format" });
      }
    } else {
      switch (loginType) {
        // user selected "new user"
        case "new":
        case "existing":
          checkForReturningUser("new");
          break;
        case "social-media":
          checkForReturningUser("social-media");
          break;
        default:
          console.log("switch on login failed");
          break;
      }
    }
  };

  const submitCreateNewUserAPI = (event) => {
    const validEmail = EmailValidator.validate(loginFormInfo.email);
    if (validEmail) {
      checkForReturningUser("new");
      if (!loginEmailIsTaken && !emailError) {
        const abortController = new AbortController();
        createNewUserAPI(
          newUserProfileInfo,
          newUserPreferences,
          abortController.signal
        );
      }
    } else {
      setEmailError({ message: "Incorrect email format" });
    }
  };

  const createPageContent = () => {
    return (
      <>
        <Header setThemeId={setThemeId} theme={theme} />
        <div
          className="grid-x grid-margin-y align-center align-middle"
          style={{ height: "100%" }}
        >
          <div className="cell small-11 medium-4 large-3">
            <div className="grid-x align-center">
              <h2 className="loginH2">Welcome!</h2>
              <img src={logo200} alt="motive-motor-logo" width="150px" />
            </div>
            <form  id='login-form' onSubmit={submitLogin} className="loginForm">
              <div className="grid-container">
                <p>
                  {loginType === "new"
                    ? "Let's get signed up:"
                    : "Let's get logged in:"}
                </p>
                <div>
                  <div className="grid-x align-middle align-center grid-margin-x">
                    <div className="cell medium-12">
                      <label htmlFor="username">Email:</label>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="rickyBobby@email.com"
                        required
                        value={loginFormInfo.email}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="cell small-10">
                      <label htmlFor="password">Password:</label>
                      <input
                        id="password"
                        name="password"
                        type={passwordInputType}
                        placeholder="password"
                        required
                        minLength="8"
                        autoComplete="current-password"
                        value={loginFormInfo.password}
                        onChange={handleChange}
                      />
                    </div>
                    <div className={`cell small-2`}>
                      <button
                        className={`button eye ${theme.btnColor}`}
                        onClick={handleShowPassword}
                        style={roundedCorners}
                      >
                        {showPassword ? (
                          <ion-icon name="eye-off"></ion-icon>
                        ) : (
                          <ion-icon name="eye-outline"></ion-icon>
                        )}
                      </button>
                    </div>
                    {loginType === "new" ? (
                      <NewUser
                        loading={loading}
                        setLoading={setLoading}
                        loginFormInfo={loginFormInfo}
                        theme={theme}
                        setTheme={setTheme}
                        theme_id={theme_id}
                        setThemeId={setThemeId}
                        newUserProfileInfo={newUserProfileInfo}
                        setNewUserProfileInfo={setNewUserProfileInfo}
                        newUserPreferences={newUserPreferences}
                        setNewUserPreferences={setNewUserPreferences}
                        handleChange={handleChange}
                        loginEmailIsTaken={loginEmailIsTaken}
                      />
                    ) : null}
                  </div>
                </div>
              </div>
              <div className="grid-x grid-margin-x grid-margin-y align-center text-center formButtons">
                <ErrorMessage error={emailError} />
                {routeToLogin ? (
                  <ReturningUserMessage
                    returningUserIsValidated={returningUserIsValidated}
                    setReturningUserIsValidated={setReturningUserIsValidated}
                    setLoginType={setLoginType}
                    setLoading={setLoading}
                    setLoggedIn={setLoggedIn}
                    setEmailError={setEmailError}
                    setRouteToLogin={setRouteToLogin}
                  />
                ) : null}
                {loginType === "existing" || loginType === "social-media" ? (
                  <>
                    <DefaultLoginBtns
                      theme={theme}
                      setCreateNewUser={setCreateNewUser}
                      setLoginType={setLoginType}
                    />
                    <LogInWithSocialMedia
                      setSocialMediaLoginData={setSocialMediaLoginData}
                      submitLogin={submitLogin}
                      submitCreateNewUserAPI={submitCreateNewUserAPI}
                      setLoginFormInfo={setLoginFormInfo}
                      setLoginType={setLoginType}
                    />
                  </>
                ) : (
                  <div className="cell small-12">
                    <button
                      type="button"
                      onClick={() => {
                        setLoginType("existing");
                      }}
                      className={`button ${theme.btnColor}`}
                      style={{ marginRight: "10px", borderRadius: "3px" }}
                    >
                      Back to Login
                    </button>
                    <button
                      type="button"
                      id="create_user"
                      style={roundedCorners}
                      onClick={
                        loginEmailIsTaken || emailError
                          ? null
                          : submitCreateNewUserAPI
                      }
                      className={`${
                        loginEmailIsTaken || emailError
                          ? "button disabled"
                          : "button"
                      } ${theme.btnColor}`}
                    >
                      submit
                    </button>
                  </div>
                )}
              </div>
            </form>
          </div>
        </div>
      </>
    );
  };

  let pageContent = createPageContent();
  return (
    <div
      className={`grid-y ${theme.bkgd} ${theme.fontColor}`}
      style={{ height: "100%" }}
    >
      {loading ? <h4>Loading ...</h4> : pageContent}
    </div>
  );
}

export default DefaultLogin;
