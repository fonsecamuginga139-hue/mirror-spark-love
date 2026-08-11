import { Star, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";

import testimonialCarlos from "@/assets/testimonial-carlos.jpg";
import testimonialAna from "@/assets/testimonial-ana.jpg";
import testimonialRicardo from "@/assets/testimonial-ricardo.jpg";
import testimonialJoana from "@/assets/testimonial-joana.jpg";

interface Testimonial {
  quote: string[];
  author: string;
  location: string;
  image: string;
}

const testimonials: Testimonial[] = [
  {
    quote: [
      "Achava que não ganhava o suficiente.",
      "A verdade é que gastava mal.",
      "Em 30 dias com o Vault, vi exatamente onde o meu dinheiro se perdia.",
    ],
    author: "Carlos M.",
    location: "Portugal",
    image: testimonialCarlos,
  },
  {
    quote: [
      "Nunca conseguia controlar as minhas despesas.",
      "Com o Vault, tudo fica claro.",
      "Agora sei quanto posso gastar sem medo.",
    ],
    author: "Ana P.",
    location: "Brazil",
    image: testimonialAna,
  },
  {
    quote: [
      "Não é apenas uma app bonita.",
      "É um alerta.",
      "Ou controla o dinheiro, ou o dinheiro controla-o a si.",
    ],
    author: "Ricardo S.",
    location: "Brazil",
    image: testimonialRicardo,
  },
  {
    quote: [
      "Achava impossível gerir tudo num telemóvel.",
      "O Vault provou que estava errada.",
      "Simples, rápido, e realmente funciona.",
    ],
    author: "Joana L.",
    location: "Portugal",
    image: testimonialJoana,
  },
];

const TestimonialsSection = () => {
  return (
    <section className="px-4 py-16 md:py-20 bg-[#0B0B0B] relative overflow-hidden">
      {/* Subtle background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      
      <div className="max-w-3xl mx-auto relative">
        {/* Section Header */}
        <div className="text-center mb-12 opacity-0 animate-[testimonial-header_0.8s_cubic-bezier(0.25,0.46,0.45,0.94)_forwards]">
          <h3 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Pessoas reais.{" "}
            <span className="bg-gradient-to-r from-primary to-[#4ade80] bg-clip-text text-transparent">
              Resultados reais.
            </span>
          </h3>
          <p className="text-lg text-neutral-400 max-w-xl mx-auto">
            Veja o que acontece quando finalmente assume o controlo do seu dinheiro.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid gap-4 md:gap-6">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="testimonial-card opacity-0 animate-[testimonial-card-enter_0.8s_cubic-bezier(0.34,1.56,0.64,1)_forwards]"
              style={{ animationDelay: `${0.3 + index * 0.2}s` }}
            >
              {/* Quote icon */}
              <div className="absolute top-4 right-4 opacity-20">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor" className="text-primary">
                  <path d="M11.192 15.757c0-.88-.23-1.618-.69-2.217-.326-.412-.768-.683-1.327-.812-.55-.128-1.07-.137-1.54-.028-.16-.95.1-1.956.76-3.022.66-1.065 1.515-1.867 2.558-2.403L9.373 5c-.8.396-1.56.898-2.26 1.505-.71.607-1.34 1.305-1.9 2.094s-.98 1.68-1.25 2.69-.346 2.04-.217 3.1c.168 1.4.62 2.52 1.356 3.35.735.84 1.652 1.26 2.748 1.26.965 0 1.766-.29 2.4-.878.628-.576.94-1.365.94-2.368l.002.004zm9.124 0c0-.88-.23-1.618-.69-2.217-.326-.42-.768-.695-1.327-.825-.55-.13-1.07-.14-1.54-.03-.16-.95.1-1.956.76-3.022.66-1.06 1.515-1.86 2.56-2.4L18.49 5c-.8.396-1.555.898-2.26 1.505-.708.607-1.34 1.305-1.894 2.094-.556.79-.97 1.68-1.24 2.69-.273 1-.345 2.04-.217 3.1.168 1.4.62 2.52 1.356 3.35.735.84 1.652 1.26 2.748 1.26.965 0 1.766-.29 2.4-.878.628-.576.94-1.365.94-2.368l-.007.004z" />
                </svg>
              </div>
              
              {/* Quote text */}
              <div className="mb-4 space-y-2">
                {testimonial.quote.map((line, i) => (
                  <p key={i} className="text-white text-lg leading-relaxed">
                    {line}
                  </p>
                ))}
              </div>
              
              {/* Author info */}
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/10">
                <div className="flex items-center gap-3">
                  {/* Avatar */}
                  <div className="w-12 h-12 rounded-full overflow-hidden ring-2 ring-primary/30 flex-shrink-0">
                    <img 
                      src={testimonial.image} 
                      alt={testimonial.author}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <p className="text-white font-semibold">{testimonial.author}</p>
                    <p className="text-neutral-500 text-sm">{testimonial.location}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-primary text-sm">
                  <CheckCircle size={14} className="text-primary" />
                  <span className="text-neutral-400 hidden sm:inline">Utilizador verificado</span>
                </div>
              </div>

              {/* Star rating */}
              <div className="flex gap-1 mt-3">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} size={14} className="fill-primary text-primary" />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* CTA after testimonials */}
        <div 
          className="mt-12 text-center opacity-0 animate-[testimonial-cta_0.9s_cubic-bezier(0.25,0.46,0.45,0.94)_forwards]"
          style={{ animationDelay: "1.3s" }}
        >
          <p className="text-xl font-semibold text-white mb-6">
            Se eles conseguiram, você também consegue.
          </p>
          <Link
            to="/register"
            className="inline-block px-10 py-4 bg-gradient-to-r from-primary to-[#4ade80] hover:from-primary/90 hover:to-[#4ade80]/90 text-white font-bold text-lg rounded-2xl transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-primary/25"
          >
            Começar agora
          </Link>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
