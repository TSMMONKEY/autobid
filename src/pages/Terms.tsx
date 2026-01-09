import { Helmet } from "react-helmet-async";
import Layout from "@/components/Layout";

const Terms = () => {
  return (
    <>
      <Helmet>
        <title>Terms of Service | AutoBid SA</title>
        <meta name="description" content="Read the terms and conditions for using AutoBid SA car auction platform." />
      </Helmet>
      <Layout>
        <div className="pt-24 pb-16 min-h-screen">
          <div className="container mx-auto px-4 max-w-4xl">
            <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-8">
              Terms of <span className="text-primary">Service</span>
            </h1>

            <div className="prose prose-gray dark:prose-invert max-w-none space-y-8">
              <section className="bg-card rounded-xl p-8 border border-border">
                <h2 className="font-display text-xl font-semibold mb-4">1. Acceptance of Terms</h2>
                <p className="text-muted-foreground leading-relaxed">
                  By accessing and using AutoBid SA's website and services, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.
                </p>
              </section>

              <section className="bg-card rounded-xl p-8 border border-border">
                <h2 className="font-display text-xl font-semibold mb-4">2. Registration and Account</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  To bid on vehicles, you must create an account and provide accurate information. You are responsible for maintaining the confidentiality of your account credentials.
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2">
                  <li>You must be at least 18 years old to register</li>
                  <li>A R250 refundable deposit is required to activate bidding privileges</li>
                  <li>You must provide valid identification and contact information</li>
                </ul>
              </section>

              <section className="bg-card rounded-xl p-8 border border-border">
                <h2 className="font-display text-xl font-semibold mb-4">3. Bidding Rules</h2>
                <ul className="list-disc list-inside text-muted-foreground space-y-2">
                  <li>All bids are legally binding contracts to purchase</li>
                  <li>Bids cannot be retracted once placed</li>
                  <li>The highest bid at auction end wins the vehicle</li>
                  <li>A 5% buyer's premium applies to all winning bids</li>
                </ul>
              </section>

              <section className="bg-card rounded-xl p-8 border border-border">
                <h2 className="font-display text-xl font-semibold mb-4">4. Payment Terms</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Winning bidders must complete full payment within 48 hours. Failure to pay may result in account suspension and forfeiture of the R250 deposit. Accepted payment methods include EFT and bank deposits.
                </p>
              </section>

              <section className="bg-card rounded-xl p-8 border border-border">
                <h2 className="font-display text-xl font-semibold mb-4">5. Vehicle Condition</h2>
                <p className="text-muted-foreground leading-relaxed">
                  All vehicles are sold "as-is, where-is" with no warranties expressed or implied. Buyers are encouraged to inspect vehicles before bidding. Condition descriptions are provided as guidance only.
                </p>
              </section>

              <section className="bg-card rounded-xl p-8 border border-border">
                <h2 className="font-display text-xl font-semibold mb-4">6. Limitation of Liability</h2>
                <p className="text-muted-foreground leading-relaxed">
                  AutoBid SA acts as an intermediary between sellers and buyers. We are not liable for any mechanical issues, defects, or misrepresentations by sellers. Maximum liability is limited to the buyer's premium paid.
                </p>
              </section>

              <section className="bg-card rounded-xl p-8 border border-border">
                <h2 className="font-display text-xl font-semibold mb-4">7. Contact Information</h2>
                <p className="text-muted-foreground leading-relaxed">
                  For questions about these terms, contact us at info@autobidsa.co.za or call +27 11 000 0000.
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

export default Terms;
