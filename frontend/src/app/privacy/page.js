import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";

export const metadata = {
  title: "Privacy Policy — Yarn",
  description: "Privacy Policy and data protection terms for Yarn Voice Logbook.",
};

export default function PrivacyPolicyPage() {
  const lastUpdated = "October 13, 2026";

  return (
    <div className="min-h-screen bg-background py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-surface border border-border rounded-2xl p-6 sm:p-10 shadow-sm">
        {/* Back Link */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-ink-600 hover:text-ink-900 font-small text-sm mb-6 transition-colors"
        >
          <ArrowLeft size={16} />
          Back to Yarn
        </Link>

        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-accent-100 text-accent-700 flex items-center justify-center">
            <ShieldCheck size={22} />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-heading font-bold text-ink-900">
              Privacy Policy
            </h1>
            <p className="text-xs text-ink-400">Last updated: {lastUpdated}</p>
          </div>
        </div>

        <div className="mt-8 space-y-8 text-ink-900 font-body text-sm leading-relaxed border-t border-border pt-6">
          <section>
            <h2 className="text-lg font-heading font-semibold text-ink-900 mb-2">
              1. Overview
            </h2>
            <p className="text-ink-600">
              Yarn (&ldquo;we&rdquo;, &ldquo;our&rdquo;, or &ldquo;us&rdquo;) is a voice-to-text logbook generator designed to help students (including SIWES interns) and professionals record their daily activities and generate structured journal logs. We respect your privacy and are committed to safeguarding your personal information.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-heading font-semibold text-ink-900 mb-2">
              2. Information We Collect
            </h2>
            <ul className="list-disc pl-5 space-y-2 text-ink-600">
              <li>
                <strong className="text-ink-900">Google Account Information:</strong> When you choose to sign in with Google OAuth, we receive your email address, display name, and avatar picture provided by Google.
              </li>
              <li>
                <strong className="text-ink-900">Voice Audio Recordings:</strong> When you record voice notes or upload audio files to transcribe your daily work.
              </li>
              <li>
                <strong className="text-ink-900">Logbook Entries:</strong> Text notes, reflections, technical tasks, tags, and timestamps generated from your entries.
              </li>
              <li>
                <strong className="text-ink-900">Guest Session Identifiers:</strong> For users who choose to try Yarn as a guest without creating an account, an anonymous unique session token (UUID) is stored locally in your browser to maintain your logbook state.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-heading font-semibold text-ink-900 mb-2">
              3. How We Use Your Information
            </h2>
            <p className="text-ink-600 mb-3">
              We use collected information solely to deliver and improve the Yarn service:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-ink-600">
              <li>To authenticate you and associate your logs with your account.</li>
              <li>To transcribe and structure your spoken thoughts into formatted daily logbook entries using AI models (such as Google Gemini).</li>
              <li>To allow you to export your logs to document formats (PDF and Word docx).</li>
              <li>To merge previous guest logs into your Google account when you choose to connect.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-heading font-semibold text-ink-900 mb-2">
              4. Audio Processing & Storage Retention
            </h2>
            <p className="text-ink-600">
              Your voice recordings are processed solely to produce your log transcripts. Audio recordings are stored temporarily in secure cloud storage and are deleted following processing or upon log completion to ensure your audio privacy.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-heading font-semibold text-ink-900 mb-2">
              5. Third-Party Services & Google API Disclosures
            </h2>
            <p className="text-ink-600 mb-2">
              Yarn complies with the <strong>Google API Services User Data Policy</strong>, including the Limited Use requirements.
            </p>
            <ul className="list-disc pl-5 space-y-2 text-ink-600">
              <li>We only request access to basic profile and email scopes (<code className="text-xs bg-surface-muted px-1.5 py-0.5 rounded">openid</code>, <code className="text-xs bg-surface-muted px-1.5 py-0.5 rounded">email</code>, <code className="text-xs bg-surface-muted px-1.5 py-0.5 rounded">profile</code>).</li>
              <li>We do <strong>not</strong> sell your data to third parties, broker personal information, or use your private logbook content for marketing or advertising.</li>
              <li>We do not transfer your personal information to third parties except as necessary to provide core infrastructure (e.g., Supabase database hosting, AI transcription processing).</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-heading font-semibold text-ink-900 mb-2">
              6. Data Deletion and Your Rights
            </h2>
            <p className="text-ink-600">
              You maintain full ownership of your data:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-ink-600 mt-2">
              <li>
                <strong className="text-ink-900">Log Deletion:</strong> Any log moved to trash is permanently deleted after 7 days, or can be permanently purged immediately by the user.
              </li>
              <li>
                <strong className="text-ink-900">Account Deletion:</strong> You may request complete erasure of your account and associated logs at any time by contacting us.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-heading font-semibold text-ink-900 mb-2">
              7. Contact Us
            </h2>
            <p className="text-ink-600">
              If you have any questions about this Privacy Policy or wish to request data deletion, please reach out to:
            </p>
            <p className="text-ink-900 font-medium mt-2">
              Email: <a href="mailto:support@yarnlog.app" className="text-accent-600 underline">support@yarnlog.app</a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
