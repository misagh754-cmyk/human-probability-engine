import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

def send_test_email():
    sender_email = "misagh754@gmail.com"
    receiver_email = "misagh754@gmail.com"
    password = "lqqnoolxcahfcdir"

    message = MIMEMultipart("alternative")
    message["Subject"] = "HPE: Python SMTP Test ✅"
    message["From"] = sender_email
    message["To"] = receiver_email

    text = "This is a test email from Python smtplib."
    html = "<html><body><p>This is a test email from Python <b>smtplib</b>.</p></body></html>"

    part1 = MIMEText(text, "plain")
    part2 = MIMEText(html, "html")
    message.attach(part1)
    message.attach(part2)

    print("Attempting to connect to smtp.gmail.com on port 587...")
    try:
        server = smtplib.SMTP("smtp.gmail.com", 587, timeout=10)
        server.starttls()
        print("Logging in...")
        server.login(sender_email, password)
        print("Sending message...")
        server.sendmail(sender_email, receiver_email, message.as_string())
        server.quit()
        print("✓ SUCCESS: Email sent to misagh754@gmail.com")
    except Exception as e:
        print(f"✗ FAILED: {e}")

if __name__ == "__main__":
    send_test_email()
