import React, { useState, useRef, useEffect } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';
import { X, Upload, Trash2, Save, Download } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export default function SmartDocViewer({ template, registration, onClose, onSaved }) {
    const [formData, setFormData] = useState({});
    const [signatureData, setSignatureData] = useState(null);
    const [materaiFile, setMateraiFile] = useState(null);
    const [materaiPreview, setMateraiPreview] = useState(null);
    const [saving, setSaving] = useState(false);
    const [downloading, setDownloading] = useState(false);
    const [dynamicFields, setDynamicFields] = useState([]);

    const signatureRef = useRef(null);
    const contentRef = useRef(null);

    // Initial Data Separation
    // Standard fields from registration (read-only or pre-filled)
    const standardFields = {
        nama_siswa: registration?.full_name || '',
        nisn: registration?.nisn || '',
        alamat: registration?.address || '',
        tempat_lahir: registration?.birth_place || '',
        tanggal_lahir: registration?.birth_date || '',
        asal_sekolah: registration?.school_origin || '',
        nama_ayah: registration?.father_name || '',
        nama_ibu: registration?.mother_name || '',
        no_hp: registration?.phone || '',
        email: registration?.email || '',
    };

    useEffect(() => {
        // Parse content to find all {{variables}}
        if (template.content_html) {
            const regex = /{{([\w_]+)}}/g;
            const matches = [...template.content_html.matchAll(regex)];
            const fields = matches.map(m => m[1]);
            const uniqueFields = [...new Set(fields)].filter(f => f !== 'tanda_tangan' && f !== 'materai');
            setDynamicFields(uniqueFields);

            // Initialize formData with standard values if available
            const initialData = {};
            uniqueFields.forEach(field => {
                if (standardFields[field]) {
                    initialData[field] = standardFields[field];
                }
            });
            setFormData(prev => ({ ...prev, ...initialData }));
        }
    }, [template, registration]);

    const handleInputChange = (key, value) => {
        setFormData(prev => ({ ...prev, [key]: value }));
    };

    const handleClearSignature = () => {
        if (signatureRef.current) {
            signatureRef.current.clear();
            setSignatureData(null);
        }
    };

    const handleSaveSignature = () => {
        if (signatureRef.current && !signatureRef.current.isEmpty()) {
            const dataUrl = signatureRef.current.toDataURL();
            setSignatureData(dataUrl);
            toast.success('Tanda tangan disimpan');
        } else {
            toast.error('Tanda tangan masih kosong');
        }
    };

    const handleMateraiUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (!file.type.startsWith('image/')) {
            toast.error('File harus berupa gambar');
            return;
        }
        setMateraiFile(file);
        const reader = new FileReader();
        reader.onload = () => setMateraiPreview(reader.result);
        reader.readAsDataURL(file);
        toast.success('Materai diunggah');
    };

    const generatePDF = async (mode = 'save') => {
        const loadingSet = mode === 'save' ? setSaving : setDownloading;
        loadingSet(true);

        try {
            const element = contentRef.current;

            // force element to specific pixel width for consistent capture
            // A4 @ 96 DPI is approx 794px width.
            // But we rendered it at 210mm. 
            // html2canvas uses the computed style.

            const canvas = await html2canvas(element, {
                scale: 2, // 2x scale for sharpness (creates large image)
                useCORS: true,
                logging: false,
                backgroundColor: '#ffffff',
                // Important: Fix width/height to avoid random scrolling capture
                width: element.offsetWidth,
                height: element.offsetHeight,
                windowWidth: element.scrollWidth,
                windowHeight: element.scrollHeight
            });

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth(); // 210mm
            const pdfHeight = pdf.internal.pageSize.getHeight(); // 297mm

            const canvasRatio = canvas.height / canvas.width;
            const pdfRatio = pdfHeight / pdfWidth;

            let finalWidth = pdfWidth;
            let finalHeight = finalWidth * canvasRatio;

            // Logic: "Dijadikan 1 lembar" (Make it 1 page)
            // If the content is taller than 1 page, we shrink it to fit.
            if (canvasRatio > pdfRatio) {
                // Too tall, fit to height
                finalHeight = pdfHeight;
                finalWidth = finalHeight / canvasRatio;
                // Center horizontally if shrunk by height
                const xOffset = (pdfWidth - finalWidth) / 2;
                pdf.addImage(imgData, 'PNG', xOffset, 0, finalWidth, finalHeight);
            } else {
                // Width fits or is wider (Fit to width)
                // standard A4 width
                pdf.addImage(imgData, 'PNG', 0, 0, finalWidth, finalHeight);
            }

            if (mode === 'download') {
                pdf.save(`${template.title}.pdf`);
                toast.success('PDF berhasil diunduh');
            } else {
                const pdfBlob = pdf.output('blob');
                await uploadAndSave(pdfBlob);
            }

        } catch (err) {
            console.error('Error generating PDF:', err);
            toast.error('Gagal memproses dokumen');
        } finally {
            loadingSet(false);
        }
    };

    const uploadAndSave = async (pdfBlob) => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            const fileName = `${user.id}/smart_doc_${template.id}_${Date.now()}.pdf`;

            const { error: uploadError } = await supabase.storage
                .from('private-docs')
                .upload(fileName, pdfBlob);

            if (uploadError) throw uploadError;

            // Save record
            const { error: dbError } = await supabase.from('documents').insert([{
                registration_id: registration.id,
                document_type: `smart_${template.id}`,
                file_url: fileName,
                file_name: `${template.title}.pdf`,
                file_size: pdfBlob.size
            }]);

            if (dbError) throw dbError;

            // Track generation
            await supabase.from('generated_documents').insert([{
                registration_id: registration.id,
                template_id: template.id,
                file_url: fileName
            }]);

            toast.success('Dokumen berhasil disimpan!');
            onSaved && onSaved();
            onClose();
        } catch (err) {
            console.error('Save error:', err);
            toast.error('Gagal menyimpan ke server');
        }
    };

    const renderContentWithInputs = () => {
        let html = template.content_html;

        // Replace all {{variable}} with <span id="var-placeholder"></span>
        html = html.replace(/{{([\w_]+)}}/g, (match, varName) => {
            return `<span data-var="${varName}" class="dynamic-input-placeholder"></span>`;
        });

        return html;
    };

    // Effect to mount inputs into placeholders
    useEffect(() => {
        if (!contentRef.current) return;

        const placeholders = contentRef.current.querySelectorAll('.dynamic-input-placeholder');

        placeholders.forEach(span => {
            const varName = span.getAttribute('data-var');

            // Special handling for signature and materai
            if (varName === 'tanda_tangan' || varName === 'materai') {
                if (varName === 'tanda_tangan') {
                    if (signatureData) {
                        const img = document.createElement('img');
                        img.src = signatureData;
                        img.style.height = '60px'; // Consistent size
                        span.replaceWith(img);
                    } else {
                        span.innerHTML = '<span style="color:red; font-size: 0.8em; background:#fee; padding:2px;">(Tanda Tangan)</span>';
                    }
                } else if (varName === 'materai') {
                    if (materaiPreview) {
                        const img = document.createElement('img');
                        img.src = materaiPreview;
                        img.style.width = '60px';
                        span.replaceWith(img);
                    } else {
                        span.innerHTML = '<span style="color:red; font-size: 0.8em; background:#fee; padding:2px;">(Materai)</span>';
                    }
                }
                return;
            }

            // Standard Inputs
            const val = formData[varName] || '';
            const input = document.createElement('input');
            input.type = 'text';
            input.value = val;
            input.placeholder = '.....';
            // Styling to look like a line effectively
            input.style.cssText = 'border: none; border-bottom: 1px dotted #000; outline: none; min-width: 100px; font-family: inherit; font-size: inherit; background: transparent; padding: 0 4px; text-align: center;';

            // Auto-width based on content
            input.style.width = Math.max(val.length + 1, 15) + 'ch';

            input.oninput = (e) => {
                handleInputChange(varName, e.target.value);
                e.target.style.width = Math.max(e.target.value.length + 1, 15) + 'ch';
            };

            span.replaceWith(input);
        });

    }, [formData, template.content_html, signatureData, materaiPreview]);


    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 2000,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '1rem',
            // Disable scroll on body while open?
        }}>
            <div className="card" style={{ maxWidth: '1000px', width: '100%', maxHeight: '95vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <div style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff' }}>
                    <h2 style={{ margin: 0, fontSize: '1.25rem' }}>{template.title}</h2>
                    <button onClick={onClose} className="btn btn-outline btn-sm">
                        <X size={20} />
                    </button>
                </div>

                <div
                    style={{
                        flex: 1,
                        overflowY: 'auto',
                        backgroundColor: '#525659',
                        padding: '2rem',
                        display: 'flex',
                        justifyContent: 'center'
                    }}
                >

                    {/* PAPER VIEW (A4) */}
                    <div
                        ref={contentRef}
                        style={{
                            // Fixed Pixel Width for consistency. 210mm is roughly 794px at 96dpi.
                            // However, we want high quality, so maybe slightly larger visually but scaling handles it.
                            width: '210mm',
                            // Setting Min Height to A4
                            minHeight: '297mm',
                            backgroundColor: 'white',
                            boxShadow: '0 0 10px rgba(0,0,0,0.5)',
                            position: 'relative',
                            color: 'black',
                            fontFamily: 'serif', // Generic serif to match PDF expectation
                            fontSize: '12pt',
                            display: 'flex',
                            flexDirection: 'column',
                            // Reset text alignment to left to avoid scattering, unless specific
                            textAlign: 'left'
                        }}
                    >
                        {/* Letterhead - strict width */}
                        {template.letterhead_url && (
                            <img
                                src={template.letterhead_url}
                                alt="Kop Surat"
                                style={{
                                    width: '100%',
                                    height: 'auto',
                                    display: 'block',
                                    objectFit: 'contain',
                                    // Ensure it doesn't overflow
                                    maxWidth: '100%'
                                }}
                                crossOrigin="anonymous"
                            />
                        )}

                        {/* Content Body - with Margins */}
                        <div
                            style={{
                                padding: '10mm 20mm 20mm 20mm', // standard margins
                                flex: 1,
                                display: 'flex',
                                flexDirection: 'column'
                            }}
                        >
                            {/* Force specific styling for printed content */}
                            <style>{`
                                .document-content p { margin-bottom: 0.5em; line-height: 1.5; }
                                .document-content table { width: 100%; border-collapse: collapse; }
                                .document-content td, .document-content th { border: 1px solid black; padding: 4px; }
                                input { font-family: inherit; font-size: inherit; color: black; }
                            `}</style>
                            <div
                                className="document-content"
                                dangerouslySetInnerHTML={{ __html: renderContentWithInputs() }}
                            />
                        </div>
                    </div>
                </div>

                {/* Footer controls ... */}

                <div style={{ padding: '1rem', borderTop: '1px solid var(--border-color)', backgroundColor: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottomLeftRadius: '8px', borderBottomRightRadius: '8px', flexWrap: 'wrap', gap: '1rem' }}>

                    {/* Input Controls for Signature/Materai */}
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                        {(dynamicFields.includes('tanda_tangan') || template.content_html?.includes('{{tanda_tangan}}')) && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                <span style={{ fontSize: '0.75rem', fontWeight: 'bold' }}>Tanda Tangan:</span>
                                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                    <div style={{ border: '1px solid #ccc', backgroundColor: '#fff', width: '150px', height: '60px' }}>
                                        <SignatureCanvas
                                            ref={signatureRef}
                                            canvasProps={{ width: 150, height: 60, className: 'sigCanvas' }}
                                            onEnd={handleSaveSignature}
                                        />
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                        <button onClick={handleSaveSignature} className="btn btn-xs btn-primary" style={{ fontSize: '0.65rem' }}>Simpan</button>
                                        <button onClick={handleClearSignature} className="btn btn-xs btn-outline" style={{ fontSize: '0.65rem' }}>Ulang</button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {(dynamicFields.includes('materai') || template.content_html?.includes('{{materai}}')) && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                <span style={{ fontSize: '0.75rem', fontWeight: 'bold' }}>Materai:</span>
                                <input type="file" accept="image/*" onChange={handleMateraiUpload} style={{ width: '180px', fontSize: '0.75rem' }} />
                                {materaiPreview && <span style={{ color: 'green', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}><Check size={10} /> Uploaded</span>}
                            </div>
                        )}
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button onClick={() => generatePDF('download')} className="btn btn-outline" disabled={downloading}>
                            <Download size={18} style={{ marginRight: '0.5rem' }} /> PDF
                        </button>
                        <button onClick={() => generatePDF('save')} className="btn btn-primary" disabled={saving}>
                            <Save size={18} style={{ marginRight: '0.5rem' }} /> Simpan
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
