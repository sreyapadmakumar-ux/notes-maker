import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/notes';

function App() {
  const [notes, setNotes] = useState([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [theme, setTheme] = useState('dark');
  const [activeFormats, setActiveFormats] = useState([]);

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      const response = await axios.get(API_URL);
      setNotes(response.data);
    } catch (error) {
      console.error('Error fetching notes:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !content) return alert('Please write a note title and body content first!');

    try {
      const response = await axios.post(API_URL, { title, content });
      setNotes([response.data, ...notes]);
      setTitle('');
      setContent('');
    } catch (error) {
      console.error('Error creating note:', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      setNotes(notes.filter((note) => note._id !== id));
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  };

  const handleExport = () => {
    if (notes.length === 0) return alert('No notes available to export yet!');
    const fileContent = notes.map((note) => `TITLE: ${note.title}\nCONTENT:\n${note.content}\n----------\n`).join('\n');
    const element = document.createElement("a");
    const file = new Blob([fileContent], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = "my-notes-export.txt";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark');
  const toggleFormat = (f) => setActiveFormats(prev => prev.includes(f) ? prev.filter(x => x !== f) : [...prev, f]);

  const styles = {
    bg: theme === 'dark' ? '#0f172a' : '#f8fafc',
    panelBg: theme === 'dark' ? '#1e293b' : '#ffffff',
    text: theme === 'dark' ? '#f8fafc' : '#0f172a',
    subText: theme === 'dark' ? '#94a3b8' : '#64748b',
    border: theme === 'dark' ? '#334155' : '#e2e8f0',
    inputBg: theme === 'dark' ? '#0f172a' : '#f1f5f9',
    accent: '#10b981',
  };

  return (
    <div style={{ height: '100vh', backgroundColor: styles.bg, color: styles.text, fontFamily: '"Inter", sans-serif', display: 'flex', flexDirection: 'column', overflow: 'hidden', transition: 'background 0.3s' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 24px', borderBottom: `1px solid ${styles.border}`, backgroundColor: styles.panelBg }}>
        <span style={{ fontSize: '20px', fontWeight: 'bold', color: styles.accent }}>Notes Maker</span>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <button onClick={handleExport} style={{ background: 'none', border: 'none', color: styles.text, cursor: 'pointer', fontSize: '14px', fontWeight: '500' }}>💾 Save</button>
          <button onClick={handleExport} style={{ background: 'none', border: 'none', color: styles.text, cursor: 'pointer', fontSize: '14px', fontWeight: '500' }}>📤 Export</button>
          <button onClick={toggleTheme} style={{ backgroundColor: theme === 'dark' ? '#f59e0b' : '#475569', color: '#ffffff', border: 'none', borderRadius: '20px', padding: '6px 14px', cursor: 'pointer', fontWeight: '600', fontSize: '12px' }}>
            {theme === 'dark' ? '☀️ Bright Mode' : '🌙 Dark Mode'}
          </button>
        </div>
      </header>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* PRESENTATION SIDE PREVIEW */}
        <div style={{ flex: 1, borderRight: `1px solid ${styles.border}`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px', backgroundColor: theme === 'dark' ? '#0b0f19' : '#f1f5f9' }}>
          <div style={{ width: '100%', maxWidth: '500px', backgroundColor: styles.panelBg, borderRadius: '12px', border: `1px solid ${styles.border}`, aspectRatio: '4/3', display: 'flex', flexDirection: 'column', padding: '40px', boxSizing: 'border-box', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
            <h2 style={{ fontSize: '24px', fontWeight: '700', margin: '0 0 16px 0', color: title ? styles.text : styles.subText, borderBottom: title ? `2px solid ${styles.accent}` : 'none', paddingBottom: '8px' }}>
              {title || "Presentation Slide Title"}
            </h2>
            <p style={{ fontSize: '15px', color: content ? styles.text : styles.subText, lineHeight: '1.6', margin: '0', whiteSpace: 'pre-wrap', fontStyle: content ? 'normal' : 'italic' }}>
              {content || "Start typing your note on the right to view it live on this slide screen..."}
            </p>
          </div>
        </div>

        {/* COMPOSER FORM SIDE EDITOR */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '24px', overflowY: 'auto', backgroundColor: styles.panelBg }}>
          <div style={{ display: 'flex', gap: '8px', paddingBottom: '14px', borderBottom: `1px solid ${styles.border}`, marginBottom: '20px' }}>
            {['Bold', 'Italic', 'Underline', 'Code Block'].map((fmt) => (
              <button key={fmt} type="button" onClick={() => toggleFormat(fmt)} style={{ background: activeFormats.includes(fmt) ? styles.accent : 'none', border: `1px solid ${styles.border}`, color: activeFormats.includes(fmt) ? '#ffffff' : styles.text, padding: '4px 10px', borderRadius: '4px', fontSize: '13px', cursor: 'pointer' }}>{fmt}</button>
            ))}
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px' }}>
            <input type="text" placeholder="Enter note title..." value={title} onChange={(e) => setTitle(e.target.value)} style={{ padding: '12px', fontSize: '15px', borderRadius: '6px', border: `1px solid ${styles.border}`, backgroundColor: styles.inputBg, color: styles.text, outline: 'none' }} />
            <textarea placeholder="Start writing note descriptions..." rows="4" value={content} onChange={(e) => setContent(e.target.value)} style={{ padding: '12px', fontSize: '14px', borderRadius: '6px', border: `1px solid ${styles.border}`, backgroundColor: styles.inputBg, color: styles.text, outline: 'none', resize: 'none' }} />
            <button type="submit" style={{ padding: '12px', fontSize: '14px', fontWeight: '600', backgroundColor: styles.accent, color: '#ffffff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
              + Attach Current Note
            </button>
          </form>

          {/* ATTACHED LIST DATABASE FEED */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <h3 style={{ fontSize: '13px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', color: styles.subText, margin: '0' }}>Saved Document Log</h3>
            {notes.length === 0 ? (
              <p style={{ color: styles.subText, fontStyle: 'italic', fontSize: '14px' }}>No notes logs added yet.</p>
            ) : (
              notes.map((note) => (
                <div key={note._id} style={{ padding: '16px', borderRadius: '8px', border: `1px solid ${styles.border}`, backgroundColor: theme === 'dark' ? '#0f172a' : '#f8fafc', position: 'relative' }}>
                  <h4 style={{ margin: '0 0 6px 0', fontSize: '15px', color: styles.text }}>{note.title}</h4>
                  <p style={{ margin: '0 0 10px 0', color: styles.subText, fontSize: '13.5px', lineHeight: '1.5' }}>{note.content}</p>
                  <button onClick={() => handleDelete(note._id)} style={{ backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', padding: '4px 8px', cursor: 'pointer', fontSize: '11px' }}>Remove</button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;