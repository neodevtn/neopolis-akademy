import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import { ArrowLeft, ArrowRight, CheckCircle, Loader2, AlertCircle } from "lucide-react";
import { step1Schema, step2Schema, step3Schema, step4Schema, step5Schema, applicationSchema, getFieldErrors } from "@shared/validation";

const LOGO_URL = "/manus-storage/logo_neopolis_dev_04585f1b.png";

const africanCountries = [
  "Algérie", "Angola", "Bénin", "Botswana", "Burkina Faso", "Burundi", "Cameroun",
  "Cap-Vert", "Centrafrique", "Comores", "Congo", "Côte d'Ivoire", "Djibouti",
  "Égypte", "Érythrée", "Eswatini", "Éthiopie", "Gabon", "Gambie", "Ghana",
  "Guinée", "Guinée-Bissau", "Guinée équatoriale", "Kenya", "Lesotho", "Libéria",
  "Libye", "Madagascar", "Malawi", "Mali", "Maroc", "Maurice", "Mauritanie",
  "Mozambique", "Namibie", "Niger", "Nigéria", "Ouganda", "RD Congo", "Rwanda",
  "São Tomé-et-Príncipe", "Sénégal", "Seychelles", "Sierra Leone", "Somalie",
  "Soudan", "Soudan du Sud", "Tanzanie", "Tchad", "Togo", "Tunisie", "Zambie", "Zimbabwe"
];

const sectors = [
  "Développement logiciel", "Service client / Support", "Comptabilité & Finance",
  "Juridique & Paralégal", "Administration & Secrétariat", "Marketing & Communication",
  "Traduction & Interprétation", "Banque & Assurance", "Ressources Humaines",
  "Logistique & Transport", "Santé & Médical", "Éducation & Formation",
  "Immobilier", "Commerce & Vente", "Télécommunications", "Énergie",
  "Agriculture & Agroalimentaire", "Autre"
];

type FormData = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  country: string;
  city: string;
  sector: string;
  currentRole: string;
  yearsExperience: string;
  programmingLevel: string;
  aiKnowledge: string;
  cloudExperience: string;
  technicalTools: string;
  certifications: string;
  sectorExpertise: string;
  clientNetwork: string;
  businessDevelopment: string;
  languages: string;
  publicSpeaking: string;
  salesExperience: string;
  motivation: string;
};

const initialFormData: FormData = {
  firstName: "", lastName: "", email: "", phone: "",
  country: "", city: "", sector: "", currentRole: "", yearsExperience: "",
  programmingLevel: "", aiKnowledge: "", cloudExperience: "", technicalTools: "", certifications: "",
  sectorExpertise: "", clientNetwork: "", businessDevelopment: "",
  languages: "", publicSpeaking: "", salesExperience: "", motivation: ""
};

// Composant pour afficher une erreur sous un champ
function FieldError({ error }: { error?: string }) {
  if (!error) return null;
  return (
    <p className="text-xs text-destructive flex items-center gap-1 mt-1">
      <AlertCircle className="w-3 h-3 shrink-0" />
      {error}
    </p>
  );
}

export default function Apply() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string>("");
  const [result, setResult] = useState<{ scoreTotal: number; scoreTechnique: number; scoreMetier: number; scoreCommunication: number } | null>(null);

  const submitMutation = trpc.applications.submit.useMutation({
    onSuccess: (data) => {
      setResult(data);
      setStep(6);
      setServerError("");
    },
    onError: (err) => {
      // Parse server validation errors
      try {
        const parsed = JSON.parse(err.message);
        if (Array.isArray(parsed)) {
          const fieldErrs: Record<string, string> = {};
          for (const issue of parsed) {
            const field = issue.path?.[0]?.toString();
            if (field && !fieldErrs[field]) {
              fieldErrs[field] = issue.message;
            }
          }
          setErrors(fieldErrs);
          setServerError("Certains champs contiennent des erreurs. Veuillez vérifier et corriger.");
        } else {
          setServerError("Une erreur est survenue. Veuillez réessayer.");
        }
      } catch {
        setServerError("Une erreur est survenue. Veuillez réessayer.");
      }
    },
  });

  const totalSteps = 5;
  const progress = (step / totalSteps) * 100;

  const updateField = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field when user edits it
    if (errors[field]) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  // Validate current step using shared schema
  const validateStep = (): boolean => {
    let schema;
    let data: Record<string, unknown>;

    switch (step) {
      case 1:
        schema = step1Schema;
        data = {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
        };
        break;
      case 2:
        schema = step2Schema;
        data = {
          country: formData.country,
          city: formData.city,
          sector: formData.sector,
          currentRole: formData.currentRole,
          yearsExperience: formData.yearsExperience === "" ? -1 : parseInt(formData.yearsExperience),
        };
        break;
      case 3:
        schema = step3Schema;
        data = {
          programmingLevel: formData.programmingLevel || undefined,
          aiKnowledge: formData.aiKnowledge || undefined,
          cloudExperience: formData.cloudExperience || undefined,
          technicalTools: formData.technicalTools,
          certifications: formData.certifications,
        };
        break;
      case 4:
        schema = step4Schema;
        data = {
          sectorExpertise: formData.sectorExpertise || undefined,
          clientNetwork: formData.clientNetwork || undefined,
          businessDevelopment: formData.businessDevelopment || undefined,
        };
        break;
      case 5:
        schema = step5Schema;
        data = {
          languages: formData.languages,
          publicSpeaking: formData.publicSpeaking || undefined,
          salesExperience: formData.salesExperience || undefined,
          motivation: formData.motivation,
        };
        break;
      default:
        return false;
    }

    const result = schema.safeParse(data);
    if (!result.success) {
      setErrors(getFieldErrors(result.error));
      return false;
    }
    setErrors({});
    return true;
  };

  const handleNext = () => {
    if (validateStep()) {
      setStep(s => s + 1);
    }
  };

  const handleSubmit = () => {
    // Full validation before submit
    const fullData = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      phone: formData.phone,
      country: formData.country,
      city: formData.city,
      sector: formData.sector,
      currentRole: formData.currentRole,
      yearsExperience: formData.yearsExperience === "" ? 0 : parseInt(formData.yearsExperience),
      programmingLevel: formData.programmingLevel,
      aiKnowledge: formData.aiKnowledge,
      cloudExperience: formData.cloudExperience,
      technicalTools: formData.technicalTools,
      certifications: formData.certifications,
      sectorExpertise: formData.sectorExpertise,
      clientNetwork: formData.clientNetwork,
      businessDevelopment: formData.businessDevelopment,
      languages: formData.languages,
      publicSpeaking: formData.publicSpeaking,
      salesExperience: formData.salesExperience,
      motivation: formData.motivation,
    };

    const validationResult = applicationSchema.safeParse(fullData);
    if (!validationResult.success) {
      setErrors(getFieldErrors(validationResult.error));
      setServerError("Certains champs contiennent des erreurs. Veuillez vérifier et corriger.");
      return;
    }

    setErrors({});
    setServerError("");
    submitMutation.mutate(validationResult.data);
  };

  if (step === 6 && result) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4">
        <div className="max-w-lg w-full text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-6" />
          <h1 className="display-lg text-foreground mb-4">Candidature soumise !</h1>
          <p className="body-md text-muted-foreground mb-8">Votre score a été calculé automatiquement.</p>
          <div className="card-stripe mb-8">
            <div className="display-xxl text-primary mb-2">
              {Number(result.scoreTotal).toFixed(1)}%
            </div>
            <p className="text-sm text-muted-foreground mb-6">Score global</p>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="display-md text-foreground">{Number(result.scoreTechnique).toFixed(1)}%</div>
                <div className="text-xs text-muted-foreground">Technique (40%)</div>
              </div>
              <div>
                <div className="display-md text-foreground">{Number(result.scoreMetier).toFixed(1)}%</div>
                <div className="text-xs text-muted-foreground">Métier (35%)</div>
              </div>
              <div>
                <div className="display-md text-foreground">{Number(result.scoreCommunication).toFixed(1)}%</div>
                <div className="text-xs text-muted-foreground">Communication (25%)</div>
              </div>
            </div>
          </div>
          <p className="body-md text-muted-foreground mb-6">
            Si votre profil est retenu, vous serez contacté sous 48h à l'adresse email fournie.
          </p>
          <Link href="/">
            <Button variant="outline" className="btn-pill">Retour à l'accueil</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <nav className="border-b border-border bg-background/90 backdrop-blur-md">
        <div className="container flex items-center justify-between h-16">
          <Link href="/">
            <div className="flex items-center gap-2 cursor-pointer">
              <img src={LOGO_URL} alt="Neopolis Development" className="h-7" />
              <span className="text-lg font-light tracking-tight">Akademy</span>
            </div>
          </Link>
          <Link href="/">
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-4 h-4 mr-2" /> Retour
            </Button>
          </Link>
        </div>
      </nav>

      <div className="container py-12 max-w-2xl mx-auto">
        <div className="mb-10">
          <h1 className="display-lg text-foreground mb-2">Formulaire de candidature</h1>
          <p className="body-md text-muted-foreground">Étape {step} sur {totalSteps}</p>
          <Progress value={progress} className="mt-4 h-1.5" />
        </div>

        {/* Step 1: Personal Info */}
        {step === 1 && (
          <div className="space-y-6">
            <h2 className="heading-lg text-foreground">Informations personnelles</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Prénom *</Label>
                <Input
                  value={formData.firstName}
                  onChange={e => updateField("firstName", e.target.value)}
                  placeholder="Votre prénom"
                  className={errors.firstName ? "border-destructive" : ""}
                />
                <FieldError error={errors.firstName} />
              </div>
              <div className="space-y-2">
                <Label>Nom *</Label>
                <Input
                  value={formData.lastName}
                  onChange={e => updateField("lastName", e.target.value)}
                  placeholder="Votre nom"
                  className={errors.lastName ? "border-destructive" : ""}
                />
                <FieldError error={errors.lastName} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Email *</Label>
              <Input
                type="email"
                value={formData.email}
                onChange={e => updateField("email", e.target.value)}
                placeholder="votre@email.com"
                className={errors.email ? "border-destructive" : ""}
              />
              <FieldError error={errors.email} />
            </div>
            <div className="space-y-2">
              <Label>Téléphone *</Label>
              <Input
                value={formData.phone}
                onChange={e => updateField("phone", e.target.value)}
                placeholder="+212 6XX XXX XXX"
                className={errors.phone ? "border-destructive" : ""}
              />
              <FieldError error={errors.phone} />
            </div>
          </div>
        )}

        {/* Step 2: Location & Sector */}
        {step === 2 && (
          <div className="space-y-6">
            <h2 className="heading-lg text-foreground">Localisation & Secteur</h2>
            <div className="space-y-2">
              <Label>Pays de résidence *</Label>
              <Select value={formData.country} onValueChange={v => updateField("country", v)}>
                <SelectTrigger className={errors.country ? "border-destructive" : ""}><SelectValue placeholder="Sélectionnez votre pays" /></SelectTrigger>
                <SelectContent>
                  {africanCountries.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
              <FieldError error={errors.country} />
            </div>
            <div className="space-y-2">
              <Label>Ville *</Label>
              <Input
                value={formData.city}
                onChange={e => updateField("city", e.target.value)}
                placeholder="Votre ville"
                className={errors.city ? "border-destructive" : ""}
              />
              <FieldError error={errors.city} />
            </div>
            <div className="space-y-2">
              <Label>Secteur d'activité *</Label>
              <Select value={formData.sector} onValueChange={v => updateField("sector", v)}>
                <SelectTrigger className={errors.sector ? "border-destructive" : ""}><SelectValue placeholder="Sélectionnez votre secteur" /></SelectTrigger>
                <SelectContent>
                  {sectors.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
              <FieldError error={errors.sector} />
            </div>
            <div className="space-y-2">
              <Label>Poste actuel *</Label>
              <Input
                value={formData.currentRole}
                onChange={e => updateField("currentRole", e.target.value)}
                placeholder="Ex: Chef de projet, Développeur senior..."
                className={errors.currentRole ? "border-destructive" : ""}
              />
              <FieldError error={errors.currentRole} />
            </div>
            <div className="space-y-2">
              <Label>Années d'expérience *</Label>
              <Input
                type="number"
                min="0"
                max="50"
                value={formData.yearsExperience}
                onChange={e => updateField("yearsExperience", e.target.value)}
                placeholder="Nombre d'années"
                className={errors.yearsExperience ? "border-destructive" : ""}
              />
              <FieldError error={errors.yearsExperience} />
            </div>
          </div>
        )}

        {/* Step 3: Technical Skills */}
        {step === 3 && (
          <div className="space-y-6">
            <h2 className="heading-lg text-foreground">Compétences techniques</h2>
            <div className="space-y-2">
              <Label>Niveau en programmation *</Label>
              <Select value={formData.programmingLevel} onValueChange={v => updateField("programmingLevel", v)}>
                <SelectTrigger className={errors.programmingLevel ? "border-destructive" : ""}><SelectValue placeholder="Sélectionnez votre niveau" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Aucune expérience</SelectItem>
                  <SelectItem value="beginner">Débutant (notions de base)</SelectItem>
                  <SelectItem value="intermediate">Intermédiaire (projets personnels)</SelectItem>
                  <SelectItem value="advanced">Avancé (professionnel)</SelectItem>
                  <SelectItem value="expert">Expert (architecte/lead)</SelectItem>
                </SelectContent>
              </Select>
              <FieldError error={errors.programmingLevel} />
            </div>
            <div className="space-y-2">
              <Label>Connaissances en IA *</Label>
              <Select value={formData.aiKnowledge} onValueChange={v => updateField("aiKnowledge", v)}>
                <SelectTrigger className={errors.aiKnowledge ? "border-destructive" : ""}><SelectValue placeholder="Sélectionnez votre niveau" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Aucune connaissance</SelectItem>
                  <SelectItem value="basic">Basique (utilisation de ChatGPT/Claude)</SelectItem>
                  <SelectItem value="intermediate">Intermédiaire (prompt engineering, APIs)</SelectItem>
                  <SelectItem value="advanced">Avancé (fine-tuning, RAG, agents)</SelectItem>
                  <SelectItem value="expert">Expert (architectures multi-agents, MLOps)</SelectItem>
                </SelectContent>
              </Select>
              <FieldError error={errors.aiKnowledge} />
            </div>
            <div className="space-y-2">
              <Label>Expérience Cloud *</Label>
              <Select value={formData.cloudExperience} onValueChange={v => updateField("cloudExperience", v)}>
                <SelectTrigger className={errors.cloudExperience ? "border-destructive" : ""}><SelectValue placeholder="Sélectionnez votre niveau" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Aucune expérience</SelectItem>
                  <SelectItem value="basic">Basique (hébergement simple)</SelectItem>
                  <SelectItem value="intermediate">Intermédiaire (AWS/GCP/Azure basique)</SelectItem>
                  <SelectItem value="advanced">Avancé (architectures cloud)</SelectItem>
                  <SelectItem value="expert">Expert (multi-cloud, DevOps)</SelectItem>
                </SelectContent>
              </Select>
              <FieldError error={errors.cloudExperience} />
            </div>
            <div className="space-y-2">
              <Label>Outils et technologies maîtrisés</Label>
              <Textarea
                value={formData.technicalTools}
                onChange={e => updateField("technicalTools", e.target.value)}
                placeholder="Ex: Python, JavaScript, Docker, Kubernetes, LangChain..."
                rows={3}
                className={errors.technicalTools ? "border-destructive" : ""}
              />
              <FieldError error={errors.technicalTools} />
            </div>
            <div className="space-y-2">
              <Label>Certifications existantes</Label>
              <Textarea
                value={formData.certifications}
                onChange={e => updateField("certifications", e.target.value)}
                placeholder="Ex: AWS Solutions Architect, Google Cloud Professional..."
                rows={3}
                className={errors.certifications ? "border-destructive" : ""}
              />
              <FieldError error={errors.certifications} />
            </div>
          </div>
        )}

        {/* Step 4: Business Skills */}
        {step === 4 && (
          <div className="space-y-6">
            <h2 className="heading-lg text-foreground">Compétences métier</h2>
            <div className="space-y-2">
              <Label>Expertise dans votre secteur *</Label>
              <Select value={formData.sectorExpertise} onValueChange={v => updateField("sectorExpertise", v)}>
                <SelectTrigger className={errors.sectorExpertise ? "border-destructive" : ""}><SelectValue placeholder="Sélectionnez votre niveau" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="junior">Junior (1-3 ans)</SelectItem>
                  <SelectItem value="intermediate">Intermédiaire (3-7 ans)</SelectItem>
                  <SelectItem value="senior">Senior (7-15 ans)</SelectItem>
                  <SelectItem value="expert">Expert (15+ ans)</SelectItem>
                </SelectContent>
              </Select>
              <FieldError error={errors.sectorExpertise} />
            </div>
            <div className="space-y-2">
              <Label>Réseau de clients/contacts *</Label>
              <Select value={formData.clientNetwork} onValueChange={v => updateField("clientNetwork", v)}>
                <SelectTrigger className={errors.clientNetwork ? "border-destructive" : ""}><SelectValue placeholder="Taille de votre réseau" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Pas de réseau professionnel</SelectItem>
                  <SelectItem value="small">Petit (quelques contacts)</SelectItem>
                  <SelectItem value="medium">Moyen (réseau actif dans mon secteur)</SelectItem>
                  <SelectItem value="large">Large (réseau étendu multi-secteurs)</SelectItem>
                </SelectContent>
              </Select>
              <FieldError error={errors.clientNetwork} />
            </div>
            <div className="space-y-2">
              <Label>Expérience en développement commercial *</Label>
              <Select value={formData.businessDevelopment} onValueChange={v => updateField("businessDevelopment", v)}>
                <SelectTrigger className={errors.businessDevelopment ? "border-destructive" : ""}><SelectValue placeholder="Sélectionnez votre niveau" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Aucune expérience commerciale</SelectItem>
                  <SelectItem value="basic">Basique (vente occasionnelle)</SelectItem>
                  <SelectItem value="intermediate">Intermédiaire (responsable de comptes)</SelectItem>
                  <SelectItem value="advanced">Avancé (direction commerciale/business dev)</SelectItem>
                </SelectContent>
              </Select>
              <FieldError error={errors.businessDevelopment} />
            </div>
          </div>
        )}

        {/* Step 5: Communication */}
        {step === 5 && (
          <div className="space-y-6">
            <h2 className="heading-lg text-foreground">Communication & Motivation</h2>
            <div className="space-y-2">
              <Label>Langues parlées</Label>
              <Textarea
                value={formData.languages}
                onChange={e => updateField("languages", e.target.value)}
                placeholder="Ex: Français (natif), Anglais (courant), Arabe (intermédiaire)..."
                rows={3}
                className={errors.languages ? "border-destructive" : ""}
              />
              <FieldError error={errors.languages} />
            </div>
            <div className="space-y-2">
              <Label>Aisance en prise de parole *</Label>
              <Select value={formData.publicSpeaking} onValueChange={v => updateField("publicSpeaking", v)}>
                <SelectTrigger className={errors.publicSpeaking ? "border-destructive" : ""}><SelectValue placeholder="Sélectionnez votre niveau" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Pas à l'aise</SelectItem>
                  <SelectItem value="basic">Basique (petits groupes)</SelectItem>
                  <SelectItem value="intermediate">Intermédiaire (présentations professionnelles)</SelectItem>
                  <SelectItem value="advanced">Avancé (conférences, formations)</SelectItem>
                </SelectContent>
              </Select>
              <FieldError error={errors.publicSpeaking} />
            </div>
            <div className="space-y-2">
              <Label>Expérience en vente/négociation *</Label>
              <Select value={formData.salesExperience} onValueChange={v => updateField("salesExperience", v)}>
                <SelectTrigger className={errors.salesExperience ? "border-destructive" : ""}><SelectValue placeholder="Sélectionnez votre expérience" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Aucune</SelectItem>
                  <SelectItem value="less_1y">Moins d'1 an</SelectItem>
                  <SelectItem value="1_3y">1 à 3 ans</SelectItem>
                  <SelectItem value="3_5y">3 à 5 ans</SelectItem>
                  <SelectItem value="more_5y">Plus de 5 ans</SelectItem>
                </SelectContent>
              </Select>
              <FieldError error={errors.salesExperience} />
            </div>
            <div className="space-y-2">
              <Label>Lettre de motivation * <span className="text-muted-foreground">(min. 50 caractères)</span></Label>
              <Textarea
                value={formData.motivation}
                onChange={e => updateField("motivation", e.target.value)}
                placeholder="Expliquez pourquoi vous souhaitez devenir technico-commercial indépendant ambassadeur et comment vous comptez contribuer à la transformation IA en Afrique..."
                rows={6}
                className={errors.motivation ? "border-destructive" : ""}
              />
              <div className="flex justify-between">
                <FieldError error={errors.motivation} />
                <p className="text-xs text-muted-foreground">{formData.motivation.length}/50 caractères minimum</p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between mt-10 pt-6 border-t border-border">
          {step > 1 ? (
            <Button variant="outline" onClick={() => setStep(s => s - 1)} className="btn-pill">
              <ArrowLeft className="w-4 h-4 mr-2" /> Précédent
            </Button>
          ) : <div />}
          {step < totalSteps ? (
            <Button onClick={handleNext} className="btn-pill bg-primary hover:bg-primary/90 text-primary-foreground">
              Suivant <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={submitMutation.isPending} className="btn-pill bg-primary hover:bg-primary/90 text-primary-foreground">
              {submitMutation.isPending ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Envoi...</> : "Soumettre ma candidature"}
            </Button>
          )}
        </div>

        {serverError && (
          <div className="mt-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-sm text-destructive text-center flex items-center justify-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {serverError}
          </div>
        )}
      </div>
    </div>
  );
}
