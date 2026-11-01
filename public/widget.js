(function () {
  try {
    var script = document.currentScript;
    if (!script) return;

    var widgetId = script.getAttribute("data-id");
    if (!widgetId) {
      console.error("[RadaSupport AI] Missing data-id");
      return;
    }

    // Use whatever domain this script was loaded from (localhost, ngrok or production)
    var origin = new URL(script.src).origin;

    // Don't load twice
    if (document.getElementById("radasupport-widget-frame")) return;

    fetch(origin + "/api/widget/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "omit",
      body: JSON.stringify({ widget_id: widgetId }),
    })
      .then(function (res) {
        if (!res.ok) throw new Error("Session request failed");
        return res.json();
      })
      .then(function (data) {
        if (!data || !data.token) {
          throw new Error("Invalid session response");
        }

        var iframe = document.createElement("iframe");
        iframe.id = "radasupport-widget-frame";
        iframe.src = origin + "/embed?token=" + encodeURIComponent(data.token);
        iframe.setAttribute("title", "Support Chat");
        iframe.style.position = "fixed";
        iframe.style.bottom = "20px";
        iframe.style.right = "20px";
        iframe.style.width = "60px";
        iframe.style.height = "60px";
        iframe.style.maxWidth = "calc(100vw - 40px)";
        iframe.style.maxHeight = "calc(100vh - 40px)";
        iframe.style.border = "none";
        iframe.style.zIndex = "999999";
        iframe.style.borderRadius = "30px";
        iframe.style.background = "transparent";
        iframe.style.colorScheme = "normal";
        iframe.style.transition = "all 0.3s ease";

        document.body.appendChild(iframe);

        window.addEventListener("message", function (event) {
          // Only accept resize messages from our own iframe
          if (event.source !== iframe.contentWindow) return;

          if (event.data && event.data.type === "resize") {
            iframe.style.width = event.data.width;
            iframe.style.height = event.data.height;
            iframe.style.borderRadius = event.data.borderRadius || "12px";
            if (event.data.boxShadow) {
              iframe.style.boxShadow = event.data.boxShadow;
            }
          }
        });
      })
      .catch(function (err) {
        console.error("[RadaSupport AI] Failed to load widget:", err);
      });
  } catch (error) {
    console.error("[RadaSupport AI] Widget error:", error);
  }
})();