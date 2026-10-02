#!/usr/bin/env python3
"""Upgrade cached Manus-authored items to the current technical-review standard.

Private source and work files remain outside this repository. Never publish an
unreviewed batch or silently reuse a failed batch. Usage:
  CERTSAFARI_LLM_PROVIDER=manus python3 scripts/review_certsafari_cached_banks.py
"""
import concurrent.futures as futures
import importlib.util
import json
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
spec=importlib.util.spec_from_file_location('authoring',ROOT/'scripts/build_certsafari_anthropic_claude.py')
gen=importlib.util.module_from_spec(spec);spec.loader.exec_module(gen)
BASE=gen.BASE
STANDARD='certsafari-parity-v5'


def jobs():
    result=[]
    for name,(cert,code) in gen.CERTS.items():
        gen.CERT,gen.CODE,gen.WORK=cert,code,BASE/name
        gen.SOURCE=json.loads((BASE/f'partner-{name}.json').read_text())
        for key,domain,subdomain,count,multiple,*_ in gen.prepare_batches():
            path=gen.WORK/'generated-batches'/f'{key}.json'
            if path.exists():result.append((name,path,gen.official_references(domain,subdomain),gen.course_excerpt(domain,subdomain),count,multiple))
        if name=='architect_foundations':
            for family,plan in gen.PLAN['certifications'][cert]['scenarioFamilies'].items():
                path=gen.WORK/'scenario-batches'/f'{family}.json'
                if path.exists():result.append((name,path,gen.official_references(plan['domain'],family.replace('_',' ')),gen.course_excerpt(plan['domain'],family.replace('_',' ')),6,0))
    return result


def quarantine(name,path,reason):
    relative=path.relative_to(BASE/name)
    destination=BASE/'rejected-batches/failed-review-v5'/name/relative
    destination.parent.mkdir(parents=True,exist_ok=True)
    # Distinct files are never overwritten; a repeated failure remains visible.
    if destination.exists(): destination=destination.with_name(destination.stem+'-second'+destination.suffix)
    path.rename(destination)
    return {'certification':name,'filename':str(relative),'status':'rejected','issue':str(reason)[:440]}


def one(job):
    name,path,refs,course_context,count,multiple=job
    data=json.loads(path.read_text())
    if data.get('editorialReview',{}).get('standard') in ('anthropic-hard-constraints-v4',STANDARD):return {'certification':name,'filename':path.name,'status':'already-reviewed'}
    try:
        if data.get('model')!='gpt-5':raise ValueError('Authored by an older model; not an original Manus batch')
        gen.validate_authored(data['items'],count,multiple)
        gen.review_official_batch(data['items'],refs,course_context)
        data['editorialReview']={'model':'gpt-5','standard':STANDARD,'passed':True}
        temporary=path.with_suffix('.tmp')
        temporary.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n')
        temporary.replace(path)
        return {'certification':name,'filename':path.name,'status':'reviewed'}
    except Exception as error:
        return quarantine(name,path,error)


def main():
    report=[]
    with futures.ThreadPoolExecutor(max_workers=4) as executor:
        work=[executor.submit(one,job) for job in jobs()]
        for future in futures.as_completed(work):
            result=future.result();report.append(result)
            print('REVIEW',result['certification'],result['filename'],result['status'],result.get('issue','')[:155],flush=True)
    target=BASE/'cached-review-v5-results.json'
    target.write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
    print('SUMMARY',json.dumps({status:sum(x['status']==status for x in report) for status in ('reviewed','already-reviewed','rejected')}),flush=True)


if __name__=='__main__':main()
