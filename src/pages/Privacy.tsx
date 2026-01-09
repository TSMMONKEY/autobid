import { Helmet } from "react-helmet-async";
import Layout from "@/components/Layout";

const Privacy = () => {
  return (
    <>
      <Helmet>
        <title>Privacy Policy | AutoBid SA</title>
        <meta name="description" content="Learn how AutoBid SA collects, uses, and protects your personal information." />
      </Helmet>
      <Layout>
        <div className="pt-24 pb-16 min-h-screen">
          <div className="container mx-auto px-4 max-w-4xl">
            <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-8">
              Privacy <span className="text-primary">Policy</span>
            </h1>

            <div className="prose prose-gray dark:prose-invert max-w-none space-y-8">
              <section className="bg-card rounded-xl p-8 border border-border">
                <h2 className="font-display text-xl font-semibold mb-4">Information We Collect</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  We collect information you provide directly to us, including:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2">
                  <li>Name, email address, phone number, and location</li>
                  <li>ID documentation for verification purposes</li>
                  <li>Payment and billing information</li>
                  <li>Bidding history and preferences</li>
                </ul>
              </section>

              <section className="bg-card rounded-xl p-8 border border-border">
                <h2 className="font-display text-xl font-semibold mb-4">How We Use Your Information</h2>
                <ul className="list-disc list-inside text-muted-foreground space-y-2">
                  <li>To process your bids and transactions</li>
                  <li>To verify your identity and prevent fraud</li>
                  <li>To communicate about auctions and your account</li>
                  <li>To improve our services and user experience</li>
                  <li>To send marketing communications (with your consent)</li>
                </ul>
              </section>

              <section className="bg-card rounded-xl p-8 border border-border">
                <h2 className="font-display text-xl font-semibold mb-4">Information Sharing</h2>
                <p className="text-muted-foreground leading-relaxed">
                  We do not sell your personal information. We may share your information with:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2 mt-4">
                  <li>Service providers who assist our operations</li>
                  <li>Legal authorities when required by law</li>
                  <li>Vehicle sellers (limited to transaction details)</li>
                </ul>
              </section>

              <section className="bg-card rounded-xl p-8 border border-border">
                <h2 className="font-display text-xl font-semibold mb-4">Data Security</h2>
                <p className="text-muted-foreground leading-relaxed">
                  We implement appropriate security measures to protect your personal information from unauthorized access, alteration, or disclosure. This includes encryption, secure servers, and regular security audits.
                </p>
              </section>

              <section className="bg-card rounded-xl p-8 border border-border">
                <h2 className="font-display text-xl font-semibold mb-4">Your Rights</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Under POPIA, you have the right to:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2">
                  <li>Access your personal information</li>
                  <li>Correct inaccurate information</li>
                  <li>Request deletion of your data</li>
                  <li>Opt-out of marketing communications</li>
                </ul>
              </section>

              <section className="bg-card rounded-xl p-8 border border-border">
                <h2 className="font-display text-xl font-semibold mb-4">Cookies</h2>
                <p className="text-muted-foreground leading-relaxed">
                  We use cookies and similar technologies to enhance your browsing experience, analyze site traffic, and personalize content. You can control cookie preferences through your browser settings.
                </p>
              </section>

              <section className="bg-card rounded-xl p-8 border border-border">
                <h2 className="font-display text-xl font-semibold mb-4">Contact Us</h2>
                <p className="text-muted-foreground leading-relaxed">
                  For privacy-related inquiries, contact our Data Protection Officer at privacy@autobidsa.co.za or call +27 11 000 0000.
                </p>
              </section>

              <p className="text-sm text-muted-foreground text-center">
                Last updated: January 2025
              </p>
            </div>
          </div>
        </div>
      </Layout>
    </>
  );
};

export default Privacy;
