"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export default function OtpPage() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  const router = useRouter();

  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);

  // Make sure these routes start with a forward slash
  const generateRoute = "/api/generate-otp";
  const verifyRoute = "/api/verify-otp";

  // Redirect back if no email in URL
  useEffect(() => {
    if (!email) {
      router.push("/signup");
    }
  }, [email, router]);

  // Send OTP on mount
  useEffect(() => {
    if (!email) return;
    const sendOtp = async () => {
      setSending(true);
      try {
        const res = await fetch(generateRoute, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });

        if (!res.ok) {
          throw new Error(`HTTP error! Status: ${res.status}`);
        }

        const data = await res.json();
        setMessage(data.message);
      } catch (error) {
        console.error("Error sending OTP:", error);
        setMessage("Failed to send OTP");
      } finally {
        setSending(false);
      }
    };

    sendOtp();
  }, [email, generateRoute]);

  const handleVerify = async () => {
    if (!otp) {
      setMessage("Please enter OTP code");
      return;
    }

    setVerifying(true);
    try {
      const res = await fetch(verifyRoute, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });

      const data = await res.json();
      setMessage(data.message);

      if (res.ok) {
        setTimeout(() => {
          router.push("/login");
        }, 1500); // Delay to show success message
      }
    } catch (error) {
      console.error("Error verifying OTP:", error);
      setMessage("OTP verification failed");
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="flex justify-center items-center p-6 min-h-screen">
      <div className="bg-white shadow-md p-8 rounded w-full max-w-sm text-center">
        <h2 className="mb-4 font-semibold text-xl">Verify Your Email</h2>
        <p className="mb-4 text-gray-700">
          {sending ? "Sending OTP…" : message || `OTP sent to ${email}`}
        </p>

        <input
          type="text"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          placeholder="Enter OTP"
          className="mb-4 px-3 py-2 border rounded w-full"
        />

        <button
          onClick={handleVerify}
          disabled={verifying}
          className="bg-green-600 hover:bg-green-700 disabled:opacity-50 py-2 rounded w-full text-white"
        >
          {verifying ? "Verifying…" : "Verify OTP"}
        </button>
      </div>
    </div>
  );
}
