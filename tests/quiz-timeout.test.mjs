import test from 'node:test';
import assert from 'node:assert/strict';
import { createGame, submitAnswer, submitTimeout, advanceGame, summarizeGame } from '../public/js/quiz-engine.mjs';
const bank = Array.from({length:10},(_,i)=>({id:`q${i}`,question:`問題${i}`,options:['A','B','C','D'],correctIndex:1,explanation:'解析'}));
const initial = () => createGame(bank, '玩家', 'mixed','easy');
test('逾時不計分且保留 null 選項與 timedOut',()=>{
 const game=submitTimeout(initial());
 assert.equal(game.score,0); assert.equal(game.phase,'feedback');
 assert.deepEqual(game.answers[0],{questionId:'q0',chosenIndex:null,correct:false,timedOut:true});
});
test('同一題逾時後禁止答題或再次逾時',()=>{
 const game=submitTimeout(initial());
 assert.throws(()=>submitTimeout(game),/已提交/);
 assert.throws(()=>submitAnswer(game,1),/已提交/);
});
test('作答後禁止逾時覆寫答題與分數',()=>{
 const game=submitAnswer(initial(),1);
 assert.equal(game.score,100);
 assert.throws(()=>submitTimeout(game),/已提交/);
});
test('答對、答錯與逾時混合計算，結算正確區分',()=>{
 let game=initial();
 for(let i=0;i<10;i++){
   game=i<3?submitTimeout(game):submitAnswer(game,i<7?1:0);
   game=advanceGame(game);
 }
 const result=summarizeGame(game);
 assert.equal(result.correct,4);assert.equal(result.timedOut,3);assert.equal(result.score,400);
 assert.equal(result.accuracy,40);assert.equal(result.review[0].chosenIndex,null);
 assert.equal(result.review[0].timedOut,true);
 assert.equal(result.review[7].timedOut,false);
});
