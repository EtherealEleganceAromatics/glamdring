(() => {
  const BANNER_ID = "mothers-day-strike-banner";

  const element = document.getElementById(BANNER_ID);
  if (!element) {
    return;
  }

  const originalBodyStyle = document.body.style;
  document.body.style = "overflow: hidden";
  element.style = null;

  const buttonElements = element.getElementsByClassName("banner-buttons");
  if (!buttonElements || buttonElements.length === 0) {
    return;
  }

  const [buttonElement] = buttonElements;
  buttonElement.onclick = () => {
    document.body.style = originalBodyStyle;
    element.style = "display: none";
  };
})();
