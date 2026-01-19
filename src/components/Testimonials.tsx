import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "James Mitchell",
    role: "Collector",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200",
    content: "AutoElite made acquiring my dream Porsche 911 GT3 an absolute pleasure. The entire process was transparent, secure, and exciting.",
    rating: 5,
  },
  {
    name: "Sarah Chen",
    role: "First-time Buyer",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200",
    content: "I was nervous about buying a car online, but the team at AutoElite guided me through every step. My new Ferrari is everything I dreamed of!",
    rating: 5,
  },
  {
    name: "Michael Torres",
    role: "Dealer",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200",
    content: "As a dealer, I've sold dozens of vehicles through AutoElite. Their platform reaches serious buyers and the process is seamless.",
    rating: 5,
  },
];

const Testimonials = () => {
  return (
    <section className="py-24 bg-gradient-dark">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="text-primary font-medium text-sm uppercase tracking-wider">
            Testimonials
          </span>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground mt-2">
            Trusted by <span className="text-gradient-gold">Collectors</span>
          </h2>
          <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">
            Join thousands of satisfied buyers and sellers who trust AutoElite for their automotive transactions.
          </p>
        </div>

        {/* Testimonial Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-gradient-card rounded-2xl p-8 border border-border/50 relative animate-fade-in"
              style={{ animationDelay: `${index * 0.15}s` }}
            >
              {/* Quote Icon */}
              <Quote className="absolute top-6 right-6 w-10 h-10 text-primary/20" />

              {/* Rating */}
              <div className="flex gap-1 mb-6">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-primary text-primary" />
                ))}
              </div>

              {/* Content */}
              <p className="text-foreground/90 leading-relaxed mb-8">
                "{testimonial.content}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-4">
                <img
                  src={testimonial.image}
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full object-cover border-2 border-primary"
                />
                <div>
                  <p className="font-semibold text-foreground">{testimonial.name}</p>
                  <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
