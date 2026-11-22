const team=TEAMS.find(t=>t.id===document.body.dataset.team)||TEAMS[0];
const $=id=>document.getElementById(id);
document.body.style.setProperty('--team',team.color);
document.body.style.setProperty('--soft',team.soft);
document.title=team.name+' 응원가 타이핑';
$('teamName').textContent=team.name+' 응원가 타이핑';
$('youtubeLink').href='https://www.youtube.com/results?search_query='+encodeURIComponent(team.name+' 응원가');

const defaultSongs=team.id==='lotte'?[{title:'부산갈매기',lyrics:'지금은 그 어디서 내 생각 잊었는가\n꽃처럼 어여쁜 그 이름도 고왔던 순이 순이야\n파도치는 부둣가에 지나간 일들이 가슴에 남았는데\n부산 갈매기 부산 갈매기 너는 정녕 나를 잊었나\n\n지금은 그 어디서 내 모습 잊었는가\n꽃처럼 어여쁜 그 이름도 고왔던 순이 순이야\n그리움이 물결치며 오늘도 못잊어 네 이름 부르는데\n부산 갈매기 부산 갈매기 너는 벌써 나를 잊었나'},{title:'윤동희 응원가',lyrics:'롯데의 (Hey!) 윤동희~ 쌔리라 안타 쌔리라~\n최강롯데 자이언츠 윤동희~ (안타!)\n최강롯데 자이언츠 윤동희~ (안타!)'},{title:'영원하라',lyrics:'자~ 롯데의 승리 위해\n소리 높여 외쳐보자\n최~강 롯데 자이언츠\n최~강 롯데 자이언츠\n아~ 롯데는 승리한다\n최!강!롯!데!\n최~강 롯데 자이언츠\n최~강 롯데 자이언츠\n아~ 롯데는 승리하리라~'}]:[];
let songs=[...defaultSongs,...JSON.parse(localStorage.getItem('songs-'+team.id)||'[]')];
let selected=0,started=false,timer=null,countTimer=null,timeLeft=60,mode='60',lineIndex=0,lines=[],correct=0,typed=0,startedAt=0,composition=false;
const input=$('typingInput');
const esc=s=>s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function renderSongs(){
 $('songList').innerHTML=songs.length?songs.map((s,i)=>`<button class="song-item ${i===selected?'selected':''}" data-i="${i}"><span class="song-num">${i+1}.</span><b>${esc(s.title)}</b><span class="song-arrow">${i===selected?'●':'›'}</span></button>`).join(''):'<p class="empty-note">응원가를 추가해 주세요!</p>';
 document.querySelectorAll('.song-item').forEach(b=>b.onclick=()=>{selected=+b.dataset.i;resetGame();renderSongs()});
}
function currentLine(){return lines[lineIndex]??''}
function renderLyrics(){
 const target=currentLine(),v=input.value;let html='';
 for(let i=0;i<target.length;i++){const c=i<v.length?(v[i]===target[i]?'done':'wrong'):(i===v.length?'current':'');html+=`<span class="${c}">${target[i]===' '?'&nbsp;':esc(target[i])}</span>`}
 $('lyrics').innerHTML=html||'<span class="line-placeholder">(빈 줄)</span>';
 $('lineProgress').textContent=`${Math.min(lineIndex+1,lines.length)} / ${lines.length}줄`;
}
function elapsedMinutes(){return Math.max((Date.now()-startedAt)/60000,1/60)}
function stats(){
 const accuracy=typed?correct/typed:1;
 $('accuracy').textContent=Math.round(accuracy*100)+'%';
 $('average').textContent='.'+String(Math.round(accuracy*1000)).padStart(3,'0');
 $('speed').textContent=started?Math.round(typed/elapsedMinutes())+' 타/분':'0 타/분';
}
function clearTimers(){clearInterval(timer);clearTimeout(countTimer);timer=null;countTimer=null}
function resetGame(){
 clearTimers();started=false;mode=$('timeMode').value;timeLeft=mode==='unlimited'?0:(mode==='custom'?Math.max(1,Number($('customTime').value)||90):Number(mode));lineIndex=0;correct=0;typed=0;startedAt=0;composition=false;
 lines=(songs[selected]?.lyrics||'').split(/\r?\n/);
 input.value='';input.disabled=true;$('time').textContent=mode==='unlimited'?'∞':timeLeft+'초';$('lastKey').textContent='-';
 document.querySelectorAll('.key').forEach(k=>k.classList.remove('active'));
 $('resultOverlay').classList.add('hidden');$('countOverlay').classList.add('hidden');stats();renderLyrics();
}
function finish(){clearTimers();started=false;input.disabled=true;stats();$('resultTitle').textContent='응원 연습 완료!';$('resultAccuracy').textContent=$('accuracy').textContent;$('resultCorrect').textContent=correct+'자';$('resultSpeed').textContent=$('speed').textContent;$('resultOverlay').classList.remove('hidden')}
function advanceLine(){
 const target=currentLine(),value=input.value;typed+=value.length;
 for(let i=0;i<Math.min(value.length,target.length);i++)if(value[i]===target[i])correct++;
 if(lineIndex>=lines.length-1){finish();return}
 lineIndex++;input.value='';renderLyrics();stats();input.focus();
}
function countdown(){
 if(!songs.length){$('songModal').classList.remove('hidden');return}
 resetGame();$('countOverlay').classList.remove('hidden');let n=3;$('countNumber').textContent='3';
 function step(){if(n>1){n--;$('countNumber').textContent=n;countTimer=setTimeout(step,850)}else{$('countNumber').textContent='시작!!';countTimer=setTimeout(()=>{$('countOverlay').classList.add('hidden');started=true;startedAt=Date.now();input.disabled=false;input.focus();timer=setInterval(()=>{if(mode==='unlimited'){stats();return}timeLeft--;$('time').textContent=timeLeft+'초';stats();if(timeLeft<=0)finish()},1000)},650)}}
 countTimer=setTimeout(step,850);
}
input.addEventListener('compositionstart',()=>composition=true);
input.addEventListener('compositionend',()=>{composition=false;renderLyrics();});
input.addEventListener('input',()=>{if(!started)return;renderLyrics();stats()});
input.addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.isComposing&&!composition){e.preventDefault();advanceLine()}});
const hangulKeys={KeyQ:'ㅂ',KeyW:'ㅈ',KeyE:'ㄷ',KeyR:'ㄱ',KeyT:'ㅅ',KeyY:'ㅛ',KeyU:'ㅕ',KeyI:'ㅑ',KeyO:'ㅐ',KeyP:'ㅔ',KeyA:'ㅁ',KeyS:'ㄴ',KeyD:'ㅇ',KeyF:'ㄹ',KeyG:'ㅎ',KeyH:'ㅗ',KeyJ:'ㅓ',KeyK:'ㅏ',KeyL:'ㅣ',KeyZ:'ㅋ',KeyX:'ㅌ',KeyC:'ㅊ',KeyV:'ㅍ',KeyB:'ㅠ',KeyN:'ㅜ',KeyM:'ㅡ'};
function showVirtualKey(e){
 if(e.ctrlKey||e.metaKey||e.altKey||e.key==='Shift')return;
 let code=e.code;
 if(!code||code==='Unidentified'){
   const key=String(e.key||'').toLowerCase();
   if(key===' ')code='Space';
   else if(/^[a-z]$/.test(key))code='Key'+key.toUpperCase();
 }
 const label=code==='Space'?'SPACE':(hangulKeys[code]?(hangulKeys[code]+' / '+String(e.key||'').toUpperCase()):String(e.key||'').toUpperCase());
 if(label)$('lastKey').textContent=label;
 document.querySelectorAll('.key').forEach(k=>k.classList.toggle('active',k.dataset.code===code));
}
document.addEventListener('keydown',showVirtualKey,true);
input.addEventListener('keydown',showVirtualKey,true);
$('startBtn').onclick=countdown;
$('timeMode').addEventListener('change',resetGame);
$('addSongBtn').onclick=()=>$('songModal').classList.remove('hidden');
function closeSong(){$('songModal').classList.add('hidden')}
$('cancelSong').onclick=closeSong;$('cancelSong2').onclick=closeSong;
$('saveSong').onclick=()=>{const title=$('songTitle').value.trim(),lyrics=$('songLyrics').value.trim();if(!title||!lyrics){alert('제목과 가사를 모두 입력해 주세요.');return}songs.push({title,lyrics});localStorage.setItem('songs-'+team.id,JSON.stringify(songs.slice(defaultSongs.length)));selected=songs.length-1;$('songTitle').value='';$('songLyrics').value='';closeSong();resetGame();renderSongs()};
$('resultRetry').onclick=()=>{resetGame();countdown()};$('closeResult').onclick=()=>$('resultOverlay').classList.add('hidden');
const keyRows=[['qwertyuiop','ㅂㅈㄷㄱㅅㅛㅕㅑㅐㅔ'],['asdfghjkl','ㅁㄴㅇㄹㅎㅗㅓㅏㅣ'],['zxcvbnm','ㅋㅌㅊㅍㅠㅜㅡ']];
$('keyboard').innerHTML=keyRows.map(([en,ko])=>`<div class="key-row">${[...en].map((k,i)=>`<span class="key" data-code="Key${k.toUpperCase()}"><b>${ko[i]}</b><small>${k.toUpperCase()}</small></span>`).join('')}</div>`).join('')+'<div class="key-row"><span class="key space-key" data-code="Space"><b>띄어쓰기</b><small>SPACE</small></span><span class="key enter-key" data-code="Enter"><b>다음 줄</b><small>ENTER ↵</small></span></div>';
renderSongs();resetGame();
