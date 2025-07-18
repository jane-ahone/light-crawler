import express from "express";
import cors from "cors";
import puppeteer from "puppeteer";
import "dotenv/config";
import email from "./helper/email.mjs";

const app = express();
const PORT = process.env.PORT || 3000;

const url = "https://alert.eneo.cm/?header=no";
app.use(cors());

(async () => {
  // Initiate the browser
  const browser = await puppeteer.launch();

  // Create a new page with the default browser context
  const page = await browser.newPage();

  await page.goto(url);

  await page.select("select#regions", "10");

  const res = await page.waitForSelector("div#contentdata > .outage", {
    timeout: 100000,
  });

  console.log('Result',res)

  const outageData = await page.evaluate(() => {
    return Array.from(
      document.querySelectorAll("div#contentdata > .outage")
    ).map((outage) => {
      return {
        quartier: outage.querySelector(".quartier")?.innerText || "",
        ville: outage.querySelector(".ville")?.innerText || "",
        observations: outage.querySelector(".observations")?.innerText || "",
        date: outage.querySelector(".prog_date")?.innerText || "",
      };
    });
  });

  // Sending the email to myself in case of outage

  if (outageData) {
    console.log("Outage data", outageData);
    email(outageData);
  } else {
    console.log("No outage");
  }

  // Closes the browser and all of its pages
  await browser.close();
})();

app.listen(PORT, () => {
  console.log("App listening on port", PORT);
});
