"use client";
import Image from "next/image";
import type React from "react";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [emailBody, setEmailBody] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission logic here
    console.log({ email, emailBody });
    // Reset form
    setEmail("");
    setEmailBody("");
  };

  const handleSignOut = async () => {
    try {
      await fetch("/api/signout", { method: "POST" });
      router.push("/");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex flex-col bg-white min-h-screen">
      {/* Header */}
      <header className="px-6 sm:px-12 py-4 border-b">
        <div className="flex justify-between items-center mx-auto max-w-7xl">
          <div className="flex items-center gap-3">
            <Image
              src="/placeholder.svg?height=40&width=40"
              alt="Logo"
              width={40}
              height={40}
            />
            <h1 className="font-bold text-gray-800 text-xl sm:text-2xl">
              Email Phishing Prevention System
            </h1>
          </div>
          <Button
            variant="destructive"
            onClick={handleSignOut}
            className="text-sm"
          >
            Sign Out
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow px-6 sm:px-12 py-10">
        <div className="mx-auto max-w-4xl">
          <div className="mb-10 text-center">
            <h2 className="mb-4 font-bold text-gray-900 text-3xl sm:text-4xl">
              Secure Email Intelligence
            </h2>
            <p className="mx-auto max-w-2xl text-gray-600">
              Our system uses machine learning and Zero Trust principles to
              detect and prevent phishing attacks in real-time.
            </p>
          </div>

          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="text-gray-800 text-center">
                Email Verification Form
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label
                    htmlFor="email"
                    className="font-medium text-gray-700 text-sm"
                  >
                    Email Address
                  </label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="emailBody"
                    className="font-medium text-gray-700 text-sm"
                  >
                    Email Body
                  </label>
                  <Textarea
                    id="emailBody"
                    placeholder="Enter email content to analyze"
                    value={emailBody}
                    onChange={(e) => setEmailBody(e.target.value)}
                    required
                    className="w-full min-h-[150px]"
                  />
                </div>

                <Button type="submit" className="w-full">
                  <Send className="mr-2 w-4 h-4" /> Analyze Email
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="gap-4 grid grid-cols-1 md:grid-cols-3 mt-10">
            <Button
              variant="outline"
              onClick={() => router.push("/dashboard")}
              className="h-16"
            >
              🔐 Dashboard
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push("/scan")}
              className="h-16"
            >
              📧 Scan Emails
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push("/threats")}
              className="h-16"
            >
              🚨 Threat Activity
            </Button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-6 sm:px-12 py-6 border-t text-gray-500 text-sm text-center">
        © 2025 Email Phishing Prevention System — Built with ❤️ using Next.js,
        Node.js, and ML
      </footer>
    </div>
  );
}
