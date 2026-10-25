/* Hugo가 빌드한 /search-index.json을 로드하는 클라이언트 검색. 외부 API 불필요. */
(() => {
  const input = document.querySelector('[data-search-input]');
  if (!input) return;
  const status = document.querySelector('[data-search-status]');
  const results = document.querySelector('[data-search-results]');
  let posts = [];
  const normal = s => String(s ?? '').toLocaleLowerCase().normalize('NFKC');
  const tagText = value => Array.isArray(value) ? value.join(' ') : String(value || '');
  const render = () => {
    const q = normal(input.value).trim();
    results.replaceChildren();
    if (!q) { status.textContent = '검색어를 입력하세요.'; return; }
    const words = q.split(/\s+/);
    const matched = posts.map(post => {
      const title = normal(post.title), tags = normal(tagText(post.tags)), cat = normal(tagText(post.categories));
      const body = normal(post.content + ' ' + post.summary);
      if (!words.every(w => (title + ' ' + tags + ' ' + cat + ' ' + body).includes(w))) return null;
      const score = words.reduce((n,w) => n + (title.includes(w)?5:0)+(tags.includes(w)?3:0)+(cat.includes(w)?3:0)+(body.includes(w)?1:0),0);
      return {post,score};
    }).filter(Boolean).sort((a,b)=>b.score-a.score || b.post.date.localeCompare(a.post.date)).slice(0,100);
    status.textContent = `${matched.length}개 검색 결과${matched.length === 100 ? ' (최대 100건 표시)' : ''}`;
    for (const {post} of matched) {
      const card = document.createElement('article'); card.className = 'surface p-5';
      const link = document.createElement('a'); link.href = post.url; link.className = 'text-lg font-semibold link'; link.textContent = post.title;
      const desc = document.createElement('p'); desc.className = 'mt-2 text-sm leading-7 muted'; desc.textContent = post.summary;
      card.append(link,desc); results.append(card);
    }
  };
  input.addEventListener('input', render);
  fetch(input.dataset.indexUrl).then(r => {if(!r.ok) throw Error('HTTP ' + r.status);return r.json();}).then(data=>{posts=data;render();}).catch(()=>{status.textContent='검색 인덱스를 불러오지 못했습니다. Hugo 빌드와 URL 설정을 확인하세요.';});
})();