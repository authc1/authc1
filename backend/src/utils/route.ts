export function getWildcardRouteValue(path: string, template: string): string | null {
  const templateRegex = new RegExp(template.replace("*", "(.+)"));
  const match = path.match(templateRegex);
  if (match && match.length >= 2) {
    return match[1];
  }
  return null;
}
