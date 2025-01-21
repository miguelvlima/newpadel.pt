const tabLinks = document.querySelectorAll(".tabs a");
const tabPanels = document.querySelectorAll(".tabs-panel");
const tabLinksRank = document.querySelectorAll(".tabsRank a");
const tabPanelsRank = document.querySelectorAll(".tabsRank-panel");

for (let el of tabLinks) {
  el.addEventListener("click", e => {
    e.preventDefault();

    document.querySelector(".tabs li.active").classList.remove("active");
    document.querySelector(".tabs-panel.active").classList.remove("active");

    const parentListItem = el.parentElement;
    parentListItem.classList.add("active");
    const index = [...parentListItem.parentElement.children].indexOf(parentListItem);

    const panel = [...tabPanels].filter(el => el.getAttribute("data-index") == index);
    panel[0].classList.add("active");
    });
  }

  
for (let el of tabLinksRank) {
  el.addEventListener("click", e => {
    e.preventDefault();

    document.querySelector(".tabsRank li.active").classList.remove("active");
    document.querySelector(".tabsRank-panel.active").classList.remove("active");

    const parentListItem = el.parentElement;
    parentListItem.classList.add("active");
    const index = [...parentListItem.parentElement.children].indexOf(parentListItem);

    const panel = [...tabPanelsRank].filter(el => el.getAttribute("data-index") == index);
    panel[0].classList.add("active");
    });
  }