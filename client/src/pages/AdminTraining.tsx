import { useState } from "react";
import { Link } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  ArrowLeft, Users, BookOpen, Award, GraduationCap, Search,
  ChevronLeft, ChevronRight, Loader2, Shield, LogIn, Eye,
} from "lucide-react";
import { motion } from "framer-motion";
import trainingIndex from "@/data/trainingIndex.json";

const LOGO_URL = "/manus-storage/logo_neopolis_akademy_9c9a0823.png";

/* ─── Animation ─── */
const fadeIn = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.23, 1, 0.32, 1] as const } },
};

export default function AdminTraining() {
  const { user, loading, isAuthenticated } = useAuth();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const pageSize = 15;

  const statsQuery = trpc.admin.getStats.useQuery(undefined, {
    enabled: isAuthenticated && user?.role === "admin",
  });

  const learnersQuery = trpc.admin.getLearners.useQuery(
    { page, pageSize, search: search || undefined },
    { enabled: isAuthenticated && user?.role === "admin" }
  );

  const detailQuery = trpc.admin.getLearnerDetail.useQuery(
    { userId: selectedUserId! },
    { enabled: !!selectedUserId && isAuthenticated && user?.role === "admin" }
  );

  // Auth gates
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="text-center bg-card rounded-2xl border border-border p-10 shadow-sm max-w-md">
          <LogIn className="w-12 h-12 text-primary mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-foreground mb-3">Accès restreint</h1>
          <p className="text-muted-foreground mb-6">Vous devez être connecté en tant qu'administrateur.</p>
          <a href={getLoginUrl()}>
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">Se connecter</Button>
          </a>
        </div>
      </div>
    );
  }

  if (user?.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="text-center bg-card rounded-2xl border border-border p-10 shadow-sm max-w-md">
          <Shield className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-foreground mb-3">Accès refusé</h1>
          <p className="text-muted-foreground mb-6">Cette page est réservée aux administrateurs.</p>
          <Link href="/">
            <Button variant="outline">Retour à l'accueil</Button>
          </Link>
        </div>
      </div>
    );
  }

  const stats = statsQuery.data;
  const learners = learnersQuery.data;
  const totalPages = learners ? Math.ceil(learners.total / pageSize) : 0;

  const handleSearch = () => {
    setSearch(searchInput);
    setPage(1);
  };

  // Detail view for a specific learner
  if (selectedUserId && detailQuery.data) {
    const detail = detailQuery.data;
    const selectedLearner = learners?.users.find((u: any) => u.id === selectedUserId);

    // Group progress by certification
    const progressByCert: Record<string, { courseId: string; lessonIndex: number }[]> = {};
    for (const p of detail.progress) {
      if (!progressByCert[p.certificationId]) progressByCert[p.certificationId] = [];
      progressByCert[p.certificationId].push({ courseId: p.courseId, lessonIndex: p.lessonIndex });
    }

    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="max-w-6xl mx-auto px-6 py-8">
          <Button variant="outline" size="sm" onClick={() => setSelectedUserId(null)} className="mb-6 gap-1.5">
            <ChevronLeft className="w-4 h-4" /> Retour à la liste
          </Button>

          <motion.div initial="hidden" animate="visible" variants={fadeIn}>
            <div className="bg-card rounded-2xl border border-border p-6 mb-6 shadow-sm">
              <h2 className="text-xl font-bold text-foreground mb-1">
                {selectedLearner?.name || "Apprenant"}
              </h2>
              <p className="text-sm text-muted-foreground">{selectedLearner?.email || "—"}</p>
            </div>

            {/* Progress by certification */}
            <div className="bg-card rounded-2xl border border-border p-6 mb-6 shadow-sm">
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-primary" /> Progression par certification
              </h3>
              {Object.keys(progressByCert).length === 0 ? (
                <p className="text-sm text-muted-foreground italic">Aucune progression enregistrée.</p>
              ) : (
                <div className="space-y-4">
                  {Object.entries(progressByCert).map(([certId, items]) => {
                    const cert = trainingIndex.certifications.find((c) => c.id === certId);
                    const certCourses = trainingIndex.courses.filter((c) => c.certId === certId);
                    const uniqueCourses = new Set(items.map((i) => i.courseId));
                    return (
                      <div key={certId} className="border border-border rounded-xl p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-sm text-foreground">
                            {cert?.title?.fr || cert?.title?.en || certId}
                          </span>
                          <span className="text-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary font-medium">
                            {items.length} leçons terminées
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {uniqueCourses.size}/{certCourses.length} cours entamés
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Exam attempts */}
            <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <Award className="w-5 h-5 text-primary" /> Tentatives d'examen
              </h3>
              {detail.attempts.length === 0 ? (
                <p className="text-sm text-muted-foreground italic">Aucune tentative d'examen.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Certification</TableHead>
                      <TableHead>Score</TableHead>
                      <TableHead>Résultat</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {detail.attempts.map((attempt: any, idx: number) => {
                      const cert = trainingIndex.certifications.find((c) => c.id === attempt.certificationId);
                      return (
                        <TableRow key={idx}>
                          <TableCell className="font-medium text-sm">
                            {cert?.title?.fr || cert?.title?.en || attempt.certificationId}
                          </TableCell>
                          <TableCell>
                            <span className={`font-bold ${attempt.passed ? "text-emerald-600" : "text-red-500"}`}>
                              {attempt.score}/1000
                            </span>
                          </TableCell>
                          <TableCell>
                            {attempt.passed ? (
                              <span className="text-xs px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 font-medium">
                                Réussi
                              </span>
                            ) : (
                              <span className="text-xs px-2 py-1 rounded-full bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400 font-medium">
                                Échoué
                              </span>
                            )}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {attempt.finishedAt ? new Date(attempt.finishedAt).toLocaleDateString("fr-FR") : "—"}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="max-w-7xl mx-auto px-6 py-8">
        <motion.div initial="hidden" animate="visible" variants={fadeIn}>
          {/* Title */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Suivi des apprenants</h1>
              <p className="text-sm text-muted-foreground mt-1">Progression et résultats de tous les apprenants inscrits</p>
            </div>
            <Link href="/admin">
              <Button variant="outline" size="sm" className="gap-1.5">
                <ArrowLeft className="w-4 h-4" /> Candidatures
              </Button>
            </Link>
          </div>

          {/* Stats */}
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <StatCard icon={<Users className="w-5 h-5" />} value={stats.totalUsers} label="Apprenants" />
              <StatCard icon={<BookOpen className="w-5 h-5" />} value={stats.totalLessonsCompleted} label="Leçons terminées" />
              <StatCard icon={<GraduationCap className="w-5 h-5" />} value={stats.totalExamAttempts} label="Examens passés" />
              <StatCard icon={<Award className="w-5 h-5" />} value={stats.totalExamsPassed} label="Examens réussis" />
            </div>
          )}

          {/* Search */}
          <div className="flex items-center gap-3 mb-6">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher par nom ou email..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="pl-10"
              />
            </div>
            <Button onClick={handleSearch} size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground">
              Rechercher
            </Button>
            {search && (
              <Button variant="outline" size="sm" onClick={() => { setSearch(""); setSearchInput(""); setPage(1); }}>
                Effacer
              </Button>
            )}
          </div>

          {/* Table */}
          <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
            {learnersQuery.isLoading ? (
              <div className="p-12 text-center">
                <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary mb-3" />
                <p className="text-sm text-muted-foreground">Chargement...</p>
              </div>
            ) : !learners || learners.users.length === 0 ? (
              <div className="p-12 text-center">
                <Users className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">Aucun apprenant trouvé.</p>
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Apprenant</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Rôle</TableHead>
                      <TableHead>Dernière connexion</TableHead>
                      <TableHead>Inscrit le</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {learners.users.map((learner: any) => (
                      <TableRow
                        key={learner.id}
                        className="cursor-pointer hover:bg-secondary/50 transition-colors"
                        onClick={() => setSelectedUserId(learner.id)}
                      >
                        <TableCell className="font-medium">{learner.name || "Sans nom"}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{learner.email || "—"}</TableCell>
                        <TableCell>
                          {learner.role === "admin" ? (
                            <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary font-medium">Admin</span>
                          ) : (
                            <span className="text-xs px-2 py-1 rounded-full bg-secondary text-muted-foreground font-medium">Utilisateur</span>
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {learner.lastSignedIn ? new Date(learner.lastSignedIn).toLocaleDateString("fr-FR") : "—"}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {learner.createdAt ? new Date(learner.createdAt).toLocaleDateString("fr-FR") : "—"}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            className="gap-1.5"
                            onClick={(e) => { e.stopPropagation(); setSelectedUserId(learner.id); }}
                          >
                            <Eye className="w-3.5 h-3.5" /> Détails
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between px-6 py-4 border-t border-border">
                    <span className="text-sm text-muted-foreground">
                      Page {page} sur {totalPages} ({learners.total} résultats)
                    </span>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={page <= 1}
                        onClick={() => setPage((p) => p - 1)}
                        className="gap-1"
                      >
                        <ChevronLeft className="w-4 h-4" /> Précédent
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={page >= totalPages}
                        onClick={() => setPage((p) => p + 1)}
                        className="gap-1"
                      >
                        Suivant <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

/* ─── Sub-components ─── */

function Header() {
  return (
    <header className="sticky top-0 z-30 bg-card/80 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src={LOGO_URL} alt="Neopolis Akademy" className="h-8 object-contain" />
          <span className="text-xs bg-primary/15 text-primary px-2.5 py-1 rounded-full font-semibold tracking-wide uppercase">Admin</span>
          <span className="text-xs text-muted-foreground font-medium ml-2">/ Suivi Formation</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/admin">
            <Button variant="outline" size="sm" className="gap-1.5 text-sm">
              <ArrowLeft className="w-4 h-4" /> Candidatures
            </Button>
          </Link>
          <Link href="/">
            <Button variant="outline" size="sm" className="text-sm">
              Retour au site
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}

function StatCard({ icon, value, label }: { icon: React.ReactNode; value: number | string; label: string }) {
  return (
    <div className="bg-card rounded-2xl border border-border p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-2 text-muted-foreground">
        {icon}
        <span className="text-xs uppercase tracking-wider font-medium">{label}</span>
      </div>
      <div className="text-2xl font-bold text-foreground">{value}</div>
    </div>
  );
}
