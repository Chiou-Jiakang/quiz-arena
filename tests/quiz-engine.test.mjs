import test from 'node:test';
import assert from 'node:assert/strict';
import { createGame, submitAnswer, advanceGame, summarizeGame } from '../public/js/quiz-engine.mjs';
const bank = Array.from({length:10}, (_,i) => ({id:`q${i}`,question:`題目${i}`,options:['A','B','C','D'],correctIndex:1,explanation:'解析'}));
const start = () => createGame(bank,'Player01','mixed','easy');
test('開局必須十題且沒有重複 ID',()=>{
 assert.throws(()=>createGame(bank.slice(0,9),'P','mixed','easy'),/十道/);
 assert.throws(()=>createGame([...bank.slice(0,9),bank[0]],'P','mixed','easy'),/不重複/);
 assert.equal(start().questions.length,10);
});
test('暱稱不可空白或超過 20 字元',()=>{
 assert.throws(()=>createGame(bank,'   ','mixed','easy'),/暱稱/);
 assert.throws(()=>createGame(bank,'A'.repeat(21),'mixed','easy'),/暱稱/);
});
test('回答正確加 100；回答錯誤不加分',()=>{
 const correct=submitAnswer(start(),1);
 assert.equal(correct.score,100);assert.equal(correct.answers[0].correct,true);
 const wrong=submitAnswer(start(),0);
 assert.equal(wrong.score,0);assert.equal(wrong.answers[0].correct,false);
});
test('不可重複提交，同題未回答不能前進',()=>{
 assert.throws(()=>advanceGame(start()),/請先/);
 assert.throws(()=>submitAnswer(submitAnswer(start(),1),1),/已提交/);
});
test('無效索引被拒絕',()=>{
 for(const n of [-1,4,1.5,'1'])assert.throws(()=>submitAnswer(start(),n),/索引/);
});
test('第十題後正確結束；得分與逐題紀錄一致',()=>{
 let game=start();
 for(let i=0;i<10;i++){game=submitAnswer(game,i%2?0:1);game=advanceGame(game);}
 assert.equal(game.phase,'finished');
 const result=summarizeGame(game);
 assert.equal(result.score,500);assert.equal(result.correct,5);assert.equal(result.accuracy,50);assert.equal(result.review.length,10);
 assert.throws(()=>submitAnswer(game,1),/已結束/);
 assert.throws(()=>advanceGame(game),/請先/);
});
test('未結束遊戲不可取出結算結果',()=>assert.throws(()=>summarizeGame(start()),/尚未/));
