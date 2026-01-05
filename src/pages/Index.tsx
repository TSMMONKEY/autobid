import { Helmet } from "react-helmet-async";
import Layout from "@/components/Layout";
import HeroSection from "@/components/HeroSection";
import FeaturedAuctions from "@/components/FeaturedAuctions";
import LiveAuctionBanner from "@/components/LiveAuctionBanner";
import HowItWorks from "@/components/HowItWorks";
import Testimonials from "@/components/Testimonials";
import Newsletter from "@/components/Newsletter";

const Index = () => {
  return (
    <>
      <Helmet>
        <title>AutoElite - Premium Car Auctions | Buy & Sell Luxury Vehicles</title>
        <meta 
          name="description" 
          content="The world's premier online auction platform for luxury, exotic, and collector cars. Bid on exceptional vehicles from Porsche, Ferrari, Lamborghini and more." 
        />
      </Helmet>
      <Layout>
        <HeroSection />
        <LiveAuctionBanner />
        <FeaturedAuctions />
        <HowItWorks />
        <Testimonials />
        <Newsletter />
      </Layout>
    </>
  );
};

export default Index;
