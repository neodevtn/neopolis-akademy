import json
from pathlib import Path
from collections import Counter
from datetime import datetime, timezone

ROOT=Path('/home/ubuntu/neopolis-akademy')
AUDIT=ROOT/'pedagogical-audit'
items=json.loads((AUDIT/'expert-p1-items.json').read_text())
baseline=Path('/home/ubuntu/expert-p1-baseline')
source=json.loads((AUDIT/'13-pedagogical-rescore-2026-10-18.json').read_text())
expected={i:f for i,f in enumerate(source['open_findings_detail']) if f['severity'] in ['P0','P1']}
seen={}
reports=[]
errors=[]
added=[]
removed=[]
changed=set()
for item in items:
    p=Path(item['output_path'])
    if not p.exists(): errors.append('Rapport manquant : '+item['id']); continue
    d=json.loads(p.read_text())
    if d['formation_id']!=item['id']: errors.append('Formation incorrecte : '+str(p))
    allowed=set(item['paths'])
    changed.update(d.get('course_paths_changed',[]))
    if not set(d.get('course_paths_changed',[]))<=allowed: errors.append('Modification hors périmètre : '+item['id'])
    for f in d.get('findings',[]):
        idx=f['source_finding_index']
        if idx not in expected or idx in seen: errors.append('Constat invalide/dupliqué : '+str(idx)); continue
        original=expected[idx]
        for key in ['severity','course_id','chapter_id']:
            if f.get(key)!=original[key]: errors.append('Raccord incorrect : '+str(idx)+' '+key)
        if not f.get('proof') or f.get('status') not in ['corrected','removed','verified_false_positive','unresolved']: errors.append('Preuve/statut invalide : '+str(idx))
        seen[idx]={**f,'formation_id':item['id'],'formation_title':item['title']}
    for qid in d.get('added_quiz_ids',[]): added.append({'formation_id':item['id'],'id':qid})
    removed.extend(d.get('removed_block_ids',[]))
    reports.append(d)
for idx in expected:
    if idx not in seen: errors.append('Constat non couvert : '+str(idx))

metrics=[]
new_quizzes=[]
for path in sorted((ROOT/'client/public/data/courses').glob('*.json')):
    course=json.loads(path.read_text())
    old=json.loads((baseline/path.name).read_text()) if (baseline/path.name).exists() else {}
    old_blocks={b.get('id') for l in old.get('lessons',[]) for ch in l.get('chapters',[]) for b in ch.get('blocks',[]) if isinstance(b,dict)}
    current_blocks=[b for l in course.get('lessons',[]) for ch in l.get('chapters',[]) for b in ch.get('blocks',[]) if isinstance(b,dict)]
    if old!=course:
        changed.add(str(path))
        metrics.append({'course_id':course.get('courseId',path.stem),'lessons_before':len(old.get('lessons',[])),'lessons_after':len(course.get('lessons',[])),'chapters_before':sum(len(l.get('chapters',[])) for l in old.get('lessons',[])),'chapters_after':sum(len(l.get('chapters',[])) for l in course.get('lessons',[])),'blocks_before':len(old_blocks),'blocks_after':len(current_blocks)})
    for li,l in enumerate(course.get('lessons',[])):
        if not l.get('chapters'):errors.append(f'{path.stem}: leçon {li} vide')
        for ch in l.get('chapters',[]):
            blocks=ch.get('blocks',[])
            if not blocks:errors.append(f'{path.stem}: écran {ch.get("id")} vide')
            if sum(b.get('type')=='video' for b in blocks if isinstance(b,dict))>1:errors.append(f'{path.stem}: plusieurs vidéos {ch.get("id")}')
            for b in blocks:
                if not isinstance(b,dict):continue
                if b.get('type')=='single_choice_exercise' and b.get('id') not in old_blocks:
                    ids=[o.get('id') for o in b.get('options',[])]
                    if len(ids)<2 or len(set(ids))!=len(ids) or b.get('correctAnswer') not in ids or b.get('serverValidated') is not True:errors.append(f'{path.stem}: nouveau quiz invalide {b.get("id")}')
                    for key in ['question','explanation']:
                        if not isinstance(b.get(key),dict) or not all(b[key].get(lang) for lang in ['fr','en']):errors.append(f'{path.stem}: nouveau quiz {b.get("id")} sans {key} bilingue')
                    new_quizzes.append({'course_id':course.get('courseId',path.stem),'chapter_id':ch.get('id'),'id':b.get('id')})
statuses=Counter(f['status'] for f in seen.values())
closed=Counter(f['severity'] for f in seen.values() if f['status']!='unresolved')
summary={'generated_at':datetime.now(timezone.utc).isoformat(),'formations':len(items),'coverage':len(seen),'closed':dict(closed),'statuses':dict(statuses),'new_quiz_count':len(new_quizzes),'changed_courses':len(changed),'errors':errors,'findings':list(seen.values()),'new_quizzes':new_quizzes,'changed_course_paths':sorted(changed),'course_metrics':metrics,'reports':reports,'initial_backlog':source['open_findings'],'scope_note':'Clôture des constats P0/P1 du contre-audit du 18 octobre. Le score global et le backlog P2/P3 ne sont pas recalculés sans nouvelle revue complète.'}
(AUDIT/'15-expert-p1-corrections-2026-10-18.json').write_text(json.dumps(summary,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({k:summary[k] for k in ['formations','coverage','closed','statuses','new_quiz_count','changed_courses','errors']},ensure_ascii=False,indent=2))
if errors:raise SystemExit(1)
