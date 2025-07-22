import express from "express";
import cors from "cors";
import puppeteer from "puppeteer";
import "dotenv/config";
import email, { sendErrorEmail } from "./helper/email.mjs";

const app = express();
const PORT = process.env.PORT || 3000;

const url = "https://alert.eneo.cm/?header=no";
app.use(cors());

(async () => {
  // Initiate the browser
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  // Create a new page with the default browser context
  const page = await browser.newPage();

  await page.goto(url);

  // Select Southwest region; its value is 10 on the website
  await page.select("select#regions", "10");
  // Check if there is no outage
  try {
    await page.waitForSelector("div#contentdata > .no_prog", {
      timeout: 100000,
    });

    process.exit(0);
  } catch (error) {
    // If there is an outage an error is thrown and the catch section runs
    //For loop enables a retry policy of 3
    for (let index = 0; index < 1; index++) {
      try {
        await page.waitForSelector("div#contentdata > .outage", {
          timeout: 100000,
        });
        const outageData = await page.evaluate(() => {
          return Array.from(
            document.querySelectorAll("div#contentdata > .outage")
          ).map((outage) => {
            return {
              quartier: outage.querySelector(".quartier")?.innerText || "",
              ville: outage.querySelector(".ville")?.innerText || "",
              observations:
                outage.querySelector(".observations")?.innerText || "",
              date: outage.querySelector(".prog_date")?.innerText || "",
            };
          });
        });

        // Sending the email to myself in case of outage

        if (outageData) {
          email(outageData);
        }
        break;
      } catch (error) {
        // If another error is thrown, then there is an error
        sendErrorEmail();
      }
    }
  }

  // Closes the browser and all of its pages
  await browser.close();
})();

app.listen(PORT, () => {
  console.log("App listening on port", PORT);
});
