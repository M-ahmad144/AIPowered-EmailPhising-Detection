"use client";

import Image from "next/image";
import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

export default function Page() {
  const router = useRouter();
  const [user, setUser] = useState({ email: "", password: "" });
  const [errorMessage, setErrrorMessage] = useState("");

  const handleSubmit = async (e) => {
    try {
      e.preventDefault();
      if (user.email && user.password) {
        setErrrorMessage("");
        const res = await axios.post("/api/login", user);
        if (res.status === 200) router.push("/");
      } else if (!user.email || !user.password) {
        setErrrorMessage("Please fill all the fields");
      }
    } catch (err) {
      console.log(err);
      if (err.status === 400 || err.status === 401)
        setErrrorMessage(err.response.data.message);
    }
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
          <h2 className="mt-5 font-bold text-gray-900 text-2xl/9 text-center tracking-tight">
            Log in to your account
          </h2>
        </div>
        <div className="mt-5">
          <form action="#" method="POST" className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block font-medium text-gray-900 text-xl"
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
                  className="block bg-white px-3 py-1.5 rounded-md focus:outline outline-gray-300 focus:outline-indigo-600 -outline-offset-1 focus:-outline-offset-2 w-full text-gray-900 placeholder:text-gray-400 text-xl"
                  value={user.email}
                  onChange={(e) => setUser({ ...user, email: e.target.value })}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center">
                <label
                  htmlFor="password"
                  className="block font-medium text-gray-900 text-xl"
                >
                  Password
                </label>
                <div className="text-xl">
                  {/* <a href="#" className="font-semibold text-indigo-600 hover:text-indigo-500">
                                    Forgot password?
                                </a> */}
                </div>
              </div>
              <div className="mt-2">
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  autoComplete="current-password"
                  className="block bg-white px-3 py-1.5 rounded-md outline outline-gray-300 focus:outline-2 focus:outline-indigo-600 -outline-offset-1 focus:-outline-offset-2 w-full text-gray-900 placeholder:text-gray-400 text-xl"
                  value={user.password}
                  onChange={(e) =>
                    setUser({ ...user, password: e.target.value })
                  }
                />
              </div>
            </div>
            <div>
              <button
                type="submit"
                className="flex justify-center bg-indigo-600 hover:bg-indigo-500 shadow-sm px-3 py-1.5 rounded-md focus-visible:outline focus-visible:outline-indigo-600 focus-visible:outline-offset-2 w-full font-semibold text-white text-xl"
                onClick={(e) => handleSubmit(e)}
              >
                Log in
              </button>
            </div>
          </form>
          <span className="font-bold text-red-600 text-lg">{errorMessage}</span>
          <p className="mt-2 text-gray-500 text-md text-center">
            Don&apos;t have an account?{" "}
            <a
              href="/signup"
              className="font-semibold text-indigo-600 hover:text-indigo-500"
            >
              Sign up
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
