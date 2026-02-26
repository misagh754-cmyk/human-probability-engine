const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: 'misagh754@gmail.com',
        pass: 'lqqnoolxcahfcdir'  // Render ENV 'SMTP_PASS' equivalent
    }
});

const checkout_link = "https://human-probability-enginehuman.onrender.com";

const mailOptions = {
    from: '"HPE Rainmaker" <misagh754@gmail.com>',
    to: 'misagh754@gmail.com',
    subject: 'rainmaker is live',
    text: `Hey CEO,\n\nThis is an automated verification email from THE RAINMAKER.\n\nThe autonomous outreach engine is now LIVE and operational.\nDaily Limit: 40 emails/day\nPrice Point: $199/conversion\n\nThe engine will now begin processing the 342 identified startup leads.\n\n— HPE Rainmaker Engine v2.0`,
    html: `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size: 14px; color: #333; line-height: 1.6;">
Hey CEO,<br><br>
This is an automated verification email from THE RAINMAKER.<br><br>
The autonomous outreach engine is now LIVE and operational.<br>
Daily Limit: 40 emails/day<br>
Price Point: $199/conversion<br><br>
The engine will now begin processing the 342 identified startup leads in Stealth Mode (7-22 min delay).<br><br>
Run your Deep Scale Analysis here ($199): <a href="${checkout_link}" style="color: #0ea5e9;">${checkout_link}</a>
<br><br>
<span style="color: #999; font-size: 11px;">Sent from HPE Analytics V1 | <a href="${checkout_link}" style="color: #0ea5e9;">humanprobability.ai</a></span>
</div>`
};

console.log("=" * 60);
console.log("IGNITING FULL FIRE MODE: Dispatching CEO Verification Email...");
console.log("=" * 60);

transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
        console.log('✗ EMAIL SEND FAILED (Check App Password formatting):', error);
    } else {
        console.log('✓ FULL FIRE TEST EMAIL SENT TO INBOX:', info.response);
    }
});
