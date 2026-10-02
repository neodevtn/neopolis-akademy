#!/usr/bin/env python3
"""Author and translate four separate CertSafari-informed Anthropic practice banks.

Credentials remain server-side. Progress files stay outside this repository until
validation. No answer key enters the frontend bundle. Existing Claude caches are kept.
"""
import argparse
import collections
import concurrent.futures as futures
import json
import os
from pathlib import Path
import re
import time

import requests

ROOT = Path(__file__).resolve().parents[1]
BASE = Path('/home/ubuntu/anthropic-mock-exam-work')
COURSES = ROOT / 'client/public/data/courses'
PLAN = json.loads((ROOT / 'scripts/data/anthropicMockExamGenerationPlan.json').read_text())
OFFICIAL = json.loads((ROOT / 'scripts/data/anthropicOfficialMockExamReferences.json').read_text())
OFFICIAL_URLS = {item['url'] for item in OFFICIAL['references']}
CERTS = {
    'developer_foundations': ('claude_certified_developer_foundations', 'CCDV-F'),
    'associate_foundations': ('claude_certified_associate_foundations', 'CCAO-F'),
    'architect_foundations': ('claude_certified_architect_foundations', 'CCAR-F'),
    'architect_professional': ('claude_certified_architect_professional', 'CCAR-P'),
}
MODEL = 'claude-sonnet-4-6'
SOURCE = []
WORK = BASE
CERT = ''
CODE = ''
SOURCE_KIND = 'partner'


def safe_name(value):
    return re.sub(r'[^a-z0-9]+', '-', value.lower()).strip('-')


def schema(properties):
    return {'type': 'json_schema', 'json_schema': {'name': 'practice_content', 'strict': True,
            'schema': {'type': 'object', 'additionalProperties': False,
                       'properties': {'items': {'type': 'array', 'items': {
                           'type': 'object', 'additionalProperties': False,
                           'properties': properties, 'required': list(properties)}}}, 'required': ['items']}}}


def api_call(messages, output_format, max_tokens=12000, retries=3, model_override=None):
    provider = os.environ.get('CERTSAFARI_LLM_PROVIDER', 'webdev')
    if provider not in ('manus', 'openrouter', 'webdev'): raise ValueError('Unsupported model provider')
    url = ('https://openrouter.ai/api/v1/chat/completions' if provider == 'openrouter'
           else os.environ['OPENAI_API_BASE'].rstrip('/') + '/chat/completions' if provider == 'manus'
           else os.environ['BUILT_IN_FORGE_API_URL'].rstrip('/') + '/v1/chat/completions')
    key = (os.environ['OPENROUTER_API_KEY'] if provider == 'openrouter'
           else os.environ['OPENAI_API_KEY'] if provider == 'manus'
           else os.environ['BUILT_IN_FORGE_API_KEY'])
    headers = {'Authorization': 'Bearer ' + key, 'Content-Type': 'application/json'}
    chosen_model=model_override or MODEL
    body = {'model': 'anthropic/claude-sonnet-4.6' if provider == 'openrouter' else chosen_model,
            'messages': messages, 'response_format': output_format}
    if provider == 'manus':
        body['max_completion_tokens'] = max_tokens
        body['reasoning'] = {'effort': 'low' if chosen_model == 'gpt-5' else 'minimal'}
    else:
        body['max_tokens'] = max_tokens
        if provider == 'webdev': body['thinking'] = {'type': 'enabled', 'budget_tokens': 768}
    for attempt in range(retries):
        try:
            response = requests.post(url, headers=headers, json=body, timeout=210)
            if response.status_code != 200:
                raise RuntimeError(f'HTTP {response.status_code}: {response.text[:250]}')
            data = response.json()
            if data.get('error'): raise RuntimeError(str(data['error'])[:250])
            content = data['choices'][0]['message']['content']
            if not content: raise ValueError('Empty response')
            return json.loads(content)
        except (requests.RequestException, ValueError, KeyError, RuntimeError) as error:
            if attempt == retries - 1:
                raise RuntimeError(f'Model request failed after {retries} tries: {str(error)[:300]}') from error
            time.sleep(min(30, 2 ** attempt * 3))


def course_excerpt(domain, subdomain):
    chunks = []
    key_terms = {t for t in re.findall(r'[a-z]{4,}', subdomain.lower()) if t not in {'with', 'from', 'management', 'design', 'apply', 'using'}}
    course_ids = PLAN['certifications'][CERT]['domains'][domain]['courseIds']
    for course_id in course_ids:
        course_path = COURSES / f'{course_id}.json'
        if not course_path.exists(): continue
        data = json.loads(course_path.read_text())
        for lesson in data.get('lessons', []):
            for chapter in lesson.get('chapters', []):
                title = chapter['title']['en'] if isinstance(chapter['title'], dict) else str(chapter['title'])
                overlap = len(key_terms & set(re.findall(r'[a-z]{4,}', title.lower())))
                content = '\n'.join(str(block.get('body', {}).get('en', '')) for block in chapter.get('blocks', [])
                                    if block.get('type') == 'content' and isinstance(block.get('body'), dict))
                if content.strip(): chunks.append((overlap, course_id, title, content[:1800]))
    chunks.sort(key=lambda item: (-item[0], item[1]))
    return '\n\n'.join(f'{course_id} — {title}: {text[:1400]}' for _, course_id, title, text in chunks[:3])[:4200]


def official_references(domain, subdomain):
    """Keep only sources that actually match this exam objective; avoid generic AI citations."""
    matches = []
    for index, item in enumerate(OFFICIAL['references']):
        score = sum(3 if re.search(r'\b' + re.escape(term) + r'\b', subdomain, re.I)
                    else 1 if re.search(r'\b' + re.escape(term) + r'\b', domain, re.I)
                    else 0 for term in item['match'])
        if score: matches.append((-score,index,item))
    matches.sort()
    selected = [item for _,_,item in matches[:3]]
    if not selected:
        selected = [OFFICIAL['references'][index] for index in (4,10)]
    return [{'url': item['url'], 'verified_summary': item['summary']} for item in selected]


def prepare_batches():
    by_subdomain = collections.defaultdict(list)
    for q in SOURCE: by_subdomain[(q['domain'], q['subdomain'])].append(q)
    jobs = []
    for (domain, subdomain), records in sorted(by_subdomain.items()):
        target = len(records)  # In each subdomain, add as many original items as licensed samples.
        multiple_ratio = sum(len(q['correctChoiceIds']) > 1 for q in records) / target
        for offset in range(0, target, 4):
            n = min(4, target - offset)
            multiple = round((offset + n) * multiple_ratio) - round(offset * multiple_ratio)
            fingerprint = safe_name(domain)[:22] + '-' + safe_name(subdomain)[:48] + '-' + str(offset // 4 + 1).zfill(2)
            samples = []
            for ix in range(min(2,target)):
                sample=records[(offset * 3 + ix) % target]
                samples.append({
                    'scenario':sample['question']['en'],
                    'options':[choice['text']['en'] for choice in sample['choices']],
                    'correct_answers':sample['correctChoiceIds'],
                    'option_specific_explanations':[choice['rationale']['en'] for choice in sample['choices']],
                })
            jobs.append((fingerprint, domain, subdomain, n, multiple, samples, offset))
    if sum(job[3] for job in jobs) != len(SOURCE): raise ValueError('Generated count must equal partner count')
    return jobs


def normalize(text):
    return re.sub(r'[^a-z0-9]+', ' ', text.lower()).strip()


def validate_authored(items, count, multiple):
    if not isinstance(items, list) or len(items) != count: raise ValueError('Wrong number of authored items')
    for item in items:
        prompt = item['question_en'].strip()
        options = item['options_en']; answers = item['correct_answers']; rationales = item['rationales_en']
        if len(prompt) < 165 or len(prompt) > 1600: raise ValueError('Scenario length out of range')
        if item.get('source_ref') and not re.search(r'\b(?:Claude|Anthropic|MCP|Messages API|Agent SDK|Sonnet|Haiku|Opus)\b',prompt,re.I):
            raise ValueError('Scenario must explicitly assess an Anthropic Claude product in its stem')
        if not (4 <= len(options) <= 6) or len(rationales) != len(options): raise ValueError('Option/rationale count invalid')
        distinct=[re.sub(r'\s+', ' ', text.strip()).casefold() for text in options]
        if len(set(distinct)) != len(options) or any(not text for text in distinct):
            raise ValueError(f'Duplicate or empty authored option in question: {prompt[:90]}')
        if any(len(text.strip()) < 42 for text in rationales): raise ValueError('Generic or missing rationale')
        if item.get('source_ref') and item['source_ref'] not in OFFICIAL_URLS: raise ValueError('Unverified Anthropic source URL')
        letters = [chr(65 + index) for index in range(len(options))]
        cleaned = []
        for answer in answers:
            found = re.fullmatch(r'(?:option|choice)?\s*([A-F])\.?', str(answer).strip().upper().replace('OPTION', 'option').replace('CHOICE', 'choice'), re.I)
            cleaned.append(found.group(1) if found else answer)
        item['correct_answers'] = cleaned
        if not cleaned or len(set(cleaned)) != len(cleaned) or any(a not in letters for a in cleaned): raise ValueError(f'Incorrect answer index: {cleaned!r} for {letters!r}')
        if len(cleaned) > 1 and not (2 <= len(cleaned) <= len(options)-1 and len(options) >= 5): raise ValueError('Multiple-answer contract')
        if item.get('source_ref'):
            for index,rationale in enumerate(rationales):
                expected='correct:' if letters[index] in cleaned else 'incorrect:'
                if not rationale.strip().casefold().startswith(expected):
                    raise ValueError(f'Option {letters[index]} must begin {expected} to match the answer key, not {rationale[:30]!r}')
    if sum(len(item['correct_answers']) > 1 for item in items) != multiple:
        raise ValueError(f'Expected {multiple} multi-select items, got {sum(len(x["correct_answers"])>1 for x in items)}')


def review_official_batch(items, references):
    """Reject ambiguous, generic or technically false Manus items before caching."""
    allowed = {ref['url'] for ref in references}
    for item in items:
        if item['source_ref'] not in allowed: raise ValueError('Unverified source_ref')
        for answer in item['correct_answers']:
            text = item['options_en'][ord(answer)-65]
            if '.claude/rules/' in text and '.yaml' in text:
                raise ValueError('Claude Code rules use .md files with YAML frontmatter, not .yaml files')
    properties={'verdict':{'type':'string','enum':['pass','revise']},'issue':{'type':'string'}}
    result=api_call([
        {'role':'system','content':('You are an independent STRICT technical reviewer, not the author. Use the supplied Anthropic references as the authority. For EACH question first reconstruct EVERY hard requirement in the stem, then ask whether the keyed option satisfies ALL of them simultaneously and whether another choice also does. If NO option can satisfy every requirement, REJECT the question instead of pretending one answer is correct. Check every distractor rationale and make sure the source_ref truly supports each product behavior. CRITICAL: a user-defined function executes as a CLIENT tool on application infrastructure, NOT as an Anthropic-hosted server tool; sensitive private processing cannot magically be moved into a server tool. Claude Code subagents inherit parent/managed permissions: a narrower definition cannot grant an operation blocked by inherited policy. CLAUDE.md is not a permission control; .claude/rules requires .md with YAML frontmatter; local modes cannot override managed denies. If ANY claim is unsupported, a keyed answer violates a hard condition, more than one answer is viable, a distractor is trivial, or cases repeat, verdict=revise with item index and the precise conflict. Demand multiple interacting constraints and genuine product-specific decisions. Return exactly ONE verdict item for the WHOLE batch in items, not one per question. JSON only.')},
        {'role':'system','content':'IMPORTANT independent feasibility check: PreToolUse denial blocks one tool call, NOT the entire agent session; Claude may continue to try another action. An application-level stop and explicit rollback are needed when the stem requires a hard halt. Per-tool timeouts do NOT guarantee a complete sub-second Claude model answer. If a proposed best option relies on either false guarantee, return revise and quote the offending answer.'},
        {'role':'user','content':json.dumps({'references':references,'questions':items},ensure_ascii=False)},
    ],schema({'verdict':properties['verdict'],'issue':properties['issue']}),max_tokens=3600,model_override='gpt-5')
    # schema() wraps a list of items; one reviewer verdict is expected.
    if len(result['items'])!=1: raise ValueError('Reviewer verdict shape invalid')
    verdict=result['items'][0]
    if verdict['verdict']!='pass':raise ValueError('Independent Anthropic-content review: '+verdict['issue'][:260])


def author_one(job):
    key, domain, subdomain, count, multiple, examples, offset = job
    target = WORK / 'generated-batches' / f'{key}.json'
    if target.exists():
        existing = json.loads(target.read_text()); validate_authored(existing['items'], count, multiple)
        if os.environ.get('CERTSAFARI_LLM_PROVIDER')=='manus' and (
            existing.get('model')!='gpt-5' or
            existing.get('editorialReview',{}).get('standard')!='anthropic-hard-constraints-v3'
        ):
            raise ValueError(f'Legacy or weakly-reviewed authoring cache must be quarantined: {target}')
        return key, 'cached', count
    references=official_references(domain,subdomain)
    fields = {'question_en': {'type':'string'}, 'options_en': {'type':'array','items': {'type':'string'}},
              'correct_answers': {'type':'array','items': {'type':'string'}},
              'rationales_en': {'type':'array','items': {'type':'string'}},
              'source_ref': {'type':'string','enum':[ref['url'] for ref in references]}}
    settings = ['a migration with a strict rollback condition', 'a latency budget and failure fallback',
                'a scoped credential and untrusted user input', 'a staging-to-production release with audit logs',
                'a multi-team deployment with conflicting constraints', 'a long conversation with noisy tool results',
                'a partner integration with version drift', 'an evidence-based quality review']
    guidance = {
        'certification': CODE + ' — non-official practice questions',
        'domain': domain, 'subdomain': subdomain, 'count': count,
        'distribution': f'EXACTLY {count-multiple} single-answer and {multiple} multiple-answer questions. Multi-answer questions need 5-6 options and 2-3 correct answers. For other questions use 4 options.',
        'distinct_scenario_settings_in_order': [settings[(offset + i) % len(settings)] for i in range(count)],
        'reference_scenarios_for_difficulty_and_style_ONLY': examples,
        'verified_Anthropic_references_FOR_PRODUCT_FACTS': references,
        'mandatory_feasibility_checks': 'Before writing each item, ensure at least one answer satisfies EVERY hard constraint in the scenario. Never make a correct answer override managed denies using local settings or subagent configuration. Custom customer functions execute as client tools on application-controlled infrastructure, not automatically as Anthropic-hosted server tools. A hook that denies ONE tool call does not halt the entire Claude Agent SDK run or automatically roll back: stopping and rollback need explicit application logic. Tool timeouts do not guarantee a sub-second complete Claude model response. If constraints leave no feasible answer, change the scenario instead of inventing a capability.',
        'official_certification_expectation': OFFICIAL['certificationPage']['summary'] if CODE=='CCAR-F' else OFFICIAL['programme']['summary'],
        'course_content_primary_reference': course_excerpt(domain, subdomain),
    }
    messages = [
        {'role':'system','content': ('You are an expert author of difficult, ORIGINAL practice assessments for the ANTHROPIC CLAUDE certification identified in the input. EVERY question stem must explicitly NAME an Anthropic product or technology (Claude, Claude Code, Claude API, MCP, Messages API, Agent SDK, or a named Claude model) and its choices must require a real product-specific decision, NOT generic AI theory with a decorative product mention. Use the verified Anthropic references as the authority for product facts; the course excerpt supplies learning context, and the official documentation prevails if they differ. Cite EXACTLY ONE of the supplied reference URLs in source_ref for each item. Do not assume an undocumented permission, hook, model, SDK or API behavior; avoid version-dependent claims when the reference is silent. Match the complexity of the CertSafari scenarios: require 2-3 interacting constraints, a concrete failure signal, a tradeoff between plausible implementations, and a defensible best option or exact multi-select set. Do not copy, closely paraphrase, or reuse actors, facts, wording, choices or answers from the partner samples. Use a DIFFERENT decision type and the distinct setting assigned to each of the four items; avoid repeated SLA/latency situations. No definition-recall, slogans, or trivially implausible distractors. Every wrong choice needs its own specific technical explanation; explain every correct option as well. First select correct_answers as UPPERCASE OPTION LETTERS like ["A"] or ["A","C"], then write rationales_en in EXACT options_en order: EACH correct option rationale MUST start with "Correct:" and EACH other one MUST start with "Incorrect:". Double-check every answer letter against its corresponding option and rationale before responding. These are NOT official Anthropic exam questions. Return JSON only.')},
        {'role':'user','content': json.dumps(guidance, ensure_ascii=False)},
    ]
    last_error = None
    for revision in range(3):
        try:
            result = api_call(messages, schema(fields), max_tokens=11500)
            validate_authored(result['items'], count, multiple)
            if any(item['source_ref'] not in {ref['url'] for ref in references} for item in result['items']):
                raise ValueError('Source reference does not match the supplied Anthropic references')
            if os.environ.get('CERTSAFARI_LLM_PROVIDER')=='manus':
                review_official_batch(result['items'],references)
                result['editorialReview']={'model':'gpt-5','standard':'anthropic-hard-constraints-v3','passed':True}
            result['model'] = MODEL
            target.parent.mkdir(parents=True, exist_ok=True)
            temp = target.with_suffix('.tmp')
            temp.write_text(json.dumps(result, ensure_ascii=False, indent=2) + '\n'); temp.replace(target)
            return key, 'created', count
        except Exception as error:
            last_error = error
            messages.append({'role':'user','content': f'Failed validation: {str(error)[:200]}. Regenerate exactly {count} complete original scenarios: {count-multiple} single-answer and {multiple} multi-answer. Answer letters only.'})
    raise RuntimeError(f'{key}: {last_error}')


def validate_translation(originals, translations):
    if not isinstance(translations,list) or len(translations)!=len(originals): raise ValueError('Translation count')
    for original,translated in zip(originals,translations):
        n=len(original['choices'])
        if len(translated['options_fr'])!=n or len(translated['rationales_fr'])!=n: raise ValueError('Option count changed')
        if len(translated['question_fr'].strip())<25: raise ValueError('Question translation missing')
        if any(not text.strip() for text in translated['options_fr']): raise ValueError('Option translation missing')
        if any(len(text.strip())<25 for text in translated['rationales_fr']): raise ValueError('Rationale translation missing')
        # Regex/code punctuation can be the *entire* difference between two
        # answers (e.g. ^mcp__ versus mcp__*). Do not erase it here.
        distinct=[re.sub(r'\s+', ' ', text.strip()).casefold() for text in translated['options_fr']]
        if len(set(distinct))<n: raise ValueError('Duplicate translated option')


def translate_one(job):
    index, batch = job
    folder = 'translations' if SOURCE_KIND == 'partner' else 'generated-translations'
    target = WORK / folder / f'{index:04}.json'
    if target.exists():
        existing=json.loads(target.read_text());validate_translation(batch,existing['items']);return index,'cached',len(batch)
    fields={'question_fr': {'type':'string'}, 'options_fr': {'type':'array','items': {'type':'string'}},
            'rationales_fr': {'type':'array','items': {'type':'string'}}}
    payload=[{'id':item['id'],'question_en':item['question']['en'],
              'options_en':[c['text']['en'] for c in item['choices']],
              'rationales_en':[c['rationale']['en'] for c in item['choices']]} for item in batch]
    messages=[
      {'role':'system','content': ('Translate technical English practice-exam questions, answer options and each option-specific explanation into accurate, natural French. Preserve technical product names (Claude, Claude Code, MCP, Messages API), HTTP codes, API identifiers, code fragments and negation. Preserve order, number of choices, intended correctness and all details. In particular, when English options differ subtly, retain that precise difference in French: options must remain distinct, never merge them into the same French sentence. Short choices such as "No" may remain short. Do not answer or edit facts. Return exactly one item per input in input order; JSON only.')},
      {'role':'user','content': json.dumps(payload,ensure_ascii=False)},
    ]
    last_error=None
    for revision in range(3):
        try:
            result=api_call(messages,schema(fields),max_tokens=17000)
            validate_translation(batch,result['items'])
            result['model'] = MODEL
            target.parent.mkdir(parents=True,exist_ok=True)
            temp=target.with_suffix('.tmp');temp.write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n');temp.replace(target)
            return index,'created',len(batch)
        except Exception as error:
            last_error=error
            messages.append({'role':'user','content':f'Failed translation validation: {str(error)[:200]}. Return complete translations for all {len(batch)} items in order.'})
    raise RuntimeError(f'translation batch {index}: {last_error}')


def run_jobs(jobs, runner, workers, limit):
    if limit: jobs=jobs[:limit]
    print(f'START {CERT} {len(jobs)} batches with {workers} {MODEL} workers',flush=True)
    errors=[];done=0
    with futures.ThreadPoolExecutor(max_workers=workers) as executor:
        tasks={executor.submit(runner,job):job for job in jobs}
        for future in futures.as_completed(tasks):
            done+=1
            try:
                key,status,count=future.result();print(f'PROGRESS {CERT} {done}/{len(jobs)} {key} {status} {count}',flush=True)
            except Exception as error:
                errors.append(str(error));print(f'PROGRESS {CERT} {done}/{len(jobs)} FAILED {str(error)[:250]}',flush=True)
    if errors:raise RuntimeError(f'{len(errors)} batches failed: {errors[:8]}')


def main():
    global CERT, CODE, SOURCE, WORK, SOURCE_KIND, MODEL
    parser=argparse.ArgumentParser();parser.add_argument('mode',choices=('generate','translate'))
    parser.add_argument('--cert',choices=CERTS,required=True)
    parser.add_argument('--source',choices=('partner','generated'),default='partner')
    parser.add_argument('--workers',type=int,default=4);parser.add_argument('--limit-batches',type=int,default=0)
    args=parser.parse_args(); CERT,CODE=CERTS[args.cert]; WORK=BASE/args.cert; SOURCE_KIND=args.source
    if os.environ.get('CERTSAFARI_LLM_PROVIDER') == 'manus':
        MODEL = 'gpt-5' if args.mode == 'generate' else 'gpt-5-mini'
    if args.mode == 'generate' and args.source != 'partner': parser.error('Generation is always grounded in the partner source')
    source_path = BASE/f'partner-{args.cert}.json' if args.source == 'partner' else WORK/'generated-questions.json'
    SOURCE=json.loads(source_path.read_text())
    if args.mode=='generate':
        jobs=prepare_batches();print('TARGET',CERT,len(SOURCE),'SUBDOMAINS',len({j[2] for j in jobs}),flush=True)
        run_jobs(jobs,author_one,args.workers,args.limit_batches)
    else:
        jobs=list(enumerate([SOURCE[i:i+4] for i in range(0,len(SOURCE),4)]))
        run_jobs(jobs,translate_one,args.workers,args.limit_batches)

if __name__=='__main__': main()
