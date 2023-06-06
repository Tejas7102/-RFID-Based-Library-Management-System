import React, { useEffect, useState } from "react";
import "./sign.css";
import { useFormik } from "formik";
import { signUpSchema } from "./schemas";
import { useNavigate } from "react-router-dom";
import { getAuth } from "firebase/auth";
import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth";

const initialValues = {
  name: "",
  email: "",
  password: "",
  confirm_password: "",
};
function Signin(props) {
  const auth = getAuth();
  const navigate = useNavigate();
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        navigate("/Home");
      }
    });
    return () => {
      unsubscribe();
    };
  }, [auth, navigate]);

  const [submitButtonDisable, setSubmitButtonDisabled] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const { values, errors, handleBlur, handleChange, handleSubmit, touched } =
    useFormik({
      initialValues: initialValues,
      validationSchema: signUpSchema,
      onSubmit: (values) => {
        console.log(values);
      },
    });
  const submitData = async (event) => {
    const { email, password } = values;
    if (email && password) {
      setSubmitButtonDisabled(true);
      signInWithEmailAndPassword(auth, email, password)
        .then(async (res) => {
          setSubmitButtonDisabled(false);
          navigate("/Home");
        })
        .catch((err) => {
          setSubmitButtonDisabled(false);
          setErrorMsg(err.message);
        });
    }
  };
  const forgotPass = () => {
    return sendPasswordResetEmail(auth, values.email);
  };
  const navigateToSignUp = () => {
    navigate("/Registration");
  };
  return (
    <div className="fc2">
      <div className="fc">
        <form action="" onSubmit={handleSubmit}>
          <div className="input-block">
            <label htmlFor="email" className="input-label">
              Email
            </label>
            <input
              type="email"
              autoComplete="off"
              name="email"
              id="email"
              placeholder="Email"
              value={values.email}
              onChange={handleChange}
              onBlur={handleBlur}
            />
            {errors.email && touched.email ? (
              <p className="form-error">{errors.email}</p>
            ) : null}
          </div>
          <div className="input-block">
            <label htmlFor="password" className="input-label">
              Password
            </label>
            <input
              type="password"
              autoComplete="off"
              name="password"
              id="password"
              placeholder="Password"
              value={values.password}
              onChange={handleChange}
              onBlur={handleBlur}
            />
            {errors.password && touched.password ? (
              <p className="form-error">{errors.password}</p>
            ) : null}
          </div>
          <div className="modal-buttons">
            <button
              className="input-button"
              type="submit"
              onClick={submitData}
              disabled={submitButtonDisable}
            >
              Sign In
            </button>
          </div>
          <div className="login">
          <a href="" onClick={navigateToSignUp}>
          Don't have an account?
          </a>
          <a href="" onClick={forgotPass}>
          Forgot Password.?
          </a>
          </div>
        </form>
        <p>{errorMsg}</p>
      </div>
    </div>
  );
}
export default Signin;
