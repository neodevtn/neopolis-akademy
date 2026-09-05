(function bootstrapNeopolisAnalytics() {
  var sourceScript = document.currentScript;
  var measurementId = sourceScript && sourceScript.getAttribute("data-measurement-id");
  if (!measurementId || measurementId.indexOf("G-") !== 0 || measurementId.indexOf("%VITE_") === 0) return;

  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function gtag() {
    window.dataLayer.push(arguments);
  };

  window.gtag("consent", "default", {
    analytics_storage: "denied",
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied"
  });
  window.gtag("js", new Date());
  window.gtag("config", measurementId, { send_page_view: false, anonymize_ip: true });

  var googleScript = document.createElement("script");
  googleScript.async = true;
  googleScript.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(measurementId);
  googleScript.setAttribute("data-neopolis-ga4", "true");
  document.head.appendChild(googleScript);
  window.__neopolisAnalyticsBootstrapped = true;
})();
