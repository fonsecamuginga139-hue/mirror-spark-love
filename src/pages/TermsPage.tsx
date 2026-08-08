import LegalLayout from "@/components/LegalLayout";

const TermsPage = () => {
  return (
    <LegalLayout
      title="Terms of Service"
      description="The terms and conditions that govern your use of FinanceFLOW."
      path="/terms"
    >
      <p>
        These Terms of Service (&quot;Terms&quot;) govern your access to and use of FinanceFLOW. By creating
        an account or using the service, you agree to be bound by these Terms.
      </p>

      <h2>1. The Service</h2>
      <p>
        FinanceFLOW is a personal finance application that allows individual users to track transactions,
        manage goals, monitor recurring entries, and visualize their financial activity. The service is
        intended for personal, non-commercial use.
      </p>

      <h2>2. Accounts</h2>
      <p>
        You are responsible for maintaining the confidentiality of your account credentials and for all
        activity that occurs under your account. You must provide accurate information when registering.
      </p>

      <h2>3. Subscriptions and Pricing</h2>
      <ul>
        <li><strong>Free Trial:</strong> 7 days of full access at no cost.</li>
        <li><strong>Monthly Flow:</strong> $7/month, billed monthly.</li>
        <li><strong>Master Annual:</strong> $30/year, billed annually.</li>
      </ul>
      <p>
        Subscriptions renew automatically until cancelled. You can cancel at any time from your billing
        portal or by contacting support.
      </p>

      <h2>4. Acceptable Use</h2>
      <ul>
        <li>Do not attempt to disrupt, reverse-engineer, or abuse the service.</li>
        <li>Do not use the service for unlawful or fraudulent activities.</li>
        <li>Do not attempt to access another user&apos;s account or data.</li>
      </ul>

      <h2>5. Intellectual Property</h2>
      <p>
        All branding, design, code, and content of FinanceFLOW are owned by FinanceFLOW and protected by
        applicable intellectual property laws. You retain ownership of the financial data you input.
      </p>

      <h2>6. Disclaimer</h2>
      <p>
        FinanceFLOW is a personal finance organization tool. It does not provide financial, investment,
        legal, or tax advice. You are solely responsible for any decisions based on the information
        displayed in the app.
      </p>

      <h2>7. Limitation of Liability</h2>
      <p>
        To the maximum extent permitted by law, FinanceFLOW shall not be liable for any indirect,
        incidental, or consequential damages resulting from the use or inability to use the service.
      </p>

      <h2>8. Termination</h2>
      <p>
        We may suspend or terminate accounts that violate these Terms. You may close your account at any
        time from your profile settings.
      </p>

      <h2>9. Changes to These Terms</h2>
      <p>
        We may update these Terms from time to time. Continued use of the service after changes
        constitutes acceptance of the updated Terms.
      </p>

      <h2>10. Contact</h2>
      <p>
        Questions about these Terms can be sent to{" "}
        <a href="mailto:financeflow.team@gmail.com">financeflow.team@gmail.com</a>.
      </p>
    </LegalLayout>
  );
};

export default TermsPage;