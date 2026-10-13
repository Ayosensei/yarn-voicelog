import Link from "next/link";
import { ArrowLeft, FileText } from "lucide-react";

export const metadata = {
  title: "Terms of Service — Yarn",
  description: "Terms of Service and conditions of use for Yarn Voice Logbook.",
};

export default function TermsOfServicePage() {
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
            <FileText size={22} />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-heading font-bold text-ink-900">
              Terms of Service
            </h1>
            <p className="text-xs text-ink-400">Last updated: {lastUpdated}</p>
          </div>
        </div>

        <div className="mt-8 space-y-8 text-ink-900 font-body text-sm leading-relaxed border-t border-border pt-6">
          <section>
            <h2 className="text-lg font-heading font-semibold text-ink-900 mb-2">
              1. Agreement to Terms
            </h2>
            <p className="text-ink-600">
              By accessing or using Yarn (&ldquo;the Application&rdquo;), you agree to be bound by these Terms of Service (&ldquo;Terms&rdquo;). If you disagree with any part of these Terms, you may not access or use Yarn.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-heading font-semibold text-ink-900 mb-2">
              2. Description of the Service
            </h2>
            <p className="text-ink-600">
              Yarn is an application that allows students, interns, and professionals to create and manage daily work logbooks. Features include voice recording, AI-assisted transcript formatting, task categorization, and export capabilities (PDF and Word docx formats).
            </p>
          </section>

          <section>
            <h2 className="text-lg font-heading font-semibold text-ink-900 mb-2">
              3. User Accounts & Guest Sessions
            </h2>
            <ul className="list-disc pl-5 space-y-2 text-ink-600">
              <li>
                <strong className="text-ink-900">Google Authentication:</strong> You may sign in using your Google account. You are responsible for maintaining the confidentiality of your credentials.
              </li>
              <li>
                <strong className="text-ink-900">Guest Mode:</strong> You may also use Yarn without creating an account. In guest mode, your data is linked to your browser session. We recommend linking an account if you wish to access your logbook across multiple devices.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-heading font-semibold text-ink-900 mb-2">
              4. User Content & Ownership
            </h2>
            <p className="text-ink-600">
              You retain all ownership rights to the voice recordings, thoughts, reflections, and generated text logs you create on Yarn. You grant Yarn a limited license solely to process, host, and transmit your content as necessary to provide the service to you.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-heading font-semibold text-ink-900 mb-2">
              5. AI Disclaimer & Academic Responsibility
            </h2>
            <p className="text-ink-600">
              Yarn utilizes automated artificial intelligence models (such as Google Gemini) to transcribe and format spoken entries. While the AI assists in structuring your logs, <strong>you are solely responsible for reviewing and verifying the accuracy of all generated entries</strong> before submitting them to academic supervisors, employers, or industrial coordinators.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-heading font-semibold text-ink-900 mb-2">
              6. Acceptable Use
            </h2>
            <p className="text-ink-600 mb-2">You agree not to:</p>
            <ul className="list-disc pl-5 space-y-1.5 text-ink-600">
              <li>Use Yarn for any unlawful or fraudulent purpose.</li>
              <li>Upload malicious code, viruses, or harmful software.</li>
              <li>Attempt to reverse engineer, disrupt, or compromise the infrastructure of Yarn.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-heading font-semibold text-ink-900 mb-2">
              7. Disclaimer of Warranties & Limitation of Liability
            </h2>
            <p className="text-ink-600">
              Yarn is provided on an &ldquo;AS IS&rdquo; and &ldquo;AS AVAILABLE&rdquo; basis without warranties of any kind. We do not guarantee uninterrupted service, and we recommend periodically downloading your logbook exports for offline backup. To the fullest extent permitted by law, Yarn shall not be liable for any indirect, incidental, or consequential damages.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-heading font-semibold text-ink-900 mb-2">
              8. Contact Us
            </h2>
            <p className="text-ink-600">
              For questions regarding these Terms of Service, please contact us at:
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
