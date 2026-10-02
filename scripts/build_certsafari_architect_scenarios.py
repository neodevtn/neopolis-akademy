#!/usr/bin/env python3
"""Write six coherent, original, verified Anthropic CCAR-F scenario families."""
import concurrent.futures as futures
import importlib.util
import json
import os
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location('anthropic_bank', ROOT / 'scripts/build_certsafari_anthropic_claude.py')
gen = importlib.util.module_from_spec(spec)
spec.loader.exec_module(gen)
gen.CERT, gen.CODE = gen.CERTS['architect_foundations']
gen.WORK = gen.BASE/'architect_foundations'
gen.SOURCE = json.loads((gen.BASE/'partner-architect_foundations.json').read_text())
if os.environ.get('CERTSAFARI_LLM_PROVIDER') == 'manus': gen.MODEL='gpt-5'
plans = gen.PLAN['certifications'][gen.CERT]['scenarioFamilies']
settings = {
 'research_coordination': 'Coordinate Claude Agent SDK subagents over an evidence-based research workflow with delegated tool access and approvals',
 'migration_control': 'Stage a Claude-based migration with a rollback gate and explicit human approval for irreversible steps',
 'support_mcp': 'Connect a Claude support agent to least-privilege account-lookup tools over a remote MCP server',
 'code_rollout': 'Roll out Claude Code repository automation across local developers, CI, and production policy boundaries',
 'structured_intake': 'Implement Claude API structured outputs for a high-volume intake pipeline with schema validation and source checking',
 'long_context_review': 'Review long regulatory documents with Claude, context management, grounded citations and escalation',
}


def run_one(family,plan):
    target=gen.WORK/'scenario-batches'/f'{family}.json'
    domain=plan['domain'];subdomain=family.replace('_',' ')
    references=gen.official_references(domain,subdomain)
    if target.exists():
        cached=json.loads(target.read_text())
        gen.validate_authored(cached['items'],6,0)
        if cached.get('model')!='gpt-5' or cached.get('editorialReview',{}).get('standard') not in ('anthropic-hard-constraints-v4','certsafari-parity-v5') or not all(item.get('source_ref') in gen.OFFICIAL_URLS for item in cached['items']):
            raise ValueError('Unsourced legacy scenario cache must be quarantined before reuse')
        return family,'cached'
    records=[q for q in gen.SOURCE if q['domain']==domain]
    examples=[]
    for q in records[:2]:
        examples.append({'scenario':q['question']['en'],
                         'options':[choice['text']['en'] for choice in q['choices']],
                         'correct_answers':q['correctChoiceIds'],
                         'option_specific_explanations':[choice['rationale']['en'] for choice in q['choices']]})
    fields={'question_en':{'type':'string'},'options_en':{'type':'array','items':{'type':'string'}},
            'correct_answers':{'type':'array','items':{'type':'string'}},
            'rationales_en':{'type':'array','items':{'type':'string'}},
            'source_ref':{'type':'string','enum':[ref['url'] for ref in references]}}
    guidance={'family':family,'common_scenario':settings[family],'domain':domain,
              'count':6,'distribution':'6 single-answer, 0 multi-answer',
              'verified_Anthropic_product_references':references,
              'mandatory_feasibility_checks':'At least one answer MUST satisfy every explicit constraint. A managed deny cannot be lifted by a subagent or local mode; a custom customer tool remains a client tool executed by the application, not an Anthropic server tool. Prompt caching stores input prefixes, not generated responses, and TTL expiry is not an application rollback mechanism. If requirements conflict with every option, revise the scenario.',
              'official_CCArF_focus':gen.OFFICIAL['certificationPage']['summary'],
              'course_content_primary_reference':gen.course_excerpt(domain,subdomain),
              'partner_question_choice_explanation_examples_FOR_COMPLEXITY_NOT_COPYING':examples}
    messages=[
      {'role':'system','content':('Author six ORIGINAL, CHALLENGING, NON-OFFICIAL CCAR-F practice items centered on a coherent ANTHROPIC CLAUDE product deployment. Every question stem MUST explicitly name Claude, Claude Code, the Claude API, the Agent SDK, or MCP and be self-contained because items can appear independently in random order. Cite exactly one supplied verified Anthropic URL in source_ref per item; only state product behaviors supported by THAT page. Application-enforced controls are allowed if explicitly labeled as application code; do not imply Anthropic provides a built-in feature from another page. Assess six DIFFERENT decisions across architecture, implementation, tool safety, measurable evaluation, recovery and governance; each requires compatible constraints and a plausible tradeoff, not impossible SLA promises. Partner Q/R demonstrate complexity and rationale style only: do not copy or lightly paraphrase text, facts, choices or answers. Do not invent product capabilities or conflicting interpretations of permissions. Four credible options, EXACTLY one uppercase letter in correct_answers per item. rationales_en follow option order: each correct option starts "Correct:" and each other option "Incorrect:", followed by a specific technical explanation. Check each key and explanation align. Return JSON only.')},
      {'role':'user','content':json.dumps(guidance,ensure_ascii=False)}]
    error=None
    for _ in range(5):
        try:
            content=gen.api_call(messages,gen.schema(fields),max_tokens=19000)
            gen.validate_authored(content['items'],6,0)
            if os.environ.get('CERTSAFARI_LLM_PROVIDER')=='manus':
                gen.review_official_batch(content['items'],references,gen.course_excerpt(domain,subdomain))
                content['editorialReview']={'model':'gpt-5','standard':'certsafari-parity-v5','passed':True}
            content['model']=gen.MODEL
            target.parent.mkdir(parents=True,exist_ok=True)
            temp=target.with_suffix('.tmp')
            temp.write_text(json.dumps(content,ensure_ascii=False,indent=2)+'\n')
            temp.replace(target)
            return family,'created'
        except Exception as exc:
            error=exc
            messages.append({'role':'user','content':f'Validation failure: {str(exc)[:920]}. Regenerate exactly SIX independent Anthropic-specific single-answer scenarios with realistic, documented constraints.'})
    raise RuntimeError(f'{family}: {error}')


def main():
    errors=[]
    with futures.ThreadPoolExecutor(max_workers=2) as executor:
        tasks=[executor.submit(run_one,family,plan) for family,plan in plans.items()]
        for task in futures.as_completed(tasks):
            try:print('SCENARIO',*task.result(),flush=True)
            except Exception as exc:
                errors.append(str(exc))
                print('FAILED',str(exc)[:250],flush=True)
    if errors:raise RuntimeError(str(errors))


if __name__=='__main__':main()
