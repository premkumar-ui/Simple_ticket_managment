import { useContext } from "react";
import API from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";

const Login = () => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  // 🔹 Validation Schema
  const LoginSchema = Yup.object().shape({
    email: Yup.string()
      .email("Invalid email format")
      .required("Email is required"),

    password: Yup.string()
      .min(6, "Minimum 6 characters")
      .required("Password is required"),
  });

  return (
    <div className="flex justify-center items-center min-h-[80vh] bg-gray-100 text-gray-800">
      <div className="p-6 shadow-lg rounded-xl w-80 bg-white">
        <h2 className="text-xl mb-4 text-center font-semibold">Login</h2>

        <Formik
          initialValues={{ email: "", password: "" }}
          validationSchema={LoginSchema}
          onSubmit={async (values, { setSubmitting }) => {
            try {
              const res = await API.post("/auth/login", values);
              login(res.data);

              if (res.data.user.role === "ADMIN") {
                navigate("/admin");
              } else {
                navigate("/dashboard");
              }
            } catch (err) {
              console.error(err);
              alert("Invalid credentials");
            } finally {
              setSubmitting(false);
            }
          }}
        >
          {({ isSubmitting }) => (
            <Form className="space-y-3">

              {/* Email */}
              <div>
                <Field
                  name="email"
                  type="email"
                  placeholder="Email"
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
                <p className="text-red-500 text-sm">
                  <ErrorMessage name="email" />
                </p>
              </div>

              {/* Password */}
              <div>
                <Field
                  name="password"
                  type="password"
                  placeholder="Password"
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
                <p className="text-red-500 text-sm">
                  <ErrorMessage name="password" />
                </p>
              </div>

              {/* Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-blue-600 text-white w-full p-2 rounded hover:bg-blue-700 transition disabled:opacity-50"
              >
                {isSubmitting ? "Logging in..." : "Login"}
              </button>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default Login;