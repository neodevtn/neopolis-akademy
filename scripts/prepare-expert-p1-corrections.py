import json
from pathlib import Path
from collections import defaultdict

ROOT=Path('/home/ubuntu/neopolis-akademy')
AUDIT=ROOT/'pedagogical-audit'
report=json.loads((AUDIT/'13-pedagogical-rescore-2026-10-18.json').read_text())
manifest=json.loads((AUDIT/'formation-manifest.json').read_text())
if isinstance(manifest, dict): manifest=manifest.get('formations', manifest.get('items', []))
by_id={f.get('formation_id',f.get('id')):f for f in manifest}
issues=defaultdict(list)
for i, finding in enumerate(report['open_findings_detail']):
    if finding['severity'] in ['P0','P1']:
        issues[finding['formation_id']].append({**finding,'source_finding_index':i})
inputs=AUDIT/'expert-p1-inputs'
outputs=AUDIT/'expert-p1-results'
inputs.mkdir(exist_ok=True)
outputs.mkdir(exist_ok=True)
baseline=Path('/home/ubuntu/expert-p1-baseline')
baseline.mkdir(exist_ok=True)
for p in (ROOT/'client/public/data/courses').glob('*.json'):
    target=baseline/p.name
    if not target.exists(): target.write_bytes(p.read_bytes())
items=[]
for index,(fid,findings) in enumerate(issues.items(),1):
    f=by_id.get(fid,{})
    course_ids=f.get('course_ids',[]) or sorted({x['course_id'] for x in findings})
    paths=[str(ROOT/'client/public/data/courses'/f'{cid}.json') for cid in course_ids]
    title=findings[0]['formation_title']
    input_path=inputs/f'{index:02d}-{fid}.json'
    output_path=outputs/f'{index:02d}-{fid}.json'
    input_path.write_text(json.dumps({'formation_id':fid,'formation_title':title,'course_paths':paths,'findings':findings},ensure_ascii=False,indent=2)+'\n')
    items.append({'id':fid,'title':title,'input_path':str(input_path),'output_path':str(output_path),'paths':paths})
(AUDIT/'expert-p1-items.json').write_text(json.dumps(items,ensure_ascii=False,indent=2)+'\n')
schema={'type':'object','properties':{'formation_id':{'type':'string'},'rapport':{'type':'string'},'corriges':{'type':'integer'},'non_resolus':{'type':'integer'},'quiz_ajoutes':{'type':'integer'},'resume':{'type':'string'}},'required':['formation_id','rapport','corriges','non_resolus','quiz_ajoutes','resume']}
prompt='''Tu es rédacteur pédagogique expert chargé de CORRIGER une seule formation, pas simplement de l'auditer. Racine : /home/ubuntu/neopolis-akademy. Lis ton dossier d'entrée et les JSON courants indiqués. Lis les skills webdev-readme-fullstack et data-analysis avant d'agir. Si recherche externe nécessaire, lis deep-research avant search/fetch; ouvre les sources, privilégie documentation officielle. Pas de navigateur partagé.\n
Autorisation : modifier UNIQUEMENT les fichiers course_paths de ton dossier et ton rapport de sortie; pas d'index catalogue, de code commun, de fichiers de tests préexistants, ni des rapports initiaux. Préserver les IDs de cours/leçons/chapitres/blocs conservés. Pas de git commit ni checkpoint. Les autres formations sont corrigées par d'autres agents. Le parent gère métriques, tests et composants.\n
Objectif : corriger CHAQUE P0/P1 fourni. Remplacer les incohérences par un contenu de cours clair, contextualisé et techniquement exact; supprimer l'activité/annonce si les données/fichiers/outils requis n'existent pas ou si correction non vérifiable rapidement. Ne pas fabriquer dataset, fichier, workflow, résultat d'exécution, vidéo ou lien. Ne pas remplacer un écran vide par une excuse vide. Réutiliser les sources présentes, transcripts, contenu historique dans git ou documentation officielle pour une vraie explication; si la formation serait vide sans contenus, le signaler non résolu au lieu de prétendre conforme. Ne pas supprimer des vidéos pédagogiques utiles simplement parce qu'elles sont en anglais : expliciter langue, ajouter une alternative FR complète fidèle au transcript et corriger tous les champs affichés FR/EN. Garder les noms produits, APIs et code non traduits. Pour les contenus Anthropic, ne pas appeler un modèle non Claude; privilégier restaurer/réagencer contenu source plutôt qu'inventer.\n
Blocs standards Neopolis uniquement. La propriété chapter.body n'est PAS affichée si des blocks existent : transférer le contenu utile dans un bloc content unique placé avant vidéo, conserver champ legacy si nécessaire. Les scripts Projector sont anglais mono-langue : ajouter un bloc content FR/EN ou alternativeTextFr complète, pas seulement renommer titre. Pour Replit, vérifier ffprobe des assets /api/assets/ si MP4 possède piste vidéo réelle; si oui passer sourceType video, sourceUrl et mp4Url vers lecteur vidéo réel et retirer projectorSlides/projectorTimings de la représentation active. Si audio seulement, ne jamais prétendre restaurer une vidéo : transformer en explication textuelle fidèle et supprimer promesse de gestes invisibles. Pour code incorrect, corriger syntaxe/imports/contrats mais ne pas inventer sorties numériques; s'il reste doute, supprimer la sortie ou démonstration. Si lab absent, retirer renvoi, conclure sur acquis réellement expliqués.\n
Conception attendue : objectif -> explication spécifique -> exemple ou contraste -> petite validation des acquis. Sur les écrans de contenu que tu réécris substantiellement, ajouter à la FIN un petit quiz contextualisé et auto-suffisant (single_choice_exercise avec id stable, question FR/EN, 3-4 options text FR/EN, correctAnswer ID, explanation FR/EN détaillée, serverValidated=true) ou conserver un quiz existant déjà cohérent. Aucun quiz générique sur secrets/humain répété à la place du sujet; il doit tester la notion enseignée. Corriger les quiz existants mal alignés. Pas d'activité demandant un accès externe. Pas de fuite de correction dans contenu avant quiz. Ne pas réintroduire les TPs libres supprimés; remplacer leur intérêt pédagogique par une étude de cas et QCM s'appuyant sur texte présent. Pour les règles de progression existantes, retirer UNIQUEMENT référence à activité supprimée; préserver all_chapters/all_blocks/vidéo et checkpoint légitimes. Pas de changement arbitraire des thresholds. Une seule vidéo max par écran; aucune leçon vide.\n
Exécuter une vérification locale légère des JSON, ids de blocs, 1 vidéo/écran, référence correctAnswer vers option réelle. Ne pas lancer la suite entière de tests. Rendre un rapport JSON au chemin sortie avec formation_id, course_paths_changed, findings:[{source_finding_index,severity,course_id,chapter_id,status:'corrected'|'removed'|'verified_false_positive'|'unresolved',action,proof}], added_quiz_ids, removed_block_ids, sources_used, unresolved. Aucune assertion de fonctionnement navigateur sans l'avoir testé. Retourner résultat structuré court demandé.\n'''
script='const items = '+json.dumps(items,ensure_ascii=False)+';\n'
script+='const schema = '+json.dumps(schema,ensure_ascii=False)+';\n'
script+='const common = '+json.dumps(prompt,ensure_ascii=False)+';\n'
script+='const results = await parallel("Réécriture experte des formations avec P0/P1", () => items.map(item => agent(common + "\\nDossier : " + item.input_path + "\\nRapport sortie : " + item.output_path, {brief: "Corriger " + item.title.slice(0,100), sandbox:"shared", effort_level:"standard", input_files:[{path:item.input_path,name:"dossier"}], schema})), {schema});\n'
script+='return {results: results.map((r,i) => ({id:items[i].id,...r})), reports:items.map(x=>x.output_path)};\n'
(AUDIT/'workflow-expert-p1.js').write_text(script)
print(json.dumps({'formations':len(items),'findings':sum(map(len,issues.values())),'workflow':str(AUDIT/'workflow-expert-p1.js')},ensure_ascii=False))
