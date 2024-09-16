document.addEventListener("DOMContentLoaded", function () {
  var letfeedFrame;
  var letfeedBtnOpen;
  var letfeedScript = document.querySelector("script[letfeed-id]");
  var letfeedId = letfeedScript.getAttribute("letfeed-id") || "";
  var url = letfeedScript.src.split("/widgets.js")[0] || "";
  var appUrl = url;

  function LetFeed() {
    var self = this;

    fetch(`${appUrl}/api/team/${letfeedId}`)
      .then((res) => res.json())
      .then((res) => {
        if (res?.success) {
          var dataTeam = res?.data;
          var css = document.createElement("link");
          css.href = `${url}/widgets.css`;
          css.type = "text/css";
          css.rel = "stylesheet";
          css.media = "screen";

          document.getElementsByTagName("head")[0].appendChild(css);
          document.body.insertAdjacentHTML(
            "beforeend",
            `<a id="letfeed-btn-open" class="letfeed-toggle-feedback letfeed-btn-open-${dataTeam?.style?.button_position}" href="javascript:;" style="background: ${dataTeam?.style?.button_bg};color: ${dataTeam?.style?.button_color}">
            ${dataTeam?.style?.button_text}
          </a>

          <div id="letfeed-frame" class="letfeed-frame-closed" style="display:none;">
              <iframe allowfullscreen="true" class="letfeed-frame-embed" title="LetFeed" role="dialog" src="${appUrl}/collect/${letfeedId}"></iframe>
          </div>`
          );

          document.addEventListener("click", function (event) {
            var target = event.target;
            function prevent() {
              event.preventDefault();
              event.stopPropagation();
            }
            if (target.matches(".letfeed-toggle-feedback")) {
              self.toggle();
              prevent();
            } else if (target.matches(".letfeed-open-feedback")) {
              self.open();
              prevent();
            } else if (target.matches(".letfeed-close-feedback")) {
              self.close();
              prevent();
            }
          });

          letfeedFrame = document.getElementById("letfeed-frame");
          letfeedBtnOpen = document.getElementById("letfeed-btn-open");
        }
      });

    return self;
  }

  LetFeed.prototype.toggle = function () {
    var self = this;
    letfeedFrame.style.display = "block";

    var isOpen = letfeedFrame.classList.contains("letfeed-frame-open");
    if (isOpen) {
      letfeedFrame.classList.remove("letfeed-frame-open");
      letfeedFrame.classList.add("letfeed-frame-closed");

      letfeedBtnOpen.style.display = "inline";
    } else {
      letfeedFrame.classList.remove("letfeed-frame-closed");
      letfeedFrame.classList.add("letfeed-frame-open");
      letfeedFrame.classList.add("slide-in-bck-br");

      letfeedBtnOpen.style.display = "none";
    }

    return self;
  };

  window.letfeed = new LetFeed();
  window.addEventListener("message", (event) => {
    if (event.data == "letfeed-minimized") {
      window.letfeed.toggle();
    }
    return;
  });
});
