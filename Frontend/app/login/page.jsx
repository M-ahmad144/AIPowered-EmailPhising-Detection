"use client";

import { useState } from "react";
import axios from "axios";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function LoginPage() {
  const router = useRouter();

  const [user, setUser] = useState({ email: "", password: "" });
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (!user.email || !user.password) {
        setErrorMessage("Please fill all the fields");
        return;
      }

      setErrorMessage("");
      setLoading(true);

      const res = await axios.post("/api/login", user);
      if (res.status === 200) {
        router.push("/");
      }

      setLoading(false);
    } catch (err) {
      console.log(err);
      setLoading(false);
      if (err.response?.status === 400 || err.response?.status === 401)
        setErrorMessage(err.response.data.message);
      else setErrorMessage("Login failed. Please try again.");
    }
  };

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="flex justify-center items-center bg-gradient-to-br from-indigo-100 to-purple-50 px-4 py-12 min-h-screen">
      <motion.div
        className="w-full max-w-md"
        initial="hidden"
        animate="visible"
        variants={fadeIn}
        transition={{ duration: 0.5 }}
      >
        <div className="relative bg-white shadow-xl rounded-2xl overflow-hidden">
          {/* Design accent */}
          <div className="top-0 right-0 left-0 absolute bg-gradient-to-r from-purple-500 via-indigo-500 to-blue-500 h-2"></div>

          <div className="px-8 pt-10 pb-8">
            <motion.div
              className="flex justify-center items-center"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <Image
                width={80}
                height={80}
                alt="Company Logo"
                src="https://tailwindcss.com/_next/static/media/tailwindcss-mark.d52e9897.svg"
                className="w-auto h-16"
              />
            </motion.div>

            <motion.h2
              className="mt-6 font-extrabold text-gray-900 text-3xl text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              Log in to your account
            </motion.h2>

            <form onSubmit={handleSubmit} className="space-y-6 mt-8">
              <motion.div
                className="space-y-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <div>
                  <label
                    htmlFor="email"
                    className="block font-medium text-gray-700 text-sm"
                  >
                    Email address
                  </label>
                  <div className="relative mt-1">
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      autoComplete="email"
                      value={user.email}
                      onChange={(e) =>
                        setUser({ ...user, email: e.target.value })
                      }
                      className="block shadow-sm px-4 py-3 border border-gray-300 focus:border-indigo-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full transition-all duration-300 appearance-none placeholder-gray-400"
                      placeholder="you@example.com"
                    />
                    <div className="right-0 absolute inset-y-0 flex items-center pr-3 pointer-events-none">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-5 h-5 text-gray-400"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                        <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center">
                    <label
                      htmlFor="password"
                      className="block font-medium text-gray-700 text-sm"
                    >
                      Password
                    </label>
                    <div className="text-sm">
                      <a
                        href="#"
                        className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors duration-300"
                      >
                        Forgot password?
                      </a>
                    </div>
                  </div>
                  <div className="relative mt-1">
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      required
                      autoComplete="current-password"
                      value={user.password}
                      onChange={(e) =>
                        setUser({ ...user, password: e.target.value })
                      }
                      className="block shadow-sm px-4 py-3 border border-gray-300 focus:border-indigo-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full transition-all duration-300 appearance-none placeholder-gray-400"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="right-0 absolute inset-y-0 flex items-center pr-3"
                    >
                      {showPassword ? (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="w-5 h-5 text-gray-500"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                          <path
                            fillRule="evenodd"
                            d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      ) : (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="w-5 h-5 text-gray-500"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z"
                            clipRule="evenodd"
                          />
                          <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
              </motion.div>

              {errorMessage && (
                <motion.div
                  className="bg-red-50 p-4 rounded-md"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg
                        className="w-5 h-5 text-red-400"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="font-medium text-red-800 text-sm">
                        {errorMessage}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <button
                  type="submit"
                  className="flex justify-center bg-gradient-to-r from-indigo-600 hover:from-indigo-700 to-purple-600 hover:to-purple-700 shadow-sm px-4 py-3 border border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 w-full font-medium text-white text-base transition-all duration-300"
                >
                  {loading ? (
                    <svg
                      className="mr-3 -ml-1 w-5 h-5 text-white animate-spin"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                  ) : null}
                  {loading ? "Logging in..." : "Log in"}
                </button>
              </motion.div>
            </form>

            <motion.div
              className="mt-6 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <p className="text-gray-600 text-sm">
                Don&apos;t have an account?{" "}
                <a
                  href="/signup"
                  className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors duration-300"
                >
                  Sign up
                </a>
              </p>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
