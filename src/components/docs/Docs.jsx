import { useState } from 'react';
import { useStorage, generateId } from '../../hooks/useStorage';
import { useStudents } from '../../hooks/useStudents';
import { useEmployees } from '../../hooks/useEmployees';
import { usePermissions } from '../../hooks/usePermissions';
import { useApp } from '../../context/AppContext';
import Widget from '../ui/Widget';

const DOC_TYPES = ['تقرير طبي','تقييم نفسي','خطة IEP','عقد','هوية','صورة','أخرى'];
const ASSET_CATS = ['أجهزة إلكترونية','أثاث','معدات علاجية','وسائل تعليمية','أخرى'];

export default function Docs() {
  const { toast } = useApp();
  const { activeStudents } = useStudents();
  const { employees } = useEmployees();
  const { canManage } = usePermissions();

  const [docs, setDocs]     = useStorage('docs',   []);
  const [assets, setAssets] = useStorage('assets', []);
  const [tab, setTab]       = useState('docs');
  const [showDocForm, setShowDocForm]     = useState(false);
  const [showAssetForm, setShowAssetForm] = useState(false);

  function addDoc(data) {
    setDocs(prev => [{ ...data, id: generateId(), _t: Date.now() }, ...prev]);
    toast('✅ تم إضافة الوثيقة', 'ok');
    setShowDocForm(false);
  }

  function deleteDoc(id) {
    if (!window.confirm('حذف هذه الوثيقة؟')) return;
    setDocs(prev => prev.filter(d => d.id !== id));
    toast('🗑️ تم الحذف', 'ok');
  }

  function addAsset(data) {
    setAssets(prev => [{ ...data, id: generateId(), _t: Date.now() }, ...prev]);
    toast('✅ تم إضافة العهدة', 'ok');
    setShowAssetForm(false);
  }

  function deleteAsset(id) {
    if (!window.confirm('حذف هذا السجل؟')) return;
    setAssets(prev => prev.filter(a => a.id !== id));
    toast('🗑️ تم الحذف', 'ok');
  }

  if (showDocForm) return <DocForm students={activeStudents} onSave={addDoc} onCancel={() => setShowDocForm(false)} />;
  if (showAssetForm) return <AssetForm employees={employees} onSave={addAsset} onCancel={() => setShowAssetForm(false)} />;

  return (
    <div className="page">
      <div className="ph">
        <div className="ph-t">
          <h2>📁 الوثائق والعهدة</h2>
          <p>{docs.length} وثيقة · {assets.length} عهدة</p>
        </div>
        <div className="ph-a">
          {canManage && (
            <>
              <button className="btn btn-p btn-sm" onClick={() => setShowDocForm(true)}>➕ وثيقة</button>
              <button className="btn btn-s btn-sm" onClick={() => setShowAssetForm(true)}>🗄️ عهدة</button>
            </>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 2, marginBottom: 14 }}>
        <button className={`btn btn-sm ${tab === 'docs' ? 'btn-p' : 'btn-s'}`} onClick={() => setTab('docs')}>📄 الوثائق ({docs.length})</button>
        <button className={`btn btn-sm ${tab === 'assets' ? 'btn-p' : 'btn-s'}`} onClick={() => setTab('assets')}>🗄️ العهدة ({assets.length})</button>
      </div>

      {/* Docs */}
      {tab === 'docs' && (
        <Widget noPadding>
          {docs.length === 0
            ? <div className="empty"><div className="ei">📄</div><div className="et">لا توجد وثائق — اضغط "وثيقة" لإضافة</div></div>
            : [...docs].sort((a, b) => (b._t || 0) - (a._t || 0)).map(doc => {
              const stu = activeStudents.find(s => s.id === doc.stuId);
              const isPDF = (doc.fileType || '').includes('pdf');
              return (
                <div key={doc.id} className="card" style={{ borderRadius: 0, borderBottom: '1px solid var(--border-color)', margin: 0 }}>
                  <div className="av blue" style={{ fontSize: '1.4rem' }}>{isPDF ? '📄' : '🖼️'}</div>
                  <div className="ci">
                    <div className="cn">{doc.name || '—'}</div>
                    <div className="cm">
                      {doc.type || '—'}{stu ? ` · ${stu.name}` : ''}
                      {doc.date ? ` · ${doc.date}` : ''}
                    </div>
                    {doc.notes && <div className="cm" style={{ color: 'var(--g5)' }}>{doc.notes}</div>}
                  </div>
                  <div className="c-acts">
                    {doc.fileData && (
                      <a href={doc.fileData} download={doc.name} className="btn btn-g btn-xs">⬇️</a>
                    )}
                    {canManage && <button className="btn btn-d btn-xs" onClick={() => deleteDoc(doc.id)}>🗑️</button>}
                  </div>
                </div>
              );
            })
          }
        </Widget>
      )}

      {/* Assets */}
      {tab === 'assets' && (
        <Widget noPadding>
          {assets.length === 0
            ? <div className="empty"><div className="ei">🗄️</div><div className="et">لا توجد عهدة مسجلة</div></div>
            : [...assets].sort((a, b) => (b._t || 0) - (a._t || 0)).map(asset => {
              const emp = employees.find(e => e.id === asset.assignedTo);
              const statusMap = { active: { cls: 'b-gr', label: '✅ نشط' }, maintenance: { cls: 'b-yw', label: '🔧 صيانة' }, inactive: { cls: 'b-gy', label: '⏸️ خارج الخدمة' } };
              const st = statusMap[asset.status] || statusMap.active;
              return (
                <div key={asset.id} className="card" style={{ borderRadius: 0, borderBottom: '1px solid var(--border-color)', margin: 0 }}>
                  <div className="av orange" style={{ fontSize: '1.3rem' }}>🗄️</div>
                  <div className="ci">
                    <div className="cn">{asset.name || '—'}</div>
                    <div className="cm">
                      {asset.category || '—'}{asset.serialNo ? ` · S/N: ${asset.serialNo}` : ''}
                      {emp ? ` · بعهدة: ${emp.name}` : ''}
                    </div>
                    {asset.notes && <div className="cm" style={{ color: 'var(--g5)' }}>{asset.notes}</div>}
                  </div>
                  <span className={`bdg ${st.cls}`}>{st.label}</span>
                  {canManage && <button className="btn btn-d btn-xs" onClick={() => deleteAsset(asset.id)}>🗑️</button>}
                </div>
              );
            })
          }
        </Widget>
      )}
    </div>
  );
}

// ── نموذج الوثيقة ──
function DocForm({ students, onSave, onCancel }) {
  const today = new Date().toISOString().split('T')[0];
  const [form, setForm] = useState({ name: '', type: '', stuId: '', date: today, notes: '', fileData: '', fileType: '' });
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const inp = { padding: '10px 13px', border: '1.5px solid var(--g2)', borderRadius: 9, fontFamily: 'inherit', fontSize: '.9rem', background: 'var(--bg-input)', color: 'var(--text-main)', outline: 'none', width: '100%' };

  function handleFile(e) {
    const file = e.target.files?.[0]; if (!file) return;
    const r = new FileReader();
    r.onload = ev => setForm(p => ({ ...p, fileData: ev.target.result, fileType: file.type, name: p.name || file.name }));
    r.readAsDataURL(file);
  }

  return (
    <div className="page">
      <div className="ph">
        <div className="ph-t"><h2>📄 إضافة وثيقة</h2></div>
        <div className="ph-a">
          <button className="btn btn-s btn-sm" onClick={onCancel}>إلغاء</button>
          <button className="btn btn-p" onClick={() => { if (!form.name?.trim()) { alert('⚠️ اسم الوثيقة مطلوب'); return; } onSave(form); }}>💾 حفظ</button>
        </div>
      </div>
      <Widget>
        <div className="fg c2">
          <div className="fl"><label>اسم الوثيقة <span className="req">*</span></label><input value={form.name} onChange={e => set('name', e.target.value)} placeholder="اسم الملف أو الوثيقة" style={inp} /></div>
          <div className="fl"><label>نوع الوثيقة</label>
            <select value={form.type} onChange={e => set('type', e.target.value)} style={inp}>
              <option value="">-- اختر --</option>
              {DOC_TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div className="fl"><label>الطالب (اختياري)</label>
            <select value={form.stuId} onChange={e => set('stuId', e.target.value)} style={inp}>
              <option value="">-- عام --</option>
              {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div className="fl"><label>التاريخ</label><input type="date" value={form.date} onChange={e => set('date', e.target.value)} style={inp} /></div>
          <div className="fl full">
            <label>رفع الملف (PDF أو صورة)</label>
            <input type="file" accept=".pdf,image/*" onChange={handleFile} style={{ ...inp, padding: '8px' }} />
            {form.fileData && <div style={{ fontSize: '.76rem', color: 'var(--ok)', marginTop: 4 }}>✅ تم رفع الملف</div>}
          </div>
        </div>
        <div className="fl"><label>ملاحظات</label><textarea rows={2} value={form.notes} onChange={e => set('notes', e.target.value)} style={{ ...inp, resize: 'vertical' }} /></div>
      </Widget>
    </div>
  );
}

// ── نموذج العهدة ──
function AssetForm({ employees, onSave, onCancel }) {
  const [form, setForm] = useState({ name: '', category: '', serialNo: '', assignedTo: '', purchaseDate: '', status: 'active', notes: '' });
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const inp = { padding: '10px 13px', border: '1.5px solid var(--g2)', borderRadius: 9, fontFamily: 'inherit', fontSize: '.9rem', background: 'var(--bg-input)', color: 'var(--text-main)', outline: 'none', width: '100%' };

  return (
    <div className="page">
      <div className="ph">
        <div className="ph-t"><h2>🗄️ إضافة عهدة</h2></div>
        <div className="ph-a">
          <button className="btn btn-s btn-sm" onClick={onCancel}>إلغاء</button>
          <button className="btn btn-p" onClick={() => { if (!form.name?.trim()) { alert('⚠️ اسم الأصل مطلوب'); return; } onSave(form); }}>💾 حفظ</button>
        </div>
      </div>
      <Widget>
        <div className="fg c2">
          <div className="fl"><label>اسم الأصل <span className="req">*</span></label><input value={form.name} onChange={e => set('name', e.target.value)} placeholder="مثال: لابتوب Dell" style={inp} /></div>
          <div className="fl"><label>الفئة</label>
            <select value={form.category} onChange={e => set('category', e.target.value)} style={inp}>
              <option value="">-- اختر --</option>
              {ASSET_CATS.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div className="fl"><label>الرقم التسلسلي</label><input value={form.serialNo} onChange={e => set('serialNo', e.target.value)} placeholder="S/N..." style={inp} /></div>
          <div className="fl"><label>بعهدة موظف</label>
            <select value={form.assignedTo} onChange={e => set('assignedTo', e.target.value)} style={inp}>
              <option value="">-- المركز (عام) --</option>
              {employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
            </select>
          </div>
          <div className="fl"><label>تاريخ الشراء</label><input type="date" value={form.purchaseDate} onChange={e => set('purchaseDate', e.target.value)} style={inp} /></div>
          <div className="fl"><label>الحالة</label>
            <select value={form.status} onChange={e => set('status', e.target.value)} style={inp}>
              <option value="active">✅ نشط</option>
              <option value="maintenance">🔧 صيانة</option>
              <option value="inactive">⏸️ خارج الخدمة</option>
            </select>
          </div>
        </div>
        <div className="fl"><label>ملاحظات</label><textarea rows={2} value={form.notes} onChange={e => set('notes', e.target.value)} style={{ ...inp, resize: 'vertical' }} /></div>
      </Widget>
    </div>
  );
}
