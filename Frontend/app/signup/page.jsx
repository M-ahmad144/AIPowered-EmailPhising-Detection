"use client";

import { useState } from "react";
import axios from "axios";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const router = useRouter();

  // form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // validation
  const validate = () => {
    if (!email) {
      setErrorMessage("Email is required");
      return false;
    }
    if (!password) {
      setErrorMessage("Password is required");
      return false;
    }
    if (password.length < 8) {
      setErrorMessage("Password must be at least 8 characters");
      return false;
    }
    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match");
      return false;
    }
    return true;
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setErrorMessage("");
      setLoading(true);
      const res = await axios.post("/api/signup", { email, password });
      if (res.status === 200) {
        router.push(`/otp?email=${encodeURIComponent(email)}`);
      }
      setLoading(false);
    } catch (err) {
      setLoading(false);
      setErrorMessage(err.response?.data?.message || "Signup failed");
    }
  };

  const handleGoogleSignup = () => {
    window.location.href = "/api/auth/google";
  };

  return (
    <div className="flex flex-col flex-1 justify-center px-6 lg:px-8 py-12 min-h-full">
      <div className="bg-slate-100 sm:mx-auto p-8 rounded sm:w-full sm:max-w-md">
        <div>
          <Image
            width={100}
            height={100}
            alt="Your Company"
            src="https://tailwindcss.com/_next/static/media/tailwindcss-mark.d52e9897.svg"
            className="mx-auto w-auto h-10"
          />
          <h2 className="mt-5 font-bold text-gray-900 text-2xl text-center tracking-tight">
            Create your account
          </h2>
        </div>

        <div className="mt-5">
          <form onSubmit={handleSignup} className="space-y-4 mb-2">
            <div>
              <label
                htmlFor="email"
                className="block font-medium text-gray-900 text-sm"
              >
                Email address
              </label>
              <div className="mt-2">
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block bg-white px-3 py-1.5 rounded-md outline outline-gray-300 focus:outline-2 focus:outline-indigo-600 -outline-offset-1 focus:-outline-offset-2 w-full text-gray-900 placeholder:text-gray-400"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block font-medium text-gray-900 text-sm"
              >
                Password
              </label>
              <div className="mt-2">
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block bg-white px-3 py-1.5 rounded-md outline-gray-300 focus:outline-2 focus:outline-indigo-600 -outline-offset-1 focus:-outline-offset-2 w-full text-gray-900 placeholder:text-gray-400"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block font-medium text-gray-900 text-sm"
              >
                Confirm Password
              </label>
              <div className="mt-2">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="block bg-white px-3 py-1.5 rounded-md outline outline-gray-300 focus:outline-2 focus:outline-indigo-600 -outline-offset-1 focus:-outline-offset-2 w-full text-gray-900 placeholder:text-gray-400"
                />
              </div>
            </div>

            {errorMessage && (
              <div className="font-bold text-red-600 text-sm">
                {errorMessage}
              </div>
            )}

            <div>
              <button
                type="submit"
                onClick={handleSignup}
                className="flex justify-center bg-indigo-600 hover:bg-indigo-500 shadow-sm px-3 py-1.5 rounded-md focus-visible:outline focus-visible:outline-indigo-600 focus-visible:outline-offset-2 w-full font-semibold text-white text-sm"
              >
                {loading ? "Signing up..." : "Sign up"}
              </button>
            </div>
          </form>

          <div className="mt-4">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="border-gray-300 border-t w-full"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-slate-100 px-2 text-gray-500">
                  Or continue with
                </span>
              </div>
            </div>

            <div className="mt-4">
              <button
                type="button"
                onClick={handleGoogleSignup}
                className="flex justify-center items-center gap-2 bg-white hover:bg-gray-50 shadow-sm px-3 py-1.5 rounded-md ring-1 ring-gray-300 ring-inset w-full font-semibold text-gray-900 text-sm"
              >
                <svg className="w-5 h-5" aria-hidden="true" viewBox="0 0 24 24">
                  <path
                    d="M12.0003 4.75C13.7703 4.75 15.3553 5.36002 16.6053 6.54998L20.0303 3.125C17.9502 1.19 15.2353 0 12.0003 0C7.31028 0 3.25527 2.69 1.28027 6.60998L5.27028 9.70498C6.21525 6.86002 8.87028 4.75 12.0003 4.75Z"
                    fill="#EA4335"
                  />
                  <path
                    d="M23.49 12.275C23.49 11.49 23.415 10.73 23.3 10H12V14.51H18.47C18.18 15.99 17.34 17.25 16.08 18.1L19.945 21.1C22.2 19.01 23.49 15.92 23.49 12.275Z"
                    fill="#4285F4"
                  />
                  <path
                    d="M5.26498 14.2949C5.02498 13.5699 4.88501 12.7999 4.88501 11.9999C4.88501 11.1999 5.01998 10.4299 5.26498 9.7049L1.275 6.60986C0.46 8.22986 0 10.0599 0 11.9999C0 13.9399 0.46 15.7699 1.28 17.3899L5.26498 14.2949Z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12.0004 24.0001C15.2404 24.0001 17.9654 22.935 19.9454 21.095L16.0804 18.095C15.0054 18.82 13.6204 19.245 12.0004 19.245C8.8704 19.245 6.21537 17.135 5.2654 14.29L1.27539 17.385C3.25539 21.31 7.3104 24.0001 12.0004 24.0001Z"
                    fill="#34A853"
                  />
                </svg>
                Google
              </button>
            </div>
          </div>

          <p className="mt-4 text-gray-500 text-sm text-center">
            Already have an account?{" "}
            <a
              href="/login"
              className="font-semibold text-indigo-600 hover:text-indigo-500"
            >
              Log in
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
