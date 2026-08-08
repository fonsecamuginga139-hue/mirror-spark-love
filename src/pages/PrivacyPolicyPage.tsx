import LegalLayout from "@/components/LegalLayout";

const PrivacyPolicyPage = () => {
  return (
    <LegalLayout
      title="Privacy Policy"
      description="Learn how FinanceFLOW collects, uses, and protects your personal and financial data."
      path="/privacy-policy"
    >
      <p>
        FinanceFLOW (&quot;we&quot;, &quot;our&quot;, &quot;us&quot;) is committed to protecting your privacy. This Privacy
        Policy explains how we collect, use, store, and safeguard the information you provide when
        using our personal finance application.
      </p>

      <h2>1. Information We Collect</h2>
      <p>We collect the following types of information:</p>
      <ul>
        <li><strong>Account data:</strong> name, email, currency, and language preferences.</li>
        <li><strong>Financial data:</strong> transactions, cards, categories, goals, and recurring entries you create.</li>
        <li><strong>Usage data:</strong> device type, app interactions, and diagnostic information.</li>
      </ul>

      <h2>2. How We Use Your Information</h2>
      <ul>
        <li>Provide and operate the FinanceFLOW service.</li>
        <li>Process subscriptions and payment-related events.</li>
        <li>Improve product performance, reliability, and security.</li>
        <li>Communicate important updates about your account.</li>
      </ul>

      <h2>3. Data Storage and Security</h2>
      <p>
        Your data is stored on encrypted infrastructure provided by Supabase. We apply industry-standard
        security practices, including row-level security, encrypted connections, and strict access controls.
        Only you can access your financial data through your authenticated account.
      </p>

      <h2>4. Sharing of Information</h2>
      <p>
        We do not sell or rent your personal information. We only share data with third-party processors
        strictly required to operate the service (e.g., payment provider for subscription billing).
      </p>

      <h2>5. Your Rights</h2>
      <p>
        You may access, correct, export, or delete your personal data at any time from your profile
        settings, or by contacting us at <a href="mailto:financeflow.team@gmail.com">financeflow.team@gmail.com</a>.
      </p>

      <h2>6. Data Retention</h2>
      <p>
        We retain your data while your account is active. If you delete your account, your financial data
        is permanently removed from our systems within a reasonable period.
      </p>

      <h2>7. Cookies and Local Storage</h2>
      <p>
        FinanceFLOW uses local storage and cookies strictly to maintain your authenticated session and
        improve performance. We do not use third-party advertising trackers.
      </p>

      <h2>8. Changes to This Policy</h2>
      <p>
        We may update this Privacy Policy from time to time. Material changes will be communicated through
        the app or via email.
      </p>

      <h2>9. Contact</h2>
      <p>
        For any privacy-related questions, contact us at{" "}
        <a href="mailto:financeflow.team@gmail.com">financeflow.team@gmail.com</a>.
      </p>
    </LegalLayout>
  );
};

export default PrivacyPolicyPage;