/** Kept as the default adapter for v0.4.0-compatible unit tests. */
export function createMemoryStore() {
  const games = new Map();
  const results = new Map();
  return {
    persistence:'memory',
    create(s){games.set(s.id,structuredClone(s));},
    get(id){const s=games.get(id);return s?structuredClone(s):null;},
    save(s){if(!games.has(s.id))throw new Error('場次不存在');games.set(s.id,structuredClone(s));
      if(s.phase==='finished'&&!results.has(s.id)){
        const correct=s.answers.filter(x=>x.correct).length;
        results.set(s.id,{id:s.id,player:s.player,category:s.category,difficulty:s.difficulty,score:s.score,
          correct,timedOut:s.answers.filter(x=>x.timedOut).length,accuracy:Math.round(correct/s.questions.length*100),
          completedAt:s.lastSeen,review:s.questions.map((q,i)=>({...q,...s.answers[i]}))});
      }
    },
    delete(id){return games.delete(id);},
    prune(cutoff){for(const [id,s] of games)if(s.phase!=='finished'&&s.lastSeen<cutoff)games.delete(id);},
    count(){return [...games.values()].filter(s=>s.phase!=='finished').length;},
    listResults(limit=20){return [...results.values()].sort((a,b)=>b.completedAt-a.completedAt).slice(0,limit).map(({review,...v})=>v);},
    leaderboard(limit=10){return [...results.values()].sort((a,b)=>b.score-a.score||b.accuracy-a.accuracy||a.completedAt-b.completedAt||a.id.localeCompare(b.id)).slice(0,limit).map(({review,...v})=>v);},
    result(id){const x=results.get(id);return x?structuredClone(x):null;},
    close(){}
  };
}
