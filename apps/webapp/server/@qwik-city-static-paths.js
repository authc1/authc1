const staticPaths = new Set(["/_routes.json","/favicon.svg","/logo/authc1-logo.svg","/logo/authc1-short-logo.svg","/logo/authc1.png","/logo/cloudflare/one.svg","/logo/cloudflare/pages.svg","/logo/cloudflare/queues.svg","/logo/cloudflare/workers.svg","/manifest.json","/q-manifest.json","/robots.txt","/service-worker.js","/sitemap.xml"]);
function isStaticPath(method, url) {
  if (method.toUpperCase() !== 'GET') {
    return false;
  }
  const p = url.pathname;
  if (p.startsWith("/build/")) {
    return true;
  }
  if (p.startsWith("/assets/")) {
    return true;
  }
  if (staticPaths.has(p)) {
    return true;
  }
  if (p.endsWith('/q-data.json')) {
    const pWithoutQdata = p.replace(/\/q-data.json$/, '');
    if (staticPaths.has(pWithoutQdata + '/')) {
      return true;
    }
    if (staticPaths.has(pWithoutQdata)) {
      return true;
    }
  }
  return false;
}
export { isStaticPath };