import assert from "node:assert/strict";
import { chromium } from "playwright";

const baseUrl = process.env.E2E_BASE_URL ?? "http://127.0.0.1:8000";

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    await page.goto(baseUrl, { waitUntil: "networkidle" });
    await page.getByRole("heading", { name: /Stay grounded in your notes/ }).waitFor();

    await page.getByLabel("Question or topic").fill("What are the key concepts?");
    await page.getByRole("button", { name: "Find an answer" }).click();
    await page.locator("#answerArea").getByText("Add study notes first, then ask your question.").waitFor();
    console.log("PASS: asking without notes gives a clear prompt");

    await page.getByLabel("Document title").fill("Architecture Notes");
    await page.getByLabel("Paste notes").fill("A monolith packages application features into one deployable unit. Microservices split an application into independently deployable services that communicate over defined interfaces.");
    await page.getByRole("button", { name: "Add to library" }).click();
    await page.getByText("Architecture Notes", { exact: true }).first().waitFor();
    console.log("PASS: notes can be added to the library");

    await page.getByLabel("Question or topic").fill("What are microservices?");
    await page.getByRole("button", { name: "Find an answer" }).click();
    await page.locator("#answerArea").getByText("Best matching passage from").waitFor();
    await page.locator("#answerArea .answer-text").filter({ hasText: "Microservices split an application into independently deployable services" }).first().waitFor();
    await page.locator("#answerArea").getByText("Matched terms:").waitFor();
    console.log("PASS: matching evidence and source title are shown");

    await page.getByLabel("Question or topic").fill("quantum astronomy");
    await page.getByRole("button", { name: "Find an answer" }).click();
    await page.locator("#answerArea").getByText(/could not find a passage with matching keywords/i).waitFor();
    console.log("PASS: unrelated questions do not fabricate an answer");

    await page.getByLabel("Document title").fill("");
    await page.getByLabel("Paste notes").fill("Some text");
    await page.getByRole("button", { name: "Add to library" }).click();
    await page.getByText("Add a document title.").waitFor();
    console.log("PASS: blank titles are validated");

    await page.getByLabel("Document title").fill("Second Notes");
    await page.getByLabel("Paste notes").fill("Databases store structured records and support queries.");
    await page.getByRole("button", { name: "Add to library" }).click();
    await page.getByLabel("Question or topic").fill("databases");
    await page.getByRole("button", { name: "Find an answer" }).click();
    await page.getByRole("button", { name: "Remove Second Notes" }).waitFor();

    await page.getByRole("button", { name: "Remove Second Notes" }).click();
    await page.getByLabel("Question or topic").fill("databases");
    await page.getByRole("button", { name: "Find an answer" }).click();
    await page.getByText(/could not find a passage with matching keywords/i).waitFor();
    console.log("PASS: removing a document removes its searchable evidence");

    await page.getByRole("button", { name: "Clear library" }).click();
    await page.getByText("Library cleared from this browser session.").waitFor();
    assert.equal(await page.locator("#docList .item").count(), 0);
    console.log("PASS: clearing the library removes all session documents");

    console.log("\nAll StudyPilot browser checks passed.");
  } finally {
    await browser.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
