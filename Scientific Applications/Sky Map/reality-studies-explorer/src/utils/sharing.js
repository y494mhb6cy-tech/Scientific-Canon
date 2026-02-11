export function getShareUrl(nodeId, zoom = 1.2) {
  const base = window.location.origin + window.location.pathname;
  return `${base}#node=${nodeId}&z=${zoom}`;
}

export async function copyShareLink(nodeId, zoom = 1.2) {
  const url = getShareUrl(nodeId, zoom);
  try {
    await navigator.clipboard.writeText(url);
    return true;
  } catch {
    return false;
  }
}
