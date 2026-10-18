import json
import re
from pathlib import Path
from collections import Counter
from datetime import datetime, timezone

ROOT=Path('/home/ubuntu/neopolis-akademy')
AUDIT=ROOT/'pedagogical-audit'
D=json.loads((AUDIT/'15-expert-p1-corrections-2026-10-18.json').read_text())
review=json.loads((AUDIT/'expert-p1-editorial-review.json').read_text())
static=json.loads((AUDIT/'static-audit-data.json').read_text())
browser=json.loads((AUDIT/'expert-p1-browser/results.json').read_text())
fixture=json.loads((AUDIT/'expert-p1-browser-fixture/results.json').read_text())
log=Path('/tmp/expert-p1-full-tests-final.log').read_text() if Path('/tmp/expert-p1-full-tests-final.log').exists() else ''
test_files=[x.strip() for x in log.splitlines() if re.match(r'\s*Test Files\s',x)]
tests=[x.strip() for x in log.splitlines() if re.match(r'\s*Tests\s',x)]
old,new=Counter(),Counter()
for p in (ROOT/'client/public/data/courses').glob('*.json'):
    for source,counter in [(Path('/home/ubuntu/expert-p1-baseline')/p.name,old),(p,new)]:
        course=json.loads(source.read_text())
        counter['lessons']+=len(course.get('lessons',[]))
        for lesson in course.get('lessons',[]):
            counter['chapters']+=len(lesson.get('chapters',[]))
            for chapter in lesson.get('chapters',[]):
                for block in chapter.get('blocks',[]):
                    if isinstance(block,dict):counter[block['type']]+=1
rows=Counter(x['formation_title'] for x in D['findings'])
lines=[
 '# Corrections éditoriales des P0/P1 — 18 octobre 2026',
 '',
 '## Résultat et périmètre',
 '',
 f"Les **85 constats P1 et les deux P0** du dernier contre-audit ont reçu une correction ou un remplacement traçable. Le lot couvre **{D['formations']} formations** et modifie **{D['changed_courses']} fichiers de cours**. Les rapports de rédaction ne déclarent aucun constat cible non résolu. Ce résultat décrit le lot corrigé ; il ne vaut pas attestation de publication ni parcours intégral de toutes les formations.",
 '',
 'La règle appliquée est de conserver les éléments pédagogiques vérifiables et de remplacer ou retirer les activités non réalisables rapidement, **sans inventer fichier, jeu de données, workflow de départ ni résultat d’exécution**.',
 '',
 '## Changements concrets',
 '',
 '| Élément | Avant le lot | Après le lot |',
 '|---|---:|---:|',
]
for key,label in [('content','Blocs explicatifs'),('single_choice_exercise','QCM à choix unique'),('cloud_exercise','TP évalués'),('video','Blocs vidéo'),('chapters','Écrans'),('lessons','Leçons')]:
    lines.append(f'| {label} | {old[key]} | {new[key]} |')
lines.extend([
 '',
 f"**{D['new_quiz_count']} nouveaux identifiants de QCM** sont ajoutés. Deux anciens IDs de TP Developer sont réutilisés pour des QCM, d’où une augmentation nette de {new['single_choice_exercise']-old['single_choice_exercise']} blocs QCM. Les questions sont contextualisées, localisées FR/EN et corrigées côté serveur. Les clés et explications ne sont pas présentes dans la projection apprenant avant soumission.",
 '',
 'Les sept démonstrations Replit concernées utilisent désormais leur vrai MP4, avec une piste vidéo H.264 et une piste audio AAC attestées par ffprobe. Les sources Projector/HLS concurrentes ont été retirées de ces sept blocs. Cette preuve technique ne constitue pas, à elle seule, un test image/son début-milieu-fin de chaque vidéo dans le navigateur.',
 '',
 'Les fallbacks Google Cloud vides ont été remplacés par de vraies explications. Les chapitres Novasavo ont été réécrits selon leur sujet comptable. Les exemples Databricks/FastAPI ont été corrigés, les annonces de labs/capstones absents retirées, et les alternatives textuelles françaises des vidéos concernées complétées.',
 '',
 '## Validation',
 '',
 f"- **Couverture des corrections :** {D['coverage']} / 87 constats rattachés exactement à leur formation, cours et chapitre ; contrôle de consolidation sans erreur.",
 f"- **Contrôleur structurel :** {static['coverage']['course_count']} cours et {static['coverage']['chapter_count']} écrans ; {static['severity_counts']}. Ce contrôleur ne remplace pas une revue qualitative exhaustive.",
 '- **Langues et Markdown :** audits stricts FR/EN sans constat après correction du balisage final.',
'- **Compte et recherche :** métriques synchronisées pour 180 cours et 116 formations ; index de recherche régénéré avec 3 303 entrées.',
'- **Progression :** tests de verrouillage et d’IDs scopés, gates réels des QCM Developer et des quiz 4/4 conservés ; pas d’activité obligatoire réintroduite sans support.',
f"- **Relecture éditoriale indépendante :** {review['status']}, {len(review['blockers'])} bloqueur dans l’échantillon ciblé. Les limites de cet avis sont consignées dans son rapport JSON.",
'- **Régression complète :** '+ (' ; '.join(test_files[-1:]+tests[-1:]) or 'résultat final non encore disponible'),
'- **Pipeline de contenu :** 0 erreur bloquante ; 220 avertissements heuristiques sur des options proches dans le catalogue. Ces avertissements ne sont pas assimilés automatiquement aux P1 du lot ni déclarés tous faux positifs par cette correction.',
'',
'### Contrôles navigateur et limite de publication',
 '',
 'Le compte QA conserve un rôle apprenant. Deux exécutions ont été distinguées :',
 '',
 '1. **Progression réelle :** 12 vues desktop/mobile sur six écrans. Six vues étaient rendues et six étaient normalement bloquées par les prérequis séquentiels. Une soumission réelle du nouveau QCM GitHub Copilot a renvoyé HTTP 200, affiché « Correct ! » et présenté son explication seulement après soumission.',
 '2. **Progression prérequise de test, injectée uniquement en mémoire :** les six écrans desktop ont été rendus ; quatre QCM (OpenAI, n8n, Novasavo, Copilot) ont été soumis à la véritable API protégée, avec feedback correct et explication cachée avant soumission. Aucun acquis simulé n’a été sauvegardé. Les six vues mobiles de cette seconde exécution ont ensuite rencontré la vérification de présence : **elles ne sont pas déclarées validées**. Le mécanisme d’intégrité n’a pas été contourné.',
 '',
 'Les vues rendues ne présentent ni erreur JavaScript ni débordement horizontal détecté. Les captures sont disponibles dans `expert-p1-browser/` et `expert-p1-browser-fixture/` avec leurs JSON de résultats.',
 '',
 '**Aucun déploiement en production n’est effectué par ce lot.** La validation complète du parcours apprenant et des médias obligatoires reste une condition de publication ; les vues bloquées par une vérification de présence ne sont pas transformées en PASS artificiel.',
 '',
 '## Progression mesurée',
 '',
 '**87 / 87 constats ciblés traités dans les fichiers et le code : 100 % du lot P0/P1.** Ce pourcentage n’est ni un nouveau score pédagogique /100 ni une déclaration que tous les P2/P3 sont clos. Le précédent score de l’audit ne peut être remplacé sans une nouvelle notation selon la même grille.',
 '',
 '## Répartition par formation',
 '',
 '| Formation | Constats traités |',
 '|---|---:|',
])
for title,count in sorted(rows.items()):lines.append(f'| {title} | {count} |')
lines.extend(['','## Liste exhaustive des corrections',''])
for i,f in enumerate(D['findings'],1):
    label={'corrected':'Corrigé / remplacé','removed':'Retiré','verified_false_positive':'Faux positif vérifié','unresolved':'Non résolu'}[f['status']]
    lines.extend([
      f"### {i:02d}. {f['severity']} — {f['formation_title']}",
      '',f"**Cours :** `{f['course_id']}` — **Écran :** `{f['chapter_id']}` — **Statut :** {label}.",
      '',f"**Action :** {f['action']}",
      '',f"**Preuve :** {f['proof']}",''
    ])
path=AUDIT/'15-expert-p1-corrections-2026-10-18.md'
path.write_text('\n'.join(lines)+'\n')
print(json.dumps({'report':str(path),'bytes':path.stat().st_size,'findings':len(D['findings']),'test_files':test_files[-1:] ,'tests':tests[-1:]},ensure_ascii=False))
