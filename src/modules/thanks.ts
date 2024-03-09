async function enableAutoThanks() {
  const path = window.location.pathname;
  if (path === "/details.php") {
    const urlSearchParams = new URLSearchParams(window.location.search);
    const detailsId = urlSearchParams.get("id");

    const thanksRequest = document.getElementById("saythanks");
    if (thanksRequest) {
      try {
        const response = await fetch(`${window.location.origin}/ajax.php?action=say_thanks&id=${detailsId}`);
        if (!response.ok) {
          throw new Error(`Request failed with status: ${response.status}`);
        }

        const body = new TextDecoder("TIS-620").decode(new Uint8Array(await response.arrayBuffer()));

        if (body.includes("กดขอบคุณ")) {
          const thanksGuideElement = document.querySelector(
            "body > table.mainouter > tbody > tr:nth-child(3) > td > table > tbody > tr:nth-child(1) > td.rowhead > font"
          ) as HTMLElement;
          thanksGuideElement.style.color = "#D91BEA";
          thanksGuideElement.innerHTML = "Download";
          const thanksRequestParentElement = thanksRequest.parentNode as HTMLElement;
          thanksRequestParentElement.remove();
        }

        if (body.includes("ผิดพลาด")) {
          throw new Error("fail to thanks / already thanks");
        }
      } catch (error) {
        console.error(error);
      }
    }
  }
}

export { enableAutoThanks }
