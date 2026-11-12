import Navbar from "@/components/Navbar";
import { jakarta } from "@/lib/fonts";
import ShareExperienceForm from "./ShareExperienceForm";

export const metadata = { title: "Share Your Experience" };

export default function ShareYourExperience() {
  return (
    <div className="flex w-full flex-1 flex-col bg-[#FAF7F2] text-[#0F172A]">
      <Navbar />

      <main className={`mx-auto w-full max-w-3xl flex-1 px-4 py-8 sm:px-6 sm:py-12 ${jakarta.className}`}>
        <ShareExperienceForm />
      </main>
    </div>
  );
}
