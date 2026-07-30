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
import { motion, AnimatePresence } from "framer-motion";
import {
  step1Schema, step2Schema, step3Schema, step4Schema, step5Schema,
  step6Schema, step7Schema, step8Schema, step9Schema, step10Schema, applicationSchema, getFieldErrors
} from "@shared/validation";
import { useLanguage } from "@/contexts/LanguageContext";
import { translateValidationError } from "@/data/validationMessages";

const LOGO_URL = "/api/assets/logo_neopolis_akademy_wise_ede57803.png";

const africanCountriesData: {fr: string; en: string; ar: string}[] = [
  {fr: "Algérie", en: "Algeria", ar: "الجزائر"}, {fr: "Angola", en: "Angola", ar: "أنغولا"}, {fr: "Bénin", en: "Benin", ar: "بنين"},
  {fr: "Botswana", en: "Botswana", ar: "بوتسوانا"}, {fr: "Burkina Faso", en: "Burkina Faso", ar: "بوركينا فاسو"},
  {fr: "Burundi", en: "Burundi", ar: "بوروندي"}, {fr: "Cameroun", en: "Cameroon", ar: "الكاميرون"},
  {fr: "Cap-Vert", en: "Cape Verde", ar: "الرأس الأخضر"}, {fr: "Centrafrique", en: "Central African Republic", ar: "أفريقيا الوسطى"},
  {fr: "Comores", en: "Comoros", ar: "جزر القمر"}, {fr: "Congo", en: "Congo", ar: "الكونغو"},
  {fr: "Côte d'Ivoire", en: "Ivory Coast", ar: "ساحل العاج"}, {fr: "Djibouti", en: "Djibouti", ar: "جيبوتي"},
  {fr: "Égypte", en: "Egypt", ar: "مصر"}, {fr: "Érythrée", en: "Eritrea", ar: "إريتريا"},
  {fr: "Eswatini", en: "Eswatini", ar: "إسواتيني"}, {fr: "Éthiopie", en: "Ethiopia", ar: "إثيوبيا"},
  {fr: "Gabon", en: "Gabon", ar: "الغابون"}, {fr: "Gambie", en: "Gambia", ar: "غامبيا"},
  {fr: "Ghana", en: "Ghana", ar: "غانا"}, {fr: "Guinée", en: "Guinea", ar: "غينيا"},
  {fr: "Guinée-Bissau", en: "Guinea-Bissau", ar: "غينيا بيساو"}, {fr: "Guinée équatoriale", en: "Equatorial Guinea", ar: "غينيا الاستوائية"},
  {fr: "Kenya", en: "Kenya", ar: "كينيا"}, {fr: "Lesotho", en: "Lesotho", ar: "ليسوتو"},
  {fr: "Libéria", en: "Liberia", ar: "ليبيريا"}, {fr: "Libye", en: "Libya", ar: "ليبيا"},
  {fr: "Madagascar", en: "Madagascar", ar: "مدغشقر"}, {fr: "Malawi", en: "Malawi", ar: "ملاوي"},
  {fr: "Mali", en: "Mali", ar: "مالي"}, {fr: "Maroc", en: "Morocco", ar: "المغرب"},
  {fr: "Maurice", en: "Mauritius", ar: "موريشيوس"}, {fr: "Mauritanie", en: "Mauritania", ar: "موريتانيا"},
  {fr: "Mozambique", en: "Mozambique", ar: "موزمبيق"}, {fr: "Namibie", en: "Namibia", ar: "ناميبيا"},
  {fr: "Niger", en: "Niger", ar: "النيجر"}, {fr: "Nigéria", en: "Nigeria", ar: "نيجيريا"},
  {fr: "Ouganda", en: "Uganda", ar: "أوغندا"}, {fr: "RD Congo", en: "DR Congo", ar: "الكونغو الديمقراطية"},
  {fr: "Rwanda", en: "Rwanda", ar: "رواندا"}, {fr: "São Tomé-et-Príncipe", en: "São Tomé and Príncipe", ar: "ساو تومي وبرينسيبي"},
  {fr: "Sénégal", en: "Senegal", ar: "السنغال"}, {fr: "Seychelles", en: "Seychelles", ar: "سيشل"},
  {fr: "Sierra Leone", en: "Sierra Leone", ar: "سيراليون"}, {fr: "Somalie", en: "Somalia", ar: "الصومال"},
  {fr: "Soudan", en: "Sudan", ar: "السودان"}, {fr: "Soudan du Sud", en: "South Sudan", ar: "جنوب السودان"},
  {fr: "Tanzanie", en: "Tanzania", ar: "تنزانيا"}, {fr: "Tchad", en: "Chad", ar: "تشاد"},
  {fr: "Togo", en: "Togo", ar: "توغو"}, {fr: "Tunisie", en: "Tunisia", ar: "تونس"},
  {fr: "Zambie", en: "Zambia", ar: "زامبيا"}, {fr: "Zimbabwe", en: "Zimbabwe", ar: "زيمبابوي"}
];

const sectorsData: {fr: string; en: string; ar: string}[] = [
  {fr: "Développement logiciel", en: "Software Development", ar: "تطوير البرمجيات"},
  {fr: "Service client / Support", en: "Customer Service / Support", ar: "خدمة العملاء / الدعم"},
  {fr: "Comptabilité & Finance", en: "Accounting & Finance", ar: "المحاسبة والمالية"},
  {fr: "Juridique & Paralégal", en: "Legal & Paralegal", ar: "القانون والشؤون القانونية"},
  {fr: "Administration & Secrétariat", en: "Administration & Secretarial", ar: "الإدارة والسكرتارية"},
  {fr: "Marketing & Communication", en: "Marketing & Communication", ar: "التسويق والاتصالات"},
  {fr: "Traduction & Interprétation", en: "Translation & Interpretation", ar: "الترجمة والترجمة الفورية"},
  {fr: "Banque & Assurance", en: "Banking & Insurance", ar: "البنوك والتأمين"},
  {fr: "Ressources Humaines", en: "Human Resources", ar: "الموارد البشرية"},
  {fr: "Logistique & Transport", en: "Logistics & Transport", ar: "اللوجستيات والنقل"},
  {fr: "Santé & Médical", en: "Healthcare & Medical", ar: "الصحة والطب"},
  {fr: "Éducation & Formation", en: "Education & Training", ar: "التعليم والتدريب"},
  {fr: "Immobilier", en: "Real Estate", ar: "العقارات"},
  {fr: "Commerce & Vente", en: "Sales & Commerce", ar: "التجارة والمبيعات"},
  {fr: "Télécommunications", en: "Telecommunications", ar: "الاتصالات"},
  {fr: "Énergie", en: "Energy", ar: "الطاقة"},
  {fr: "Agriculture & Agroalimentaire", en: "Agriculture & Agri-food", ar: "الزراعة والصناعات الغذائية"},
  {fr: "Autre", en: "Other", ar: "أخرى"}
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
  const { lang } = useLanguage();
  if (!error) return null;
  return (
    <p className="text-xs text-destructive flex items-center gap-1 mt-1">
      <AlertCircle className="w-3 h-3 shrink-0" />
      {translateValidationError(error, lang)}
    </p>
  );
}

function getStepTitles(t: (v: {fr: string; en: string; ar: string}) => string) {
  return [
    { icon: User, title: t({fr: "Informations personnelles", en: "Personal Information", ar: "المعلومات الشخصية"}) },
    { icon: Globe, title: t({fr: "Localisation & Secteur", en: "Location & Sector", ar: "الموقع والقطاع"}) },
    { icon: Brain, title: t({fr: "Compétences techniques", en: "Technical Skills", ar: "المهارات التقنية"}) },
    { icon: Network, title: t({fr: "Compétences métier", en: "Business Skills", ar: "المهارات المهنية"}) },
    { icon: Network, title: t({fr: "Réseau de distribution", en: "Distribution Network", ar: "شبكة التوزيع"}) },
    { icon: Lightbulb, title: t({fr: "Profil entrepreneurial", en: "Entrepreneurial Profile", ar: "الملف الريادي"}) },
    { icon: Brain, title: t({fr: "Scénario Agent IA", en: "AI Agent Scenario", ar: "سيناريو وكيل الذكاء الاصطناعي"}) },
    { icon: MessageSquare, title: t({fr: "Communication & Motivation", en: "Communication & Motivation", ar: "التواصل والدافع"}) },
    { icon: Link2, title: t({fr: "Profil en ligne & Documents", en: "Online Profile & Documents", ar: "الملف الشخصي والوثائق"}) },
    { icon: Video, title: t({fr: "Vidéo Pitch", en: "Video Pitch", ar: "فيديو العرض"}) },
  ];
}

export default function Apply() {
  const { t } = useLanguage();
  const stepTitles = getStepTitles(t);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string>("");
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<{ id: number; success: boolean; message: string } | null>(null);
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
    { time: 0, text: t({fr: "Présentez-vous (nom, parcours)", en: "Introduce yourself (name, background)", ar: "قدّم نفسك (الاسم، المسار)"}) },
    { time: 20, text: t({fr: "Parlez de votre secteur d'expertise", en: "Talk about your area of expertise", ar: "تحدث عن مجال خبرتك"}) },
    { time: 40, text: t({fr: "Décrivez votre cas d'usage agent IA", en: "Describe your AI agent use case", ar: "صف حالة استخدام وكيل الذكاء الاصطناعي"}) },
    { time: 60, text: t({fr: "Expliquez pourquoi vous êtes le bon candidat", en: "Explain why you are the right candidate", ar: "اشرح لماذا أنت المرشح المناسب"}) },
    { time: 75, text: t({fr: "Concluez avec votre vision", en: "Conclude with your vision", ar: "اختم برؤيتك"}) },
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
      setCameraError(t({fr: "Impossible d'accéder à la caméra/micro. Vérifiez les permissions de votre navigateur.", en: "Unable to access camera/microphone. Check your browser permissions.", ar: "تعذر الوصول إلى الكاميرا/الميكروفون. تحقق من أذونات المتصفح."}));
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
          setServerError(t({fr: "Certains champs contiennent des erreurs. Veuillez vérifier et corriger.", en: "Some fields contain errors. Please check and correct.", ar: "بعض الحقول تحتوي على أخطاء. يرجى التحقق والتصحيح."}));
        } else {
          setServerError(t({fr: "Une erreur est survenue. Veuillez réessayer.", en: "An error occurred. Please try again.", ar: "حدث خطأ. يرجى المحاولة مرة أخرى."}));
        }
      } catch {
        setServerError(t({fr: "Une erreur est survenue. Veuillez réessayer.", en: "An error occurred. Please try again.", ar: "حدث خطأ. يرجى المحاولة مرة أخرى."}));
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

    // Vidéo optionnelle mais fortement recommandée
    // (pas de blocage si pas de vidéo)

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
      <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: "var(--wise-canvas-soft)" }}>
        <div className="max-w-lg w-full text-center wise-card p-8">
          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6" style={{ backgroundColor: "var(--wise-primary-pale)" }}>
            <CheckCircle className="w-10 h-10" style={{ color: "var(--wise-positive)" }} />
          </div>
          <h1 className="wise-display-md mb-4">{t({fr: "Candidature soumise !", en: "Application Submitted!", ar: "تم تقديم الطلب!"})}</h1>
          <p className="wise-body-md mb-8">{result.message}</p>
          <div className="wise-card-green p-8 mb-8">
            <div className="text-3xl font-black mb-2" style={{ color: "var(--wise-positive-deep)" }}>{t({fr: "Merci !", en: "Thank you!", ar: "شكراً!"})}</div>
            <p className="text-sm mb-4" style={{ color: "var(--wise-mute)" }}>{t({fr: "Votre candidature a bien été enregistrée", en: "Your application has been successfully registered", ar: "تم تسجيل طلبك بنجاح"})}</p>
            <p className="text-base" style={{ color: "var(--wise-body)" }}>{t({fr: "Notre équipe analysera votre profil et vous recevrez un email de confirmation avec les prochaines étapes.", en: "Our team will analyze your profile and you will receive a confirmation email with next steps.", ar: "سيقوم فريقنا بتحليل ملفك الشخصي وستتلقى بريداً إلكترونياً للتأكيد مع الخطوات التالية."})}</p>
          </div>
          <p className="wise-body-md mb-6">{t({fr: "Si votre profil est retenu, vous serez contacté sous 48h.", en: "If your profile is selected, you will be contacted within 48 hours.", ar: "إذا تم اختيار ملفك، سيتم الاتصال بك خلال 48 ساعة."})}</p>
          <Link href="/"><button className="wise-btn-secondary">{t({fr: "Retour à l'accueil", en: "Back to Home", ar: "العودة إلى الرئيسية"})}</button></Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--wise-canvas-soft)" }}>
      <nav className="sticky top-0 z-50 backdrop-blur-md" style={{ backgroundColor: "rgba(255,255,255,0.85)", borderBottom: "1px solid var(--wise-canvas-soft)" }}>
        <div className="container flex items-center justify-between h-16">
          <Link href="/"><div className="flex items-center gap-2 cursor-pointer"><img src={LOGO_URL} alt="Neopolis Akademy" className="h-8 object-contain" /></div></Link>
          <Link href="/"><button className="wise-btn-tertiary text-sm px-4 py-2 flex items-center gap-2"><ArrowLeft className="w-4 h-4" /> {t({fr: "Retour", en: "Back", ar: "رجوع"})}</button></Link>
        </div>
      </nav>

      <div className="container py-6 md:py-12 px-4 md:px-6 max-w-2xl mx-auto">
        <motion.div
          className="mb-10"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] as [number, number, number, number] }}
        >
          <div className="flex items-center gap-2 md:gap-3 mb-2">
            {stepTitles[step - 1] && (() => { const Icon = stepTitles[step - 1].icon; return <Icon className="w-4 h-4 md:w-5 md:h-5" style={{ color: "var(--wise-positive)" }} />; })()}
            <h1 className="text-xl md:text-2xl font-bold" style={{ color: "var(--wise-ink)" }}>{stepTitles[step - 1]?.title}</h1>
          </div>
          <p className="wise-body-sm">{t({fr: `Étape ${step} sur ${totalSteps}`, en: `Step ${step} of ${totalSteps}`, ar: `الخطوة ${step} من ${totalSteps}`})}</p>
          <div className="mt-4 h-2 rounded-full overflow-hidden" style={{ backgroundColor: "var(--wise-canvas-soft)" }}>
            <motion.div
              className="h-full rounded-full"
              style={{ backgroundColor: "var(--wise-primary)" }}
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] as [number, number, number, number] }}
            />
          </div>

          {/* Step indicators */}
          <div className="flex items-center gap-0.5 md:gap-1 mt-3 md:mt-4">
            {Array.from({ length: totalSteps }, (_, i) => (
              <div
                key={i}
                className="h-1 md:h-1.5 flex-1 rounded-full transition-all duration-300"
                style={{
                  backgroundColor: i < step ? "var(--wise-primary)" : i === step - 1 ? "var(--wise-positive)" : "var(--wise-canvas-soft)",
                  opacity: i < step ? 1 : 0.5,
                }}
              />
            ))}
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          {serverError && (
            <motion.div
              initial={{ opacity: 0, y: -10, height: 0 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              exit={{ opacity: 0, y: -10, height: 0 }}
              className="mb-6 p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-center gap-2"
            >
              <AlertCircle className="w-4 h-4 shrink-0" /> {serverError}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Step 1: Personal Info */}
        <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] as [number, number, number, number] }}
            className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t({fr: "Prénom", en: "First Name", ar: "الاسم الأول"})} *</Label>
                <Input value={formData.firstName} onChange={e => updateField("firstName", e.target.value)} placeholder={t({fr: "Votre prénom", en: "Your first name", ar: "اسمك الأول"})} className={errors.firstName ? "border-destructive" : ""} />
                <FieldError error={errors.firstName} />
              </div>
              <div className="space-y-2">
                <Label>{t({fr: "Nom", en: "Last Name", ar: "اسم العائلة"})} *</Label>
                <Input value={formData.lastName} onChange={e => updateField("lastName", e.target.value)} placeholder={t({fr: "Votre nom", en: "Your last name", ar: "اسم عائلتك"})} className={errors.lastName ? "border-destructive" : ""} />
                <FieldError error={errors.lastName} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>{t({fr: "Email", en: "Email", ar: "البريد الإلكتروني"})} *</Label>
              <Input type="email" value={formData.email} onChange={e => updateField("email", e.target.value)} placeholder={t({fr: "votre@email.com", en: "your@email.com", ar: "بريدك@email.com"})} className={errors.email ? "border-destructive" : ""} />
              <FieldError error={errors.email} />
            </div>
            <div className="space-y-2">
              <Label>{t({fr: "Téléphone", en: "Phone", ar: "الهاتف"})} *</Label>
              <Input value={formData.phone} onChange={e => updateField("phone", e.target.value)} placeholder="+216 XX XXX XXX" className={errors.phone ? "border-destructive" : ""} />
              <FieldError error={errors.phone} />
            </div>
          </motion.div>
        )}

        {/* Step 2: Location & Sector */}
        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] as [number, number, number, number] }}
            className="space-y-6">
            <div className="space-y-2">
              <Label>{t({fr: "Pays de résidence", en: "Country of Residence", ar: "دولة الإقامة"})} *</Label>
              <Select value={formData.country} onValueChange={v => updateField("country", v)}>
                <SelectTrigger className={errors.country ? "border-destructive" : ""}><SelectValue placeholder={t({fr: "Sélectionnez votre pays", en: "Select your country", ar: "اختر بلدك"})} /></SelectTrigger>
                <SelectContent>{africanCountriesData.map(c => <SelectItem key={c.fr} value={c.fr}>{t(c)}</SelectItem>)}</SelectContent>
              </Select>
              <FieldError error={errors.country} />
            </div>
            <div className="space-y-2">
              <Label>{t({fr: "Ville", en: "City", ar: "المدينة"})} *</Label>
              <Input value={formData.city} onChange={e => updateField("city", e.target.value)} placeholder={t({fr: "Votre ville", en: "Your city", ar: "مدينتك"})} className={errors.city ? "border-destructive" : ""} />
              <FieldError error={errors.city} />
            </div>
            <div className="space-y-2">
              <Label>{t({fr: "Secteur d'activité", en: "Industry Sector", ar: "قطاع النشاط"})} *</Label>
              <Select value={formData.sector} onValueChange={v => updateField("sector", v)}>
                <SelectTrigger className={errors.sector ? "border-destructive" : ""}><SelectValue placeholder={t({fr: "Sélectionnez votre secteur", en: "Select your sector", ar: "اختر قطاعك"})} /></SelectTrigger>
                <SelectContent>{sectorsData.map(s => <SelectItem key={s.fr} value={s.fr}>{t(s)}</SelectItem>)}</SelectContent>
              </Select>
              <FieldError error={errors.sector} />
            </div>
            <div className="space-y-2">
              <Label>{t({fr: "Poste actuel", en: "Current Role", ar: "المنصب الحالي"})} *</Label>
              <Input value={formData.currentRole} onChange={e => updateField("currentRole", e.target.value)} placeholder={t({fr: "Ex: Chef de projet, Développeur senior...", en: "E.g.: Project Manager, Senior Developer...", ar: "مثال: مدير مشروع، مطور أول..."})} className={errors.currentRole ? "border-destructive" : ""} />
              <FieldError error={errors.currentRole} />
            </div>
            <div className="space-y-2">
              <Label>{t({fr: "Années d'expérience", en: "Years of Experience", ar: "سنوات الخبرة"})} *</Label>
              <Input type="number" min="0" max="50" value={formData.yearsExperience} onChange={e => updateField("yearsExperience", e.target.value)} placeholder={t({fr: "Ex: 5", en: "E.g.: 5", ar: "مثال: 5"})} className={errors.yearsExperience ? "border-destructive" : ""} />
              <FieldError error={errors.yearsExperience} />
            </div>
          </motion.div>
        )}

        {/* Step 3: Technical Skills */}
        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] as [number, number, number, number] }}
            className="space-y-6">
            <SelectField label={t({fr: "Niveau en programmation", en: "Programming Level", ar: "مستوى البرمجة"}) + " *"} value={formData.programmingLevel} onChange={v => updateField("programmingLevel", v)} error={errors.programmingLevel}
              options={[["none",t({fr:"Aucun",en:"None",ar:"لا شيء"})],["beginner",t({fr:"Débutant",en:"Beginner",ar:"مبتدئ"})],["intermediate",t({fr:"Intermédiaire",en:"Intermediate",ar:"متوسط"})],["advanced",t({fr:"Avancé",en:"Advanced",ar:"متقدم"})],["expert",t({fr:"Expert",en:"Expert",ar:"خبير"})]]} />
            <SelectField label={t({fr: "Connaissances en IA", en: "AI Knowledge", ar: "معرفة الذكاء الاصطناعي"}) + " *"} value={formData.aiKnowledge} onChange={v => updateField("aiKnowledge", v)} error={errors.aiKnowledge}
              options={[["none",t({fr:"Aucune",en:"None",ar:"لا شيء"})],["basic",t({fr:"Basique",en:"Basic",ar:"أساسي"})],["intermediate",t({fr:"Intermédiaire",en:"Intermediate",ar:"متوسط"})],["advanced",t({fr:"Avancé",en:"Advanced",ar:"متقدم"})],["expert",t({fr:"Expert",en:"Expert",ar:"خبير"})]]} />
            <SelectField label={t({fr: "Expérience Cloud", en: "Cloud Experience", ar: "خبرة السحابة"}) + " *"} value={formData.cloudExperience} onChange={v => updateField("cloudExperience", v)} error={errors.cloudExperience}
              options={[["none",t({fr:"Aucune",en:"None",ar:"لا شيء"})],["basic",t({fr:"Basique",en:"Basic",ar:"أساسي"})],["intermediate",t({fr:"Intermédiaire",en:"Intermediate",ar:"متوسط"})],["advanced",t({fr:"Avancé",en:"Advanced",ar:"متقدم"})],["expert",t({fr:"Expert",en:"Expert",ar:"خبير"})]]} />
            <div className="space-y-2">
              <Label>{t({fr: "Outils techniques maîtrisés", en: "Technical Tools Mastered", ar: "الأدوات التقنية المتقنة"})}</Label>
              <Textarea value={formData.technicalTools} onChange={e => updateField("technicalTools", e.target.value)} placeholder={t({fr: "Ex: Python, JavaScript, AWS, Docker, LangChain...", en: "E.g.: Python, JavaScript, AWS, Docker, LangChain...", ar: "مثال: Python, JavaScript, AWS, Docker, LangChain..."})} rows={3} />
            </div>
            <div className="space-y-2">
              <Label>{t({fr: "Certifications existantes", en: "Existing Certifications", ar: "الشهادات الحالية"})}</Label>
              <Textarea value={formData.certifications} onChange={e => updateField("certifications", e.target.value)} placeholder={t({fr: "Ex: AWS Certified, Google Cloud, PMP...", en: "E.g.: AWS Certified, Google Cloud, PMP...", ar: "مثال: AWS Certified, Google Cloud, PMP..."})} rows={3} />
            </div>
          </motion.div>
        )}

        {/* Step 4: Business Skills */}
        {step === 4 && (
          <motion.div
            key="step4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] as [number, number, number, number] }}
            className="space-y-6">
            <SelectField label={t({fr: "Expertise sectorielle", en: "Sector Expertise", ar: "الخبرة القطاعية"}) + " *"} value={formData.sectorExpertise} onChange={v => updateField("sectorExpertise", v)} error={errors.sectorExpertise}
              options={[["junior",t({fr:"Junior (< 2 ans)",en:"Junior (< 2 years)",ar:"مبتدئ (أقل من سنتين)"})],["intermediate",t({fr:"Intermédiaire (2-5 ans)",en:"Intermediate (2-5 years)",ar:"متوسط (2-5 سنوات)"})],["senior",t({fr:"Senior (5-10 ans)",en:"Senior (5-10 years)",ar:"متقدم (5-10 سنوات)"})],["expert",t({fr:"Expert (10+ ans)",en:"Expert (10+ years)",ar:"خبير (10+ سنوات)"})]]} />
            <SelectField label={t({fr: "Réseau client existant", en: "Existing Client Network", ar: "شبكة العملاء الحالية"}) + " *"} value={formData.clientNetwork} onChange={v => updateField("clientNetwork", v)} error={errors.clientNetwork}
              options={[["none",t({fr:"Aucun",en:"None",ar:"لا شيء"})],["small",t({fr:"Petit (< 10 contacts)",en:"Small (< 10 contacts)",ar:"صغير (أقل من 10 جهات اتصال)"})],["medium",t({fr:"Moyen (10-50 contacts)",en:"Medium (10-50 contacts)",ar:"متوسط (10-50 جهة اتصال)"})],["large",t({fr:"Large (50+ contacts)",en:"Large (50+ contacts)",ar:"كبير (50+ جهة اتصال)"})]]} />
            <SelectField label={t({fr: "Expérience en développement commercial", en: "Business Development Experience", ar: "خبرة التطوير التجاري"}) + " *"} value={formData.businessDevelopment} onChange={v => updateField("businessDevelopment", v)} error={errors.businessDevelopment}
              options={[["none",t({fr:"Aucune",en:"None",ar:"لا شيء"})],["basic",t({fr:"Basique",en:"Basic",ar:"أساسي"})],["intermediate",t({fr:"Intermédiaire",en:"Intermediate",ar:"متوسط"})],["advanced",t({fr:"Avancé",en:"Advanced",ar:"متقدم"})]]} />
          </motion.div>
        )}

        {/* Step 5: Distribution Network (NEW) */}
        {step === 5 && (
          <motion.div
            key="step5"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] as [number, number, number, number] }}
            className="space-y-6">
            <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-200 mb-4">
              <p className="text-sm text-emerald-800 font-medium">{t({fr: "Cette section évalue votre capacité à distribuer des solutions IA auprès de PME/TPE dans votre secteur.", en: "This section evaluates your ability to distribute AI solutions to SMEs in your sector.", ar: "يقيّم هذا القسم قدرتك على توزيع حلول الذكاء الاصطناعي على الشركات الصغيرة والمتوسطة في قطاعك."})}</p>
            </div>
            <div className="space-y-2">
              <Label>{t({fr: "Décrivez votre réseau de distribution potentiel", en: "Describe your potential distribution network", ar: "صف شبكة التوزيع المحتملة"})}</Label>
              <Textarea value={formData.distributionNetwork} onChange={e => updateField("distributionNetwork", e.target.value)}
                placeholder={t({fr: "Décrivez vos contacts B2B, partenaires potentiels, canaux de distribution...", en: "Describe your B2B contacts, potential partners, distribution channels...", ar: "صف جهات اتصالك B2B، الشركاء المحتملين، قنوات التوزيع..."})} rows={5} className={errors.distributionNetwork ? "border-destructive" : ""} />
              <FieldError error={errors.distributionNetwork} />
            </div>
            <SelectField label={t({fr: "Niveau de contacts dans l'industrie", en: "Industry Contact Level", ar: "مستوى الاتصالات في الصناعة"}) + " *"} value={formData.industryContacts} onChange={v => updateField("industryContacts", v)} error={errors.industryContacts}
              options={[["none",t({fr:"Aucun contact",en:"No contacts",ar:"لا جهات اتصال"})],["few",t({fr:"Quelques contacts (< 5)",en:"Few contacts (< 5)",ar:"بعض الجهات (أقل من 5)"})],["moderate",t({fr:"Contacts modérés (5-20)",en:"Moderate contacts (5-20)",ar:"جهات متوسطة (5-20)"})],["extensive",t({fr:"Réseau étendu (20-100)",en:"Extensive network (20-100)",ar:"شبكة واسعة (20-100)"})],["very_extensive",t({fr:"Très étendu (100+)",en:"Very extensive (100+)",ar:"شبكة كبيرة جداً (100+)"})]]} />
            <div className="space-y-2">
              <Label>{t({fr: "Partenariats existants", en: "Existing Partnerships", ar: "الشراكات الحالية"})}</Label>
              <Textarea value={formData.existingPartnerships} onChange={e => updateField("existingPartnerships", e.target.value)}
                placeholder={t({fr: "Listez vos partenariats professionnels actuels...", en: "List your current professional partnerships...", ar: "اذكر شراكاتك المهنية الحالية..."})} rows={4} className={errors.existingPartnerships ? "border-destructive" : ""} />
              <FieldError error={errors.existingPartnerships} />
            </div>
            <SelectField label={t({fr: "Connaissance du marché cible", en: "Target Market Knowledge", ar: "معرفة السوق المستهدف"}) + " *"} value={formData.targetMarketKnowledge} onChange={v => updateField("targetMarketKnowledge", v)} error={errors.targetMarketKnowledge}
              options={[["none",t({fr:"Aucune",en:"None",ar:"لا شيء"})],["basic",t({fr:"Basique",en:"Basic",ar:"أساسي"})],["good",t({fr:"Bonne",en:"Good",ar:"جيدة"})],["excellent",t({fr:"Excellente",en:"Excellent",ar:"ممتازة"})],["expert",t({fr:"Expert du marché",en:"Market Expert",ar:"خبير السوق"})]]} />
          </motion.div>
        )}

        {/* Step 6: Entrepreneurial Psychology (NEW) */}
        {step === 6 && (
          <motion.div
            key="step6"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] as [number, number, number, number] }}
            className="space-y-6">
            <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-200 mb-4">
              <p className="text-sm text-emerald-800 font-medium">{t({fr: "Cette section évalue votre profil psychologique d'entrepreneur. Soyez honnête, il n'y a pas de mauvaise réponse.", en: "This section evaluates your entrepreneurial psychological profile. Be honest, there are no wrong answers.", ar: "يقيّم هذا القسم ملفك النفسي الريادي. كن صادقاً، لا توجد إجابات خاطئة."})}</p>
            </div>
            <SelectField label={t({fr: "Tolérance au risque", en: "Risk Tolerance", ar: "تحمل المخاطر"}) + " *"} value={formData.riskTolerance} onChange={v => updateField("riskTolerance", v)} error={errors.riskTolerance}
              options={[["very_low",t({fr:"Très faible - J'évite tout risque",en:"Very low - I avoid all risk",ar:"منخفض جداً - أتجنب كل مخاطرة"})],["low",t({fr:"Faible - Je préfère la sécurité",en:"Low - I prefer safety",ar:"منخفض - أفضل الأمان"})],["moderate",t({fr:"Modérée - Risques calculés",en:"Moderate - Calculated risks",ar:"معتدل - مخاطر محسوبة"})],["high",t({fr:"Élevée - J'accepte les risques importants",en:"High - I accept significant risks",ar:"عالي - أقبل المخاطر الكبيرة"})],["very_high",t({fr:"Très élevée - Je recherche le risque",en:"Very high - I seek risk",ar:"عالي جداً - أبحث عن المخاطرة"})]]} />
            <SelectField label={t({fr: "Niveau d'autonomie", en: "Autonomy Level", ar: "مستوى الاستقلالية"}) + " *"} value={formData.autonomyLevel} onChange={v => updateField("autonomyLevel", v)} error={errors.autonomyLevel}
              options={[["needs_guidance",t({fr:"Besoin d'accompagnement constant",en:"Needs constant guidance",ar:"يحتاج إرشاد مستمر"})],["somewhat_autonomous",t({fr:"Relativement autonome",en:"Somewhat autonomous",ar:"مستقل نسبياً"})],["autonomous",t({fr:"Autonome",en:"Autonomous",ar:"مستقل"})],["very_autonomous",t({fr:"Très autonome",en:"Very autonomous",ar:"مستقل جداً"})],["fully_independent",t({fr:"Totalement indépendant",en:"Fully independent",ar:"مستقل تماماً"})]]} />
            <SelectField label={t({fr: "Résilience face aux échecs", en: "Resilience to Failure", ar: "المرونة أمام الفشل"}) + " *"} value={formData.resilienceLevel} onChange={v => updateField("resilienceLevel", v)} error={errors.resilienceLevel}
              options={[["low",t({fr:"Faible - Les échecs me découragent",en:"Low - Failures discourage me",ar:"منخفض - الفشل يثبطني"})],["moderate",t({fr:"Modérée - Je me relève après un temps",en:"Moderate - I recover after some time",ar:"معتدل - أتعافى بعد فترة"})],["high",t({fr:"Élevée - Je rebondis rapidement",en:"High - I bounce back quickly",ar:"عالي - أنهض بسرعة"})],["very_high",t({fr:"Très élevée - Les échecs me motivent",en:"Very high - Failures motivate me",ar:"عالي جداً - الفشل يحفزني"})]]} />
            <SelectField label={t({fr: "Style de leadership", en: "Leadership Style", ar: "أسلوب القيادة"}) + " *"} value={formData.leadershipStyle} onChange={v => updateField("leadershipStyle", v)} error={errors.leadershipStyle}
              options={[["follower",t({fr:"Suiveur - Je préfère exécuter",en:"Follower - I prefer to execute",ar:"تابع - أفضل التنفيذ"})],["collaborative",t({fr:"Collaboratif - Je travaille en équipe",en:"Collaborative - I work in teams",ar:"تعاوني - أعمل في فريق"})],["situational",t({fr:"Situationnel - Je m'adapte",en:"Situational - I adapt",ar:"ظرفي - أتكيف"})],["visionary",t({fr:"Visionnaire - J'inspire les autres",en:"Visionary - I inspire others",ar:"رؤيوي - ألهم الآخرين"})],["transformational",t({fr:"Transformationnel - Je change les choses",en:"Transformational - I change things",ar:"تحويلي - أغير الأشياء"})]]} />
            <div className="space-y-2">
              <Label>{t({fr: "Expériences entrepreneuriales passées", en: "Past Entrepreneurial Experiences", ar: "التجارب الريادية السابقة"})}</Label>
              <Textarea value={formData.entrepreneurialExperience} onChange={e => updateField("entrepreneurialExperience", e.target.value)}
                placeholder={t({fr: "Décrivez vos expériences entrepreneuriales : création d'entreprise, projets personnels, freelance...", en: "Describe your entrepreneurial experiences: business creation, personal projects, freelance...", ar: "صف تجاربك الريادية: إنشاء شركة، مشاريع شخصية، عمل حر..."})} rows={5} className={errors.entrepreneurialExperience ? "border-destructive" : ""} />
              <FieldError error={errors.entrepreneurialExperience} />
            </div>
          </motion.div>
        )}

        {/* Step 7: AI Agent Scenario (NEW) */}
        {step === 7 && (
          <motion.div
            key="step7"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] as [number, number, number, number] }}
            className="space-y-6">
            <div className="p-4 rounded-lg bg-primary/5 border border-primary/20 mb-4">
              <p className="text-sm text-primary font-medium">{t({fr: "Décrivez un scénario concret où un agent IA pourrait remplacer un humain dans un processus métier que vous maîtrisez. C'est le cœur de votre candidature.", en: "Describe a concrete scenario where an AI agent could replace a human in a business process you master. This is the core of your application.", ar: "صف سيناريو ملموس حيث يمكن لوكيل ذكاء اصطناعي أن يحل محل إنسان في عملية تجارية تتقنها. هذا هو جوهر ترشيحك."})}</p>
            </div>
            <div className="space-y-2">
              <Label>{t({fr: "Secteur cible du scénario", en: "Target Sector for Scenario", ar: "القطاع المستهدف للسيناريو"})} *</Label>
              <Input value={formData.aiAgentSector} onChange={e => updateField("aiAgentSector", e.target.value)}
                placeholder={t({fr: "Ex: Comptabilité PME, Service client e-commerce, Gestion immobilière...", en: "E.g.: SME Accounting, E-commerce Customer Service, Real Estate Management...", ar: "مثال: محاسبة الشركات الصغيرة، خدمة عملاء التجارة الإلكترونية..."})} className={errors.aiAgentSector ? "border-destructive" : ""} />
              <FieldError error={errors.aiAgentSector} />
            </div>
            <div className="space-y-2">
              <Label>{t({fr: "Scénario concret", en: "Concrete Scenario", ar: "السيناريو الملموس"})} * <span className="text-muted-foreground">(min. 100 {t({fr: "caractères", en: "characters", ar: "حرف"})})</span></Label>
              <Textarea value={formData.aiAgentScenario} onChange={e => updateField("aiAgentScenario", e.target.value)}
                placeholder={t({fr: "Décrivez en détail un cas d'usage concret : Quel processus métier ? Quel humain est remplacé ? Quelles tâches l'agent IA effectue-t-il ?", en: "Describe in detail a concrete use case: What business process? What human is replaced? What tasks does the AI agent perform?", ar: "صف بالتفصيل حالة استخدام ملموسة: ما هي العملية التجارية؟ من يتم استبداله؟ ما المهام التي يؤديها الوكيل؟"})} rows={8} className={errors.aiAgentScenario ? "border-destructive" : ""} />
              <div className="flex justify-between">
                <FieldError error={errors.aiAgentScenario} />
                <span className="text-xs text-muted-foreground">{formData.aiAgentScenario.length}/5000</span>
              </div>
            </div>
            <div className="space-y-2">
              <Label>{t({fr: "Impact attendu et potentiel de distribution", en: "Expected Impact and Distribution Potential", ar: "التأثير المتوقع وإمكانية التوزيع"})} * <span className="text-muted-foreground">(min. 50 {t({fr: "caractères", en: "characters", ar: "حرف"})})</span></Label>
              <Textarea value={formData.aiAgentImpact} onChange={e => updateField("aiAgentImpact", e.target.value)}
                placeholder={t({fr: "Quel impact concret pour les PME/TPE ? Combien d'entreprises pourraient être ciblées ?", en: "What concrete impact for SMEs? How many businesses could be targeted?", ar: "ما التأثير الملموس على الشركات الصغيرة؟ كم عدد الشركات المستهدفة؟"})} rows={5} className={errors.aiAgentImpact ? "border-destructive" : ""} />
              <div className="flex justify-between">
                <FieldError error={errors.aiAgentImpact} />
                <span className="text-xs text-muted-foreground">{formData.aiAgentImpact.length}/3000</span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Step 8: Communication & Motivation */}
        {step === 8 && (
          <motion.div
            key="step8"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] as [number, number, number, number] }}
            className="space-y-6">
            <div className="space-y-2">
              <Label>{t({fr: "Langues parlées", en: "Languages Spoken", ar: "اللغات المتحدثة"})}</Label>
              <Input value={formData.languages} onChange={e => updateField("languages", e.target.value)} placeholder={t({fr: "Ex: Français (natif), Anglais (courant), Arabe (intermédiaire)", en: "E.g.: French (native), English (fluent), Arabic (intermediate)", ar: "مثال: العربية (أم،), الفرنسية (طليق), الإنجليزية (متوسط)"})} />
            </div>
            <SelectField label={t({fr: "Aisance en prise de parole publique", en: "Public Speaking Comfort", ar: "الراحة في التحدث العام"}) + " *"} value={formData.publicSpeaking} onChange={v => updateField("publicSpeaking", v)} error={errors.publicSpeaking}
              options={[["none",t({fr:"Aucune expérience",en:"No experience",ar:"لا خبرة"})],["basic",t({fr:"Basique (petits groupes)",en:"Basic (small groups)",ar:"أساسي (مجموعات صغيرة)"})],["intermediate",t({fr:"Intermédiaire (conférences)",en:"Intermediate (conferences)",ar:"متوسط (مؤتمرات)"})],["advanced",t({fr:"Avancé (keynotes, médias)",en:"Advanced (keynotes, media)",ar:"متقدم (كلمات رئيسية، إعلام)"})]]} />
            <SelectField label={t({fr: "Expérience en vente", en: "Sales Experience", ar: "خبرة المبيعات"}) + " *"} value={formData.salesExperience} onChange={v => updateField("salesExperience", v)} error={errors.salesExperience}
              options={[["none",t({fr:"Aucune",en:"None",ar:"لا شيء"})],["less_1y",t({fr:"Moins d'1 an",en:"Less than 1 year",ar:"أقل من سنة"})],["1_3y",t({fr:"1 à 3 ans",en:"1 to 3 years",ar:"1 إلى 3 سنوات"})],["3_5y",t({fr:"3 à 5 ans",en:"3 to 5 years",ar:"3 إلى 5 سنوات"})],["more_5y",t({fr:"Plus de 5 ans",en:"More than 5 years",ar:"أكثر من 5 سنوات"})]]} />
            <div className="space-y-2">
              <Label>{t({fr: "Lettre de motivation", en: "Cover Letter", ar: "رسالة التحفيز"})} * <span className="text-muted-foreground">(min. 50 {t({fr: "caractères", en: "characters", ar: "حرف"})})</span></Label>
              <Textarea value={formData.motivation} onChange={e => updateField("motivation", e.target.value)}
                placeholder={t({fr: "Expliquez pourquoi vous souhaitez devenir AI Solutions Partner...", en: "Explain why you want to become an AI Solutions Partner...", ar: "اشرح لماذا تريد أن تصبح شريك حلول الذكاء الاصطناعي..."})} rows={6} className={errors.motivation ? "border-destructive" : ""} />
              <div className="flex justify-between">
                <FieldError error={errors.motivation} />
                <span className="text-xs text-muted-foreground">{formData.motivation.length}/5000</span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Step 9: Social Links & Files (NEW) */}
        {step === 9 && (
          <motion.div
            key="step9"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] as [number, number, number, number] }}
            className="space-y-6">
            <div className="p-4 rounded-lg bg-primary/5 border border-primary/20 mb-4">
              <p className="text-sm text-primary font-medium">{t({fr: "Partagez vos profils en ligne et documents pour compléter votre candidature.", en: "Share your online profiles and documents to complete your application.", ar: "شارك ملفاتك الشخصية عبر الإنترنت والوثائق لإكمال ترشيحك."})}</p>
            </div>
            <div className="space-y-2">
              <Label>LinkedIn</Label>
              <Input value={formData.linkedinUrl} onChange={e => updateField("linkedinUrl", e.target.value)} placeholder="https://linkedin.com/in/your-profile" />
            </div>
            <div className="space-y-2">
              <Label>Twitter / X</Label>
              <Input value={formData.twitterUrl} onChange={e => updateField("twitterUrl", e.target.value)} placeholder="https://x.com/your-profile" />
            </div>
            <div className="space-y-2">
              <Label>GitHub</Label>
              <Input value={formData.githubUrl} onChange={e => updateField("githubUrl", e.target.value)} placeholder="https://github.com/your-profile" />
            </div>
            <div className="space-y-2">
              <Label>{t({fr: "Site web personnel", en: "Personal Website", ar: "الموقع الشخصي"})}</Label>
              <Input value={formData.websiteUrl} onChange={e => updateField("websiteUrl", e.target.value)} placeholder="https://your-site.com" />
            </div>
            <div className="space-y-2">
              <Label>{t({fr: "Autre réseau social", en: "Other Social Network", ar: "شبكة اجتماعية أخرى"})}</Label>
              <Input value={formData.otherSocialUrl} onChange={e => updateField("otherSocialUrl", e.target.value)} placeholder="https://..." />
            </div>

            {/* File uploads */}
            <div className="border-t pt-6 mt-6" style={{ borderColor: "var(--wise-canvas-soft)" }}>
              <h3 className="heading-md text-foreground mb-4">{t({fr: "Documents", en: "Documents", ar: "الوثائق"})}</h3>
              <p className="text-sm text-muted-foreground mb-4">{t({fr: "Ajoutez votre CV et une photo de profil pour compléter votre dossier de candidature.", en: "Add your CV and a profile photo to complete your application.", ar: "أضف سيرتك الذاتية وصورة شخصية لإكمال ملف ترشيحك."})}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="font-semibold">{t({fr: "CV (PDF, DOC, DOCX)", en: "Resume (PDF, DOC, DOCX)", ar: "السيرة الذاتية (PDF, DOC, DOCX)"})} <span className="text-xs text-muted-foreground font-normal">— max 10 {t({fr: "Mo", en: "MB", ar: "ميغابايت"})}</span></Label>
                  <input ref={cvInputRef} type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={e => { if (e.target.files?.[0]) setCvFile(e.target.files[0]); }} />
                  <div
                    className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-200 hover:border-primary/50 hover:bg-primary/5 ${cvFile ? 'border-primary/40 bg-primary/5' : ''}`}
                    style={{ borderColor: cvFile ? undefined : "var(--wise-canvas-soft)" }}
                    onClick={() => cvInputRef.current?.click()}
                  >
                    {cvFile ? (
                      <div className="space-y-2">
                        <div className="w-12 h-12 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                          <CheckCircle className="w-6 h-6 text-primary" />
                        </div>
                        <p className="text-sm text-primary font-semibold">{cvFile.name}</p>
                        <p className="text-xs text-muted-foreground">{(cvFile.size / 1024 / 1024).toFixed(2)} Mo</p>
                        <p className="text-xs text-primary/70 underline">{t({fr: "Changer le fichier", en: "Change file", ar: "تغيير الملف"})}</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Upload className="w-10 h-10 mx-auto text-muted-foreground/60" />
                        <p className="text-sm font-medium text-foreground">{t({fr: "Cliquez pour uploader votre CV", en: "Click to upload your resume", ar: "انقر لتحميل سيرتك الذاتية"})}</p>
                        <p className="text-xs text-muted-foreground">PDF, DOC {t({fr: "ou", en: "or", ar: "أو"})} DOCX</p>
                      </div>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="font-semibold">{t({fr: "Photo de profil (JPG, PNG)", en: "Profile Photo (JPG, PNG)", ar: "صورة الملف الشخصي (JPG, PNG)"})} <span className="text-xs text-muted-foreground font-normal">— max 5 {t({fr: "Mo", en: "MB", ar: "ميغابايت"})}</span></Label>
                  <input ref={photoInputRef} type="file" accept=".jpg,.jpeg,.png,.webp" className="hidden" onChange={e => { if (e.target.files?.[0]) setPhotoFile(e.target.files[0]); }} />
                  <div
                    className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-200 hover:border-primary/50 hover:bg-primary/5 ${photoFile ? 'border-primary/40 bg-primary/5' : ''}`}
                    style={{ borderColor: photoFile ? undefined : "var(--wise-canvas-soft)" }}
                    onClick={() => photoInputRef.current?.click()}
                  >
                    {photoFile ? (
                      <div className="space-y-2">
                        <div className="w-16 h-16 mx-auto rounded-full overflow-hidden border-2 border-primary/30">
                          <img src={URL.createObjectURL(photoFile)} alt="Aperçu" className="w-full h-full object-cover" />
                        </div>
                        <p className="text-sm text-primary font-semibold">{photoFile.name}</p>
                        <p className="text-xs text-muted-foreground">{(photoFile.size / 1024 / 1024).toFixed(2)} Mo</p>
                        <p className="text-xs text-primary/70 underline">{t({fr: "Changer la photo", en: "Change photo", ar: "تغيير الصورة"})}</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="w-16 h-16 mx-auto rounded-full bg-muted/30 flex items-center justify-center">
                          <User className="w-8 h-8 text-muted-foreground/60" />
                        </div>
                        <p className="text-sm font-medium text-foreground">{t({fr: "Cliquez pour uploader votre photo", en: "Click to upload your photo", ar: "انقر لتحميل صورتك"})}</p>
                        <p className="text-xs text-muted-foreground">JPG, PNG {t({fr: "ou", en: "or", ar: "أو"})} WebP</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Step 10: Video Pitch */}
        {step === 10 && (
          <motion.div
            key="step10"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] as [number, number, number, number] }}
            className="space-y-6">
            <div className="p-4 rounded-lg bg-primary/5 border border-primary/20 mb-4">
              <p className="text-sm text-primary font-medium">{t({fr: "Enregistrez une courte vidéo (90 secondes max) pour vous présenter et nous convaincre de vous sélectionner. Un compte à rebours de 3 secondes vous laissera le temps de vous préparer.", en: "Record a short video (90 seconds max) to introduce yourself and convince us to select you. A 3-second countdown will give you time to prepare.", ar: "سجل فيديو قصير (90 ثانية كحد أقصى) لتقديم نفسك وإقناعنا باختيارك. عد تنازلي من 3 ثوانٍ سيمنحك وقتاً للاستعداد."})}</p>
            </div>

            {/* Video preview area */}
            <div className="relative rounded-xl overflow-hidden bg-gray-900 aspect-video shadow-lg max-h-[50vh]">
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
                  <p className="text-base md:text-lg font-medium text-white">{t({fr: "Prêt à enregistrer votre pitch", en: "Ready to record your pitch", ar: "مستعد لتسجيل عرضك"})}</p>
                  <p className="text-xs md:text-sm text-white/50 mt-1">{t({fr: "Endroit calme et bien éclairé", en: "Quiet and well-lit place", ar: "مكان هادئ ومضاء جيداً"})}</p>
                </div>
              )}

              {/* Countdown overlay */}
              {countdown > 0 && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/70 z-10">
                  <div className="text-center">
                    <div className="text-7xl font-bold text-white animate-pulse">{countdown}</div>
                    <p className="text-white/70 mt-2 text-lg">{t({fr: "Préparez-vous...", en: "Get ready...", ar: "استعد..."})}</p>
                  </div>
                </div>
              )}

              {/* Recording overlay - timer + prompt */}
              {isRecording && (
                <>
                  {/* Timer badge */}
                  <div className="absolute top-2 right-2 md:top-4 md:right-4 flex items-center gap-1.5 md:gap-2 bg-red-600 text-white px-2 md:px-3 py-1 md:py-1.5 rounded-full text-xs md:text-sm font-medium shadow-lg">
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
                  <div className="absolute bottom-6 left-2 right-2 md:left-4 md:right-4">
                    <div className="bg-black/60 backdrop-blur-sm rounded-lg px-2 md:px-4 py-1.5 md:py-2 text-center">
                      <p className="text-white text-xs md:text-sm font-medium">💡 {getCurrentPrompt()}</p>
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
                    <Mic className="w-3.5 h-3.5" /> {t({fr: "Niveau audio", en: "Audio level", ar: "مستوى الصوت"})}
                  </span>
                  <span className={`text-xs font-medium ${audioLevel > 0.1 ? 'text-green-600' : 'text-amber-500'}`}>
                    {audioLevel > 0.1 ? t({fr: '✓ Audio détecté', en: '✓ Audio detected', ar: '✓ تم الكشف عن الصوت'}) : t({fr: '⚠ Parlez plus fort', en: '⚠ Speak louder', ar: '⚠ تحدث بصوت أعلى'})}
                  </span>
                </div>
                <div className="h-3 bg-gray-100 rounded-full overflow-hidden border border-gray-200">
                  <div
                    className={`h-full rounded-full transition-all duration-100 ${audioLevel > 0.6 ? 'bg-red-400' : audioLevel > 0.3 ? 'bg-green-400' : audioLevel > 0.1 ? 'bg-green-300' : 'bg-amber-300'}`}
                    style={{ width: `${Math.max(audioLevel * 100, 2)}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-muted-foreground">
                  <span>{t({fr: "Faible", en: "Low", ar: "ضعيف"})}</span>
                  <span>{t({fr: "Optimal", en: "Optimal", ar: "مثالي"})}</span>
                  <span>{t({fr: "Fort", en: "Loud", ar: "قوي"})}</span>
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
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              {!isRecording && !recordedBlob && countdown === 0 && (
                <Button onClick={startRecording} className="btn-pill bg-red-600 hover:bg-red-700 text-white px-4 md:px-6 py-2.5 md:py-3 text-sm md:text-base w-full sm:w-auto">
                  <Circle className="w-4 h-4 md:w-5 md:h-5 mr-2 fill-white" /> {t({fr: "Démarrer l'enregistrement", en: "Start Recording", ar: "بدء التسجيل"})}
                </Button>
              )}
              {isRecording && (
                <Button onClick={stopRecording} className="btn-pill bg-gray-800 hover:bg-gray-900 text-white px-4 md:px-6 py-2.5 md:py-3 text-sm md:text-base w-full sm:w-auto">
                  <Square className="w-4 h-4 md:w-5 md:h-5 mr-2 fill-white" /> {t({fr: "Arrêter", en: "Stop", ar: "إيقاف"})}
                </Button>
              )}
              {!isRecording && recordedBlob && (
                <div className="flex flex-col items-center gap-2 w-full">
                  <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
                    <Button variant="outline" onClick={resetRecording} className="btn-pill w-full sm:w-auto">
                      {t({fr: "Recommencer", en: "Restart", ar: "إعادة"})}
                    </Button>
                    <div className="text-xs md:text-sm text-green-600 font-medium flex items-center gap-1 bg-green-50 px-3 py-1.5 rounded-full">
                      <CheckCircle className="w-3.5 h-3.5 md:w-4 md:h-4" /> {t({fr: "Vidéo", en: "Video", ar: "فيديو"})} ({Math.round(recordedBlob.size / 1024 / 1024 * 10) / 10} {t({fr: "Mo", en: "MB", ar: "ميغابايت"})})
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground text-center">{t({fr: "Relisez votre vidéo ci-dessus avant de soumettre", en: "Review your video above before submitting", ar: "راجع الفيديو أعلاه قبل الإرسال"})}</p>
                </div>
              )}
            </div>

            {/* Structured tips */}
            {!isRecording && !recordedBlob && (
              <div className="p-4 rounded-xl bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/10">
                <p className="font-semibold text-foreground mb-3 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs">?</span>
                  {t({fr: "Guide de votre pitch (90 secondes)", en: "Pitch Guide (90 seconds)", ar: "دليل العرض (90 ثانية)"})}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="flex items-start gap-2 p-2 rounded-lg bg-white/60">
                    <span className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-primary text-[10px] font-bold shrink-0 mt-0.5">1</span>
                    <div><p className="text-xs font-medium text-foreground">{t({fr: "0-20s : Présentation", en: "0-20s: Introduction", ar: "0-20ث: التقديم"})}</p><p className="text-[11px] text-muted-foreground">{t({fr: "Nom, parcours, secteur", en: "Name, background, sector", ar: "الاسم، المسار، القطاع"})}</p></div>
                  </div>
                  <div className="flex items-start gap-2 p-2 rounded-lg bg-white/60">
                    <span className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-primary text-[10px] font-bold shrink-0 mt-0.5">2</span>
                    <div><p className="text-xs font-medium text-foreground">{t({fr: "20-40s : Expertise", en: "20-40s: Expertise", ar: "20-40ث: الخبرة"})}</p><p className="text-[11px] text-muted-foreground">{t({fr: "Votre secteur et réseau", en: "Your sector and network", ar: "قطاعك وشبكتك"})}</p></div>
                  </div>
                  <div className="flex items-start gap-2 p-2 rounded-lg bg-white/60">
                    <span className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-primary text-[10px] font-bold shrink-0 mt-0.5">3</span>
                    <div><p className="text-xs font-medium text-foreground">{t({fr: "40-60s : Cas d'usage IA", en: "40-60s: AI Use Case", ar: "40-60ث: حالة استخدام الذكاء الاصطناعي"})}</p><p className="text-[11px] text-muted-foreground">{t({fr: "Scénario concret d'agent IA", en: "Concrete AI agent scenario", ar: "سيناريو ملموس لوكيل ذكاء اصطناعي"})}</p></div>
                  </div>
                  <div className="flex items-start gap-2 p-2 rounded-lg bg-white/60">
                    <span className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-primary text-[10px] font-bold shrink-0 mt-0.5">4</span>
                    <div><p className="text-xs font-medium text-foreground">{t({fr: "60-90s : Conclusion", en: "60-90s: Conclusion", ar: "60-90ث: الخاتمة"})}</p><p className="text-[11px] text-muted-foreground">{t({fr: "Pourquoi vous, votre vision", en: "Why you, your vision", ar: "لماذا أنت، رؤيتك"})}</p></div>
                  </div>
                </div>
              </div>
            )}

            <p className="text-xs text-muted-foreground text-center">{t({fr: "Cette étape est optionnelle mais fortement recommandée. Les candidats avec vidéo sont prioritaires dans la sélection.", en: "This step is optional but highly recommended. Candidates with video are prioritized in selection.", ar: "هذه الخطوة اختيارية ولكن ينصح بها بشدة. المرشحون الذين لديهم فيديو لهم الأولوية في الاختيار."})}</p>
          </motion.div>
        )}
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex justify-between items-center mt-6 md:mt-10 pt-4 md:pt-6 gap-3" style={{ borderTop: "1px solid var(--wise-canvas-soft)" }}>
          {step > 1 ? (
            <button onClick={handleBack} className="wise-btn-tertiary flex items-center gap-1 md:gap-2 text-sm md:text-base px-3 md:px-4 py-2 md:py-3">
              <ArrowLeft className="w-3.5 h-3.5 md:w-4 md:h-4" /> {t({fr: "Précédent", en: "Previous", ar: "السابق"})}
            </button>
          ) : <div />}

          {step < totalSteps ? (
            <button onClick={handleNext} className="wise-btn-primary flex items-center gap-1 md:gap-2 text-sm md:text-base px-4 md:px-6 py-2 md:py-3">
              {t({fr: "Suivant", en: "Next", ar: "التالي"})} <ArrowRight className="w-3.5 h-3.5 md:w-4 md:h-4" />
            </button>
          ) : (
            <button onClick={handleSubmit} disabled={submitMutation.isPending || uploading} className="wise-btn-primary flex items-center gap-1 md:gap-2 text-xs md:text-base px-3 md:px-6 py-2 md:py-3" style={{ opacity: (submitMutation.isPending || uploading) ? 0.6 : 1 }}>
              {(submitMutation.isPending || uploading) ? <><Loader2 className="w-4 h-4 animate-spin" /> {t({fr: "Envoi...", en: "Sending...", ar: "إرسال..."})}</> : <>{t({fr: "Soumettre ma candidature", en: "Submit my application", ar: "تقديم ترشيحي"})} <CheckCircle className="w-4 h-4" /></>}
            </button>
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
  const { t } = useLanguage();
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className={error ? "border-destructive" : ""}><SelectValue placeholder={t({fr: "Sélectionnez...", en: "Select...", ar: "اختر..."})} /></SelectTrigger>
        <SelectContent>{options.map(([val, label]) => <SelectItem key={val} value={val}>{label}</SelectItem>)}</SelectContent>
      </Select>
      <FieldError error={error} />
    </div>
  );
}
