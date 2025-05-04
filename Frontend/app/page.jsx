"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Send,
  Shield,
  Lock,
  AlertTriangle,
  ChevronRight,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { motion } from "framer-motion";
import forge from "node-forge";

export default function EmailAnalysis() {
  const [publicKey, setPublicKey] = useState(null);
  const [email, setEmail] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [userInfo, setUser] = useState(null);
  const router = useRouter();

  // Fetch user data
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/me", {
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }

        const data = await res.json();

        if (data.success) {
          setUser(data.user);
        } else {
          console.error("User fetch error:", data.error);
          router.push("/login");
        }
      } catch (error) {
        console.error("Error fetching user:", error);
        router.push("/login");
      }
    };

    fetchUser();
  }, [router]);

  // Fetch public key
  useEffect(() => {
    const fetchPublicKey = async () => {
      try {
        const res = await fetch(
          "https://is-project-backend-production.up.railway.app/api/public_key"
        );

        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }

        const data = await res.json();
        setPublicKey(data.public_key);
      } catch (err) {
        console.error("Failed to fetch public key:", err);
        alert("Failed to load security keys. Please refresh the page.");
      }
    };

    fetchPublicKey();
  }, []);

  // Encryption function
  const encryptData = (data) => {
    if (!publicKey) {
      throw new Error("Public key not available");
    }

    try {
      const publicKeyObj = forge.pki.publicKeyFromPem(publicKey);
      const encrypted = publicKeyObj.encrypt(JSON.stringify(data), "RSA-OAEP", {
        md: forge.md.sha256.create(),
        mgf1: forge.mgf.mgf1.create(forge.md.sha256.create()),
      });
      return forge.util.encode64(encrypted);
    } catch (err) {
      console.error("Encryption error:", err);
      throw new Error("Failed to encrypt data");
    }
  };

  // Form submission handler
  const handleSubmitEmail = async (e) => {
    e.preventDefault();

    if (!email || !emailBody) {
      alert("Please enter both email and email body!");
      return;
    }

    // Validate email format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      alert("Please enter a valid email address");
      return;
    }

    setIsLoading(true);

    try {
      const encryptedData = encryptData({
        email,
        body: emailBody,
      });

      const response = await fetch(
        "https://is-project-backend-production.up.railway.app/api/predict",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ encrypted: encryptedData }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Analysis failed");
      }

      const resultData = await response.json();
      setResult(resultData);
    } catch (error) {
      console.error("Error during analysis:", error);
      alert(error.message || "Something went wrong during analysis.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      const res = await fetch("/api/signout", {
        method: "POST",
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error("Failed to sign out");
      }

      router.push("/login");
    } catch (err) {
      console.error("Error during sign out:", err);
      alert("Error during sign out.");
    }
  };

  return (
    <div className="relative flex flex-col bg-gradient-to-b from-white to-gray-50 min-h-screen overflow-hidden">
      {/* SVG Background Elements */}
      <div className="z-0 absolute inset-0 overflow-hidden">
        <svg
          className="top-0 left-0 absolute opacity-[0.03] w-full h-full"
          viewBox="0 0 1000 1000"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern
              id="grid"
              width="40"
              height="40"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 40 0 L 0 0 0 40"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.05, scale: 1 }}
          transition={{
            duration: 2,
            repeat: Number.POSITIVE_INFINITY,
            repeatType: "reverse",
          }}
          className="top-[10%] right-[5%] absolute w-[600px] h-[600px]"
        >
          <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
            <path
              fill="#3B82F6"
              d="M45.3,-51.2C58.3,-40.5,68.3,-25.1,70.3,-8.7C72.3,7.8,66.4,25.2,55.3,37.1C44.2,49,27.9,55.3,10.8,59.9C-6.3,64.5,-24.2,67.3,-39.2,60.6C-54.2,53.9,-66.3,37.7,-70.6,19.9C-74.9,2.1,-71.4,-17.3,-61.3,-31.2C-51.2,-45.1,-34.5,-53.5,-18.4,-58.8C-2.3,-64.1,13.2,-66.3,28.1,-62.1C43,-57.9,57.3,-47.3,45.3,-51.2Z"
              transform="translate(100 100)"
            />
          </svg>
        </motion.div>
      </div>

      {/* Header */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="top-0 z-10 sticky bg-white/80 backdrop-blur-sm px-6 sm:px-12 py-4 border-b"
      >
        <div className="flex justify-between items-center mx-auto max-w-7xl">
          <motion.div
            className="flex items-center gap-3"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <div className="relative flex justify-center items-center bg-blue-600 rounded-lg w-10 h-10 overflow-hidden">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <h1 className="font-bold text-gray-800 text-xl sm:text-2xl">
              Email Phishing Prevention System
            </h1>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant="destructive"
              onClick={handleSignOut}
              className="gap-2 text-sm"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </Button>
          </motion.div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="z-10 relative flex-grow px-6 sm:px-12 py-10">
        <div className="mx-auto max-w-4xl">
          <motion.div
            className="mb-10 text-center"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <h2 className="bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-600 mb-4 font-bold text-gray-900 text-3xl sm:text-4xl">
              Secure Email Intelligence
            </h2>
            <p className="mx-auto max-w-2xl text-gray-600">
              Our system uses machine learning and Zero Trust principles to
              detect and prevent phishing attacks in real-time.
            </p>
          </motion.div>

          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card className="bg-white/90 shadow-lg backdrop-blur-sm border-0">
              <CardHeader className="pb-2">
                <CardTitle className="text-gray-800 text-2xl text-center">
                  Email Verification Form
                </CardTitle>
                <CardDescription className="text-center">
                  Submit an email to analyze for potential phishing threats
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmitEmail} className="space-y-6">
                  <motion.div
                    className="space-y-2"
                    whileHover={{ scale: 1.01 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  >
                    <label
                      htmlFor="email"
                      className="flex items-center gap-2 font-medium text-gray-700 text-sm"
                    >
                      <Lock className="w-4 h-4 text-blue-500" />
                      Email Address
                    </label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="focus:border-transparent focus:ring-2 focus:ring-blue-500 w-full transition-all duration-300"
                    />
                  </motion.div>

                  <motion.div
                    className="space-y-2"
                    whileHover={{ scale: 1.01 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  >
                    <label
                      htmlFor="emailBody"
                      className="flex items-center gap-2 font-medium text-gray-700 text-sm"
                    >
                      <AlertTriangle className="w-4 h-4 text-blue-500" />
                      Email Body
                    </label>
                    <Textarea
                      id="emailBody"
                      placeholder="Enter email content to analyze"
                      value={emailBody}
                      onChange={(e) => setEmailBody(e.target.value)}
                      required
                      className="focus:border-transparent focus:ring-2 focus:ring-blue-500 w-full min-h-[150px] transition-all duration-300"
                    />
                  </motion.div>

                  <motion.div
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <Button
                      type="submit"
                      className="bg-gradient-to-r from-blue-600 hover:from-blue-700 to-cyan-600 hover:to-cyan-700 w-full h-12 text-base transition-all duration-300"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{
                            duration: 1,
                            repeat: Number.POSITIVE_INFINITY,
                            ease: "linear",
                          }}
                          className="mr-2 border-2 border-white border-t-transparent rounded-full w-5 h-5"
                        />
                      ) : (
                        <Send className="mr-2 w-5 h-5" />
                      )}
                      {isLoading ? "Analyzing..." : "Analyze Email"}
                    </Button>
                  </motion.div>
                </form>
              </CardContent>
            </Card>

            {result &&
              (() => {
                const probabilities = result.all_probabilities || {};
                const sortedEntries = Object.entries(probabilities).sort(
                  (a, b) => b[1] - a[1]
                );
                const topClass = sortedEntries[0]?.[0]?.toLowerCase();
                const phishingUrlScore = probabilities["phishing_url"] || 0;
                const isPhishingUrlHigh = phishingUrlScore > 0.9;

                return (
                  <div className="flex justify-center my-8 w-full">
                    <div className="bg-gradient-to-r from-indigo-50 to-blue-50 shadow-md border border-indigo-100 rounded-xl w-full max-w-xl overflow-hidden">
                      {/* Header */}
                      <div
                        className={`p-4 ${
                          topClass === "phishing"
                            ? "bg-red-500"
                            : "bg-green-500"
                        } text-white`}
                      >
                        <h3 className="font-bold text-xl text-center">
                          Analysis Result
                        </h3>
                      </div>

                      {/* Content */}
                      <div className="p-5">
                        {/* Prediction */}
                        <div className="flex justify-between items-center bg-white shadow-sm mb-4 p-3 rounded-lg">
                          <span className="font-medium text-gray-700">
                            Prediction:
                          </span>
                          <span
                            className={`font-bold px-3 py-1 rounded-full ${
                              topClass === "phishing"
                                ? "bg-red-100 text-red-700"
                                : "bg-green-100 text-green-700"
                            }`}
                          >
                            {topClass === "phishing"
                              ? "Phishing Email"
                              : "Not Phishing"}
                          </span>
                        </div>

                        {/* Warning for phishing_url */}
                        {isPhishingUrlHigh && (
                          <div className="bg-yellow-100 mb-4 p-3 border-yellow-500 border-l-4 rounded text-yellow-800">
                            ⚠️ <strong>Warning:</strong> This email contains a
                            URL that is highly likely to be phishing (
                            {(phishingUrlScore * 100).toFixed(2)}%).
                          </div>
                        )}

                        {/* Email Check */}
                        <div className="bg-white shadow-sm mb-4 p-3 rounded-lg">
                          <div className="mb-1 font-medium text-gray-700">
                            Email Check:
                          </div>
                          <div className="pl-2 border-indigo-300 border-l-4">
                            {result.email_check}
                          </div>
                        </div>

                        {/* Confidence */}
                        <div className="mb-4">
                          <div className="mb-2 font-medium text-gray-700">
                            Confidence:
                          </div>
                          <div className="relative pt-1">
                            <div className="flex justify-between items-center mb-2">
                              <div>
                                <span className="inline-block bg-indigo-200 px-2 py-1 rounded-full font-semibold text-indigo-700 text-xs uppercase">
                                  {(result.confidence * 100).toFixed(2)}%
                                </span>
                              </div>
                            </div>
                            <div className="flex bg-gray-200 mb-4 rounded h-2 overflow-hidden text-xs">
                              <div
                                style={{ width: `${result.confidence * 100}%` }}
                                className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${
                                  topClass === "phishing"
                                    ? "bg-red-500"
                                    : "bg-green-500"
                                }`}
                              ></div>
                            </div>
                          </div>
                        </div>

                        {/* All Probabilities */}
                        <div className="bg-white shadow-sm p-4 rounded-lg">
                          <h4 className="mb-3 pb-2 border-b font-medium text-gray-800">
                            All Probabilities:
                          </h4>
                          <div className="space-y-3">
                            {Object.entries(probabilities).map(
                              ([key, value]) => (
                                <div
                                  key={key}
                                  className="gap-2 grid grid-cols-3"
                                >
                                  <span className="col-span-1 font-medium text-gray-600">
                                    {key}:
                                  </span>
                                  <div className="col-span-2">
                                    <div className="flex items-center">
                                      <div className="bg-gray-200 mr-2 rounded-full w-full h-2.5">
                                        <div
                                          className={`h-2.5 rounded-full ${
                                            key
                                              .toLowerCase()
                                              .includes("phishing")
                                              ? "bg-red-400"
                                              : "bg-green-400"
                                          }`}
                                          style={{ width: `${value * 100}%` }}
                                        ></div>
                                      </div>
                                      <span className="font-medium text-gray-900 text-sm">
                                        {(value * 100).toFixed(2)}%
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}
          </motion.div>

          {userInfo?.role === "admin" && (
            <motion.div
              className="flex justify-center gap-4 mt-10 align-middle"
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <motion.div
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  variant="outline"
                  onClick={() => router.push("/dashboard")}
                  className="group bg-white/80 hover:bg-blue-50 shadow-sm backdrop-blur-sm border border-gray-200 hover:border-blue-200 w-full h-16 transition-all duration-300"
                >
                  <div className="flex justify-between items-center w-full">
                    <div className="flex items-center">
                      <div className="bg-blue-100 mr-3 p-2 rounded-full">
                        <Lock className="w-5 h-5 text-blue-600" />
                      </div>
                      <span>Dashboard</span>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-all group-hover:translate-x-1" />
                  </div>
                </Button>
              </motion.div>

              {/* Threat Activity */}
              <motion.div
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  variant="outline"
                  onClick={() => router.push("/threat-activity")}
                  className="group bg-white/80 hover:bg-red-50 shadow-sm backdrop-blur-sm border border-gray-200 hover:border-red-200 w-full h-16 transition-all duration-300"
                >
                  <div className="flex justify-between items-center w-full">
                    <div className="flex items-center">
                      <div className="bg-red-100 mr-3 p-2 rounded-full">
                        <AlertTriangle className="w-5 h-5 text-red-600" />
                      </div>
                      <span>Threat Activity</span>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-red-500 transition-all group-hover:translate-x-1" />
                  </div>
                </Button>
              </motion.div>
            </motion.div>
          )}
        </div>
      </main>

      {/* Footer */}
      <motion.footer
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="z-10 relative bg-white/80 backdrop-blur-sm px-6 sm:px-12 py-6 border-t text-gray-500 text-sm text-center"
      >
        <div className="flex sm:flex-row flex-col justify-center items-center gap-2 sm:gap-4">
          <span>© 2025 Email Phishing Prevention System</span>
          <span className="hidden sm:inline">•</span>
          <span className="flex items-center">
            Built with <span className="mx-1">❤️</span> using Next.js, Node.js,
            and ML
          </span>
        </div>
      </motion.footer>
    </div>
  );
}
