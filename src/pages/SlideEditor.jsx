import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ChevronUp, ChevronDown, Trash2, Plus, Image as ImageIcon, X } from 'lucide-react';
import { uploadMaterialFile, saveMaterial } from '../services/dataService';
import { buildSlideDeckHtml, compressImageDataUrl } from '../utils/pptxConverter';
import '../styles/Dashboard.css';

const blankSlide = () => ({ title: '', bulletsText: '', image: null, imageName: '' });

export default function SlideEditor() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const courseId = searchParams.get('courseId');
  const topicId = searchParams.get('topicId');

  const [deckTitle, setDeckTitle] = useState('');
  const [slides, setSlides] = useState([blankSlide()]);
  const [saving, setSaving] = useState(false);

  const updateSlide = (idx, patch) => {
    setSlides((prev) => prev.map((s, i) => (i === idx ? { ...s, ...patch } : s)));
  };

  const addSlide = () => setSlides((prev) => [...prev, blankSlide()]);

  const removeSlide = (idx) => {
    if (slides.length === 1) return;
    setSlides((prev) => prev.filter((_, i) => i !== idx));
  };

  const moveSlide = (idx, direction) => {
    const target = idx + direction;
    if (target < 0 || target >= slides.length) return;
    setSlides((prev) => {
      const next = [...prev];
      [next[idx], next[target]] = [next[target], next[idx]];
      return next;
    });
  };

  const handleImageChange = (idx, file) => {
    if (!file) return updateSlide(idx, { image: null, imageName: '' });
    const reader = new FileReader();
    reader.onload = async () => {
      const compressed = await compressImageDataUrl(reader.result, file.type === 'image/png' || file.type === 'image/gif');
      updateSlide(idx, { image: compressed, imageName: file.name });
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!deckTitle.trim()) return alert('Give this slide deck a title.');
    if (!courseId || !topicId) return alert('Missing course/topic context - please go back and open this from a lesson topic.');

    const slideData = slides
      .map((s) => ({
        title: s.title.trim(),
        bullets: s.bulletsText.split('\n').map((b) => b.trim()).filter(Boolean),
        images: s.image ? [s.image] : []
      }))
      .filter((s) => s.title || s.bullets.length > 0 || s.images.length > 0);

    if (slideData.length === 0) return alert('Add some content to at least one slide first.');

    setSaving(true);
    try {
      const html = buildSlideDeckHtml(deckTitle.trim(), slideData);
      const fileName = deckTitle.trim().replace(/[^a-z0-9]+/gi, '_').toLowerCase() + '.html';
      const file = new File([html], fileName, { type: 'text/html' });
      const fileUrl = await uploadMaterialFile(file.name, file);
      await saveMaterial({
        course_id: courseId,
        topic_id: topicId,
        title: deckTitle.trim(),
        file_url: fileUrl,
        file_type: 'html_slide'
      });
      alert('Slide deck created!');
      navigate(-1);
    } catch (err) {
      alert('Failed to save slide deck: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ maxWidth: '860px', margin: '0 auto', padding: '2rem 1.5rem 4rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <div>
          <h2 style={{ margin: 0, color: 'var(--primary-color)' }}>Create Slide Deck</h2>
          <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem', color: '#718096' }}>
            Build slides directly here - no PowerPoint needed. Each slide gets a title, optional bullet points, and an optional image.
          </p>
        </div>
        <button className="btn-prev" onClick={() => navigate(-1)}>Cancel</button>
      </div>

      <div className="dashboard-card" style={{ marginBottom: '1.5rem' }}>
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label>Deck Title *</label>
          <input
            type="text"
            value={deckTitle}
            onChange={(e) => setDeckTitle(e.target.value)}
            placeholder="e.g. Introduction to Fractions"
            required
          />
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {slides.map((slide, idx) => (
          <div key={idx} className="dashboard-card" style={{ marginBottom: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <h4 style={{ margin: 0, color: 'var(--primary-color)' }}>Slide {idx + 1}</h4>
              <div style={{ display: 'flex', gap: '0.4rem' }}>
                <button type="button" className="whiteboard-btn-icon" disabled={idx === 0} onClick={() => moveSlide(idx, -1)} title="Move up">
                  <ChevronUp size={16} />
                </button>
                <button type="button" className="whiteboard-btn-icon" disabled={idx === slides.length - 1} onClick={() => moveSlide(idx, 1)} title="Move down">
                  <ChevronDown size={16} />
                </button>
                <button type="button" className="whiteboard-btn-icon" disabled={slides.length === 1} onClick={() => removeSlide(idx)} title="Delete slide">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            <div className="form-group">
              <label>Title</label>
              <input
                type="text"
                value={slide.title}
                onChange={(e) => updateSlide(idx, { title: e.target.value })}
                placeholder="Slide title"
              />
            </div>

            <div className="form-group">
              <label>Bullet Points (one per line)</label>
              <textarea
                value={slide.bulletsText}
                onChange={(e) => updateSlide(idx, { bulletsText: e.target.value })}
                placeholder={'First point\nSecond point\nThird point'}
                rows={4}
                style={{ width: '100%', padding: '0.6rem', fontFamily: 'inherit', fontSize: '0.9rem', borderRadius: '8px', border: '1.5px solid #e2e8f0' }}
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Image (optional)</label>
              {slide.image ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <img src={slide.image} alt="" style={{ maxWidth: '120px', maxHeight: '90px', borderRadius: '8px', border: '1px solid #e2e8f0', objectFit: 'contain' }} />
                  <span style={{ fontSize: '0.8rem', color: '#718096' }}>{slide.imageName}</span>
                  <button type="button" className="whiteboard-btn-icon" onClick={() => handleImageChange(idx, null)} title="Remove image">
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', fontSize: '0.85rem', color: 'var(--primary-color)', fontWeight: 600 }}>
                  <ImageIcon size={16} /> Add an image
                  <input
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={(e) => handleImageChange(idx, e.target.files[0])}
                  />
                </label>
              )}
            </div>
          </div>
        ))}
      </div>

      <button type="button" className="btn-action approve" style={{ marginTop: '1rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }} onClick={addSlide}>
        <Plus size={16} /> Add Slide
      </button>

      <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end' }}>
        <button type="button" className="btn-primary" disabled={saving} onClick={handleSave} style={{ padding: '0.7rem 1.5rem' }}>
          {saving ? 'Saving...' : 'Save Slide Deck'}
        </button>
      </div>
    </div>
  );
}
