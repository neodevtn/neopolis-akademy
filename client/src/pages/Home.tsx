import { Link } from "wouter";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, Shield, Zap, Globe, Users, TrendingDown, Award, Rocket, ChevronDown, ChevronUp, GraduationCap, Brain, Network } from "lucide-react";

/* ═══════════════════════════════════════════════════════════════
   NEOPOLIS AKADEMY — Landing Page
   Design: Dark Luxury AI (Linear + Cursor inspired)
   ═══════════════════════════════════════════════════════════════ */

// Animated counter hook
function useCountUp(end: number, duration: number = 2000, startOnView: boolean = true) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    if (!startOnView) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const startTime = Date.now();
          const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(eased * end));
            if (progress < 1) requestAnimationFrame(animate);
          };
          animate();
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [end, duration, startOnView]);

  return { count, ref };
}

// FAQ Item component
function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="surface-1 rounded-xl overflow-hidden card-hover">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-6 text-left cursor-pointer"
      >
        <span className="display-md text-foreground pr-4">{question}</span>
        <span className="text-muted-foreground shrink-0">
          {open ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </span>
      </button>
      {open && (
        <div className="px-6 pb-6 pt-0">
          <p className="body-lg text-muted-foreground">{answer}</p>
        </div>
      )}
    </div>
  );
}

export default function Home() {
  const stat1 = useCountUp(234, 2500);
  const stat2 = useCountUp(92, 2000);
  const stat3 = useCountUp(300, 2000);

  return (
    <div className="min-h-screen bg-background noise-overlay">
      {/* ═══ NAVIGATION ═══ */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-background/80 border-b border-border/50">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <img src="/manus-storage/logo_neopolis_akademy_0d0427ea.png" alt="Neopolis Akademy" className="h-8 object-contain" />
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#formule" className="text-sm text-muted-foreground hover:text-foreground transition-colors">La Formule</a>
            <a href="#urgence" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Pourquoi maintenant</a>
            <a href="#partenaires" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Partenaires</a>
            <a href="#faq" className="text-sm text-muted-foreground hover:text-foreground transition-colors">FAQ</a>
          </div>
          <Link href="/apply" className="btn-primary text-sm px-5 py-2.5 rounded-lg inline-flex items-center gap-2">
            Postuler <ArrowRight size={14} />
          </Link>
        </div>
      </nav>

      {/* ═══ HERO SECTION ═══ */}
      <section className="relative min-h-screen flex items-center mesh-gradient pt-16">
        <div className="container relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            {/* Eyebrow */}
            <div className="animate-fade-up inline-flex items-center gap-2 px-4 py-2 rounded-full surface-2 mb-8">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
              <span className="eyebrow text-muted-foreground">Programme 2026 — Places limitées</span>
            </div>

            {/* Main headline */}
            <h1 className="animate-fade-up delay-100 display-hero text-foreground mb-6">
              Transformez la menace de l'IA<br />
              <span className="gradient-text">en opportunité</span>
            </h1>

            {/* Subtitle */}
            <p className="animate-fade-up delay-200 body-lg text-muted-foreground max-w-2xl mx-auto mb-8">
              Formation certifiante 100% gratuite. Devenez <strong className="text-foreground">AI Solutions Partner — Ambassadeur Certifié</strong> et conquérez le marché africain de l'IA agentique.
            </p>

            {/* Free badge */}
            <div className="animate-fade-up delay-300 inline-flex items-center gap-3 px-6 py-3 rounded-xl bg-green-500/10 border border-green-500/20 mb-10">
              <Shield className="text-green-400" size={20} />
              <span className="text-green-400 font-semibold text-lg">100% GRATUIT</span>
              <span className="text-muted-foreground text-sm">— Formation, certification et accompagnement</span>
            </div>

            {/* CTA buttons */}
            <div className="animate-fade-up delay-400 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/apply" className="btn-primary text-base px-8 py-4 rounded-xl inline-flex items-center gap-3 glow-primary">
                Déposer ma candidature <ArrowRight size={18} />
              </Link>
              <a href="#formule" className="btn-secondary text-base px-8 py-4 rounded-xl inline-flex items-center gap-3">
                Découvrir le programme
              </a>
            </div>

            {/* Deadline */}
            <p className="animate-fade-up delay-500 mt-8 text-sm text-muted-foreground">
              Date limite de candidature : <span className="text-accent font-semibold">31 août 2026</span>
            </p>
          </div>
        </div>

        {/* Hero background image */}
        <div className="absolute inset-0 z-0 opacity-20">
          <img src="/manus-storage/hero_ai_network_679ae43a.png" alt="" className="w-full h-full object-cover" />
        </div>

        {/* Bottom gradient fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent z-10"></div>
      </section>

      {/* ═══ STATS BAR ═══ */}
      <section className="relative z-10 -mt-16 pb-24">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div ref={stat1.ref} className="surface-1 rounded-xl p-6 text-center card-hover">
              <p className="display-xl gradient-text">{stat1.count}Mds$</p>
              <p className="text-sm text-muted-foreground mt-2">de SaaS menacés d'ici 2030</p>
              <p className="text-xs text-muted-foreground/60 mt-1">Source : Gartner 2025</p>
            </div>
            <div ref={stat2.ref} className="surface-1 rounded-xl p-6 text-center card-hover">
              <p className="display-xl gradient-text">{stat2.count}M</p>
              <p className="text-sm text-muted-foreground mt-2">d'emplois menacés dans le monde</p>
              <p className="text-xs text-muted-foreground/60 mt-1">Source : WEF 2025</p>
            </div>
            <div ref={stat3.ref} className="surface-1 rounded-xl p-6 text-center card-hover">
              <p className="display-xl gradient-text">{stat3.count}</p>
              <p className="text-sm text-muted-foreground mt-2">places disponibles — Afrique entière</p>
              <p className="text-xs text-muted-foreground/60 mt-1">Sélection sur dossier</p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ LA FORMULE ═══ */}
      <section id="formule" className="py-24">
        <div className="container">
          <div className="text-center mb-16">
            <span className="eyebrow text-primary mb-4 block">Le Programme</span>
            <h2 className="display-xl text-foreground mb-4">Une formule complète,<br /><span className="gradient-text">entièrement gratuite</span></h2>
            <p className="body-lg text-muted-foreground max-w-2xl mx-auto">
              De la formation à la certification, puis au lancement de votre activité d'AI Solutions Partner sur le marché africain.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Card 1 */}
            <div className="surface-1 rounded-xl p-8 card-hover group relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-all"></div>
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-6">
                  <GraduationCap className="text-primary" size={24} />
                </div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 mb-4">
                  <span className="text-green-400 text-xs font-medium">GRATUIT</span>
                </div>
                <h3 className="display-md text-foreground mb-3">E-Learning 7 jours</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Formation intensive sur les fondamentaux de l'IA, les LLM, les agents IA et leur déploiement en entreprise.
                </p>
              </div>
            </div>

            {/* Card 2 */}
            <div className="surface-1 rounded-xl p-8 card-hover group relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full blur-3xl group-hover:bg-accent/10 transition-all"></div>
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mb-6">
                  <Brain className="text-accent" size={24} />
                </div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 mb-4">
                  <span className="text-green-400 text-xs font-medium">GRATUIT</span>
                </div>
                <h3 className="display-md text-foreground mb-3">Certification CCA</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Accès à la plateforme Anthropic + voucher pour passer la certification <strong className="text-foreground">Claude Certified Architect</strong>.
                </p>
              </div>
            </div>

            {/* Card 3 */}
            <div className="surface-1 rounded-xl p-8 card-hover group relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-chart-3/5 rounded-full blur-3xl group-hover:bg-chart-3/10 transition-all"></div>
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-lg bg-chart-3/10 flex items-center justify-center mb-6">
                  <Rocket className="text-chart-3" size={24} />
                </div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 mb-4">
                  <span className="text-green-400 text-xs font-medium">GRATUIT</span>
                </div>
                <h3 className="display-md text-foreground mb-3">Lancement Business</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Statut d'AI Solutions Partner avec accompagnement complet, ressources techniques et accès au marché africain.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ POURQUOI MAINTENANT — URGENCE ═══ */}
      <section id="urgence" className="py-24 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-red-950/5 to-background"></div>
        <div className="container relative z-10">
          <div className="text-center mb-16">
            <span className="eyebrow text-destructive mb-4 block">Pourquoi se transformer ?</span>
            <h2 className="display-xl text-foreground mb-4">L'IA ne menace pas l'avenir.<br /><span className="text-destructive">Elle menace le présent.</span></h2>
            <p className="body-lg text-muted-foreground max-w-2xl mx-auto">
              Les chiffres sont sans appel. Les métiers traditionnels disparaissent à un rythme sans précédent.
            </p>
          </div>

          {/* Jobs at risk chart */}
          <div className="max-w-4xl mx-auto surface-1 rounded-xl p-8 mb-12">
            <h3 className="display-md text-foreground mb-6 text-center">Postes les plus menacés par l'IA (2025–2030)</h3>
            <div className="space-y-4">
              {[
                { job: "Saisie de données", risk: 95, loss: "-4.7M postes" },
                { job: "Service client / Support", risk: 88, loss: "-3.2M postes" },
                { job: "Comptabilité / Finance", risk: 82, loss: "-2.8M postes" },
                { job: "Développeurs logiciels", risk: 75, loss: "-2.1M postes" },
                { job: "Traduction / Rédaction", risk: 72, loss: "-1.9M postes" },
                { job: "Juridique / Paralegal", risk: 65, loss: "-1.4M postes" },
              ].map((item, i) => (
                <div key={i} className="group">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-foreground font-medium">{item.job}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-destructive font-mono">{item.loss}</span>
                      <span className="text-sm font-semibold text-foreground">{item.risk}%</span>
                    </div>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-1000"
                      style={{
                        width: `${item.risk}%`,
                        background: item.risk > 80
                          ? "linear-gradient(90deg, #ef4444, #f97316)"
                          : item.risk > 70
                          ? "linear-gradient(90deg, #f97316, #eab308)"
                          : "linear-gradient(90deg, #eab308, #22c55e)"
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground/60 mt-6 text-center">Sources : World Economic Forum (Future of Jobs 2025), Goldman Sachs, Bureau of Labor Statistics</p>
          </div>

          {/* Impact statement */}
          <div className="max-w-3xl mx-auto text-center surface-2 rounded-xl p-10 glow-accent">
            <TrendingDown className="text-destructive mx-auto mb-4" size={32} />
            <p className="display-md text-foreground mb-4">
              "D'ici 2030, <span className="text-destructive font-semibold">33%</span> des tâches actuelles seront automatisées par l'IA agentique"
            </p>
            <p className="text-sm text-muted-foreground">— World Economic Forum, Future of Jobs Report 2025</p>
          </div>
        </div>
      </section>

      {/* ═══ PARTENARIATS ═══ */}
      <section id="partenaires" className="py-24">
        <div className="container">
          <div className="text-center mb-16">
            <span className="eyebrow text-primary mb-4 block">Partenariats Stratégiques</span>
            <h2 className="display-xl text-foreground mb-4">Soutenus par des<br /><span className="gradient-text">leaders mondiaux</span></h2>
            <p className="body-lg text-muted-foreground max-w-2xl mx-auto">
              Neopolis Development a noué des partenariats stratégiques avec les géants de l'IA pour déployer leurs solutions en Afrique.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Anthropic */}
            <div className="surface-1 rounded-xl p-8 card-hover relative overflow-hidden">
              <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary/5 rounded-full blur-3xl"></div>
              <div className="relative z-10">
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                  <Brain className="text-primary" size={28} />
                </div>
                <h3 className="display-md text-foreground mb-3">Anthropic</h3>
                <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                  Partenaire officiel pour la certification Claude Certified Architect (CCA). Accès privilégié à la plateforme Claude et aux outils de développement d'agents IA.
                </p>
                <div className="flex items-center gap-2 text-primary text-sm font-medium">
                  <Award size={16} />
                  <span>Certification officielle</span>
                </div>
              </div>
            </div>

            {/* Alibaba Cloud */}
            <div className="surface-1 rounded-xl p-8 card-hover relative overflow-hidden">
              <div className="absolute -top-20 -right-20 w-40 h-40 bg-accent/5 rounded-full blur-3xl"></div>
              <div className="relative z-10">
                <div className="w-14 h-14 rounded-xl bg-accent/10 flex items-center justify-center mb-6">
                  <Globe className="text-accent" size={28} />
                </div>
                <h3 className="display-md text-foreground mb-3">Alibaba Cloud</h3>
                <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                  Infrastructure cloud de pointe pour l'hébergement on-premise des LLM et appliances IA. Serveurs haute performance dédiés au marché africain.
                </p>
                <div className="flex items-center gap-2 text-accent text-sm font-medium">
                  <Zap size={16} />
                  <span>Infrastructure on-premise</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ AI SOLUTIONS PARTNER ═══ */}
      <section className="py-24 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/3 to-background"></div>
        <div className="container relative z-10">
          <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <span className="eyebrow text-primary mb-4 block">Votre nouveau rôle</span>
              <h2 className="display-xl text-foreground mb-6">AI Solutions Partner<br /><span className="gradient-text">Ambassadeur Certifié</span></h2>
              <p className="body-lg text-muted-foreground mb-8">
                Après votre certification, devenez un entrepreneur indépendant spécialisé dans le déploiement de solutions IA pour les PME/TPE de votre secteur d'activité, sur l'ensemble du continent africain.
              </p>
              <div className="space-y-4">
                {[
                  { icon: Network, text: "Accès aux agents IA ready-to-deploy de Neopolis" },
                  { icon: Users, text: "Support technique, humain et matériel complet" },
                  { icon: Globe, text: "Marché cible : toute l'Afrique (54 pays)" },
                  { icon: Zap, text: "Accès multi-LLM : Claude, Qwen, DeepSeek et plus" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <item.icon className="text-primary" size={18} />
                    </div>
                    <span className="text-foreground text-sm">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex justify-center">
              <img src="/manus-storage/africa_network_a07280c9.png" alt="Réseau IA Afrique" className="w-80 h-auto object-contain animate-float" />
            </div>
          </div>
        </div>
      </section>

      {/* ═══ CTA BANNER ═══ */}
      <section className="py-16">
        <div className="container">
          <div className="max-w-4xl mx-auto surface-2 rounded-2xl p-12 text-center relative overflow-hidden glow-primary">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5"></div>
            <div className="relative z-10">
              <h2 className="display-lg text-foreground mb-4">Ne subissez pas la disruption.</h2>
              <p className="display-md gradient-text mb-8">Devenez-en l'acteur.</p>
              <Link href="/apply" className="btn-primary text-lg px-10 py-5 rounded-xl inline-flex items-center gap-3">
                Déposer ma candidature maintenant <ArrowRight size={20} />
              </Link>
              <p className="text-sm text-muted-foreground mt-6">
                Seulement <strong className="text-foreground">300 places</strong> disponibles — Date limite : <strong className="text-accent">31 août 2026</strong>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ FAQ ═══ */}
      <section id="faq" className="py-24">
        <div className="container">
          <div className="text-center mb-16">
            <span className="eyebrow text-primary mb-4 block">Questions fréquentes</span>
            <h2 className="display-xl text-foreground">Tout ce que vous<br />devez savoir</h2>
          </div>

          <div className="max-w-3xl mx-auto space-y-4">
            <FAQItem
              question="Quels sont les prérequis ?"
              answer="Aucun prérequis technique n'est exigé. Nous recherchons des profils motivés avec une expertise métier dans un secteur menacé par l'IA (finance, juridique, santé, commerce, etc.), une capacité d'apprentissage rapide et un esprit entrepreneurial. La formation couvre les bases techniques nécessaires."
            />
            <FAQItem
              question="Le programme est-il vraiment 100% gratuit ?"
              answer="Oui, entièrement. La formation e-learning, l'accès à la plateforme Anthropic, le voucher de certification CCA et l'accompagnement au lancement sont pris en charge par Neopolis Development grâce à nos partenariats avec Anthropic et Alibaba Cloud."
            />
            <FAQItem
              question="Comment fonctionne le processus de sélection ?"
              answer="Votre candidature est évaluée sur 3 axes : compétences techniques (40%), expertise métier (35%) et capacités de communication/entrepreneuriat (25%). Un score est calculé automatiquement. Les 200 à 300 meilleurs profils sont sélectionnés pour intégrer le programme."
            />
            <FAQItem
              question="Quelle est la durée totale du programme ?"
              answer="La formation e-learning dure 7 jours intensifs. Ensuite, vous disposez de plusieurs semaines pour préparer et passer la certification CCA (avant le 31 août 2026). Le lancement de votre activité d'AI Solutions Partner est accompagné sans limite de durée."
            />
            <FAQItem
              question="Quels pays africains sont concernés ?"
              answer="L'ensemble des 54 pays africains sont éligibles. Le programme vise à créer un réseau d'ambassadeurs IA couvrant tout le continent, avec un focus sur les marchés francophones, anglophones et lusophones."
            />
            <FAQItem
              question="Que se passe-t-il après la certification ?"
              answer="Vous obtenez le statut d'AI Solutions Partner — Ambassadeur Certifié. Neopolis Development vous fournit : des agents IA prêts à déployer, un support technique continu, des ressources commerciales, et un accès à l'infrastructure cloud (LLM multiples, serveurs on-premise). Vous opérez en indépendant sur votre marché."
            />
            <FAQItem
              question="Quelles ressources techniques sont fournies ?"
              answer="Accès multi-LLM (Claude, Qwen, DeepSeek, etc.), infrastructure serveurs on-premise via Alibaba Cloud, bibliothèque d'agents IA ready-to-deploy, outils de développement, documentation technique, et support d'une équipe d'ingénieurs Neopolis."
            />
          </div>
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer className="py-16 border-t border-border">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div>
              <img src="/manus-storage/logo_neopolis_akademy_0d0427ea.png" alt="Neopolis Akademy" className="h-8 object-contain mb-4" />
              <p className="text-sm text-muted-foreground leading-relaxed">
                Programme de formation et certification IA pour l'Afrique, porté par Neopolis Development en partenariat avec Anthropic et Alibaba Cloud.
              </p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-4">Programme</h4>
              <div className="space-y-2">
                <a href="#formule" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">La Formule</a>
                <a href="#urgence" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">Pourquoi se transformer</a>
                <a href="#partenaires" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">Partenariats</a>
                <Link href="/apply" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">Postuler</Link>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-4">Contact</h4>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">info@neopolis-dev.com</p>
                <a href="https://www.neopolis-dev.com" target="_blank" rel="noopener" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">www.neopolis-dev.com</a>
              </div>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-muted-foreground">&copy; 2026 Neopolis Development. Tous droits réservés.</p>
            <p className="text-xs text-muted-foreground">Programme soutenu par Anthropic & Alibaba Cloud</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
