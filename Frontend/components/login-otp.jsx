"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import { useAuth } from "../app/contexts/AuthContext";
import { useSearchParams } from "next/navigation";
import axios from "axios";
export default function OtpPage() {
  const [email, setEmail] = useState("");
  const router = useRouter();
  const { contextPassword } = useAuth();

  // Read email from URL params on client side
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const emailFromParams = params.get("email");
    if (emailFromParams) {
      setEmail(emailFromParams);
    }
  }, []);

  // For individual OTP inputs
  const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
  const inputRefs = useRef([]);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("info");
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [resendDisabled, setResendDisabled] = useState(true);

  // API routes
  const generateRoute = "/api/generate-otp";
  const verifyRoute = "/api/login";

  const searchParams = useSearchParams();

  useEffect(() => {
    const emailFromParams = searchParams.get("email");
    if (!emailFromParams) {
      router.push("/login");
    } else {
      setEmail(emailFromParams);
    }
  }, [searchParams]);

  // Countdown timer for resend button
  useEffect(() => {
    if (countdown > 0 && resendDisabled) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0 && resendDisabled) {
      setResendDisabled(false);
    }
  }, [countdown, resendDisabled]);

  const sendOtp = useCallback(async () => {
    try {
      setSending(true);
      const { data } = await axios.post(generateRoute, { email });
      console.log(data);
      if (data.success) {
        setMessage("OTP sent successfully!");
        setMessageType("success");
        setResendDisabled(true);
        setCountdown(60);
      } else {
        setMessage(data.error || "Failed to send OTP.");
        setMessageType("error");
      }
    } catch (error) {
      console.error("Error sending OTP:", error);
      setMessage("Error sending OTP.");
      setMessageType("error");
    } finally {
      setSending(false);
    }
  }, [email, generateRoute]);

  useEffect(() => {
    if (email) {
      sendOtp();
    }
  }, [email, sendOtp]);
  const resendOtp = async () => {
    try {
      const { data } = await axios.post("/api/resend-otp", { email });

      setMessageType("success");
      setMessage(data.message || "Verification code sent successfully");

      setCountdown(60);
      setResendDisabled(true);
    } catch (error) {
      console.error("Error resending OTP:", error);
      setMessageType("error");
      setMessage("Failed to resend verification code. Please try again.");
    } finally {
      setSending(false);
    }
  };
  const handleVerify = async () => {
    const otp = otpDigits.join("");

    if (otp.length !== 6) {
      setMessageType("error");
      setMessage("Please enter all 6 digits of the verification code");
      return;
    }

    setVerifying(true);
    setMessageType("info");
    setMessage("Verifying code...");

    try {
      const res = await fetch(verifyRoute, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: contextPassword, otp }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessageType("success");
        setMessage(data.message || "Email verified successfully!");
        router.push("/");
      } else {
        setMessageType("error");
        setMessage(
          data.message || "Invalid verification code. Please try again."
        );
      }
    } catch (error) {
      console.error("Error verifying OTP:", error);
      setMessageType("error");
      setMessage("Verification failed. Please try again.");
    } finally {
      setVerifying(false);
    }
  };

  const handleDigitChange = (index, value) => {
    // Only allow digits
    if (value && !/^\d+$/.test(value)) return;

    const newOtpDigits = [...otpDigits];

    // Handle pasting full OTP
    if (value.length > 1) {
      const digits = value.split("").slice(0, 6);
      setOtpDigits(digits.concat(Array(6 - digits.length).fill("")));

      // Focus on appropriate input
      if (digits.length < 6 && inputRefs.current[digits.length]) {
        inputRefs.current[digits.length].focus();
      }
      return;
    }

    // Handle single digit
    newOtpDigits[index] = value;
    setOtpDigits(newOtpDigits);

    // Auto-focus next input
    if (value && index < 5 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, e) => {
    // Handle backspace to go back to previous input
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const messageVariants = {
    info: "text-blue-800 bg-blue-50",
    error: "text-red-800 bg-red-50",
    success: "text-green-800 bg-green-50",
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
              Verify Your Email
            </motion.h2>

            <motion.div
              className="mt-3 text-gray-600 text-sm text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <p>We have sent a 6-digit verification code to</p>
              <p className="mt-1 font-medium">{email}</p>
            </motion.div>

            {message && (
              <motion.div
                className={`rounded-md p-4 mt-6 ${messageVariants[messageType]}`}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex">
                  <div className="flex-shrink-0">
                    {messageType === "error" && (
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
                    )}
                    {messageType === "success" && (
                      <svg
                        className="w-5 h-5 text-green-400"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                    {messageType === "info" && (
                      <svg
                        className="w-5 h-5 text-blue-400"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </div>
                  <div className="ml-3">
                    <p className="font-medium text-sm">{message}</p>
                  </div>
                </div>
              </motion.div>
            )}

            <motion.div
              className="mt-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <label className="block mb-3 font-medium text-gray-700 text-sm text-center">
                Enter verification code
              </label>

              <div className="flex justify-center gap-2">
                {otpDigits.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => (inputRefs.current[index] = el)}
                    type="text"
                    maxLength={6}
                    value={digit}
                    onChange={(e) => handleDigitChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className="shadow-sm border border-gray-300 focus:border-indigo-500 rounded-lg focus:ring-2 focus:ring-indigo-500 w-12 h-12 font-bold text-xl text-center"
                    placeholder="•"
                  />
                ))}
              </div>

              <div className="mt-6">
                <motion.button
                  onClick={handleVerify}
                  disabled={verifying || otpDigits.join("").length !== 6}
                  className="flex justify-center bg-gradient-to-r from-indigo-600 hover:from-indigo-700 to-purple-600 hover:to-purple-700 disabled:opacity-60 shadow-sm px-4 py-3 border border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 w-full font-medium text-white text-base transition-all duration-300 disabled:cursor-not-allowed"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {verifying ? (
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
                  {verifying ? "Verifying..." : "Verify Email"}
                </motion.button>
              </div>

              <div className="mt-6 text-center">
                <p className="mb-2 text-gray-600 text-sm">
                  Did not receive the code?
                </p>
                <button
                  onClick={resendDisabled ? null : resendOtp}
                  disabled={resendDisabled || sending}
                  className="flex justify-center items-center mx-auto font-medium text-indigo-600 hover:text-indigo-500 disabled:text-indigo-400 text-sm transition-colors duration-300 disabled:cursor-not-allowed"
                >
                  {sending ? (
                    <svg
                      className="mr-2 -ml-1 w-4 h-4 text-indigo-600 animate-spin"
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
                  {sending
                    ? "Sending..."
                    : resendDisabled
                    ? `Resend code in ${countdown}s`
                    : "Resend code"}
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
