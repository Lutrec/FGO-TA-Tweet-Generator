let fgoData = {events: [], servants: [], restrictions: []};

document.addEventListener("DOMContentLoaded", () => {
  const prefersLight = window.matchMedia(
    "(prefers-color-scheme: light)",
  ).matches;
  const themeBtn = document.getElementById("theme-btn");

  if (prefersLight) {
    document.body.classList.add("light-theme");
    if (themeBtn) themeBtn.innerText = "🌙 Dark";
  }

  Promise.allSettled([
    fetch("events.json").then((res) =>
      res.ok ? res.json() : Promise.reject(`HTTP Error: ${res.status}`),
    ),
    fetch("servants.json").then((res) =>
      res.ok ? res.json() : Promise.reject(`HTTP Error: ${res.status}`),
    ),
    fetch("restrictions.json").then((res) =>
      res.ok ? res.json() : Promise.reject(`HTTP Error: ${res.status}`),
    ),
  ])
    .then((results) => {
      const [eventsResult, servantsResult, restrictionsResult] = results;

      // Process Events
      if (eventsResult.status === "fulfilled") {
        fgoData.events = eventsResult.value;
      } else {
        console.warn("Failed to load events.json:", eventsResult.reason);
        fgoData.events = [];
      }

      // Process Servants
      if (servantsResult.status === "fulfilled") {
        fgoData.servants = servantsResult.value;
      } else {
        console.warn("Failed to load servants.json:", servantsResult.reason);
        fgoData.servants = [];
      }

      // Process Restrictions
      if (restrictionsResult.status === "fulfilled") {
        fgoData.restrictions = restrictionsResult.value;
      } else {
        console.warn(
          "Failed to load restrictions.json:",
          restrictionsResult.reason,
        );
        fgoData.restrictions = [];
      }

      // Even if one failed, try to populate the UI with what we have
      populateUI();
    })
    .catch((error) => {
      // This catch block only triggers if the network request completely fails (e.g., no internet)
      console.error("Network error while loading JSON files:", error);
      document.getElementById("loading").innerText =
        "Network error. Please check your connection.";
    });
});

window
  .matchMedia("(prefers-color-scheme: light)")
  .addEventListener("change", (event) => {
    const body = document.body;
    const themeBtn = document.getElementById("theme-btn");
    if (event.matches) {
      body.classList.add("light-theme");
      if (themeBtn) themeBtn.innerText = "🌙 Dark";
    } else {
      body.classList.remove("light-theme");
      if (themeBtn) themeBtn.innerText = "☀️ Light";
    }
  });

function toggleTheme() {
  const body = document.body;
  const themeBtn = document.getElementById("theme-btn");
  body.classList.toggle("light-theme");

  if (body.classList.contains("light-theme")) {
    themeBtn.innerText = "🌙 Dark";
  } else {
    themeBtn.innerText = "☀️ Light";
  }
}

function populateUI() {
  const eventList = document.getElementById("event-list");
  fgoData.events.forEach((ev) => {
    let option = document.createElement("option");
    option.value = ev.en;
    eventList.appendChild(option);
  });

  const servantList = document.getElementById("servant-list");
  fgoData.servants.forEach((sv) => {
    let option = document.createElement("option");
    option.value = sv.id ? `${sv.id} - ${sv.en}` : sv.en;
    servantList.appendChild(option);
  });

  const restrictionsContainer = document.getElementById(
    "restrictions-container",
  );
  fgoData.restrictions.forEach((res) => {
    let label = document.createElement("label");
    label.innerHTML = `<input type="checkbox" value="${res.en}" class="restriction"> ${res.en}`;
    restrictionsContainer.appendChild(label);
  });

  document.getElementById("loading").style.display = "none";
  document.getElementById("ta-form").style.display = "block";
}

document.getElementById("event").addEventListener("input", (e) => {
  const selectedEventEn = e.target.value;
  const stageInput = document.getElementById("stage");
  const stageList = document.getElementById("stage-list");

  stageList.innerHTML = "";
  const matchedEvent = fgoData.events.find((ev) => ev.en === selectedEventEn);

  if (matchedEvent && matchedEvent.stages && matchedEvent.stages.length > 0) {
    matchedEvent.stages.forEach((st) => {
      let option = document.createElement("option");
      option.value = st.en;
      stageList.appendChild(option);
    });

    if (matchedEvent.stages.length === 1) {
      stageInput.value = matchedEvent.stages[0].en;
    } else {
      stageInput.value = "";
    }
  } else {
    stageInput.value = "";
  }
});

function getJpString(category, enText) {
  const item = fgoData[category].find((i) => i.en === enText);
  return item ? item.jp : enText;
}

function generateTweet() {
  const lang = document.querySelector('input[name="lang"]:checked').value;
  const eventEnInput =
    document.getElementById("event").value || "Placeholder Event";
  const stageEnInput = document.getElementById("stage").value;

  const rawServantInput =
    document.getElementById("servant").value || "Placeholder Servant";
  const servantEn = rawServantInput.replace(/^\d+\s*-\s*/, "");

  const turnNum = document.getElementById("turns").value;
  const partySize = parseInt(document.getElementById("party-size").value, 10);
  const commentsEn = document.getElementById("comments").value;

  let eventJp = eventEnInput;
  let stageJp = stageEnInput;

  const matchedEvent = fgoData.events.find((ev) => ev.en === eventEnInput);
  if (matchedEvent) {
    eventJp = matchedEvent.jp;
    if (stageEnInput && matchedEvent.stages) {
      const matchedStage = matchedEvent.stages.find(
        (st) => st.en === stageEnInput,
      );
      if (matchedStage) stageJp = matchedStage.jp;
    }
  }

  const finalEventEn = stageEnInput
    ? `${eventEnInput}\n${stageEnInput}`
    : eventEnInput;
  const finalEventJp = stageJp ? `${eventJp}\n${stageJp}` : eventJp;

  const servantJp = getJpString("servants", servantEn);
  const turnJp = "で" + turnNum + "ターン";
  const turnEn = turnNum + "T";

  const checkboxes = document.querySelectorAll(".restriction:checked");
  const restrictionsEnArr = Array.from(checkboxes).map((cb) => cb.value);
  const restrictionsJpArr = restrictionsEnArr.map((res) =>
    getJpString("restrictions", res),
  );

  if (partySize < 6) {
    let sizeTextEn = "";
    let sizeTextJp = "";

    if (partySize === 1) {
      sizeTextEn = "solo";
      sizeTextJp = "単騎";
    } else if (partySize === 2) {
      sizeTextEn = "effectively 2 man";
      sizeTextJp = "実質2枠";
    } else if (partySize === 3) {
      sizeTextEn = "flo";
      sizeTextJp = "前衛のみ";
    } else {
      sizeTextEn = `${partySize} man`;
      sizeTextJp = `${partySize}枠`;
    }

    restrictionsEnArr.unshift(sizeTextEn);
    restrictionsJpArr.unshift(sizeTextJp);
  }

  let restrictionTextJp =
    restrictionsJpArr.length > 0 ? `${restrictionsJpArr.join(" ")}` : "";
  const tweetJp = `【FGO】${finalEventJp}\n${servantJp}${turnJp} ${restrictionTextJp}`;

  let restrictionTextEn =
    restrictionsEnArr.length > 0 ? `${restrictionsEnArr.join(" ")}` : "";
  const tweetEn = `【FGO】${finalEventEn}\n${servantEn} ${turnEn} ${restrictionTextEn}`;

  let finalOutput = "";

  if (lang === "jp") {
    finalOutput = tweetJp;
  } else if (lang === "en") {
    finalOutput = tweetEn;
  } else if (lang === "both") {
    finalOutput = tweetJp + "\n\n" + tweetEn;
  }

  if (commentsEn) {
    finalOutput += `\n${commentsEn}`;
  }

  // Append selected hashtags dynamically
  const selectedTags = Array.from(
    document.querySelectorAll(".tag-checkbox:checked"),
  ).map((cb) => cb.value);
  if (selectedTags.length > 0) {
    finalOutput += "\n" + selectedTags.join(" ");
  }

  document.getElementById("output").value = finalOutput;
}

function copyToClipboard() {
  const outputBox = document.getElementById("output");
  if (outputBox.value === "") {
    alert("Generate a tweet first.");
    return;
  }

  const copyBtn = document.querySelector(".copy-btn");
  const originalText = copyBtn.innerText;

  navigator.clipboard
    .writeText(outputBox.value)
    .then(() => {
      copyBtn.innerText = "Copied!";
      setTimeout(() => (copyBtn.innerText = originalText), 2000);
    })
    .catch((err) => {
      outputBox.select();
      document.execCommand("copy");
      copyBtn.innerText = "Copied!";
      setTimeout(() => (copyBtn.innerText = originalText), 2000);
    });
}

function resetForm() {
  document.getElementById("ta-form").reset();
  document.getElementById("output").value = "";
  document.getElementById("turns").value = 3;
  document.getElementById("party-size").value = 6;
  document.getElementById("stage-list").innerHTML = "";
}

function tweetDirectly() {
  const outputBox = document.getElementById("output");
  const tweetText = outputBox.value;

  if (tweetText === "") {
    alert("Generate a tweet first.");
    return;
  }

  const encodedTweet = encodeURIComponent(tweetText);
  const twitterUrl = `https://x.com/intent/tweet?text=${encodedTweet}`;
  window.open(twitterUrl, "_blank");
}
