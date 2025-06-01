import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 587,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

transporter.verify(function (error, success) {
  if (error) {
    console.error("Transporter connection error:", error);
  } else {
    console.log("Server is ready to send messages", success);
  }
});

const sendPaymentConfirmationEmail = async (
  toEmail,
  customerName,
  eventTitle,
  quantity,
  totalAmount,
  ticketNumber
) => {
  console.log("Sending email to", toEmail);
  console.log("Customer name:", customerName);
  console.log("Event title:", eventTitle);
  console.log("Quantity:", quantity);
  console.log("Total amount:", totalAmount);
  console.log("Ticket number:", ticketNumber);

  const mailOptions = {
    from: `"True Events" <${process.env.SENDER_EMAIL}>`,
    to: toEmail,
    subject: `Ticket Confirmation - ${eventTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
        <h2 style="color: #2c3e50;">Hello ${customerName},</h2>
        
        <p>Thank you for booking <strong>${quantity}</strong> ticket(s) for the event: <strong>${eventTitle}</strong>.</p>
        
        <p><strong>Total Paid:</strong> $${totalAmount}</p>
        <p><strong>Ticket Number:</strong> ${ticketNumber}</p>
        
        <p>Your payment has been received successfully, and your booking is now confirmed.</p>
        
        <hr style="margin: 20px 0;" />
        
        <p>We look forward to seeing you at the event.</p>
        
        <p style="margin-top: 30px;">
          Best regards,<br/>
          <em>The True Events Team</em>
        </p>
      </div>
    `,
  };

  try {
    const result = await transporter.sendMail(mailOptions);
    console.log("Email sent: ", result);
  } catch (error) {
    console.error("sendMail failed: ", error);
  }
};

export default sendPaymentConfirmationEmail;
