import { Suspense } from "react";
import OtpPage from "../../components/login-otp"; // Assuming OtpPage is your client component

export default function OtpWrapper() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <OtpPage />
    </Suspense>
  );
}
