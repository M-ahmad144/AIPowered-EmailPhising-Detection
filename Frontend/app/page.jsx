"use client";
import Image from "next/image";
import axios from "axios";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await axios.post("/api/signout");
      router.push("/");
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="flex flex-col justify-between bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 px-6 sm:px-12 py-10 min-h-screen font-sans text-white">
      {/* Header */}
      <header className="flex justify-between items-center w-full">
        <div className="flex items-center gap-3">
          <Image src="/shield.svg" alt="Shield logo" width={40} height={40} />
          <h1 className="font-bold text-cyan-400 text-xl sm:text-2xl">
            Email Phishing Prevention System
          </h1>
        </div>
        <button
          onClick={handleSignOut}
          className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded"
        >
          Sign Out
        </button>
      </header>

      {/* Hero Section */}
      <main className="flex flex-col flex-grow justify-center items-center gap-6 mt-10 text-center">
        <h2 className="font-extrabold text-4xl sm:text-5xl leading-tight">
          AI + Zero Trust <br />
          <span className="text-cyan-400">Secure Email Intelligence</span>
        </h2>
        <p className="max-w-2xl text-gray-300 text-lg">
          Our system uses machine learning and Zero Trust principles to detect
          and prevent phishing attacks in real-time. Ensure secure communication
          and eliminate threats before they reach your inbox.
        </p>

        <div className="flex flex-wrap justify-center gap-4 mt-6">
          <button
            onClick={() => router.push("/dashboard")}
            className="bg-cyan-600 hover:bg-cyan-700 shadow-lg px-6 py-3 rounded font-medium text-lg transition"
          >
            🔐 Dashboard
          </button>
          <button
            onClick={() => router.push("/scan")}
            className="bg-blue-600 hover:bg-blue-700 shadow-lg px-6 py-3 rounded font-medium text-lg transition"
          >
            📧 Scan Emails
          </button>
          <button
            onClick={() => router.push("/threats")}
            className="bg-indigo-600 hover:bg-indigo-700 shadow-lg px-6 py-3 rounded font-medium text-lg transition"
          >
            🚨 Threat Activity
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-12 text-gray-500 text-sm text-center">
        © 2025 Email Phishing Prevention System — Built with ❤️ using Next.js,
        Node.js, and ML
      </footer>
    </div>
  );
}
