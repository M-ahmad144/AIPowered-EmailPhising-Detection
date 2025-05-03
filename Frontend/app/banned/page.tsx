// pages/banned.js
import React from "react";
import Head from "next/head";
import Link from "next/link";

const BannedPage = () => {
  return (
    <>
      <Head>
        <title>Account Temporarily Restricted</title>
      </Head>
      <div className="flex flex-col justify-center items-center bg-gray-100 px-4 sm:px-6 lg:px-8 py-12 min-h-screen">
        <div className="bg-white shadow-md mb-4 px-8 pt-6 pb-8 rounded-lg">
          <div className="flex justify-center items-center mb-6">
            <svg
              className="w-16 h-16 text-red-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h2 className="mb-4 font-semibold text-gray-800 text-xl text-center">
            Your Account is Temporarily Restricted
          </h2>
          <p className="mb-4 text-gray-600 text-center">
            Your IP address has been temporarily blocked due to suspicious
            activity. This measure is in place to protect our system and users
            from potential security threats.
          </p>
          <div className="mb-4">
            <p className="text-gray-600 text-center">
              If you believe this is an error, please contact our support team.
            </p>
          </div>
          <div className="flex justify-center items-center">
            <Link href="/contact">
              <button
                className="bg-blue-500 hover:bg-blue-700 px-4 py-2 rounded focus:shadow-outline focus:outline-none font-bold text-white"
                type="button"
              >
                Contact Support
              </button>
            </Link>
            <Link href="/">
              <button
                className="bg-gray-300 hover:bg-gray-400 ml-4 px-4 py-2 rounded focus:shadow-outline focus:outline-none font-bold text-gray-800"
                type="button"
              >
                Go Back Home
              </button>
            </Link>
          </div>
        </div>
        <p className="mt-4 text-gray-500 text-sm text-center">
          © {new Date().getFullYear()} Your Phishing Detection System. All
          rights reserved.
        </p>
      </div>
    </>
  );
};

export default BannedPage;
