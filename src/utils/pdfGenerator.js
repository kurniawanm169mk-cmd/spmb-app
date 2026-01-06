
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { PDFDocument } from 'pdf-lib';
import { supabase } from '../lib/supabase';

// Helper to fetch file as ArrayBuffer
async function fetchFile(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Network response was not ok');
        return await response.arrayBuffer();
    } catch (error) {
        console.error('Error fetching file:', url, error);
        return null;
    }
}

// Generate Single Student PDF
export async function generateStudentPDF(student) {
    // 1. Create Base PDF (Form Data)
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // Header
    doc.setFontSize(18);
    doc.text('Kartu Pendaftaran & Berkas', pageWidth / 2, 20, { align: 'center' });

    doc.setFontSize(12);
    doc.text(`${student.profiles?.full_name} `, pageWidth / 2, 30, { align: 'center' });
    doc.text(`ID: ${student.user_id} `, pageWidth / 2, 36, { align: 'center' });

    // Table: Registration Details
    const tableBody = [
        ['Nama Lengkap', student.profiles?.full_name],
        ['Email', student.profiles?.email],
        ['Status', student.status],
        ['Program', student.boarding_type || '-'],
        ['Metode Daftar', student.registration_method || 'Online'],
    ];

    // Add all form_data fields dynamically
    if (student.form_data) {
        Object.entries(student.form_data).forEach(([key, value]) => {
            // Skip fields we already showed or internal fields
            if (['initial_password', 'confirm_password'].includes(key)) return;

            // Format Key: parent_name -> Parent Name
            const formattedKey = key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
            tableBody.push([formattedKey, value || '-']);
        });
    }

    autoTable(doc, {
        startY: 45,
        head: [['Data', 'Keterangan']],
        body: tableBody,
        theme: 'grid',
        headStyles: { fillColor: [22, 163, 74] }, // Green-600
        columnStyles: {
            0: { cellWidth: 60, fontStyle: 'bold' },
            1: { cellWidth: 'auto' }
        }
    });

    // 2. Prepare for Merging
    const pdfDoc = await PDFDocument.create();

    // Copy the JS PDF page (Form Data)
    const formPdfBytes = doc.output('arraybuffer');
    const formPdf = await PDFDocument.load(formPdfBytes);
    const [formPage] = await pdfDoc.copyPages(formPdf, [0]);
    pdfDoc.addPage(formPage);

    // 3. Process Payment Proof
    if (student.payment_proof_url) {
        try {
            const { data } = await supabase.storage.from('payment_proofs').createSignedUrl(student.payment_proof_url, 3600);
            if (data?.signedUrl) {
                const imgBuffer = await fetchFile(data.signedUrl);
                if (imgBuffer) {
                    const isPng = student.payment_proof_url.toLowerCase().endsWith('.png');
                    const image = isPng ? await pdfDoc.embedPng(imgBuffer) : await pdfDoc.embedJpg(imgBuffer);

                    const page = pdfDoc.addPage();
                    const { width, height } = image.scaleToFit(page.getWidth() - 40, page.getHeight() - 100);

                    page.drawText('Bukti Pembayaran', { x: 20, y: page.getHeight() - 40, size: 16 });
                    page.drawImage(image, {
                        x: 20,
                        y: page.getHeight() - 50 - height,
                        width,
                        height,
                    });
                }
            }
        } catch (err) {
            console.error('Error adding payment proof:', err);
        }
    }

    // 4. Process Documents
    if (student.documents && student.documents.length > 0) {
        for (const doc of student.documents) {
            try {
                const { data } = await supabase.storage.from('private-docs').createSignedUrl(doc.file_url, 3600);
                if (data?.signedUrl) {
                    const docBuffer = await fetchFile(data.signedUrl);
                    if (docBuffer) {
                        if (doc.file_url.toLowerCase().endsWith('.pdf')) {
                            // Merge PDF
                            const loadedDoc = await PDFDocument.load(docBuffer);
                            const copiedPages = await pdfDoc.copyPages(loadedDoc, loadedDoc.getPageIndices());
                            copiedPages.forEach((page) => pdfDoc.addPage(page));
                        } else {
                            // Embed Image
                            const isPng = doc.file_url.toLowerCase().endsWith('.png');
                            const image = isPng ? await pdfDoc.embedPng(docBuffer) : await pdfDoc.embedJpg(docBuffer);

                            const page = pdfDoc.addPage();
                            const { width, height } = image.scaleToFit(page.getWidth() - 40, page.getHeight() - 100);

                            page.drawText(`Dokumen: ${doc.document_type} `, { x: 20, y: page.getHeight() - 40, size: 16 });
                            page.drawImage(image, {
                                x: 20,
                                y: page.getHeight() - 50 - height,
                                width,
                                height,
                            });
                        }
                    }
                }
            } catch (err) {
                console.error(`Error adding doc ${doc.document_type}: `, err);
            }
        }
    }

    // 5. Save
    const pdfBytes = await pdfDoc.save();
    return new Blob([pdfBytes], { type: 'application/pdf' });
}
