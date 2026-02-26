const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // true for 465, false for other ports
    auth: {
        user: 'misagh754@gmail.com',
        pass: 'lqqnoolxcahfcdir'  // Render ENV 'SMTP_PASS' equivalent
    },
    debug: true,
    logger: true
});

console.log("=".repeat(60));
console.log("TESTING SMTP CONNECTION (PORT 465): Verifying Credentials...");
console.log("=".repeat(60));

transporter.verify(function (error, success) {
    if (error) {
        console.log("✗ SMTP CONNECTION FAILED. EXACT ERROR:");
        console.log(error);
    } else {
        console.log("✓ SMTP Server is ready to take our messages");

        const mailOptions = {
            from: '"HPE Rainmaker" <misagh754@gmail.com>',
            to: 'misagh754@gmail.com',
            subject: 'HPE: SMTP Port 465 Test',
            text: 'This is a raw SMTP debug test over port 465.'
        };

        transporter.sendMail(mailOptions, (err, info) => {
            if (err) {
                console.log('✗ EMAIL SEND FAILED:', err);
            } else {
                console.log('✓ EMAIL SENT SUCCESSFULLY. SMTP RESPONSE:');
                console.log(info.response);
            }
        });
    }
});
