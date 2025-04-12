import mailgun from 'mailgun-js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { name, email, subject, message } = req.body;

  // Validate input
  if (!name || !email || !message) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  // Configure Mailgun
  const mg = mailgun({
    apiKey: process.env.MAILGUN_API_KEY,
    domain: process.env.MAILGUN_DOMAIN
  });

  const emailData = {
    from: `Leap Contact <noreply@${process.env.MAILGUN_DOMAIN}>`,
    to: 'jamesthaura51@gmail.com',
    subject: subject || `New message from ${name}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #06b6d4;">New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        ${subject ? `<p><strong>Subject:</strong> ${subject}</p>` : ''}
        <p><strong>Message:</strong></p>
        <p>${message.replace(/\n/g, '<br>')}</p>
        <p style="font-size: 12px; color: #666;">
          Sent from Leap.ai at ${new Date().toLocaleString()}
        </p>
      </div>
    `,
    'h:Reply-To': email // Allows direct replies to the sender
  };

  try {
    await mg.messages().send(emailData);
    return res.status(200).json({ message: 'Message sent successfully!' });
  } catch (error) {
    console.error('Mailgun error:', error);
    return res.status(500).json({ message: 'Failed to send message' });
  }
}