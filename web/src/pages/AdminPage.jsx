import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import supabase from '../services/supabaseClient';
import { useAdmin } from '../hooks/useAdmin';

const DISCIPLINES = ['Physio', 'Ophthalmology', 'Cardiology', 'Dermatology', 'Dentistry', 'Nutrition'];
const EMPTY_FORM  = { title: '', body: '', discipline: DISCIPLINES[0] };

export default function AdminPage() {
  const navigate  = useNavigate();
  const isAdmin   = useAdmin();

  const [items,   setItems]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal,   setModal]   = useState(null);   // null | 'add' | { ...item }
  const [form,    setForm]    = useState(EMPTY_FORM);
  const [saving,  setSaving]  = useState(false);
  const [deleting,setDeleting]= useState(null);
  const [toast,   setToast]   = useState('');

  /* ── Load all content ─────────────────────────────── */
  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('content')
      .select('*')
      .order('discipline')
      .order('created_at', { ascending: false });
    setItems(data ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  /* ── Guard ────────────────────────────────────────── */
  if (!isAdmin && !loading) {
    return (
      <div className="min-h-full flex flex-col items-center justify-center gap-3 px-6">
        <p className="text-gray-500 text-sm text-center">
          You don't have admin access.<br />Contact your administrator.
        </p>
        <button onClick={() => navigate(-1)} className="text-brand-600 font-semibold text-sm">← Go back</button>
      </div>
    );
  }

  /* ── Open add modal ───────────────────────────────── */
  const openAdd = () => { setForm(EMPTY_FORM); setModal('add'); };

  /* ── Open edit modal ──────────────────────────────── */
  const openEdit = (item) => {
    setForm({ title: item.title, body: item.body, discipline: item.discipline });
    setModal(item);
  };

  /* ── Save (add or update) ─────────────────────────── */
  const handleSave = async () => {
    if (!form.title.trim() || !form.body.trim()) return;
    setSaving(true);

    let error;
    if (modal === 'add') {
      ({ error } = await supabase.from('content').insert([form]));
    } else {
      ({ error } = await supabase.from('content').update(form).eq('id', modal.id));
    }

    setSaving(false);
    if (error) { showToast('Error: ' + error.message); return; }

    setModal(null);
    showToast(modal === 'add' ? 'Post added!' : 'Post updated!');
    load();
  };

  /* ── Delete ───────────────────────────────────────── */
  const handleDelete = async (id) => {
    setDeleting(id);
    const { error } = await supabase.from('content').delete().eq('id', id);
    setDeleting(null);
    if (error) { showToast('Error: ' + error.message); return; }
    showToast('Deleted.');
    setItems(prev => prev.filter(i => i.id !== id));
  };

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  /* ── Group by discipline ──────────────────────────── */
  const grouped = DISCIPLINES.reduce((acc, d) => {
    const posts = items.filter(i => i.discipline === d);
    if (posts.length) acc.push({ discipline: d, posts });
    return acc;
  }, []);

  return (
    <div className="min-h-full flex flex-col"
      style={{ background: 'linear-gradient(160deg, #e8f0fe 0%, #f0f4ff 100%)' }}
    >
      {/* Header */}
      <header className="glass sticky top-0 z-20 pt-safe px-4 pb-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="press-scale w-9 h-9 rounded-full bg-white/80 border border-gray-200 flex items-center justify-center text-gray-600"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
            </svg>
          </button>
          <h2 className="text-base font-bold text-gray-900">Admin Panel</h2>
        </div>
        <button
          onClick={openAdd}
          className="press-scale flex items-center gap-1.5 px-4 h-9 rounded-full bg-brand-600 text-white text-sm font-semibold shadow shadow-brand-600/30"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Add Post
        </button>
      </header>

      {/* Content list */}
      <main className="flex-1 overflow-y-auto px-4 py-4 pb-safe max-w-lg mx-auto w-full">
        {loading ? (
          <div className="flex justify-center pt-16">
            <span className="w-8 h-8 rounded-full border-4 border-brand-600 border-t-transparent animate-spin" />
          </div>
        ) : grouped.length === 0 ? (
          <p className="text-center text-gray-400 pt-16 text-sm">No content yet. Add your first post.</p>
        ) : (
          <div className="space-y-6">
            {grouped.map(({ discipline, posts }) => (
              <section key={discipline}>
                <h3 className="text-xs font-bold uppercase tracking-widest text-brand-600 mb-2 px-1">
                  {discipline} · {posts.length}
                </h3>
                <div className="space-y-2">
                  {posts.map(item => (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="glass rounded-2xl px-4 py-3.5 flex items-start gap-3 shadow-sm"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">{item.title}</p>
                        <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{item.body}</p>
                      </div>
                      <div className="flex gap-1.5 flex-shrink-0">
                        <button
                          onClick={() => openEdit(item)}
                          className="press-scale w-8 h-8 rounded-xl bg-brand-50 flex items-center justify-center text-brand-600"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round"
                              d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          disabled={deleting === item.id}
                          className="press-scale w-8 h-8 rounded-xl bg-red-50 flex items-center justify-center text-red-500 disabled:opacity-40"
                        >
                          {deleting === item.id ? (
                            <span className="w-3.5 h-3.5 rounded-full border-2 border-red-400 border-t-transparent animate-spin" />
                          ) : (
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round"
                                d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                            </svg>
                          )}
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </main>

      {/* Add / Edit Modal */}
      <AnimatePresence>
        {modal !== null && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-30"
              onClick={() => setModal(null)}
            />
            <motion.div
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-40 glass rounded-t-3xl px-5 pt-5 pb-safe shadow-2xl max-w-lg mx-auto"
            >
              {/* Handle */}
              <div className="w-10 h-1 rounded-full bg-gray-300 mx-auto mb-4" />

              <h3 className="text-base font-bold text-gray-900 mb-4">
                {modal === 'add' ? 'New Post' : 'Edit Post'}
              </h3>

              {/* Discipline picker */}
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                Discipline
              </label>
              <div className="flex gap-2 overflow-x-auto no-scrollbar mb-4 pb-1">
                {DISCIPLINES.map(d => (
                  <button
                    key={d}
                    onClick={() => setForm(f => ({ ...f, discipline: d }))}
                    className={[
                      'flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors',
                      form.discipline === d
                        ? 'bg-brand-600 text-white'
                        : 'bg-white/80 text-gray-600 border border-gray-200',
                    ].join(' ')}
                  >
                    {d}
                  </button>
                ))}
              </div>

              {/* Title */}
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                Title
              </label>
              <input
                type="text"
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                placeholder="Post headline..."
                className="w-full h-11 px-4 rounded-xl bg-white/70 border border-white/60 text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-600/30 mb-4 transition"
              />

              {/* Body */}
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                Body
              </label>
              <textarea
                value={form.body}
                onChange={e => setForm(f => ({ ...f, body: e.target.value }))}
                placeholder="Promotional content body..."
                rows={5}
                className="w-full px-4 py-3 rounded-xl bg-white/70 border border-white/60 text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-600/30 resize-none mb-5 transition"
              />

              <div className="flex gap-3">
                <button
                  onClick={() => setModal(null)}
                  className="flex-1 h-12 rounded-2xl border border-gray-200 bg-white/70 text-gray-600 font-semibold text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving || !form.title.trim() || !form.body.trim()}
                  className="flex-1 h-12 rounded-2xl bg-brand-600 text-white font-semibold text-sm shadow shadow-brand-600/30 disabled:opacity-50 flex items-center justify-center"
                >
                  {saving
                    ? <span className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    : modal === 'add' ? 'Publish' : 'Save Changes'
                  }
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 glass px-6 py-3 rounded-full text-sm font-semibold text-gray-800 shadow-lg z-50 whitespace-nowrap"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
