import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import { ArrowLeft, ArrowRight, CheckCircle, Loader2, AlertCircle, Upload, User, Globe, Brain, Network, Lightbulb, MessageSquare, Link2 } from "lucide-react";
import {
  step1Schema, step2Schema, step3Schema, step4Schema, step5Schema,
  step6Schema, step7Schema, step8Schema, step9Schema, applicationSchema, getFieldErrors
} from "@shared/validation";

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
  firstName: string; lastName: string; email: string; phone: string;
  country: string; city: string; sector: string; currentRole: string; yearsExperience: string;
  programmingLevel: string; aiKnowledge: string; cloudExperience: string; technicalTools: string; certifications: string;
  sectorExpertise: string; clientNetwork: string; businessDevelopment: string;
  distributionNetwork: string; industryContacts: string; existingPartnerships: string; targetMarketKnowledge: string;
  riskTolerance: string; autonomyLevel: string; resilienceLevel: string; leadershipStyle: string; entrepreneurialExperience: string;
  aiAgentScenario: string; aiAgentSector: string; aiAgentImpact: string;
  languages: string; publicSpeaking: string; salesExperience: string; motivation: string;
  linkedinUrl: string; twitterUrl: string; githubUrl: string; websiteUrl: string; otherSocialUrl: string;
};

const initialFormData: FormData = {
  firstName: "", lastName: "", email: "", phone: "",
  country: "", city: "", sector: "", currentRole: "", yearsExperience: "",
  programmingLevel: "", aiKnowledge: "", cloudExperience: "", technicalTools: "", certifications: "",
  sectorExpertise: "", clientNetwork: "", businessDevelopment: "",
  distributionNetwork: "", industryContacts: "", existingPartnerships: "", targetMarketKnowledge: "",
  riskTolerance: "", autonomyLevel: "", resilienceLevel: "", leadershipStyle: "", entrepreneurialExperience: "",
  aiAgentScenario: "", aiAgentSector: "", aiAgentImpact: "",
  languages: "", publicSpeaking: "", salesExperience: "", motivation: "",
  linkedinUrl: "", twitterUrl: "", githubUrl: "", websiteUrl: "", otherSocialUrl: "",
};

function FieldError({ error }: { error?: string }) {
  if (!error) return null;
  return (
    <p className="text-xs text-destructive flex items-center gap-1 mt-1">
      <AlertCircle className="w-3 h-3 shrink-0" />
      {error}
    </p>
  );
}

const stepTitles = [
  { icon: User, title: "Informations personnelles" },
  { icon: Globe, title: "Localisation & Secteur" },
  { icon: Brain, title: "Compétences techniques" },
  { icon: Network, title: "Compétences métier" },
  { icon: Network, title: "Réseau de distribution" },
  { icon: Lightbulb, title: "Profil entrepreneurial" },
  { icon: Brain, title: "Scénario Agent IA" },
  { icon: MessageSquare, title: "Communication & Motivation" },
  { icon: Link2, title: "Profil en ligne & Documents" },
];

export default function Apply() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string>("");
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<{ scoreTotal: number; scoreTechnique: number; scoreMetier: number; scoreCommunication: number } | null>(null);
  const cvInputRef = useRef<HTMLInputElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);

  const submitMutation = trpc.applications.submit.useMutation({
    onSuccess: (data) => {
      setResult(data);
      setStep(10); // result step
      setServerError("");
    },
    onError: (err) => {
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

  const uploadFileMutation = trpc.applications.uploadFile.useMutation();

  const totalSteps = 9;
  const progress = Math.min((step / totalSteps) * 100, 100);

  const updateField = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => { const next = { ...prev }; delete next[field]; return next; });
    }
  };

  const validateStep = (): boolean => {
    let schema: any;
    let data: Record<string, unknown>;

    switch (step) {
      case 1:
        schema = step1Schema;
        data = { firstName: formData.firstName, lastName: formData.lastName, email: formData.email, phone: formData.phone };
        break;
      case 2:
        schema = step2Schema;
        data = { country: formData.country, city: formData.city, sector: formData.sector, currentRole: formData.currentRole, yearsExperience: formData.yearsExperience === "" ? -1 : parseInt(formData.yearsExperience) };
        break;
      case 3:
        schema = step3Schema;
        data = { programmingLevel: formData.programmingLevel || undefined, aiKnowledge: formData.aiKnowledge || undefined, cloudExperience: formData.cloudExperience || undefined, technicalTools: formData.technicalTools, certifications: formData.certifications };
        break;
      case 4:
        schema = step4Schema;
        data = { sectorExpertise: formData.sectorExpertise || undefined, clientNetwork: formData.clientNetwork || undefined, businessDevelopment: formData.businessDevelopment || undefined };
        break;
      case 5:
        schema = step5Schema;
        data = { distributionNetwork: formData.distributionNetwork, industryContacts: formData.industryContacts || undefined, existingPartnerships: formData.existingPartnerships, targetMarketKnowledge: formData.targetMarketKnowledge || undefined };
        break;
      case 6:
        schema = step6Schema;
        data = { riskTolerance: formData.riskTolerance || undefined, autonomyLevel: formData.autonomyLevel || undefined, resilienceLevel: formData.resilienceLevel || undefined, leadershipStyle: formData.leadershipStyle || undefined, entrepreneurialExperience: formData.entrepreneurialExperience };
        break;
      case 7:
        schema = step7Schema;
        data = { aiAgentScenario: formData.aiAgentScenario, aiAgentSector: formData.aiAgentSector, aiAgentImpact: formData.aiAgentImpact };
        break;
      case 8:
        schema = step8Schema;
        data = { languages: formData.languages, publicSpeaking: formData.publicSpeaking || undefined, salesExperience: formData.salesExperience || undefined, motivation: formData.motivation };
        break;
      case 9:
        schema = step9Schema;
        data = { linkedinUrl: formData.linkedinUrl, twitterUrl: formData.twitterUrl, githubUrl: formData.githubUrl, websiteUrl: formData.websiteUrl, otherSocialUrl: formData.otherSocialUrl };
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

  const handleNext = () => { if (validateStep()) setStep(s => s + 1); };
  const handleBack = () => setStep(s => s - 1);

  const handleSubmit = async () => {
    if (!validateStep()) return;

    setUploading(true);
    let cvFileUrl = "";
    let cvFileKey = "";
    let photoFileUrl = "";
    let photoFileKey = "";

    try {
      // Upload CV if provided
      if (cvFile) {
        const reader = new FileReader();
        const cvBase64 = await new Promise<string>((resolve) => {
          reader.onload = () => resolve((reader.result as string).split(",")[1]);
          reader.readAsDataURL(cvFile);
        });
        const cvResult = await uploadFileMutation.mutateAsync({
          fileName: cvFile.name,
          fileData: cvBase64,
          contentType: cvFile.type,
          type: "cv",
        });
        cvFileUrl = cvResult.url;
        cvFileKey = cvResult.key;
      }

      // Upload photo if provided
      if (photoFile) {
        const reader = new FileReader();
        const photoBase64 = await new Promise<string>((resolve) => {
          reader.onload = () => resolve((reader.result as string).split(",")[1]);
          reader.readAsDataURL(photoFile);
        });
        const photoResult = await uploadFileMutation.mutateAsync({
          fileName: photoFile.name,
          fileData: photoBase64,
          contentType: photoFile.type,
          type: "photo",
        });
        photoFileUrl = photoResult.url;
        photoFileKey = photoResult.key;
      }
    } catch (e) {
      console.error("File upload error:", e);
    }

    setUploading(false);

    const fullData = {
      firstName: formData.firstName, lastName: formData.lastName, email: formData.email, phone: formData.phone,
      country: formData.country, city: formData.city, sector: formData.sector, currentRole: formData.currentRole,
      yearsExperience: formData.yearsExperience === "" ? 0 : parseInt(formData.yearsExperience),
      programmingLevel: formData.programmingLevel, aiKnowledge: formData.aiKnowledge, cloudExperience: formData.cloudExperience,
      technicalTools: formData.technicalTools, certifications: formData.certifications,
      sectorExpertise: formData.sectorExpertise, clientNetwork: formData.clientNetwork, businessDevelopment: formData.businessDevelopment,
      distributionNetwork: formData.distributionNetwork, industryContacts: formData.industryContacts,
      existingPartnerships: formData.existingPartnerships, targetMarketKnowledge: formData.targetMarketKnowledge,
      riskTolerance: formData.riskTolerance, autonomyLevel: formData.autonomyLevel,
      resilienceLevel: formData.resilienceLevel, leadershipStyle: formData.leadershipStyle,
      entrepreneurialExperience: formData.entrepreneurialExperience,
      aiAgentScenario: formData.aiAgentScenario, aiAgentSector: formData.aiAgentSector, aiAgentImpact: formData.aiAgentImpact,
      languages: formData.languages, publicSpeaking: formData.publicSpeaking, salesExperience: formData.salesExperience,
      motivation: formData.motivation,
      linkedinUrl: formData.linkedinUrl, twitterUrl: formData.twitterUrl, githubUrl: formData.githubUrl,
      websiteUrl: formData.websiteUrl, otherSocialUrl: formData.otherSocialUrl,
      cvFileUrl, cvFileKey, photoFileUrl, photoFileKey,
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

  // Result page
  if (step === 10 && result) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4">
        <div className="max-w-lg w-full text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-6" />
          <h1 className="display-lg text-foreground mb-4">Candidature soumise !</h1>
          <p className="body-md text-muted-foreground mb-8">Votre score a été calculé automatiquement.</p>
          <div className="card-stripe mb-8">
            <div className="display-xxl text-primary mb-2">{Number(result.scoreTotal).toFixed(1)}%</div>
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
          <p className="body-md text-muted-foreground mb-6">Si votre profil est retenu, vous serez contacté sous 48h.</p>
          <Link href="/"><Button variant="outline" className="btn-pill">Retour à l'accueil</Button></Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <nav className="border-b border-border bg-background/90 backdrop-blur-md">
        <div className="container flex items-center justify-between h-16">
          <Link href="/"><div className="flex items-center gap-2 cursor-pointer"><img src={LOGO_URL} alt="Neopolis" className="h-7" /><span className="text-lg font-light tracking-tight">Akademy</span></div></Link>
          <Link href="/"><Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground"><ArrowLeft className="w-4 h-4 mr-2" /> Retour</Button></Link>
        </div>
      </nav>

      <div className="container py-12 max-w-2xl mx-auto">
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-2">
            {stepTitles[step - 1] && (() => { const Icon = stepTitles[step - 1].icon; return <Icon className="w-5 h-5 text-primary" />; })()}
            <h1 className="display-lg text-foreground">{stepTitles[step - 1]?.title}</h1>
          </div>
          <p className="body-md text-muted-foreground">Étape {step} sur {totalSteps}</p>
          <Progress value={progress} className="mt-4 h-1.5" />
        </div>

        {serverError && (
          <div className="mb-6 p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" /> {serverError}
          </div>
        )}

        {/* Step 1: Personal Info */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Prénom *</Label>
                <Input value={formData.firstName} onChange={e => updateField("firstName", e.target.value)} placeholder="Votre prénom" className={errors.firstName ? "border-destructive" : ""} />
                <FieldError error={errors.firstName} />
              </div>
              <div className="space-y-2">
                <Label>Nom *</Label>
                <Input value={formData.lastName} onChange={e => updateField("lastName", e.target.value)} placeholder="Votre nom" className={errors.lastName ? "border-destructive" : ""} />
                <FieldError error={errors.lastName} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Email *</Label>
              <Input type="email" value={formData.email} onChange={e => updateField("email", e.target.value)} placeholder="votre@email.com" className={errors.email ? "border-destructive" : ""} />
              <FieldError error={errors.email} />
            </div>
            <div className="space-y-2">
              <Label>Téléphone *</Label>
              <Input value={formData.phone} onChange={e => updateField("phone", e.target.value)} placeholder="+212 6XX XXX XXX" className={errors.phone ? "border-destructive" : ""} />
              <FieldError error={errors.phone} />
            </div>
          </div>
        )}

        {/* Step 2: Location & Sector */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label>Pays de résidence *</Label>
              <Select value={formData.country} onValueChange={v => updateField("country", v)}>
                <SelectTrigger className={errors.country ? "border-destructive" : ""}><SelectValue placeholder="Sélectionnez votre pays" /></SelectTrigger>
                <SelectContent>{africanCountries.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
              <FieldError error={errors.country} />
            </div>
            <div className="space-y-2">
              <Label>Ville *</Label>
              <Input value={formData.city} onChange={e => updateField("city", e.target.value)} placeholder="Votre ville" className={errors.city ? "border-destructive" : ""} />
              <FieldError error={errors.city} />
            </div>
            <div className="space-y-2">
              <Label>Secteur d'activité *</Label>
              <Select value={formData.sector} onValueChange={v => updateField("sector", v)}>
                <SelectTrigger className={errors.sector ? "border-destructive" : ""}><SelectValue placeholder="Sélectionnez votre secteur" /></SelectTrigger>
                <SelectContent>{sectors.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
              <FieldError error={errors.sector} />
            </div>
            <div className="space-y-2">
              <Label>Poste actuel *</Label>
              <Input value={formData.currentRole} onChange={e => updateField("currentRole", e.target.value)} placeholder="Ex: Chef de projet, Développeur senior..." className={errors.currentRole ? "border-destructive" : ""} />
              <FieldError error={errors.currentRole} />
            </div>
            <div className="space-y-2">
              <Label>Années d'expérience *</Label>
              <Input type="number" min="0" max="50" value={formData.yearsExperience} onChange={e => updateField("yearsExperience", e.target.value)} placeholder="Ex: 5" className={errors.yearsExperience ? "border-destructive" : ""} />
              <FieldError error={errors.yearsExperience} />
            </div>
          </div>
        )}

        {/* Step 3: Technical Skills */}
        {step === 3 && (
          <div className="space-y-6">
            <SelectField label="Niveau en programmation *" value={formData.programmingLevel} onChange={v => updateField("programmingLevel", v)} error={errors.programmingLevel}
              options={[["none","Aucun"],["beginner","Débutant"],["intermediate","Intermédiaire"],["advanced","Avancé"],["expert","Expert"]]} />
            <SelectField label="Connaissances en IA *" value={formData.aiKnowledge} onChange={v => updateField("aiKnowledge", v)} error={errors.aiKnowledge}
              options={[["none","Aucune"],["basic","Basique"],["intermediate","Intermédiaire"],["advanced","Avancé"],["expert","Expert"]]} />
            <SelectField label="Expérience Cloud *" value={formData.cloudExperience} onChange={v => updateField("cloudExperience", v)} error={errors.cloudExperience}
              options={[["none","Aucune"],["basic","Basique"],["intermediate","Intermédiaire"],["advanced","Avancé"],["expert","Expert"]]} />
            <div className="space-y-2">
              <Label>Outils techniques maîtrisés</Label>
              <Textarea value={formData.technicalTools} onChange={e => updateField("technicalTools", e.target.value)} placeholder="Ex: Python, JavaScript, AWS, Docker, LangChain..." rows={3} />
            </div>
            <div className="space-y-2">
              <Label>Certifications existantes</Label>
              <Textarea value={formData.certifications} onChange={e => updateField("certifications", e.target.value)} placeholder="Ex: AWS Certified, Google Cloud, PMP..." rows={3} />
            </div>
          </div>
        )}

        {/* Step 4: Business Skills */}
        {step === 4 && (
          <div className="space-y-6">
            <SelectField label="Expertise sectorielle *" value={formData.sectorExpertise} onChange={v => updateField("sectorExpertise", v)} error={errors.sectorExpertise}
              options={[["junior","Junior (< 2 ans)"],["intermediate","Intermédiaire (2-5 ans)"],["senior","Senior (5-10 ans)"],["expert","Expert (10+ ans)"]]} />
            <SelectField label="Réseau client existant *" value={formData.clientNetwork} onChange={v => updateField("clientNetwork", v)} error={errors.clientNetwork}
              options={[["none","Aucun"],["small","Petit (< 10 contacts)"],["medium","Moyen (10-50 contacts)"],["large","Large (50+ contacts)"]]} />
            <SelectField label="Expérience en développement commercial *" value={formData.businessDevelopment} onChange={v => updateField("businessDevelopment", v)} error={errors.businessDevelopment}
              options={[["none","Aucune"],["basic","Basique"],["intermediate","Intermédiaire"],["advanced","Avancé"]]} />
          </div>
        )}

        {/* Step 5: Distribution Network (NEW) */}
        {step === 5 && (
          <div className="space-y-6">
            <div className="p-4 rounded-lg bg-primary/5 border border-primary/20 mb-4">
              <p className="text-sm text-primary font-medium">Cette section évalue votre capacité à distribuer des solutions IA auprès de PME/TPE dans votre secteur.</p>
            </div>
            <div className="space-y-2">
              <Label>Décrivez votre réseau de distribution potentiel</Label>
              <Textarea value={formData.distributionNetwork} onChange={e => updateField("distributionNetwork", e.target.value)}
                placeholder="Décrivez vos contacts B2B, partenaires potentiels, canaux de distribution que vous pourriez activer pour vendre des solutions IA (associations professionnelles, chambres de commerce, réseaux d'entrepreneurs, anciens clients, etc.)" rows={5} className={errors.distributionNetwork ? "border-destructive" : ""} />
              <FieldError error={errors.distributionNetwork} />
            </div>
            <SelectField label="Niveau de contacts dans l'industrie *" value={formData.industryContacts} onChange={v => updateField("industryContacts", v)} error={errors.industryContacts}
              options={[["none","Aucun contact"],["few","Quelques contacts (< 5)"],["moderate","Contacts modérés (5-20)"],["extensive","Réseau étendu (20-100)"],["very_extensive","Très étendu (100+)"]]} />
            <div className="space-y-2">
              <Label>Partenariats existants</Label>
              <Textarea value={formData.existingPartnerships} onChange={e => updateField("existingPartnerships", e.target.value)}
                placeholder="Listez vos partenariats professionnels actuels (entreprises, distributeurs, revendeurs, intégrateurs...)" rows={4} className={errors.existingPartnerships ? "border-destructive" : ""} />
              <FieldError error={errors.existingPartnerships} />
            </div>
            <SelectField label="Connaissance du marché cible *" value={formData.targetMarketKnowledge} onChange={v => updateField("targetMarketKnowledge", v)} error={errors.targetMarketKnowledge}
              options={[["none","Aucune"],["basic","Basique"],["good","Bonne"],["excellent","Excellente"],["expert","Expert du marché"]]} />
          </div>
        )}

        {/* Step 6: Entrepreneurial Psychology (NEW) */}
        {step === 6 && (
          <div className="space-y-6">
            <div className="p-4 rounded-lg bg-primary/5 border border-primary/20 mb-4">
              <p className="text-sm text-primary font-medium">Cette section évalue votre profil psychologique d'entrepreneur. Soyez honnête, il n'y a pas de mauvaise réponse.</p>
            </div>
            <SelectField label="Tolérance au risque *" value={formData.riskTolerance} onChange={v => updateField("riskTolerance", v)} error={errors.riskTolerance}
              options={[["very_low","Très faible — J'évite tout risque"],["low","Faible — Je préfère la sécurité"],["moderate","Modérée — Risques calculés"],["high","Élevée — J'accepte les risques importants"],["very_high","Très élevée — Je recherche le risque"]]} />
            <SelectField label="Niveau d'autonomie *" value={formData.autonomyLevel} onChange={v => updateField("autonomyLevel", v)} error={errors.autonomyLevel}
              options={[["needs_guidance","Besoin d'accompagnement constant"],["somewhat_autonomous","Relativement autonome"],["autonomous","Autonome"],["very_autonomous","Très autonome"],["fully_independent","Totalement indépendant"]]} />
            <SelectField label="Résilience face aux échecs *" value={formData.resilienceLevel} onChange={v => updateField("resilienceLevel", v)} error={errors.resilienceLevel}
              options={[["low","Faible — Les échecs me découragent"],["moderate","Modérée — Je me relève après un temps"],["high","Élevée — Je rebondis rapidement"],["very_high","Très élevée — Les échecs me motivent"]]} />
            <SelectField label="Style de leadership *" value={formData.leadershipStyle} onChange={v => updateField("leadershipStyle", v)} error={errors.leadershipStyle}
              options={[["follower","Suiveur — Je préfère exécuter"],["collaborative","Collaboratif — Je travaille en équipe"],["situational","Situationnel — Je m'adapte"],["visionary","Visionnaire — J'inspire les autres"],["transformational","Transformationnel — Je change les choses"]]} />
            <div className="space-y-2">
              <Label>Expériences entrepreneuriales passées</Label>
              <Textarea value={formData.entrepreneurialExperience} onChange={e => updateField("entrepreneurialExperience", e.target.value)}
                placeholder="Décrivez vos expériences entrepreneuriales : création d'entreprise, projets personnels, freelance, side projects, initiatives dans votre entreprise actuelle..." rows={5} className={errors.entrepreneurialExperience ? "border-destructive" : ""} />
              <FieldError error={errors.entrepreneurialExperience} />
            </div>
          </div>
        )}

        {/* Step 7: AI Agent Scenario (NEW) */}
        {step === 7 && (
          <div className="space-y-6">
            <div className="p-4 rounded-lg bg-primary/5 border border-primary/20 mb-4">
              <p className="text-sm text-primary font-medium">Décrivez un scénario concret où un agent IA pourrait remplacer un humain dans un processus métier que vous maîtrisez. C'est le cœur de votre candidature.</p>
            </div>
            <div className="space-y-2">
              <Label>Secteur cible du scénario *</Label>
              <Input value={formData.aiAgentSector} onChange={e => updateField("aiAgentSector", e.target.value)}
                placeholder="Ex: Comptabilité PME, Service client e-commerce, Gestion immobilière..." className={errors.aiAgentSector ? "border-destructive" : ""} />
              <FieldError error={errors.aiAgentSector} />
            </div>
            <div className="space-y-2">
              <Label>Scénario concret * <span className="text-muted-foreground">(min. 100 caractères)</span></Label>
              <Textarea value={formData.aiAgentScenario} onChange={e => updateField("aiAgentScenario", e.target.value)}
                placeholder="Décrivez en détail un cas d'usage concret : Quel processus métier ? Quel humain est remplacé ? Quelles tâches l'agent IA effectue-t-il ? Comment fonctionne-t-il au quotidien ? Quel est le gain pour l'entreprise cliente ? Comment le distribuer à grande échelle ?" rows={8} className={errors.aiAgentScenario ? "border-destructive" : ""} />
              <div className="flex justify-between">
                <FieldError error={errors.aiAgentScenario} />
                <span className="text-xs text-muted-foreground">{formData.aiAgentScenario.length}/5000</span>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Impact attendu et potentiel de distribution * <span className="text-muted-foreground">(min. 50 caractères)</span></Label>
              <Textarea value={formData.aiAgentImpact} onChange={e => updateField("aiAgentImpact", e.target.value)}
                placeholder="Quel impact concret pour les PME/TPE ? Combien d'entreprises pourraient être ciblées ? Quel modèle de revenus envisagez-vous ? Comment passer à l'échelle ?" rows={5} className={errors.aiAgentImpact ? "border-destructive" : ""} />
              <div className="flex justify-between">
                <FieldError error={errors.aiAgentImpact} />
                <span className="text-xs text-muted-foreground">{formData.aiAgentImpact.length}/3000</span>
              </div>
            </div>
          </div>
        )}

        {/* Step 8: Communication & Motivation */}
        {step === 8 && (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label>Langues parlées</Label>
              <Input value={formData.languages} onChange={e => updateField("languages", e.target.value)} placeholder="Ex: Français (natif), Anglais (courant), Arabe (intermédiaire)" />
            </div>
            <SelectField label="Aisance en prise de parole publique *" value={formData.publicSpeaking} onChange={v => updateField("publicSpeaking", v)} error={errors.publicSpeaking}
              options={[["none","Aucune expérience"],["basic","Basique (petits groupes)"],["intermediate","Intermédiaire (conférences)"],["advanced","Avancé (keynotes, médias)"]]} />
            <SelectField label="Expérience en vente *" value={formData.salesExperience} onChange={v => updateField("salesExperience", v)} error={errors.salesExperience}
              options={[["none","Aucune"],["less_1y","Moins d'1 an"],["1_3y","1 à 3 ans"],["3_5y","3 à 5 ans"],["more_5y","Plus de 5 ans"]]} />
            <div className="space-y-2">
              <Label>Lettre de motivation * <span className="text-muted-foreground">(min. 50 caractères)</span></Label>
              <Textarea value={formData.motivation} onChange={e => updateField("motivation", e.target.value)}
                placeholder="Expliquez pourquoi vous souhaitez devenir AI Solutions Partner — Ambassadeur Certifié et comment vous comptez contribuer à la transformation IA en Afrique..." rows={6} className={errors.motivation ? "border-destructive" : ""} />
              <div className="flex justify-between">
                <FieldError error={errors.motivation} />
                <span className="text-xs text-muted-foreground">{formData.motivation.length}/5000</span>
              </div>
            </div>
          </div>
        )}

        {/* Step 9: Social Links & Files (NEW) */}
        {step === 9 && (
          <div className="space-y-6">
            <div className="p-4 rounded-lg bg-primary/5 border border-primary/20 mb-4">
              <p className="text-sm text-primary font-medium">Partagez vos profils en ligne et documents pour compléter votre candidature.</p>
            </div>
            <div className="space-y-2">
              <Label>LinkedIn</Label>
              <Input value={formData.linkedinUrl} onChange={e => updateField("linkedinUrl", e.target.value)} placeholder="https://linkedin.com/in/votre-profil" />
            </div>
            <div className="space-y-2">
              <Label>Twitter / X</Label>
              <Input value={formData.twitterUrl} onChange={e => updateField("twitterUrl", e.target.value)} placeholder="https://x.com/votre-profil" />
            </div>
            <div className="space-y-2">
              <Label>GitHub</Label>
              <Input value={formData.githubUrl} onChange={e => updateField("githubUrl", e.target.value)} placeholder="https://github.com/votre-profil" />
            </div>
            <div className="space-y-2">
              <Label>Site web personnel</Label>
              <Input value={formData.websiteUrl} onChange={e => updateField("websiteUrl", e.target.value)} placeholder="https://votre-site.com" />
            </div>
            <div className="space-y-2">
              <Label>Autre réseau social</Label>
              <Input value={formData.otherSocialUrl} onChange={e => updateField("otherSocialUrl", e.target.value)} placeholder="https://..." />
            </div>

            {/* File uploads */}
            <div className="border-t border-border pt-6 mt-6">
              <h3 className="heading-md text-foreground mb-4">Documents</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>CV (PDF, DOC, DOCX)</Label>
                  <input ref={cvInputRef} type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={e => { if (e.target.files?.[0]) setCvFile(e.target.files[0]); }} />
                  <div
                    className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
                    onClick={() => cvInputRef.current?.click()}
                  >
                    <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                    {cvFile ? (
                      <p className="text-sm text-primary font-medium">{cvFile.name}</p>
                    ) : (
                      <p className="text-sm text-muted-foreground">Cliquez pour uploader votre CV</p>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Photo de profil (JPG, PNG)</Label>
                  <input ref={photoInputRef} type="file" accept=".jpg,.jpeg,.png,.webp" className="hidden" onChange={e => { if (e.target.files?.[0]) setPhotoFile(e.target.files[0]); }} />
                  <div
                    className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
                    onClick={() => photoInputRef.current?.click()}
                  >
                    <User className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                    {photoFile ? (
                      <p className="text-sm text-primary font-medium">{photoFile.name}</p>
                    ) : (
                      <p className="text-sm text-muted-foreground">Cliquez pour uploader votre photo</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between mt-10 pt-6 border-t border-border">
          {step > 1 ? (
            <Button variant="outline" onClick={handleBack} className="btn-pill">
              <ArrowLeft className="w-4 h-4 mr-2" /> Précédent
            </Button>
          ) : <div />}

          {step < totalSteps ? (
            <Button onClick={handleNext} className="btn-pill bg-primary text-primary-foreground hover:bg-primary/90">
              Suivant <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={submitMutation.isPending || uploading} className="btn-pill bg-primary text-primary-foreground hover:bg-primary/90">
              {(submitMutation.isPending || uploading) ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Envoi en cours...</> : <>Soumettre ma candidature <CheckCircle className="w-4 h-4 ml-2" /></>}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

/* Helper component for Select fields */
function SelectField({ label, value, onChange, error, options }: {
  label: string; value: string; onChange: (v: string) => void; error?: string;
  options: [string, string][];
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className={error ? "border-destructive" : ""}><SelectValue placeholder="Sélectionnez..." /></SelectTrigger>
        <SelectContent>{options.map(([val, label]) => <SelectItem key={val} value={val}>{label}</SelectItem>)}</SelectContent>
      </Select>
      <FieldError error={error} />
    </div>
  );
}
