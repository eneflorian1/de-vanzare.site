import nodemailer from 'nodemailer';

// Configurarea transportului pentru trimiterea emailurilor
const transporter = nodemailer.createTransport({
  host: 'mail.de-vanzare.ro',
  port: 465,
  secure: true, // true pentru portul 465, false pentru alte porturi
  auth: {
    user: 'noreply@de-vanzare.ro',
    pass: 'd^QnYB2X2[8V'
  }
});

// Template pentru emailul de validare a anunțului
export const createListingValidationEmail = (
  recipientEmail: string,
  listingTitle: string,
  validationLink: string
) => {
  return {
    from: '"de-Vanzare.ro" <noreply@de-vanzare.ro>',
    to: recipientEmail,
    subject: 'Validează anunțul tău pe de-Vanzare.ro',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h1 style="color: #4f46e5;">de-Vanzare.ro</h1>
        </div>
        
        <p style="font-size: 16px; line-height: 1.5; color: #333;">Salut,</p>
        
        <p style="font-size: 16px; line-height: 1.5; color: #333;">
          Îți mulțumim pentru că ai publicat anunțul <strong>${listingTitle}</strong> pe platforma noastră.
        </p>
        
        <p style="font-size: 16px; line-height: 1.5; color: #333;">
          Pentru a finaliza procesul de publicare și a activa anunțul tău, te rugăm să confirmi adresa de email folosind link-ul de mai jos:
        </p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${validationLink}" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">
            Validează anunțul
          </a>
        </div>
        
        <p style="font-size: 16px; line-height: 1.5; color: #333;">
          Dacă nu ai creat acest anunț, te rugăm să ignori acest email.
        </p>
        
        <p style="font-size: 16px; line-height: 1.5; color: #333;">
          Cu stimă,<br>
          Echipa de-Vanzare.ro
        </p>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; font-size: 12px; color: #666; text-align: center;">
          <p>Acest email a fost trimis automat. Te rugăm să nu răspunzi la acest mesaj.</p>
          <p>&copy; ${new Date().getFullYear()} de-Vanzare.ro. Toate drepturile rezervate.</p>
        </div>
      </div>
    `
  };
};

// Funcție pentru trimiterea emailului
export const sendEmail = async (mailOptions: any) => {
  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error };
  }
};

// Funcție pentru generarea unui token de validare
export const generateValidationToken = () => {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
};

// Funcție pentru generarea link-ului de validare
export const generateValidationLink = (listingId: number, token: string) => {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  return `${baseUrl}/validare-anunt?id=${listingId}&token=${token}`;
}; 