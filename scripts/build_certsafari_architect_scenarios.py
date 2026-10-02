#!/usr/bin/env python3
"""Generate six fresh, self-contained CCAR-F scenario families with Claude Sonnet."""
import concurrent.futures as futures
import importlib.util
import json
from pathlib import Path
import time

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location('anthropic_bank', ROOT / 'scripts/build_certsafari_anthropic_claude.py')
gen = importlib.util.module_from_spec(spec);spec.loader.exec_module(gen)
gen.CERT, gen.CODE = gen.CERTS['architect_foundations']
gen.WORK = gen.BASE/'architect_foundations'
gen.SOURCE = json.loads((gen.BASE/'partner-architect_foundations.json').read_text())
plans = gen.PLAN['certifications'][gen.CERT]['scenarioFamilies']
settings = {
 'research_coordination': 'a multi-team technical research team coordinating subagents with scoped evidence and approvals',
 'migration_control': 'a staged data migration with rollback and a human approval gate',
 'support_mcp': 'a support agent connecting to a least-privilege MCP tool server for account lookup',
 'code_rollout': 'a repository automation rollout across local, CI and production contexts',
 'structured_intake': 'a high-volume intake pipeline requiring schema validation, source links and retry boundaries',
 'long_context_review': 'a regulated long-document review with context limits, citations and escalation',
}
fields={'question_en':{'type':'string'},'options_en':{'type':'array','items':{'type':'string'}},
        'correct_answers':{'type':'array','items':{'type':'string'}},
        'rationales_en':{'type':'array','items':{'type':'string'}}}


def run_one(family, plan):
    target = gen.WORK/'scenario-batches'/f'{family}.json'
    if target.exists():
        gen.validate_authored(json.loads(target.read_text())['items'],6,0)
        return family,'cached'
    domain=plan['domain']
    records=[q for q in gen.SOURCE if q['domain']==domain]
    msg=[
      {'role':'system','content':('You are writing six ORIGINAL difficult case-based CCAR-F architect certification practice questions, not official exam items. All six questions concern one coherent enterprise scenario yet EACH QUESTION MUST BE FULLY SELF-CONTAINED, because only three will appear in a random order. Different decisions should address architecture, safeguards, observable failure modes, trade-offs, release and recovery as appropriate. No definition recall. Use exactly four plausible options, one uppercase-letter correct_answers per question, and specific technically grounded rationales for EVERY option. Never copy or paraphrase vendor question wording or distinctive facts. Return structured JSON only.')},
      {'role':'user','content':json.dumps({'family':family,'common_scenario':settings[family],'domain':domain,'count':6,'distribution':'6 single-answer, 0 multi-answer','course_content_primary_reference':gen.course_excerpt(domain,family.replace('_',' ')),'style_examples_ONLY':[q['question']['en'] for q in records[:2]]})},
    ]
    error=None
    for _ in range(3):
      try:
        content=gen.api_call(msg,gen.schema(fields),max_tokens=19000)
        gen.validate_authored(content['items'],6,0)
        target.parent.mkdir(parents=True,exist_ok=True)
        tmp=target.with_suffix('.tmp');tmp.write_text(json.dumps(content,ensure_ascii=False,indent=2)+'\n');tmp.replace(target)
        return family,'created'
      except Exception as e:
        error=e;msg.append({'role':'user','content':f'Fix validation: {str(e)[:180]}. Return all SIX complete, self-contained single-answer scenarios.'})
    raise RuntimeError(f'{family}: {error}')

with futures.ThreadPoolExecutor(max_workers=2) as executor:
    results=[executor.submit(run_one,family,plan) for family,plan in plans.items()]
    errors=[]
    for future in futures.as_completed(results):
        try:print('SCENARIO',*future.result(),flush=True)
        except Exception as e:errors.append(str(e));print('FAILED',str(e)[:250],flush=True)
if errors:raise RuntimeError(str(errors))
