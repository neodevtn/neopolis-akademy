#!/usr/bin/env python3
"""Stage and merge four bilingual server-only exam banks, preserving vendor content verbatim in English."""
import argparse
import collections
import importlib.util
import json
from pathlib import Path
import re

ROOT=Path(__file__).resolve().parents[1]
BANK=ROOT/'server/data/mockExamQuestions.json'
BASE=Path('/home/ubuntu/anthropic-mock-exam-work')
spec=importlib.util.spec_from_file_location('authoring',ROOT/'scripts/build_certsafari_anthropic_claude.py')
gen=importlib.util.module_from_spec(spec);spec.loader.exec_module(gen)


def stage_generated(name):
    cert,code=gen.CERTS[name];gen.CERT,gen.CODE,gen.WORK=cert,code,BASE/name
    gen.SOURCE=json.loads((BASE/f'partner-{name}.json').read_text())
    output=[]
    for key,domain,subdomain,count,multiple,examples,offset in gen.prepare_batches():
        file=gen.WORK/'generated-batches'/f'{key}.json'
        if not file.exists():raise FileNotFoundError(str(file))
        items=json.loads(file.read_text())['items'];gen.validate_authored(items,count,multiple)
        for index,item in enumerate(items):
            output.append(make_generated(name,cert,code,key,domain,subdomain,index,item))
    if name=='architect_foundations':
        scenarios=gen.PLAN['certifications'][cert]['scenarioFamilies']
        for family,plan in scenarios.items():
            file=gen.WORK/'scenario-batches'/f'{family}.json'
            if not file.exists():raise FileNotFoundError(str(file))
            items=json.loads(file.read_text())['items'];gen.validate_authored(items,6,0)
            for index,item in enumerate(items):
                q=make_generated(name,cert,code,f'scenario-{family}',plan['domain'],family.replace('_',' '),index,item)
                q['scenarioFamily']=family
                q['scenarioTitle']={'en':family.replace('_',' ').title()}
                output.append(q)
    path=gen.WORK/'generated-questions.json'
    path.write_text(json.dumps(output,ensure_ascii=False,indent=2)+'\n')
    print('STAGED',name,'generated',len(output),'at',path)
    return output


def make_generated(name,cert,code,key,domain,subdomain,index,item):
    options=item['options_en'];rationales=item['rationales_en'];letters=[chr(65+i) for i in range(len(options))]
    qid=f"neo_{code.lower().replace('-','_')}_20261002_{key}_{index+1}"
    return {'id':qid,'certificationId':cert,'domain':domain,'subdomain':subdomain,
            'objective':subdomain,'difficulty':'advanced' if len(item['correct_answers'])>1 else 'intermediate',
            'sourceType':'claude-sonnet-original',
            'sourcePedagogique':'Neopolis Academy courses: '+', '.join(gen.PLAN['certifications'][cert]['domains'][domain]['courseIds']),
            'version':'neopolis-original-2026-10-02','question':{'en':item['question_en']},
            'choices':[{'id':letters[i].lower(),'text':{'en':text},'rationale':{'en':rationales[i]},
                        'rationaleProvenance':{'model':'claude-sonnet-4-6','method':'original-question-authoring'}}
                       for i,text in enumerate(options)],
            'correctChoiceIds':[answer.lower() for answer in item['correct_answers']]}


def read_translations(source,folder):
    path=folder
    result=[]
    for i in range(0,len(source),4):
        file=path/f'{i//4:04}.json'
        if not file.exists():raise FileNotFoundError(str(file))
        items=json.loads(file.read_text())['items']
        gen.validate_translation(source[i:i+4],items)
        result.extend(items)
    if len(result)!=len(source):raise ValueError('Untranslated item')
    return result


def with_french(questions,translations):
    for q,fr in zip(questions,translations):
        q['question']['fr']=fr['question_fr']
        for c,choice_fr,rationale_fr in zip(q['choices'],fr['options_fr'],fr['rationales_fr']):
            c['text']['fr']=choice_fr;c['rationale']['fr']=rationale_fr
            c['translationProvenance']={'model':'claude-sonnet-4-6','method':'source-faithful-french-translation'}
    return questions


def verify_bank(questions):
    ids=set();source_ids=set();stems=collections.defaultdict(list)
    for q in questions:
        if q['id'] in ids:raise ValueError(f"Duplicate ID {q['id']}")
        ids.add(q['id'])
        stem=re.sub(r'\s+',' ',q['question']['en']).strip().lower()
        stems[(q['certificationId'],stem)].append(q)
        options=q['choices'];keys=[c['id'] for c in options]
        answers=q['correctChoiceIds']
        if not 4<=len(options)<=8 or len(keys)!=len(set(keys)) or not answers or len(answers)!=len(set(answers)) or not set(answers)<=set(keys):raise ValueError(f"Answer/option integrity {q['id']}")
        if any(not q['question'].get(lang,'').strip() for lang in ('en','fr')):raise ValueError(f"Missing bilingual question {q['id']}")
        for c in options:
            if any(not c[field].get(lang,'').strip() for field in ('text','rationale') for lang in ('en','fr')):raise ValueError(f"Missing bilingual choice {q['id']}:{c['id']}")
        if q.get('sourceType')=='certsafari-partner-practice':
            key=(q['certificationId'],q['sourceQuestionId'])
            if key in source_ids:raise ValueError(f'Duplicate partner item {key}')
            source_ids.add(key)
    duplicates={key:values for key,values in stems.items() if len(values)>1}
    for key,values in duplicates.items():
        # The only exact duplicate stems allowed are the 20 source variants of CCDV-F.
        if len(values)!=2 or not all(x.get('sourceType')=='certsafari-partner-practice' for x in values) or len({x.get('sourceVariantGroup') for x in values})!=1:
            raise ValueError(f'Unexpected repeated stem: {key[0]} / {key[1][:110]}')
    return {'bankCounts':dict(collections.Counter(q['certificationId'] for q in questions)),
            'partnerCounts':dict(collections.Counter(q['certificationId'] for q in questions if q.get('sourceType')=='certsafari-partner-practice')),
            'generatedCounts':dict(collections.Counter(q['certificationId'] for q in questions if q.get('sourceType')=='claude-sonnet-original')),
            'multipleAnswerCounts':dict(collections.Counter(q['certificationId'] for q in questions if len(q['correctChoiceIds'])>1)),
            'variantGroupsWithRepeatedStem':len(duplicates)}


def merge(dry_run):
    prior=json.loads(BANK.read_text())
    target_ids={cert for cert,code in gen.CERTS.values()}
    untouched=[q for q in prior if q['certificationId'] not in target_ids]
    candidate=untouched[:]
    for name,(cert,code) in gen.CERTS.items():
        partner=json.loads((BASE/f'partner-{name}.json').read_text())
        authored=json.loads((BASE/name/'generated-questions.json').read_text())
        candidate.extend(with_french(partner,read_translations(partner,BASE/name/'translations')))
        candidate.extend(with_french(authored,read_translations(authored,BASE/name/'generated-translations')))
    metrics=verify_bank(candidate)
    if not dry_run:
        temp=BANK.with_suffix('.tmp');temp.write_text(json.dumps(candidate,ensure_ascii=False,indent=2)+'\n');temp.replace(BANK)
    print(json.dumps({'dryRun':dry_run,'removedOldAnthropic':len(prior)-len(untouched),'retainedOther':len(untouched),**metrics},indent=2))


if __name__=='__main__':
    parser=argparse.ArgumentParser();parser.add_argument('mode',choices=('stage','merge'))
    parser.add_argument('--cert',choices=gen.CERTS)
    parser.add_argument('--dry-run',action='store_true');args=parser.parse_args()
    if args.mode=='stage':
        if not args.cert:parser.error('--cert required for stage')
        stage_generated(args.cert)
    else:merge(args.dry_run)
