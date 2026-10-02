#!/usr/bin/env python3
"""Read-only data QA for staged bilingual Anthropic mock-exam banks."""
import collections
import hashlib
import json
from pathlib import Path
import re
import sys

ROOT=Path(__file__).resolve().parents[1]
BASE=Path('/home/ubuntu/anthropic-mock-exam-work')
BANK=ROOT/'server/data/mockExamQuestions.json'
SOURCE_PATHS={
 'claude_certified_associate_foundations':BASE/'source/associate_foundations/certsafari_questions.json',
 'claude_certified_architect_foundations':BASE/'source/architect_foundations/certsafari_questions.json',
 'claude_certified_architect_professional':BASE/'source/architect_professional/certsafari_questions.json',
 'claude_certified_developer_foundations':BASE/'source/developer_foundations/certsafari_questions.json',
}
EXPECTED_HASHES={
 'claude_certified_associate_foundations':'ce766fbccb82950225b2a4583aba613710a8706bd8f21ccee9b0a73c0005ff74',
 'claude_certified_architect_foundations':'76db780cb3dfa0c4d6dbc707dd8c6360c2923d25582f99b21b4a8fcd5645663a',
 'claude_certified_architect_professional':'a320e531f890ab098e29e2c88f51d7b92f5befb84c4d25875430b3d633cb61b4',
 'claude_certified_developer_foundations':'c86f816e6b6ce758355d2ee74179d899570c1e399619d162fa0ae506d6d7a842',
}


def normalized(text):
 return re.sub(r'[^a-z0-9 ]+',' ',text.lower()).split()


def trigrams(text):
 tokens=normalized(text);return set(tuple(tokens[i:i+3]) for i in range(len(tokens)-2))


def main():
 bank=json.loads(BANK.read_text());report={};errors=[];similar=[]
 for cert,path in SOURCE_PATHS.items():
  raw=path.read_bytes();digest=hashlib.sha256(raw).hexdigest()
  if digest!=EXPECTED_HASHES[cert]:errors.append(f'{cert}: hash source changed')
  source=json.loads(raw);ref={}
  for parent in source['questions']:
   for item in [parent,*(parent.get('variants') or [])]:ref[item['id']]=(parent['question'],item)
  scoped=[q for q in bank if q['certificationId']==cert]
  licensed=[q for q in scoped if q.get('sourceType')=='certsafari-partner-practice']
  authored=[q for q in scoped if q.get('sourceType')=='neopolis-original']
  if len(licensed)!=len(ref):errors.append(f'{cert}: partner count {len(licensed)} versus {len(ref)}')
  checked=0
  for q in licensed:
   item=ref.get(q.get('sourceQuestionId'))
   if not item:errors.append(f'{cert}: unknown id {q["id"]}');continue
   stem,s=item
   options=[c['text']['en'] for c in q['choices']]
   rationales=[c['rationale']['en'] for c in q['choices']]
   expected_rationales={r['option']:r['explanation'] for r in s['explanations']}
   expected_answers=[x.lower() for x in s['correct_answers']]
   if q['question']['en']!=stem or options!=s['options'] or rationales!=[expected_rationales[chr(65+i)] for i in range(len(options))] or q['correctChoiceIds']!=expected_answers:
    errors.append(f'{cert}: source content mismatch {q["id"]}')
   else:checked+=1
  # Compare inside the same assessed subdomain; avoid treating linked scenario variants as accidental duplicates.
  pools=collections.defaultdict(list)
  for q in licensed+authored:pools[q.get('subdomain','')].append(q)
  for subdomain,items in pools.items():
   prepared=[(q,trigrams(q['question']['en'])) for q in items]
   for i,(a,aa) in enumerate(prepared):
    for b,bb in prepared[i+1:]:
     if a.get('sourceVariantGroup') and a.get('sourceVariantGroup')==b.get('sourceVariantGroup'):continue
     if a.get('scenarioFamily') and a.get('scenarioFamily')==b.get('scenarioFamily'):continue
     if not aa or not bb:continue
     score=len(aa & bb)/len(aa | bb)
     if score >= .70:
      similar.append({'certificationId':cert,'first':a['id'],'second':b['id'],'jaccard':round(score,3),'subdomain':subdomain})
  for q in authored:
   if not q['question']['en'] or not q['question']['fr'] or len(q['question']['en'])<165:
    errors.append(f'{cert}: authored scenario is missing or too short {q["id"]}')
   if re.search(r'official exam question|leaked exam question|real exam question',q['question']['en'],re.I):
    errors.append(f'{cert}: prohibited official claim {q["id"]}')
  report[cert]={'sourceSha256':digest,'partnerQuestions':len(licensed),'verbatimPartnerItemsVerified':checked,
                'originalNeopolisItems':len(authored),'multiAnswerItems':sum(len(q['correctChoiceIds'])>1 for q in scoped),
                'choices':dict(collections.Counter(str(len(q['choices'])) for q in scoped))}
 output={'certifications':report,'highSimilarityPairs':similar[:150],'highSimilarityCount':len(similar),'errors':errors[:200]}
 file=BASE/'bank-audit.json';file.write_text(json.dumps(output,ensure_ascii=False,indent=2)+'\n')
 print(json.dumps({'output':str(file),'certifications':report,'highSimilarityCount':len(similar),'errors':len(errors)},indent=2))
 if errors:raise SystemExit(1)

if __name__=='__main__':main()
