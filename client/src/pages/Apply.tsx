import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import { ArrowLeft, ArrowRight, CheckCircle, Loader2, AlertCircle, Upload, User, Globe, Brain, Network, Lightbulb, MessageSquare, Link2, Video, Square, Circle, Mic } from "lucide-react";
import {
  step1Schema, step2Schema, step3Schema, step4Schema, step5Schema,
  step6Schema, step7Schema, step8Schema, step9Schema, step10Schema, applicationSchema, getFieldErrors
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
  { icon: Video, title: "Vidéo Pitch" },
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

  // Video recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [cameraError, setCameraError] = useState("");
  const [audioLevel, setAudioLevel] = useState(0);
  const [countdown, setCountdown] = useState(0);
  const videoPreviewRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioAnimRef = useRef<number | null>(null);

  const MAX_VIDEO_SECONDS = 90;

  const pitchPrompts = [
    { time: 0, text: "Présentez-vous (nom, parcours)" },
    { time: 20, text: "Parlez de votre secteur d'expertise" },
    { time: 40, text: "Décrivez votre cas d'usage agent IA" },
    { time: 60, text: "Expliquez pourquoi vous êtes le bon candidat" },
    { time: 75, text: "Concluez avec votre vision" },
  ];

  const getCurrentPrompt = () => {
    for (let i = pitchPrompts.length - 1; i >= 0; i--) {
      if (recordingTime >= pitchPrompts[i].time) return pitchPrompts[i].text;
    }
    return pitchPrompts[0].text;
  };

  const startAudioMonitoring = (stream: MediaStream) => {
    try {
      const audioContext = new AudioContext();
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);
      audioContextRef.current = audioContext;
      analyserRef.current = analyser;
      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      const updateLevel = () => {
        analyser.getByteFrequencyData(dataArray);
        const avg = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
        setAudioLevel(Math.min(avg / 128, 1));
        audioAnimRef.current = requestAnimationFrame(updateLevel);
      };
      updateLevel();
    } catch (e) { /* audio monitoring is non-critical */ }
  };

  const stopAudioMonitoring = () => {
    if (audioAnimRef.current) { cancelAnimationFrame(audioAnimRef.current); audioAnimRef.current = null; }
    if (audioContextRef.current) { audioContextRef.current.close(); audioContextRef.current = null; }
    setAudioLevel(0);
  };

  const startRecording = async () => {
    try {
      setCameraError("");
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 1280, height: 720, facingMode: "user" }, audio: true });
      streamRef.current = stream;
      if (videoPreviewRef.current) {
        videoPreviewRef.current.srcObject = stream;
        videoPreviewRef.current.play();
      }
      // 3-second countdown
      setCountdown(3);
      await new Promise<void>(resolve => {
        let c = 3;
        const interval = setInterval(() => {
          c--;
          setCountdown(c);
          if (c === 0) { clearInterval(interval); resolve(); }
        }, 1000);
      });
      setCountdown(0);
      // Start audio monitoring
      startAudioMonitoring(stream);
      chunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream, { mimeType: "video/webm" });
      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "video/webm" });
        setRecordedBlob(blob);
        if (videoPreviewRef.current) {
          videoPreviewRef.current.srcObject = null;
          videoPreviewRef.current.src = URL.createObjectURL(blob);
        }
        stream.getTracks().forEach(t => t.stop());
        stopAudioMonitoring();
      };
      mediaRecorder.start(1000);
      setIsRecording(true);
      setRecordingTime(0);
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => {
          if (prev >= MAX_VIDEO_SECONDS - 1) {
            stopRecording();
            return MAX_VIDEO_SECONDS;
          }
          return prev + 1;
        });
      }, 1000);
    } catch (err: any) {
      setCameraError("Impossible d'accéder à la caméra/micro. Vérifiez les permissions de votre navigateur.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    stopAudioMonitoring();
  };

  const resetRecording = () => {
    setRecordedBlob(null);
    setRecordingTime(0);
    if (videoPreviewRef.current) { videoPreviewRef.current.src = ""; videoPreviewRef.current.srcObject = null; }
  };

  const submitMutation = trpc.applications.submit.useMutation({
    onSuccess: (data) => {
      setResult(data);
      setStep(11); // result step
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

  const totalSteps = 10;
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
      case 10:
        schema = step10Schema;
        data = {};
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
    let videoFileUrl = "";
    let videoFileKey = "";

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

      // Upload video if recorded
      if (recordedBlob) {
        const videoBase64 = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve((reader.result as string).split(",")[1]);
          reader.readAsDataURL(recordedBlob);
        });
        const videoResult = await uploadFileMutation.mutateAsync({
          fileName: `pitch_${Date.now()}.webm`,
          fileData: videoBase64,
          contentType: "video/webm",
          type: "video",
        });
        videoFileUrl = videoResult.url;
        videoFileKey = videoResult.key;
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
      cvFileUrl, cvFileKey, photoFileUrl, photoFileKey, videoFileUrl, videoFileKey,
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
  if (step === 11 && result) {
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

        {/* Step 10: Video Pitch */}
        {step === 10 && (
          <div className="space-y-6">
            <div className="p-4 rounded-lg bg-primary/5 border border-primary/20 mb-4">
              <p className="text-sm text-primary font-medium">Enregistrez une courte vidéo (90 secondes max) pour vous présenter et nous convaincre de vous sélectionner. Un compte à rebours de 3 secondes vous laissera le temps de vous préparer.</p>
            </div>

            {/* Video preview area */}
            <div className="relative rounded-xl overflow-hidden bg-gray-900 aspect-video shadow-lg">
              <video
                ref={videoPreviewRef}
                className="w-full h-full object-cover"
                muted={isRecording}
                controls={!isRecording && !!recordedBlob}
                playsInline
              />

              {/* Idle state */}
              {!isRecording && !recordedBlob && countdown === 0 && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-gray-800 to-gray-900">
                  <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center mb-4 border-2 border-white/20">
                    <Video className="w-10 h-10 text-white/70" />
                  </div>
                  <p className="text-lg font-medium text-white">Prêt à enregistrer votre pitch</p>
                  <p className="text-sm text-white/50 mt-1">Assurez-vous d'être dans un endroit calme et bien éclairé</p>
                </div>
              )}

              {/* Countdown overlay */}
              {countdown > 0 && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/70 z-10">
                  <div className="text-center">
                    <div className="text-7xl font-bold text-white animate-pulse">{countdown}</div>
                    <p className="text-white/70 mt-2 text-lg">Préparez-vous...</p>
                  </div>
                </div>
              )}

              {/* Recording overlay - timer + prompt */}
              {isRecording && (
                <>
                  {/* Timer badge */}
                  <div className="absolute top-4 right-4 flex items-center gap-2 bg-red-600 text-white px-3 py-1.5 rounded-full text-sm font-medium shadow-lg">
                    <Circle className="w-3 h-3 fill-white animate-pulse" />
                    {Math.floor(recordingTime / 60)}:{(recordingTime % 60).toString().padStart(2, "0")} / 1:30
                  </div>

                  {/* Progress bar */}
                  <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-black/30">
                    <div
                      className="h-full bg-gradient-to-r from-green-400 via-yellow-400 to-red-500 transition-all duration-1000"
                      style={{ width: `${(recordingTime / MAX_VIDEO_SECONDS) * 100}%` }}
                    />
                  </div>

                  {/* Dynamic prompt */}
                  <div className="absolute bottom-6 left-4 right-4">
                    <div className="bg-black/60 backdrop-blur-sm rounded-lg px-4 py-2 text-center">
                      <p className="text-white text-sm font-medium">💡 {getCurrentPrompt()}</p>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Audio level indicator */}
            {isRecording && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                    <Mic className="w-3.5 h-3.5" /> Niveau audio
                  </span>
                  <span className={`text-xs font-medium ${audioLevel > 0.1 ? 'text-green-600' : 'text-amber-500'}`}>
                    {audioLevel > 0.1 ? '✓ Audio détecté' : '⚠ Parlez plus fort'}
                  </span>
                </div>
                <div className="h-3 bg-gray-100 rounded-full overflow-hidden border border-gray-200">
                  <div
                    className={`h-full rounded-full transition-all duration-100 ${audioLevel > 0.6 ? 'bg-red-400' : audioLevel > 0.3 ? 'bg-green-400' : audioLevel > 0.1 ? 'bg-green-300' : 'bg-amber-300'}`}
                    style={{ width: `${Math.max(audioLevel * 100, 2)}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-muted-foreground">
                  <span>Faible</span>
                  <span>Optimal</span>
                  <span>Fort</span>
                </div>
              </div>
            )}

            {/* Error message */}
            {cameraError && (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" /> {cameraError}
              </div>
            )}

            {/* Controls */}
            <div className="flex items-center justify-center gap-4">
              {!isRecording && !recordedBlob && countdown === 0 && (
                <Button onClick={startRecording} className="btn-pill bg-red-600 hover:bg-red-700 text-white px-6 py-3 text-base">
                  <Circle className="w-5 h-5 mr-2 fill-white" /> Démarrer l'enregistrement
                </Button>
              )}
              {isRecording && (
                <Button onClick={stopRecording} className="btn-pill bg-gray-800 hover:bg-gray-900 text-white px-6 py-3 text-base">
                  <Square className="w-5 h-5 mr-2 fill-white" /> Arrêter l'enregistrement
                </Button>
              )}
              {!isRecording && recordedBlob && (
                <div className="flex flex-col items-center gap-3">
                  <div className="flex items-center gap-3">
                    <Button variant="outline" onClick={resetRecording} className="btn-pill">
                      Recommencer
                    </Button>
                    <div className="text-sm text-green-600 font-medium flex items-center gap-1 bg-green-50 px-3 py-1.5 rounded-full">
                      <CheckCircle className="w-4 h-4" /> Vidéo enregistrée ({Math.round(recordedBlob.size / 1024 / 1024 * 10) / 10} Mo)
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">Vous pouvez relire votre vidéo ci-dessus avant de soumettre</p>
                </div>
              )}
            </div>

            {/* Structured tips */}
            {!isRecording && !recordedBlob && (
              <div className="p-4 rounded-xl bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/10">
                <p className="font-semibold text-foreground mb-3 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs">?</span>
                  Guide de votre pitch (90 secondes)
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="flex items-start gap-2 p-2 rounded-lg bg-white/60">
                    <span className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-primary text-[10px] font-bold shrink-0 mt-0.5">1</span>
                    <div><p className="text-xs font-medium text-foreground">0-20s : Présentation</p><p className="text-[11px] text-muted-foreground">Nom, parcours, secteur</p></div>
                  </div>
                  <div className="flex items-start gap-2 p-2 rounded-lg bg-white/60">
                    <span className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-primary text-[10px] font-bold shrink-0 mt-0.5">2</span>
                    <div><p className="text-xs font-medium text-foreground">20-40s : Expertise</p><p className="text-[11px] text-muted-foreground">Votre secteur et réseau</p></div>
                  </div>
                  <div className="flex items-start gap-2 p-2 rounded-lg bg-white/60">
                    <span className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-primary text-[10px] font-bold shrink-0 mt-0.5">3</span>
                    <div><p className="text-xs font-medium text-foreground">40-60s : Cas d'usage IA</p><p className="text-[11px] text-muted-foreground">Scénario concret d'agent IA</p></div>
                  </div>
                  <div className="flex items-start gap-2 p-2 rounded-lg bg-white/60">
                    <span className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-primary text-[10px] font-bold shrink-0 mt-0.5">4</span>
                    <div><p className="text-xs font-medium text-foreground">60-90s : Conclusion</p><p className="text-[11px] text-muted-foreground">Pourquoi vous, votre vision</p></div>
                  </div>
                </div>
              </div>
            )}

            <p className="text-xs text-muted-foreground text-center">Cette étape est optionnelle mais fortement recommandée. Les candidats avec vidéo sont prioritaires dans la sélection.</p>
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
