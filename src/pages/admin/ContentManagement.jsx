import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Plus, Trash2, Save, Upload, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

export default function ContentManagement() {
    const [activeTab, setActiveTab] = useState('features');
    const [features, setFeatures] = useState([]);
    const [news, setNews] = useState([]);
    const [gallery, setGallery] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAllData();
    }, []);

    const fetchAllData = async () => {
        setLoading(true);
        try {
            const [featuresData, newsData, galleryData] = await Promise.all([
                supabase.from('features').select('*').order('order_index'),
                supabase.from('news').select('*').order('published_date', { ascending: false }),
                supabase.from('gallery').select('*').order('order_index')
            ]);

            if (featuresData.data) setFeatures(featuresData.data);
            if (newsData.data) setNews(newsData.data);
            if (galleryData.data) setGallery(galleryData.data);
        } catch (error) {
            console.error('Error fetching data:', error);
            toast.error('Gagal memuat data');
        } finally {
            setLoading(false);
        }
    };

    // Features CRUD
    const addFeature = () => {
        setFeatures([...features, {
            id: 'new_' + Date.now(),
            title: '',
            description: '',
            icon_name: 'School',
            color: '#10b981',
            order_index: features.length + 1,
            is_active: true,
            isNew: true
        }]);
    };

    const saveFeature = async (feature) => {
        try {
            if (feature.isNew) {
                const { id, isNew, ...data } = feature;
                const { error } = await supabase.from('features').insert([data]);
                if (error) throw error;
            } else {
                const { isNew, ...data } = feature;
                const { error } = await supabase.from('features').update(data).eq('id', feature.id);
                if (error) throw error;
            }
            toast.success('Feature berhasil disimpan!');
            fetchAllData();
        } catch (error) {
            console.error(error);
            toast.error('Gagal menyimpan feature');
        }
    };

    const deleteFeature = async (id) => {
        if (!confirm('Hapus feature ini?')) return;
        try {
            if (String(id).startsWith('new_')) {
                setFeatures(features.filter(f => f.id !== id));
            } else {
                const { error } = await supabase.from('features').delete().eq('id', id);
                if (error) throw error;
                toast.success('Feature berhasil dihapus');
                fetchAllData();
            }
        } catch (error) {
            console.error(error);
            toast.error('Gagal menghapus feature');
        }
    };

    // News CRUD
    const addNews = () => {
        setNews([{
            id: 'new_' + Date.now(),
            title: '',
            category: 'Pengumuman',
            excerpt: '',
            content: '',
            image_url: '',
            published_date: new Date().toISOString().split('T')[0],
            is_published: true,
            isNew: true
        }, ...news]);
    };

    const saveNews = async (newsItem) => {
        try {
            if (newsItem.isNew) {
                const { id, isNew, ...data } = newsItem;
                const { error } = await supabase.from('news').insert([data]);
                if (error) throw error;
            } else {
                const { isNew, ...data } = newsItem;
                const { error } = await supabase.from('news').update(data).eq('id', newsItem.id);
                if (error) throw error;
            }
            toast.success('Berita berhasil disimpan!');
            fetchAllData();
        } catch (error) {
            console.error(error);
            toast.error('Gagal menyimpan berita');
        }
    };

    const deleteNews = async (id) => {
        if (!confirm('Hapus berita ini?')) return;
        try {
            if (String(id).startsWith('new_')) {
                setNews(news.filter(n => n.id !== id));
            } else {
                const { error } = await supabase.from('news').delete().eq('id', id);
                if (error) throw error;
                toast.success('Berita berhasil dihapus');
                fetchAllData();
            }
        } catch (error) {
            console.error(error);
            toast.error('Gagal menghapus berita');
        }
    };

    //  Gallery CRUD
    const addGallery = () => {
        setGallery([...gallery, {
            id: 'new_' + Date.now(),
            image_url: '',
            caption: '',
            category: 'Kegiatan',
            order_index: gallery.length + 1,
            is_active: true,
            isNew: true
        }]);
    };

    const saveGallery = async (item) => {
        try {
            if (item.isNew) {
                const { id, isNew, ...data } = item;
                const { error } = await supabase.from('gallery').insert([data]);
                if (error) throw error;
            } else {
                const { isNew, ...data } = item;
                const { error } = await supabase.from('gallery').update(data).eq('id', item.id);
                if (error) throw error;
            }
            toast.success('Galeri berhasil disimpan!');
            fetchAllData();
        } catch (error) {
            console.error(error);
            toast.error('Gagal menyimpan galeri');
        }
    };

    const deleteGallery = async (id) => {
        if (!confirm('Hapus item galeri ini?')) return;
        try {
            if (String(id).startsWith('new_')) {
                setGallery(gallery.filter(g => g.id !== id));
            } else {
                const { error } = await supabase.from('gallery').delete().eq('id', id);
                if (error) throw error;
                toast.success('Galeri berhasil dihapus');
                fetchAllData();
            }
        } catch (error) {
            console.error(error);
            toast.error('Gagal menghapus galeri');
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div style={{ maxWidth: '1200px' }}>
            <h1 style={{ marginBottom: '2rem' }}>Kelola Konten Landing Page</h1>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '2px solid var(--border-color)' }}>
                {[
                    { id: 'features', label: 'Keunggulan' },
                    { id: 'news', label: 'Berita' },
                    { id: 'gallery', label: 'Galeri' }
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        style={{
                            padding: '0.75rem 1.5rem',
                            border: 'none',
                            background: 'none',
                            color: activeTab === tab.id ? 'var(--primary-color)' : 'var(--text-secondary)',
                            fontWeight: activeTab === tab.id ? '600' : '400',
                            borderBottom: activeTab === tab.id ? '2px solid var(--primary-color)' : 'none',
                            marginBottom: '-2px',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                        }}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Features Tab */}
            {activeTab === 'features' && (
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h2>Mengapa Memilih Kami?</h2>
                        <button onClick={addFeature} className="btn btn-primary">
                            <Plus size={20} /> Tambah Feature
                        </button>
                    </div>

                    <div style={{ display: 'grid', gap: '1.5rem' }}>
                        {features.map((feature, index) => (
                            <FeatureEditor
                                key={feature.id}
                                feature={feature}
                                onUpdate={(updated) => {
                                    const newFeatures = [...features];
                                    newFeatures[index] = updated;
                                    setFeatures(newFeatures);
                                }}
                                onSave={saveFeature}
                                onDelete={deleteFeature}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* News Tab */}
            {activeTab === 'news' && (
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h2>Berita & Pengumuman</h2>
                        <button onClick={addNews} className="btn btn-primary">
                            <Plus size={20} /> Tambah Berita
                        </button>
                    </div>

                    <div style={{ display: 'grid', gap: '1.5rem' }}>
                        {news.map((newsItem, index) => (
                            <NewsEditor
                                key={newsItem.id}
                                news={newsItem}
                                onUpdate={(updated) => {
                                    const newNews = [...news];
                                    newNews[index] = updated;
                                    setNews(newNews);
                                }}
                                onSave={saveNews}
                                onDelete={deleteNews}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Gallery Tab */}
            {activeTab === 'gallery' && (
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h2>Galeri Kegiatan</h2>
                        <button onClick={addGallery} className="btn btn-primary">
                            <Plus size={20} /> Tambah Foto
                        </button>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                        {gallery.map((item, index) => (
                            <GalleryEditor
                                key={item.id}
                                item={item}
                                onUpdate={(updated) => {
                                    const newGallery = [...gallery];
                                    newGallery[index] = updated;
                                    setGallery(newGallery);
                                }}
                                onSave={saveGallery}
                                onDelete={deleteGallery}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

// Sub-components
function FeatureEditor({ feature, onUpdate, onSave, onDelete }) {
    return (
        <div className="card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                    <label>Judul</label>
                    <input
                        type="text"
                        className="input"
                        value={feature.title}
                        onChange={(e) => onUpdate({ ...feature, title: e.target.value })}
                        placeholder="Fasilitas Modern"
                    />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '0.5rem' }}>
                    <div>
                        <label>Icon (Lucide)</label>
                        <input
                            type="text"
                            className="input"
                            value={feature.icon_name}
                            onChange={(e) => onUpdate({ ...feature, icon_name: e.target.value })}
                            placeholder="School"
                        />
                    </div>
                    <div>
                        <label>Warna</label>
                        <input
                            type="color"
                            className="input"
                            value={feature.color}
                            onChange={(e) => onUpdate({ ...feature, color: e.target.value })}
                            style={{ height: '42px' }}
                        />
                    </div>
                </div>
            </div>
            <div>
                <label>Deskripsi</label>
                <textarea
                    className="input"
                    rows={3}
                    value={feature.description}
                    onChange={(e) => onUpdate({ ...feature, description: e.target.value })}
                    placeholder="Penjelasan lengkap..."
                />
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                <button onClick={() => onSave(feature)} className="btn btn-primary">
                    <Save size={18} /> Simpan
                </button>
                <button onClick={() => onDelete(feature.id)} className="btn btn-outline" style={{ color: 'var(--error)', borderColor: 'var(--error)' }}>
                    <Trash2 size={18} /> Hapus
                </button>
            </div>
        </div>
    );
}

function NewsEditor({ news, onUpdate, onSave, onDelete }) {
    return (
        <div className="card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                    <label>Judul</label>
                    <input
                        type="text"
                        className="input"
                        value={news.title}
                        onChange={(e) => onUpdate({ ...news, title: e.target.value })}
                    />
                </div>
                <div>
                    <label>Kategori</label>
                    <select
                        className="input"
                        value={news.category}
                        onChange={(e) => onUpdate({ ...news, category: e.target.value })}
                    >
                        <option>Prestasi</option>
                        <option>Kegiatan</option>
                        <option>Pengumuman</option>
                    </select>
                </div>
                <div>
                    <label>Tanggal</label>
                    <input
                        type="date"
                        className="input"
                        value={news.published_date}
                        onChange={(e) => onUpdate({ ...news, published_date: e.target.value })}
                    />
                </div>
            </div>
            <div style={{ marginBottom: '1rem' }}>
                <label>Gambar URL</label>
                <input
                    type="text"
                    className="input"
                    value={news.image_url}
                    onChange={(e) => onUpdate({ ...news, image_url: e.target.value })}
                    placeholder="https://..."
                />
            </div>
            <div style={{ marginBottom: '1rem' }}>
                <label>Excerpt (Ringkasan)</label>
                <textarea
                    className="input"
                    rows={2}
                    value={news.excerpt}
                    onChange={(e) => onUpdate({ ...news, excerpt: e.target.value })}
                />
            </div>
            <div style={{ marginBottom: '1rem' }}>
                <label>Konten Lengkap</label>
                <textarea
                    className="input"
                    rows={5}
                    value={news.content}
                    onChange={(e) => onUpdate({ ...news, content: e.target.value })}
                />
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button onClick={() => onSave(news)} className="btn btn-primary">
                    <Save size={18} /> Simpan
                </button>
                <button
                    onClick={() => onUpdate({ ...news, is_published: !news.is_published })}
                    className="btn btn-outline"
                >
                    {news.is_published ? <Eye size={18} /> : <EyeOff size={18} />}
                    {news.is_published ? 'Published' : 'Draft'}
                </button>
                <button onClick={() => onDelete(news.id)} className="btn btn-outline" style={{ color: 'var(--error)', borderColor: 'var(--error)' }}>
                    <Trash2 size={18} /> Hapus
                </button>
            </div>
        </div>
    );
}

function GalleryEditor({ item, onUpdate, onSave, onDelete }) {
    return (
        <div className="card" style={{ padding: '1rem' }}>
            {item.image_url && (
                <img
                    src={item.image_url}
                    alt={item.caption}
                    style={{ width: '100%', height: '150px', objectFit: 'cover', borderRadius: 'var(--radius-md)', marginBottom: '1rem' }}
                />
            )}
            <div style={{ marginBottom: '0.75rem' }}>
                <label>Image URL</label>
                <input
                    type="text"
                    className="input"
                    value={item.image_url}
                    onChange={(e) => onUpdate({ ...item, image_url: e.target.value })}
                    placeholder="https://..."
                />
            </div>
            <div style={{ marginBottom: '0.75rem' }}>
                <label>Caption</label>
                <input
                    type="text"
                    className="input"
                    value={item.caption}
                    onChange={(e) => onUpdate({ ...item, caption: e.target.value })}
                />
            </div>
            <div style={{ marginBottom: '0.75rem' }}>
                <label>Kategori</label>
                <input
                    type="text"
                    className="input"
                    value={item.category}
                    onChange={(e) => onUpdate({ ...item, category: e.target.value })}
                    placeholder="Kegiatan / Fasilitas"
                />
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button onClick={() => onSave(item)} className="btn btn-primary" style={{ flex: 1 }}>
                    <Save size={16} />
                </button>
                <button onClick={() => onDelete(item.id)} className="btn btn-outline" style={{ color: 'var(--error)', borderColor: 'var(--error)' }}>
                    <Trash2 size={16} />
                </button>
            </div>
        </div>
    );
}
