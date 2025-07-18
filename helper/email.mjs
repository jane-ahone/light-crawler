import nodemailer from "nodemailer";
import "dotenv/config";

// Create transporter
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const generateOutageEmailHtml = (region, outages = []) => {
  const outageRows = outages
    .map(
      (outage, index) => `
      <tr>
        <td style="padding: 8px; border: 1px solid #ccc;">${index + 1}</td>
        <td style="padding: 8px; border: 1px solid #ccc;">${
          outage.quartier
        }</td>
        <td style="padding: 8px; border: 1px solid #ccc;">${outage.ville}</td>
        <td style="padding: 8px; border: 1px solid #ccc;">${
          outage.observations
        }</td>
        <td style="padding: 8px; border: 1px solid #ccc;">${outage.date}</td>
      </tr>`
    )
    .join("");

  return `
    <div style="font-family: Arial, sans-serif; color: #333;">
      <h2>📢 Power Outage Alert - Region: ${region}</h2>
      <p>Below is the list of scheduled outages:</p>
      <table style="border-collapse: collapse; width: 100%; margin-top: 16px;">
        <thead>
          <tr style="background-color: #f2f2f2;">
            <th style="padding: 8px; border: 1px solid #ccc;">#</th>
            <th style="padding: 8px; border: 1px solid #ccc;">Quartier</th>
            <th style="padding: 8px; border: 1px solid #ccc;">Ville</th>
            <th style="padding: 8px; border: 1px solid #ccc;">Observations</th>
            <th style="padding: 8px; border: 1px solid #ccc;">Date</th>
          </tr>
        </thead>
        <tbody>
          ${
            outageRows ||
            "<tr><td colspan='5' style='padding: 8px;'>No outages reported.</td></tr>"
          }
        </tbody>
      </table>
      <p style="margin-top: 20px;">Stay safe,</p>
      <p><b>LightCrawler</b></p>
    </div>
  `;
};

const sendOutageEmail = async (emailTemplate) => {
  try {
    const info = await transporter.sendMail({
      from: '"LightCrawler Info" <team@example.com>',
      to: `${process.env.SMTP_RECEIVER}`,
      subject: "Omo, bulb go dark oh",
      text: "Hello world?",
      html: emailTemplate,
    });

    console.log("Message sent: %s", info.messageId);
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
  } catch (err) {
    console.error("Error while sending mail", err);
  }
};

export const sendErrorEmail = async () => {
  try {
    const info = await transporter.sendMail({
      from: '"LightCrawler Info" <team@example.com>',
      to: `${process.env.SMTP_RECEIVER}`,
      subject: "Bug alerttt",
      text: "Your code didn't run today ohh",
    });

    console.log("Message sent: %s", info.messageId);
  } catch (err) {
    console.error("Error while sending mail", err);
  }
};

const email = async (outageData) => {
  const emailTemplate = generateOutageEmailHtml("South West", outageData);
  sendOutageEmail(emailTemplate);
};

export default email;
