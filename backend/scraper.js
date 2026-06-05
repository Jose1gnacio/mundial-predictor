import { chromium } from "playwright";

export const getWorldCupMatches = async (url) => {
  const browser = await chromium.launch({
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
    ],
  });

  const page = await browser.newPage();

  await page.goto(url, {
    waitUntil: "domcontentloaded",
  });

  await page.waitForSelector(".event__match", {
    timeout: 10000,
  });

  await page.evaluate(() => {
    window.scrollTo(0, document.body.scrollHeight);
  });

  await page.waitForTimeout(3000);

  const matches = await page.evaluate(() => {
    const data = [];

    let currentRound = "Sin jornada";

    const elements = document.querySelectorAll(".event__round, .event__match");

    // 🔥 normalizador (IMPORTANTE para ID estable)
    const normalize = (text) =>
      text
        ?.toLowerCase()
        .trim()
        .replace(/\s+/g, "_")
        .normalize("NFD") // 🔥 separa acentos
        .replace(/[\u0300-\u036f]/g, "") // 🔥 elimina solo acentos
        .replace(/[^\w\-]/g, "");

    elements.forEach((el) => {
      if (el.classList.contains("event__round")) {
        currentRound = el.innerText.trim();
      }

      if (el.classList.contains("event__match")) {
        const home = el
          .querySelector(".event__homeParticipant")
          ?.innerText?.trim();

        const away = el
          .querySelector(".event__awayParticipant")
          ?.innerText?.trim();

        const homeScore = el
          .querySelector(".event__score--home")
          ?.innerText?.trim();

        const awayScore = el
          .querySelector(".event__score--away")
          ?.innerText?.trim();

        const rawTime = el.querySelector(".event__time")?.innerText?.trim();

        let time = "";
        let matchDate = "";

        if (rawTime) {
          time = rawTime;

          const datePart = rawTime.split(" ")[0];
          const cleanDate = datePart.replace(/\.$/, "");
          const [day, month] = cleanDate.split(".");

          matchDate = `2026-${month}-${day}`;
        }

        let score = "---";

        if (homeScore && awayScore) {
          score = `${homeScore}-${awayScore}`;
        }

        if (home && away) {
          // 🔥 ID FINAL ESTABLE (ronda + equipos)
          const id = `${normalize(currentRound)}_${normalize(home)}_${normalize(away)}`;

          data.push({
            id,
            round: currentRound,
            home,
            away,
            time,
            matchDate,
            score,
          });
        }
      }
    });

    return data;
  });

  await browser.close();

  return matches;
};
