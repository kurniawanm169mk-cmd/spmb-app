import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Search, Filter, Download, CheckCircle, XCircle, Eye, MessageCircle, Trash2, Edit, Plus, UserPlus } from 'lucide-react';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';

export default function StudentList() {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedStudent, setSelectedStudent] = useState(null); // For modal
    const [modalType, setModalType] = useState(null); // 'detail', 'add', 'edit'
    const [studentForm, setStudentForm] = useState({ full_name: '', email: '', phone: '', password: '' });
    const [signedUrl, setSignedUrl] = useState(null);
    const [docUrls, setDocUrls] = useState({});

    useEffect(() => {
        fetchStudents();
    }, []);

    const fetchStudents = async () => {
        try {
            // Join registrations with profiles and documents
            const { data, error } = await supabase
                .from('registrations')
                .select(`
              *,
              profiles:user_id (email, full_name),
              documents (*)
            `)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setStudents(data);
        } catch (err) {
            console.error('Error fetching students:', err);
        } finally {
            setLoading(false);
        }
    };

    const openDetailModal = async (student) => {
        setSelectedStudent(student);
        setModalType('detail');
        setSignedUrl(null);
        setDocUrls({});

        // Generate Signed URL for Payment Proof
        if (student.payment_proof_url) {
            try {
                // FIX: Used 'payment_proofs' bucket
                const { data } = await supabase.storage.from('payment_proofs').createSignedUrl(student.payment_proof_url, 3600);
                if (data) setSignedUrl(data.signedUrl);
            } catch (err) {
                console.error('Error signing payment proof:', err);
            }
        }

        // Generate Signed URLs for Documents
        if (student.documents && student.documents.length > 0) {
            const newDocUrls = {};
            for (const doc of student.documents) {
                try {
                    const { data } = await supabase.storage.from('private-docs').createSignedUrl(doc.file_url, 3600);
                    if (data) newDocUrls[doc.id] = data.signedUrl;
                } catch (err) {
                    console.error(`Error signing doc ${doc.document_type}:`, err);
                }
            }
            setDocUrls(newDocUrls);
        }
    };

    const handleUpdateStatus = async (id, newStatus) => {
        if (!confirm(`Ubah status menjadi ${newStatus}?`)) return;
        try {
            console.log('Attempting update for ID:', id, 'New Status:', newStatus);

            const { data, error } = await supabase
                .from('registrations')
                .update({ status: newStatus })
                .eq('id', id)
                .select();

            if (error) throw error;

            if (!data || data.length === 0) {
                const { data: { user } } = await supabase.auth.getUser();
                const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
                alert(`Update GAGAL! \n\nDebug Info:\nRegistration ID: ${id}\nUser ID: ${user.id}\nRole di Database: ${profile?.role || 'Tidak ditemukan'}\n\nJika Role bukan 'admin', anda tidak bisa mengupdate data.`);
                return;
            }

            fetchStudents();
            if (selectedStudent && selectedStudent.id === id) {
                setSelectedStudent(prev => ({ ...prev, status: newStatus }));
            }
            toast.success('Status berhasil diubah!');
        } catch (err) {
            console.error('Error updating status:', err);
            alert(`Gagal mengubah status: ${err.message}\nDetails: ${err.details}\nHint: ${err.hint}`);
        }
    };

    const sendWhatsApp = (phone, message) => {
        if (!phone) {
            toast.success('Nomor telepon tidak tersedia');
            return;
        }
        let formatted = phone.replace(/\D/g, '');
        if (formatted.startsWith('0')) formatted = '62' + formatted.substring(1);
        const url = `https://wa.me/${formatted}?text=${encodeURIComponent(message)}`;
        window.open(url, '_blank');
    };

    const handleDelete = async (id) => {
        if (!confirm('Hapus data siswa ini? Aksi ini tidak dapat dibatalkan.')) return;
        try {
            await supabase.from('registrations').delete().eq('id', id);
            fetchStudents();
        } catch (err) {
            console.error('Error deleting:', err);
        }
    };

    const handleAddStudent = async (e) => {
        e.preventDefault();
        alert("Fitur 'Tambah Siswa' membutuhkan akses Admin Backend.");
        setModalType(null);
    };

    const handleEditStudent = async (e) => {
        e.preventDefault();
        try {
            await supabase.from('profiles').update({ full_name: studentForm.full_name }).eq('id', selectedStudent.user_id);
            const newFormData = { ...selectedStudent.form_data, parent_phone: studentForm.phone };
            await supabase.from('registrations').update({ form_data: newFormData }).eq('id', selectedStudent.id);
            toast.success('Data berhasil diupdate!');
            fetchStudents();
            setModalType(null);
        } catch (err) {
            console.error(err);
            toast.error('Gagal update data.');
        }
    };

    const openAddModal = () => {
        setStudentForm({ full_name: '', email: '', phone: '', password: '' });
        setModalType('add');
    };

    const openEditModal = (student) => {
        setSelectedStudent(student);
        setStudentForm({
            full_name: student.profiles?.full_name || '',
            email: student.profiles?.email || '',
            phone: student.form_data?.parent_phone || '',
            password: ''
        });
        setModalType('edit');
    };

    const filteredStudents = students.filter(student => {
        const matchesStatus = filterStatus === 'all' || student.status === filterStatus;
        const matchesSearch = student.profiles?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            student.profiles?.email?.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesStatus && matchesSearch;
    });

    const handleExport = () => {
        const dataToExport = filteredStudents.map(s => ({
            Nama: s.profiles?.full_name,
            Email: s.profiles?.email,
            Status: s.status,
            'Tanggal Daftar': new Date(s.created_at).toLocaleDateString(),
            'NISN': s.form_data?.nisn || '-',
            'Asal Sekolah': s.form_data?.origin_school || '-',
            'Program': s.boarding_type || '-',
            'Metode Daftar': s.registration_method || 'Online'
        }));
        const ws = XLSX.utils.json_to_sheet(dataToExport);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Pendaftar");
        XLSX.writeFile(wb, "Data_Pendaftar_SPMB.xlsx");
    };

    if (loading) return <div>Loading data...</div>;

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1>Data Pendaftar</h1>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button onClick={openAddModal} className="btn btn-primary">
                        <UserPlus size={18} /> Tambah Siswa
                    </button>
                    <button onClick={handleExport} className="btn btn-outline">
                        <Download size={18} /> Export Excel
                    </button>
                </div>
            </div>

            <div className="card" style={{ padding: '1rem', marginBottom: '2rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: '200px', position: 'relative' }}>
                    <Search size={20} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                    <input
                        type="text"
                        placeholder="Cari nama atau email..."
                        className="input"
                        style={{ paddingLeft: '2.5rem' }}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div style={{ width: '200px' }}>
                    <select
                        className="input"
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                    >
                        <option value="all">Semua Status</option>
                        <option value="registered">Baru Daftar</option>
                        <option value="payment_submitted">Sudah Bayar</option>
                        <option value="payment_verified">Pembayaran Valid</option>
                        <option value="documents_submitted">Berkas Uploaded</option>
                        <option value="verified">Terverifikasi</option>
                        <option value="passed">Lulus</option>
                        <option value="failed">Tidak Lulus</option>
                    </select>
                </div>
            </div>

            <div className="card" style={{ overflowX: 'auto', padding: 0 }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
                    <thead style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid var(--border-color)' }}>
                        <tr>
                            <th style={{ padding: '1rem', textAlign: 'left' }}>Nama Lengkap</th>
                            <th style={{ padding: '1rem', textAlign: 'left' }}>Email</th>
                            <th style={{ padding: '1rem', textAlign: 'left' }}>Program</th>
                            <th style={{ padding: '1rem', textAlign: 'left' }}>Metode</th>
                            <th style={{ padding: '1rem', textAlign: 'left' }}>No HP</th>
                            <th style={{ padding: '1rem', textAlign: 'left' }}>Status</th>
                            <th style={{ padding: '1rem', textAlign: 'left' }}>Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredStudents.map((student) => (
                            <tr key={student.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                <td style={{ padding: '1rem' }}>{student.profiles?.full_name}</td>
                                <td style={{ padding: '1rem' }}>{student.profiles?.email}</td>
                                <td style={{ padding: '1rem' }}>
                                    <span style={{ backgroundColor: '#e2e8f0', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.875rem' }}>
                                        {student.boarding_type || 'Fullday'}
                                    </span>
                                </td>
                                <td style={{ padding: '1rem' }}>
                                    <span style={{
                                        backgroundColor: student.registration_method === 'offline' ? '#ffedd5' : '#e0f2fe',
                                        color: student.registration_method === 'offline' ? '#c2410c' : '#0369a1',
                                        padding: '0.25rem 0.5rem',
                                        borderRadius: '4px',
                                        fontSize: '0.875rem',
                                        textTransform: 'capitalize'
                                    }}>
                                        {student.registration_method || 'Online'}
                                    </span>
                                </td>
                                <td style={{ padding: '1rem' }}>{student.form_data?.parent_phone || '-'}</td>
                                <td style={{ padding: '1rem' }}>
                                    <span style={{
                                        padding: '0.25rem 0.75rem',
                                        borderRadius: 'var(--radius-full)',
                                        fontSize: '0.875rem',
                                        backgroundColor:
                                            student.status === 'passed' ? '#dcfce7' :
                                                student.status === 'failed' ? '#fee2e2' :
                                                    student.status === 'payment_submitted' ? '#fef9c3' : '#f1f5f9',
                                        color:
                                            student.status === 'passed' ? '#166534' :
                                                student.status === 'failed' ? '#991b1b' :
                                                    student.status === 'payment_submitted' ? '#854d0e' : '#475569'
                                    }}>
                                        {student.status.replace('_', ' ')}
                                    </span>
                                </td>
                                <td style={{ padding: '1rem' }}>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <button onClick={() => openDetailModal(student)} className="btn btn-outline" style={{ padding: '0.25rem 0.5rem' }} title="Detail"><Eye size={16} /></button>
                                        <button onClick={() => openEditModal(student)} className="btn btn-outline" style={{ padding: '0.25rem 0.5rem' }} title="Edit"><Edit size={16} /></button>
                                        <button onClick={() => {
                                            const phone = student.form_data?.parent_phone || '';
                                            const password = student.form_data?.initial_password || '(Sesuai saat pendaftaran)';
                                            const msg = `Yth. Bapak/Ibu Calon Wali Murid,

Sehubungan dengan proses Seleksi Penerimaan Murid Baru (SPMB) di SMPIT Ibnu Sina Nunukan, bersama ini kami informasikan akses akun pribadi untuk memantau proses pendaftaran Ananda.

Berikut adalah detail akun Anda:

Nama Calon Siswa: ${student.profiles?.full_name}

Username: ${student.profiles?.email}

Password: ${password}

Bapak/Ibu dapat melakukan login dan melengkapi berkas pendaftaran melalui laman resmi kami di: ${window.location.origin}/login

Demikian informasi ini kami sampaikan. Semoga Ananda diberikan kemudahan dalam setiap proses seleksi.

Jazakumullah khairan katsiran.

Hormat kami, Panitia SPMB SMPIT Ibnu Sina Nunukan`;
                                            sendWhatsApp(phone, msg);
                                        }} className="btn btn-outline" style={{ padding: '0.25rem 0.5rem', color: '#25D366', borderColor: '#25D366' }} title="Kirim Akun WA"><MessageCircle size={16} /></button>
                                        <button onClick={() => handleDelete(student.id)} className="btn btn-outline" style={{ padding: '0.25rem 0.5rem', color: 'var(--error)', borderColor: 'var(--error)' }} title="Hapus"><Trash2 size={16} /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {filteredStudents.length === 0 && (
                            <tr>
                                <td colSpan="6" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Tidak ada data siswa.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {(modalType === 'add' || modalType === 'edit') && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
                    <div className="card" style={{ maxWidth: '500px', width: '90%' }}>
                        <h3 style={{ marginBottom: '1rem' }}>{modalType === 'add' ? 'Tambah Siswa' : 'Edit Siswa'}</h3>
                        <form onSubmit={modalType === 'add' ? handleAddStudent : handleEditStudent} style={{ display: 'grid', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Nama Lengkap</label>
                                <input type="text" className="input" required value={studentForm.full_name} onChange={e => setStudentForm({ ...studentForm, full_name: e.target.value })} />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Email</label>
                                <input type="email" className="input" required value={studentForm.email} onChange={e => setStudentForm({ ...studentForm, email: e.target.value })} disabled={modalType === 'edit'} />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem' }}>No WhatsApp</label>
                                <input type="tel" className="input" required value={studentForm.phone} onChange={e => setStudentForm({ ...studentForm, phone: e.target.value })} />
                            </div>
                            {modalType === 'add' && (
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem' }}>Password (Default: 123456)</label>
                                    <input type="text" className="input" value={studentForm.password} onChange={e => setStudentForm({ ...studentForm, password: e.target.value })} placeholder="123456" />
                                </div>
                            )}
                            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                                <button type="button" onClick={() => setModalType(null)} className="btn btn-outline" style={{ flex: 1 }}>Batal</button>
                                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Simpan</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {selectedStudent && modalType === 'detail' && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
                    <div className="card" style={{ maxWidth: '700px', width: '90%', maxHeight: '90vh', overflowY: 'auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h3>Detail Siswa: {selectedStudent.profiles?.full_name}</h3>
                            <button onClick={() => setSelectedStudent(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><XCircle size={24} /></button>
                        </div>

                        <div style={{ display: 'grid', gap: '1.5rem' }}>
                            {/* Status Section */}
                            <div style={{ padding: '1rem', backgroundColor: '#f8fafc', borderRadius: 'var(--radius-md)' }}>
                                <h4 style={{ marginBottom: '0.5rem' }}>Update Status</h4>
                                <select
                                    className="input"
                                    value={selectedStudent.status}
                                    onChange={(e) => handleUpdateStatus(selectedStudent.id, e.target.value)}
                                    style={{ width: '100%', padding: '0.5rem' }}
                                >
                                    <option value="registered">Baru Daftar</option>
                                    <option value="payment_submitted">Sudah Bayar (Menunggu Verifikasi)</option>
                                    <option value="payment_verified">Pembayaran Valid (Lanjut Isi Formulir)</option>
                                    <option value="documents_submitted">Berkas Diupload</option>
                                    <option value="verified">Data Terverifikasi</option>
                                    <option value="passed">Lulus</option>
                                    <option value="failed">Tidak Lulus</option>
                                </select>
                            </div>

                            {/* Payment Proof */}
                            {selectedStudent.payment_proof_url && (
                                <div>
                                    <h4 style={{ marginBottom: '0.5rem' }}>Bukti Pembayaran</h4>
                                    <div style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', overflow: 'hidden', padding: '0.5rem' }}>
                                        {signedUrl ? (
                                            <div style={{ textAlign: 'center' }}>
                                                <img src={signedUrl} alt="Bukti Pembayaran" style={{ maxWidth: '100%', maxHeight: '200px', objectFit: 'contain' }} />
                                                <div style={{ marginTop: '0.5rem' }}>
                                                    <a href={signedUrl} target="_blank" rel="noreferrer" className="btn btn-outline" style={{ fontSize: '0.875rem' }}>Buka Gambar Penuh</a>
                                                </div>
                                            </div>
                                        ) : (
                                            <p style={{ color: 'var(--error)', padding: '1rem', textAlign: 'center' }}>Gagal memuat gambar (Bucket error atau file tidak ditemukan).</p>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* PROGAM CHOICE (NEW) */}
                            <div>
                                <h4 style={{ marginBottom: '0.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>Program & Metode</h4>
                                <div style={{ display: 'flex', gap: '2rem' }}>
                                    <div>
                                        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Program</p>
                                        <p style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'var(--primary-color)' }}>{selectedStudent.boarding_type || 'Fullday (Default)'}</p>
                                    </div>
                                    <div>
                                        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Metode Daftar</p>
                                        <p style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'var(--text-primary)', textTransform: 'capitalize' }}>{selectedStudent.registration_method || 'Online'}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Form Data */}
                            <div>
                                <h4 style={{ marginBottom: '0.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>Data Formulir</h4>
                                {selectedStudent.form_data ? (
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                                        {Object.entries(selectedStudent.form_data).map(([key, value]) => (
                                            <div key={key}>
                                                <strong style={{ textTransform: 'capitalize' }}>{key.replace(/_/g, ' ')}:</strong> <br />
                                                <span style={{ color: 'var(--text-secondary)' }}>{value || '-'}</span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p style={{ color: 'var(--text-secondary)' }}>Belum mengisi formulir.</p>
                                )}
                            </div>

                            {/* Documents */}
                            <div>
                                <h4 style={{ marginBottom: '0.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>Dokumen Pendukung</h4>
                                {selectedStudent.documents && selectedStudent.documents.length > 0 ? (
                                    <div style={{ display: 'grid', gap: '0.5rem' }}>
                                        {selectedStudent.documents.map((doc) => (
                                            <div key={doc.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                    <CheckCircle size={18} color="var(--success)" />
                                                    <span style={{ textTransform: 'uppercase', fontWeight: 500 }}>{doc.document_type}</span>
                                                </div>
                                                {docUrls[doc.id] ? (
                                                    <a href={docUrls[doc.id]} target="_blank" rel="noreferrer" className="btn btn-outline" style={{ padding: '0.25rem 0.75rem', fontSize: '0.875rem' }}>
                                                        Lihat
                                                    </a>
                                                ) : (
                                                    <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Loading...</span>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p style={{ color: 'var(--text-secondary)' }}>Belum ada dokumen diupload.</p>
                                )}
                            </div>
                        </div>

                        <button onClick={() => setSelectedStudent(null)} style={{ marginTop: '1.5rem', width: '100%', padding: '0.75rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', background: 'white', cursor: 'pointer' }}>Tutup</button>
                    </div>
                </div>
            )}
        </div>
    );
}
