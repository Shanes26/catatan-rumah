// ── PRESETS ───────────────────────────────────────────────────────────
const PRESETS=[
  {name:'Makanan',      emoji:'🍚',bg:'var(--accent-bg)',           bar:'#34D399'},
  {name:'Sewa rumah',   emoji:'🏠',bg:'var(--blue-bg)',             bar:'#60A5FA'},
  {name:'Listrik',      emoji:'⚡',bg:'var(--amber-bg)',            bar:'#FBBF24'},
  {name:'Air',          emoji:'💧',bg:'rgba(56,189,248,0.12)',      bar:'#38BDF8'},
  {name:'Transportasi', emoji:'🚗',bg:'var(--orange-bg)',           bar:'#FB923C'},
  {name:'Kesehatan',    emoji:'💊',bg:'var(--lime-bg)',             bar:'#A3E635'},
  {name:'Pendidikan',   emoji:'📚',bg:'var(--purple-bg)',           bar:'#A78BFA'},
  {name:'Internet',     emoji:'📡',bg:'var(--teal-bg)',             bar:'#2DD4BF'},
  {name:'Hiburan',      emoji:'🎬',bg:'var(--pink-bg)',             bar:'#F472B6'},
  {name:'Tabungan',     emoji:'🏦',bg:'var(--accent-bg)',           bar:'#059669'},
  {name:'Belanja',      emoji:'🛍️',bg:'var(--pink-bg)',            bar:'#EC4899'},
  {name:'Kopi',         emoji:'☕',bg:'rgba(180,120,60,0.13)',      bar:'#B47C3C'},
  {name:'Snack',        emoji:'🍿',bg:'rgba(251,146,60,0.13)',      bar:'#FB923C'},
  {name:'Lainnya',      emoji:'📦',bg:'rgba(161,161,170,0.12)',     bar:'#71717A'},
];

const STORAGE_KEY='hfa_v4', THEME_KEY='hfa_theme';

// ── UTILS ─────────────────────────────────────────────────────────────
function todayKey(){const n=new Date();return n.getFullYear()+'-'+String(n.getMonth()+1).padStart(2,'0')}
function keyToLabel(k){const[y,m]=k.split('-');return new Date(+y,+m-1,1).toLocaleDateString('id-ID',{month:'long',year:'numeric'})}
function uid(){return Math.random().toString(36).slice(2,9)}
function newMonth(key){return{key,closed:false,incomes:[],categories:[],transactions:[]}}

// ── STATE ─────────────────────────────────────────────────────────────
function loadState(){
  try{const r=localStorage.getItem(STORAGE_KEY);if(r)return JSON.parse(r)}catch(e){}
  const tk=todayKey();
  return{currentMonthKey:tk,bannerDismissed:false,months:{[tk]:newMonth(tk)},closedHistory:[]};
}
function saveState(){try{localStorage.setItem(STORAGE_KEY,JSON.stringify(state))}catch(e){}}

let state=loadState();

function ensureMonth(k){if(!state.months[k])state.months[k]=newMonth(k);return state.months[k]}
function currentMonth(){return ensureMonth(state.currentMonthKey)}
function fmt(n){return 'Rp\u00a0'+Math.round(n).toLocaleString('id-ID')}
function pct(u,b){if(!b)return 0;return Math.min(100,Math.round((u/b)*100))}
function getPreset(name){return PRESETS.find(p=>p.name===name)||PRESETS[13]}
function totalIncome(m){return(m.incomes||[]).reduce((s,i)=>s+i.amount,0)}
function totalBudget(m){return(m.categories||[]).reduce((s,c)=>s+c.budget,0)}
function totalSpent(m){return(m.categories||[]).reduce((s,c)=>s+c.spent,0)}

// ── THEME ──────────────────────────────────────────────────────────────
function initTheme(){
  const saved=localStorage.getItem(THEME_KEY)||'dark';
  document.documentElement.setAttribute('data-theme',saved);
  updateThemeIcons(saved);
}
function toggleTheme(){
  const curr=document.documentElement.getAttribute('data-theme');
  const next=curr==='dark'?'light':'dark';
  document.documentElement.setAttribute('data-theme',next);
  localStorage.setItem(THEME_KEY,next);
  updateThemeIcons(next);
}
function updateThemeIcons(theme){
  const sun=`<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>`;
  const moon=`<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`;
  document.querySelectorAll('.icon-btn:not(.accent)').forEach(btn=>{btn.innerHTML=theme==='dark'?sun:moon});
}

// ── MONTH SELECTOR ────────────────────────────────────────────────────
function buildMonthOptions(){
  const keys=new Set(Object.keys(state.months));
  keys.add(todayKey());
  keys.add(state.currentMonthKey);
  const sorted=[...keys].sort();
  ['month-select','month-select-txn'].forEach(id=>{
    const sel=document.getElementById(id);
    if(!sel)return;
    sel.innerHTML=sorted.map(k=>`<option value="${k}"${k===state.currentMonthKey?' selected':''}>${keyToLabel(k)}</option>`).join('');
  });
  const atLatest=state.currentMonthKey>=todayKey();
  document.getElementById('month-next').disabled=atLatest;
}

function onMonthSelect(){
  state.currentMonthKey=document.getElementById('month-select').value;
  ensureMonth(state.currentMonthKey);
  saveState();render();
}
function onMonthSelectSync(id){
  state.currentMonthKey=document.getElementById(id).value;
  ensureMonth(state.currentMonthKey);
  saveState();render();
}
function prevMonth(){
  const[y,m]=state.currentMonthKey.split('-').map(Number);
  const d=new Date(y,m-2,1);
  state.currentMonthKey=d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0');
  ensureMonth(state.currentMonthKey);
  saveState();render();
}
function nextMonth(){
  if(state.currentMonthKey>=todayKey())return;
  const[y,m]=state.currentMonthKey.split('-').map(Number);
  const d=new Date(y,m,1);
  state.currentMonthKey=d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0');
  ensureMonth(state.currentMonthKey);
  saveState();render();
}

// ── AUTO DETECT NEW MONTH ──────────────────────────────────────────────
function checkNewMonth(){
  const tk=todayKey();
  const prevKeys=Object.keys(state.months).filter(k=>k<tk).sort();
  if(!prevKeys.length)return;
  const lastKey=prevKeys[prevKeys.length-1];
  const lastM=state.months[lastKey];
  if(!lastM.closed&&!state.bannerDismissed){
    const banner=document.getElementById('new-month-banner');
    document.getElementById('banner-title').textContent='🎉 Selamat datang, '+keyToLabel(tk)+'!';
    document.getElementById('banner-desc').textContent='Bulan '+keyToLabel(lastKey)+' belum ditutup. Tutup buku sekarang untuk memindahkan sisa saldo ke bulan ini.';
    banner.classList.add('show');
  }
}
function dismissBanner(){
  state.bannerDismissed=true;saveState();
  document.getElementById('new-month-banner').classList.remove('show');
}
function doTutupBukuPrev(){
  dismissBanner();
  const tk=todayKey();
  const prevKeys=Object.keys(state.months).filter(k=>k<tk).sort();
  if(!prevKeys.length)return;
  state.currentMonthKey=prevKeys[prevKeys.length-1];
  saveState();render();
  confirmTutupBuku();
}

// ── TUTUP BUKU ────────────────────────────────────────────────────────
function confirmTutupBuku(){
  const m=currentMonth();
  if(m.closed){showToast('Bulan ini sudah ditutup');return;}
  const inc=totalIncome(m),spt=totalSpent(m),bud=totalBudget(m),sisa=inc-spt;
  document.getElementById('tutup-modal-sub').textContent='Ringkasan '+keyToLabel(m.key);
  document.getElementById('tutup-summary').innerHTML=`
    <div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:6px"><span style="color:var(--text2)">Total Pemasukan</span><strong>${fmt(inc)}</strong></div>
    <div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:6px"><span style="color:var(--text2)">Total Anggaran</span><strong>${fmt(bud)}</strong></div>
    <div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:6px"><span style="color:var(--text2)">Total Terpakai</span><strong style="color:var(--red)">${fmt(spt)}</strong></div>
    <div style="height:1px;background:var(--border);margin:8px 0"></div>
    <div style="display:flex;justify-content:space-between;font-size:14px"><span style="color:var(--text2);font-weight:600">Sisa Saldo</span><strong style="color:${sisa>=0?'var(--accent)':'var(--red)'}">${fmt(sisa)}</strong></div>`;
  document.getElementById('tutup-note').textContent=sisa>0
    ?`Sisa ${fmt(sisa)} akan dipindahkan ke pemasukan bulan berikutnya sebagai "Sisa ${keyToLabel(m.key)}".`
    :'Tidak ada sisa saldo yang dipindahkan.';
  openModal('modal-tutup');
}

function executeTutupBuku(){
  const m=currentMonth();
  if(m.closed){closeModal('modal-tutup');return;}
  const inc=totalIncome(m),spt=totalSpent(m),bud=totalBudget(m),sisa=inc-spt;
  m.closed=true;
  state.closedHistory=state.closedHistory||[];
  state.closedHistory.unshift({key:m.key,label:keyToLabel(m.key),totalIncome:inc,totalBudget:bud,totalSpent:spt,sisa});
  if(sisa>0){
    const[y,mo]=m.key.split('-').map(Number);
    const nd=new Date(y,mo,1);
    const nk=nd.getFullYear()+'-'+String(nd.getMonth()+1).padStart(2,'0');
    const nm=ensureMonth(nk);
    nm.incomes=(nm.incomes||[]).filter(i=>!i.carryover);
    nm.incomes.unshift({id:uid(),label:'Sisa '+keyToLabel(m.key),amount:sisa,carryover:true});
    if(!(nm.categories||[]).length)nm.categories=m.categories.map(c=>({...c,spent:0}));
  }
  saveState();
  closeModal('modal-tutup');
  showToast('Buku '+keyToLabel(m.key)+' berhasil ditutup ✓');
  render();
}

// ── INCOME ────────────────────────────────────────────────────────────
function openAddIncome(){
  if(currentMonth().closed){showToast('Bulan ini sudah ditutup');return;}
  document.getElementById('income-label-input').value='';
  document.getElementById('income-amt-input').value='';
  openModal('modal-income');
  setTimeout(()=>document.getElementById('income-label-input').focus(),100);
}
function saveIncome(){
  const label=document.getElementById('income-label-input').value.trim();
  const amount=parseFloat(document.getElementById('income-amt-input').value);
  if(!label){showToast('Masukkan keterangan pemasukan');return;}
  if(isNaN(amount)||amount<=0){showToast('Masukkan jumlah yang valid');return;}
  const m=currentMonth();
  m.incomes=m.incomes||[];
  m.incomes.push({id:uid(),label,amount,carryover:false});
  saveState();closeModal('modal-income');render();
  showToast('Pemasukan ditambahkan ✓');
}
function deleteIncome(id){
  const m=currentMonth();
  const item=m.incomes.find(i=>i.id===id);
  if(item&&item.carryover){showToast('Sisa carry-over tidak bisa dihapus manual');return;}
  m.incomes=m.incomes.filter(i=>i.id!==id);
  saveState();render();showToast('Pemasukan dihapus');
}

let editIncomeId=null;
function openEditIncome(id){
  if(currentMonth().closed){showToast('Bulan ini sudah ditutup');return;}
  const m=currentMonth();
  const item=m.incomes.find(i=>i.id===id);
  if(!item){return;}
  if(item.carryover){showToast('Sisa carry-over tidak bisa diedit manual');return;}
  editIncomeId=id;
  document.getElementById('edit-income-label-input').value=item.label;
  document.getElementById('edit-income-amt-input').value=item.amount;
  openModal('modal-edit-income');
  setTimeout(()=>document.getElementById('edit-income-label-input').focus(),100);
}
function saveEditIncome(){
  const label=document.getElementById('edit-income-label-input').value.trim();
  const amount=parseFloat(document.getElementById('edit-income-amt-input').value);
  if(!label){showToast('Masukkan keterangan pemasukan');return;}
  if(isNaN(amount)||amount<=0){showToast('Masukkan jumlah yang valid');return;}
  const m=currentMonth();
  const item=m.incomes.find(i=>i.id===editIncomeId);
  if(!item){showToast('Pemasukan tidak ditemukan');return;}
  item.label=label;
  item.amount=amount;
  saveState();closeModal('modal-edit-income');render();
  showToast('Pemasukan diperbarui ✓');
}

// ── CATEGORIES ────────────────────────────────────────────────────────
let selectedPreset=null;
function openAddCat(){
  if(currentMonth().closed){showToast('Bulan ini sudah ditutup');return;}
  selectedPreset=null;
  document.getElementById('cat-name-input').value='';
  document.getElementById('cat-budget-input').value='';
  document.getElementById('preset-pills').innerHTML=PRESETS.map((p,i)=>`<button class="pill" onclick="selectPreset(${i})">${p.emoji} ${p.name}</button>`).join('');
  openModal('modal-addcat');
}
function selectPreset(i){
  selectedPreset=PRESETS[i];
  document.getElementById('cat-name-input').value=PRESETS[i].name;
  document.querySelectorAll('#preset-pills .pill').forEach((el,j)=>el.classList.toggle('selected',j===i));
  document.getElementById('cat-budget-input').focus();
}
function saveCategory(){
  const name=document.getElementById('cat-name-input').value.trim();
  const budget=parseFloat(document.getElementById('cat-budget-input').value);
  if(!name){showToast('Masukkan nama kategori');return;}
  if(isNaN(budget)||budget<=0){showToast('Masukkan anggaran yang valid');return;}
  const m=currentMonth();
  if(m.categories.find(c=>c.name.toLowerCase()===name.toLowerCase())){showToast('Kategori sudah ada');return;}
  m.categories.push({name,budget,spent:0});
  saveState();closeModal('modal-addcat');render();
  showToast('Kategori ditambahkan ✓');
}

let spendIdx=null;
function openSpend(i){
  if(currentMonth().closed){showToast('Bulan ini sudah ditutup');return;}
  spendIdx=i;
  const cat=currentMonth().categories[i];
  document.getElementById('spend-modal-title').textContent=cat.name;
  document.getElementById('spend-modal-sub').textContent='Sisa anggaran: '+fmt(cat.budget-cat.spent);
  document.getElementById('spend-desc-input').value='';
  document.getElementById('spend-amt-input').value='';
  openModal('modal-spend');
  setTimeout(()=>document.getElementById('spend-desc-input').focus(),100);
}
function saveSpend(){
  const amt=parseFloat(document.getElementById('spend-amt-input').value);
  const desc=document.getElementById('spend-desc-input').value.trim();
  if(isNaN(amt)||amt<=0){showToast('Masukkan jumlah yang valid');return;}
  const m=currentMonth();
  m.categories[spendIdx].spent+=amt;
  const d=new Date();
  m.transactions.push({id:uid(),cat:m.categories[spendIdx].name,amt,desc,date:d.toLocaleDateString('id-ID',{day:'numeric',month:'short',year:'numeric'})});
  saveState();closeModal('modal-spend');render();
  showToast('Pengeluaran dicatat ✓');
}
function deleteCat(i){
  if(currentMonth().closed){showToast('Bulan ini sudah ditutup');return;}
  const m=currentMonth();
  if(!confirm('Hapus kategori "'+m.categories[i].name+'"?'))return;
  m.categories.splice(i,1);
  saveState();render();showToast('Kategori dihapus');
}

let editCatIdx=null;
function openEditCat(i){
  if(currentMonth().closed){showToast('Bulan ini sudah ditutup');return;}
  const m=currentMonth();
  const cat=m.categories[i];
  editCatIdx=i;
  document.getElementById('edit-cat-name-input').value=cat.name;
  document.getElementById('edit-cat-budget-input').value=cat.budget;
  document.getElementById('edit-cat-modal-sub').textContent='Edit "'+cat.name+'"';
  const noteEl=document.getElementById('edit-cat-spent-note');
  if(cat.spent>0){
    const p2=pct(cat.spent,cat.budget);
    noteEl.textContent='⚠️ Sudah dibelanjakan '+fmt(cat.spent)+' ('+p2+'%). Anggaran baru tidak boleh kurang dari jumlah ini.';
    noteEl.style.display='block';
  } else {
    noteEl.style.display='none';
  }
  openModal('modal-edit-cat');
  setTimeout(()=>document.getElementById('edit-cat-budget-input').focus(),100);
}
function saveEditCat(){
  const name=document.getElementById('edit-cat-name-input').value.trim();
  const budget=parseFloat(document.getElementById('edit-cat-budget-input').value);
  if(!name){showToast('Masukkan nama kategori');return;}
  if(isNaN(budget)||budget<=0){showToast('Masukkan anggaran yang valid');return;}
  const m=currentMonth();
  const cat=m.categories[editCatIdx];
  if(budget<cat.spent){showToast('Anggaran tidak boleh kurang dari yang sudah dibelanjakan ('+fmt(cat.spent)+')');return;}
  const duplicate=m.categories.find((c,idx)=>idx!==editCatIdx&&c.name.toLowerCase()===name.toLowerCase());
  if(duplicate){showToast('Nama kategori sudah digunakan');return;}
  if(cat.name!==name){
    m.transactions.forEach(t=>{if(t.cat===cat.name)t.cat=name;});
  }
  cat.name=name;
  cat.budget=budget;
  saveState();closeModal('modal-edit-cat');render();
  showToast('Kategori diperbarui ✓');
}

function openCatHist(i){
  const m=currentMonth();
  const isClosed=m.closed;
  const cat=m.categories[i];
  const p=getPreset(cat.name);
  const txns=[...m.transactions].filter(t=>t.cat===cat.name).reverse();
  document.getElementById('cat-hist-title').textContent=p.emoji+' '+cat.name;
  const total=txns.reduce((s,t)=>s+t.amt,0);
  document.getElementById('cat-hist-sub').textContent=txns.length+' transaksi · Total '+fmt(total);
  const listEl=document.getElementById('cat-hist-list');
  if(!txns.length){
    listEl.innerHTML=`<div class="empty" style="padding:32px 0"><div class="empty-icon" style="font-size:32px">📄</div><p style="font-size:13px">Belum ada transaksi di kategori ini.</p></div>`;
  } else {
    listEl.innerHTML=txns.map(t=>`
      <div class="cat-hist-txn">
        <div class="cat-hist-dot" style="background:${p.bg}">${p.emoji}</div>
        <div class="cat-hist-body">
          <div class="cat-hist-desc">${t.desc||cat.name}</div>
          <div class="cat-hist-date">${t.date}</div>
        </div>
        <div class="cat-hist-amt">-${fmt(t.amt)}</div>
        ${!isClosed?`<div class="cat-hist-actions">
          <button class="btn-ch-edit" onclick="openEditTxnFromHist('${t.id||''}')" title="Edit">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </button>
          <button class="btn-ch-del" onclick="deleteTxnFromHist('${t.id||''}')" title="Hapus">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
          </button>
        </div>`:''}
      </div>`).join('');
  }
  openModal('modal-cat-hist');
}

// ── TRANSACTIONS CRUD ────────────────────────────────────────────────
let editTxnId=null;

function deleteTxn(id){
  if(currentMonth().closed){showToast('Bulan ini sudah ditutup');return;}
  if(!confirm('Hapus transaksi ini?'))return;
  const m=currentMonth();
  m.transactions.forEach(t=>{if(!t.id)t.id=uid();});
  const t=m.transactions.find(x=>x.id===id);
  if(!t){showToast('Transaksi tidak ditemukan');return;}
  const cat=m.categories.find(c=>c.name===t.cat);
  if(cat)cat.spent=Math.max(0,cat.spent-t.amt);
  m.transactions=m.transactions.filter(x=>x.id!==id);
  saveState();render();showToast('Transaksi dihapus');
}

function openEditTxn(id){
  if(currentMonth().closed){showToast('Bulan ini sudah ditutup');return;}
  const m=currentMonth();
  m.transactions.forEach(t=>{if(!t.id)t.id=uid();});
  const t=m.transactions.find(x=>x.id===id);
  if(!t){showToast('Transaksi tidak ditemukan');return;}
  editTxnId=id;
  const sel=document.getElementById('edit-txn-cat-input');
  sel.innerHTML=m.categories.map(c=>`<option value="${c.name}"${c.name===t.cat?' selected':''}>${c.name}</option>`).join('');
  document.getElementById('edit-txn-desc-input').value=t.desc||'';
  document.getElementById('edit-txn-amt-input').value=t.amt;
  openModal('modal-edit-txn');
  setTimeout(()=>document.getElementById('edit-txn-desc-input').focus(),100);
}

function saveEditTxn(){
  const m=currentMonth();
  const t=m.transactions.find(x=>x.id===editTxnId);
  if(!t){showToast('Transaksi tidak ditemukan');closeModal('modal-edit-txn');return;}
  const newCat=document.getElementById('edit-txn-cat-input').value;
  const newDesc=document.getElementById('edit-txn-desc-input').value.trim();
  const newAmt=parseFloat(document.getElementById('edit-txn-amt-input').value);
  if(isNaN(newAmt)||newAmt<=0){showToast('Masukkan jumlah yang valid');return;}
  const oldCat=m.categories.find(c=>c.name===t.cat);
  if(oldCat)oldCat.spent=Math.max(0,oldCat.spent-t.amt);
  const newCatObj=m.categories.find(c=>c.name===newCat);
  if(newCatObj)newCatObj.spent+=newAmt;
  t.cat=newCat;
  t.desc=newDesc;
  t.amt=newAmt;
  saveState();closeModal('modal-edit-txn');render();
  showToast('Transaksi diperbarui ✓');
}

function deleteTxnFromHist(id){deleteTxn(id);closeModal('modal-cat-hist');}
function openEditTxnFromHist(id){closeModal('modal-cat-hist');openEditTxn(id);}

// ── RENDER ────────────────────────────────────────────────────────────
function render(){
  const m=currentMonth();
  const isClosed=m.closed;
  buildMonthOptions();

  ['month-status','month-status-txn'].forEach(id=>{
    const el=document.getElementById(id);if(!el)return;
    if(isClosed){el.textContent='Tutup';el.className='month-status closed';}
    else{el.textContent='Aktif';el.className='month-status open';}
  });

  document.getElementById('bulan-label').textContent=keyToLabel(state.currentMonthKey);

  const inc=totalIncome(m),bud=totalBudget(m),spt=totalSpent(m),sisa=inc-spt;
  const ratio=inc>0?bud/inc:0;
  const pctVal=Math.min(100,Math.round(ratio*100));

  document.getElementById('income-display').textContent=fmt(inc);
  document.getElementById('main-bar').style.width=pctVal+'%';
  document.getElementById('bar-used-label').textContent='Dianggarkan '+fmt(bud);
  document.getElementById('bar-sisa-label').textContent='Sisa '+fmt(sisa);
  document.getElementById('summary-total-spent').textContent=fmt(spt);

  const card=document.getElementById('summary-card');
  card.classList.toggle('warn-state',!isClosed&&ratio>=0.85&&ratio<1);
  card.classList.toggle('danger-state',!isClosed&&ratio>=1);
  card.classList.toggle('closed-state',isClosed);

  // Income items
  const incItems=document.getElementById('income-items');
  if(!(m.incomes||[]).length){
    incItems.innerHTML=`<div style="padding:14px;font-size:13px;color:var(--text3);text-align:center">Belum ada pemasukan. Tap "+ Tambah".</div>`;
  } else {
    incItems.innerHTML=m.incomes.map(inc2=>`
      <div class="income-item">
        <div class="income-dot${inc2.carryover?' carryover':''}"></div>
        <div class="income-body">
          <div class="income-label-text">${inc2.label}</div>
          ${inc2.carryover?`<div class="income-sublabel">↩ Sisa bulan sebelumnya</div>`:''}
        </div>
        <div class="income-amount${inc2.carryover?' carryover':''}">${fmt(inc2.amount)}</div>
        ${!isClosed&&!inc2.carryover?`
        <button class="btn-edit-income" onclick="openEditIncome('${inc2.id}')" title="Edit pemasukan">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
        </button>
        <button class="btn-del-income" onclick="deleteIncome('${inc2.id}')" title="Hapus pemasukan">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
        </button>`:''}
      </div>`).join('');
  }
  document.getElementById('btn-add-income').style.display=isClosed?'none':'flex';

  // Stats
  const sr=document.getElementById('stats-row');
  if(m.categories.length>0){
    sr.style.display='flex';
    document.getElementById('stat-cat').textContent=m.categories.length;
    document.getElementById('stat-spent').textContent=fmt(spt);
    document.getElementById('stat-txn').textContent=m.transactions.length;
  } else sr.style.display='none';

  // Categories
  const cl=document.getElementById('cat-list');
  const catLabel=document.getElementById('cat-section-label');
  if(!m.categories.length){
    catLabel.textContent='Rencana Pengeluaran';
    cl.innerHTML=`<div class="empty"><div class="empty-icon">💼</div><p>Belum ada kategori.<br>Tap <strong style="color:var(--accent)">Tambah Kategori</strong> di atas untuk mulai.</p></div>`;
  } else {
    catLabel.textContent='Rencana Pengeluaran ('+m.categories.length+')';
    cl.innerHTML=m.categories.map((cat,i)=>{
      const p=getPreset(cat.name);
      const r=cat.budget>0?cat.spent/cat.budget:0;
      const bc=r>=1?'var(--red)':r>=0.8?'var(--amber)':p.bar;
      const sa=cat.budget-cat.spent;
      const cls=r>=1?'danger':r>=0.8?'warn':'ok';
      const p2=pct(cat.spent,cat.budget);
      return`<div class="cat-card">
        <div class="cat-top">
          <div class="cat-icon" style="background:${p.bg}"><span class="cat-emoji">${p.emoji}</span></div>
          <div class="cat-meta">
            <div class="cat-name">${cat.name}</div>
            <div class="cat-budget-label">Anggaran ${fmt(cat.budget)}</div>
            <div class="cat-spent-info">Terpakai ${fmt(cat.spent)}</div>
          </div>
          <div class="cat-sisa">
            <div class="cat-sisa-val ${cls}">${fmt(sa)}</div>
            <div class="cat-sisa-pct">${p2}% terpakai</div>
          </div>
        </div>
        <div class="cat-bar-wrap"><div class="cat-bar" style="width:${p2}%;background:${bc}"></div></div>
        ${!isClosed?`<div class="cat-actions">
          <button class="btn-spend" onclick="openSpend(${i})">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Catat pengeluaran
          </button>
          <button class="btn-hist-cat" onclick="openCatHist(${i})" title="Riwayat transaksi">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="16" y1="6" x2="8" y2="6"/><line x1="16" y1="10" x2="8" y2="10"/><line x1="11" y1="14" x2="8" y2="14"/></svg>
          </button>
          <button class="btn-edit-cat" onclick="openEditCat(${i})" title="Edit kategori">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </button>
          <button class="btn-del" onclick="deleteCat(${i})">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
          </button>
        </div>`:`<div class="cat-actions"><button class="btn-hist-cat" onclick="openCatHist(${i})" style="flex:1">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="16" y1="6" x2="8" y2="6"/><line x1="16" y1="10" x2="8" y2="10"/><line x1="11" y1="14" x2="8" y2="14"/></svg>
            Lihat Riwayat
          </button><div class="cat-closed-note" style="display:inline-flex;align-items:center;padding:9px 10px">📌 Ditutup</div></div>`}
      </div>`;
    }).join('');
  }

  document.getElementById('btn-tutup-buku-header').style.display='none';
  const navTutupBuku=document.getElementById('nav-tutup-buku');
  if(navTutupBuku)navTutupBuku.style.display=(!isClosed&&m.categories.length>0)?'flex':'none';
  const btnAddCatInline=document.getElementById('btn-add-cat-inline');
  if(btnAddCatInline)btnAddCatInline.style.display=isClosed?'none':'flex';

  // Transactions
  const tl=document.getElementById('txn-list');
  const txns=[...m.transactions].reverse();
  document.getElementById('txn-count-label').textContent=txns.length+' transaksi · '+keyToLabel(state.currentMonthKey);
  if(!txns.length){
    tl.innerHTML=`<div class="empty"><div class="empty-icon">📄</div><p>Belum ada transaksi untuk bulan ini.</p></div>`;
  } else {
    tl.innerHTML=txns.map(t=>{
      const p=getPreset(t.cat);
      const tid=t.id||'';
      return`<div class="txn-item">
        <div class="txn-dot-wrap" style="background:${p.bg}"><span class="cat-emoji">${p.emoji}</span></div>
        <div class="txn-body">
          <div class="txn-desc">${t.desc||t.cat}</div>
          <div class="txn-sub">${t.cat} · ${t.date}</div>
        </div>
        <div class="txn-amt">-${fmt(t.amt)}</div>
        ${!isClosed?`<div class="txn-actions">
          <button class="btn-txn-edit" onclick="openEditTxn('${tid}')" title="Edit transaksi">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </button>
          <button class="btn-txn-del" onclick="deleteTxn('${tid}')" title="Hapus transaksi">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
          </button>
        </div>`:''}
      </div>`;
    }).join('');
  }

  // History
  const hl=document.getElementById('history-list');
  const hist=state.closedHistory||[];
  document.getElementById('history-sub').textContent=hist.length+' bulan tercatat';
  if(!hist.length){
    hl.innerHTML=`<div class="empty"><div class="empty-icon">📊</div><p>Belum ada riwayat tutup buku.<br>Tutup buku bulan ini untuk mulai mencatat riwayat.</p></div>`;
  } else {
    hl.innerHTML=hist.map(h=>{
      const ratio=h.totalIncome>0?Math.min(100,Math.round((h.totalSpent/h.totalIncome)*100)):0;
      const sisaOk=h.sisa>=0;
      return`<div class="history-card">
        <div class="history-card-header">
          <div class="history-month">${h.label}</div>
          <div class="history-badge">Tutup ✓</div>
        </div>
        <div class="history-bar-wrap">
          <div class="history-bar" style="width:${ratio}%;background:${ratio>=100?'var(--red)':ratio>=85?'var(--amber)':'var(--accent)'}"></div>
        </div>
        <div class="history-row"><span class="history-key">Pemasukan</span><span class="history-val">${fmt(h.totalIncome)}</span></div>
        <div class="history-row"><span class="history-key">Total Pengeluaran</span><span class="history-val danger">${fmt(h.totalSpent)}</span></div>
        <div class="history-row"><span class="history-key">Sisa dipindahkan</span><span class="history-val ${sisaOk?'ok':'danger'}">${fmt(Math.max(0,h.sisa))}</span></div>
      </div>`;
    }).join('');
  }
}

// ── NAVIGATION ──────────────────────────────────────────────────────
function switchTab(tab){
  document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b=>b.classList.remove('active'));
  document.getElementById('screen-'+tab).classList.add('active');
  document.getElementById('nav-'+tab).classList.add('active');
  render();
}

function openModal(id){document.getElementById(id).classList.add('open')}
function closeModal(id){document.getElementById(id).classList.remove('open')}
document.querySelectorAll('.modal-bg').forEach(m=>{m.addEventListener('click',e=>{if(e.target===m)m.classList.remove('open')})});
document.addEventListener('keydown',e=>{if(e.key==='Escape')document.querySelectorAll('.modal-bg.open').forEach(m=>m.classList.remove('open'))});

let toastTimer;
function showToast(msg){
  const t=document.getElementById('toast');
  t.textContent=msg;t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer=setTimeout(()=>t.classList.remove('show'),2500);
}

// ── PWA: SERVICE WORKER REGISTRATION ─────────────────────────────────
if('serviceWorker' in navigator){
  window.addEventListener('load',()=>{
    navigator.serviceWorker.register('./sw.js')
      .then(reg=>console.log('SW registered:',reg.scope))
      .catch(err=>console.log('SW error:',err));
  });
}

// ── PWA: INSTALL PROMPT ───────────────────────────────────────────────
let deferredPrompt=null;
window.addEventListener('beforeinstallprompt',(e)=>{
  e.preventDefault();
  deferredPrompt=e;
  const banner=document.getElementById('pwa-install-banner');
  if(banner)banner.classList.add('show');
});
window.addEventListener('appinstalled',()=>{
  deferredPrompt=null;
  const banner=document.getElementById('pwa-install-banner');
  if(banner)banner.classList.remove('show');
  showToast('Aplikasi berhasil diinstall ✓');
});

function installPWA(){
  if(!deferredPrompt)return;
  deferredPrompt.prompt();
  deferredPrompt.userChoice.then(choice=>{
    deferredPrompt=null;
    const banner=document.getElementById('pwa-install-banner');
    if(banner)banner.classList.remove('show');
  });
}
function closePWABanner(){
  const banner=document.getElementById('pwa-install-banner');
  if(banner)banner.classList.remove('show');
}

// ── INIT ─────────────────────────────────────────────────────────────
initTheme();
ensureMonth(todayKey());
if(!state.currentMonthKey)state.currentMonthKey=todayKey();
checkNewMonth();
render();
