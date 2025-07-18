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
  const browser = await puppeteer.launch();

  // Create a new page with the default browser context
  const page = await browser.newPage();

  await page.goto(url);

  // Select Southwest region
  await page.select("select#regions", "10");

  // Await results and process it
  for (let index = 0; index < 3; index++) {
    console.log("First try", index);
    try {
      // await page.waitForSelector("div#contentdata > .outage", {
      //   timeout: 100000,
      // });
      // const outageData = await page.evaluate(() => {
      //   return Array.from(
      //     document.querySelectorAll("div#contentdata > .outage")
      //   ).map((outage) => {
      //     return {
      //       quartier: outage.querySelector(".quartier")?.innerText || "",
      //       ville: outage.querySelector(".ville")?.innerText || "",
      //       observations:
      //         outage.querySelector(".observations")?.innerText || "",
      //       date: outage.querySelector(".prog_date")?.innerText || "",
      //     };
      //   });
      // });

      // Sending the email to myself in case of outage

      // if (outageData) {
      //   console.log("Outage data", outageData);
      //   email(outageData);
      // } else {
      //   console.log("No outage");
      // }
      break;
    } catch (error) {
      sendErrorEmail();
    }
  }

  // Closes the browser and all of its pages
  await browser.close();
})();

app.listen(PORT, () => {
  console.log("App listening on port", PORT);
});
