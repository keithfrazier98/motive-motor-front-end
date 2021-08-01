import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import DefaultLogin from "./DefaultLogin";
import FourOFour from "./FourOFour";
import Guest from "./Guest";
import NewUser from "./NewUser";

function LoginScreens() {
  const [loginFormInfo, setLoginFormInfo] = useState({
    email: "",
    password: "",
  });
  const [returningUserIsValidated, setReturningUserIsValidated] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [inputType, setInputType] = useState("password");
  const [themeId, setThemeId] = useState("bw");
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [theme, setTheme] = useState({
    bkgd: "",
    fontColor: "",
    secBkgd: "",
    btnColor: "",
    headerBkgd: "",
    navBkgd: "",
    container: "",
  });
  const [loginType, setLoginType] = useState("default");

  const history = useHistory()
  useEffect(() => {


    if(returningUserIsValidated === true && loginFormInfo){
      history.push('./dashboard')
    }

    console.log(returningUserIsValidated, loginFormInfo)
    //returningUserIsValidated changes to true:
    //dashboard page is push to history with query params: email
    //dashboard page makes api request for user information


  }, [returningUserIsValidated, loginFormInfo]);


  return (
    <>
      {loginType === "default" ? (
          <DefaultLogin
            loginFormInfo={loginFormInfo}
            setLoginFormInfo={setLoginFormInfo}
            returningUserIsValidated={returningUserIsValidated}
            setReturningUserIsValidated={setReturningUserIsValidated}
            showPassword={showPassword}
            setShowPassword={setShowPassword}
            inputType={inputType}
            setInputType={setInputType}
            themeId={themeId}
            setThemeId={setThemeId}
            loading={loading}
            setLoading={setLoading}
            emailError={emailError}
            setEmailError={setEmailError}
            theme={theme}
            setTheme={setTheme}
            loginType={loginType}
            setLoginType={setLoginType}
          />
      ) : loginType === "new" ? (
        <NewUser />
      ) : loginType === "guest" ? (
        <Guest />
      ) : (
        <FourOFour />
      )}
    </>
  );
}

export default LoginScreens;