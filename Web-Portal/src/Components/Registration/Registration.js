import React, { useEffect, useState } from "react";
import "./Reg.css";
import { useFormik } from "formik";
import { signUpSchema } from "./schemas";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { getAuth } from "firebase/auth";
const initialValues = {
  name: "",
  email: "",
  password: "",
  confirm_password: "",
};

export default function Registration() {
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
    const { name, email, password, errors, confirm_password } = values;
    const a1 = JSON.stringify({ name: name, email: email });
    if (name && email && password) {
      setSubmitButtonDisabled(true);
      createUserWithEmailAndPassword(auth, values.email, values.password)
        .then(async (res) => {
          setSubmitButtonDisabled(false);
          const user = res.user;
          await updateProfile(user, {
            displayName: values.name,
          });
          const res1 = fetch(
            `https://dlms-67462-default-rtdb.asia-southeast1.firebasedatabase.app/userDataRecords/${name}.json`,
            {
              method: "POST",
              Headers: {
                "Content-Type": "application/json",
              },

              body: JSON.stringify({
                name,
                email,
              }),
            }
          );
          console.log(a1);
          console.log(email);
          navigate("/Home");
          // console.log(user)
        })
        .catch((err) => {
          setSubmitButtonDisabled(false);
          setErrorMsg(err.message);
        });
    }
  };
  return (
    <div className="fc1">
      <form action="" onSubmit={handleSubmit}>
        <div className="input-block">
          <label htmlFor="name" className="input-label">
            Name
          </label>
          <input
            type="name"
            autoComplete="off"
            name="name"
            id="name"
            placeholder="Name"
            value={values.name}
            onChange={handleChange}
            onBlur={handleBlur}
          />
          {errors.name && touched.name ? (
            <p className="form-error">{errors.name}</p>
          ) : null}
        </div>
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
        <div className="input-block">
          <label htmlFor="confirm_password" className="input-label">
            Confirm Password
          </label>
          <input
            type="password"
            autoComplete="off"
            name="confirm_password"
            id="confirm_password"
            placeholder="Confirm Password"
            value={values.confirm_password}
            onChange={handleChange}
            onBlur={handleBlur}
          />
          {errors.confirm_password && touched.confirm_password ? (
            <p className="form-error">{errors.confirm_password}</p>
          ) : null}
        </div>
        <div className="modal-buttons">
          <button
            className="input-button"
            type="submit"
            onClick={submitData}
            name="submit"
            disabled={submitButtonDisable}
          >
            Sign Up
          </button>
        </div>
      </form>
      <div className="login">
        <Link to="/"> If allready have an account please login </Link>
      </div>
      {errorMsg ? <p className="form-error">{errorMsg}</p> : null}
    </div>
  );
}
