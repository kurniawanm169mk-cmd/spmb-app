import emailjs from '@emailjs/browser';

// TODO: Replace with actual keys from EmailJS Dashboard
// You can also move these to .env variables (VITE_EMAILJS_SERVICE_ID, etc.)
const SERVICE_ID = 'service_xtnwh8k';
const TEMPLATE_ID = 'template_9liqr3r';
const PUBLIC_KEY = 'o6mP-SPtfErKgmgQo';

export const sendRegistrationEmail = async (data) => {
    try {
        const templateParams = {
            to_name: 'Admin',
            from_name: data.fullName,
            from_email: data.email,
            phone: data.phone,
            message: `Pendaftaran Baru:
            Nama: ${data.fullName}
            Email: ${data.email}
            No HP: ${data.phone}
            Password Awal: ${data.password}
            
            Mohon segera verifikasi pembayaran dan aktivasi akun siswa ini.`
        };

        const response = await emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams, PUBLIC_KEY);
        console.log('SUCCESS!', response.status, response.text);
        return { success: true };
    } catch (error) {
        console.error('FAILED...', error);
        return { success: false, error };
    }
};
