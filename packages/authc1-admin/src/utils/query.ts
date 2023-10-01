export function toParams(query: string): Record<string, string> {
  const q = query.replace(/^\??\//, "");

  return q.split("&").reduce((values: Record<string, string>, param) => {
    const [key, value] = param.split("=");

    values[key] = value;

    return values;
  }, {});
}

export function parseQueryParams(url: string): Record<string, string> {
  const urlObj = new URL(url);
  const queryParams = urlObj.searchParams;
  const query: Record<string, string> = {};

  queryParams.forEach((value, key) => {
    query[key] = value;
  });

  return query;
}

export function toQuery(
  params: Record<string, string | number>,
  delimiter = "&"
): string {
  const keys = Object.keys(params);

  return keys.reduce((str: string, key: string, index: number) => {
    let query = `${str}${key}=${params[key]}`;

    if (index < keys.length - 1) {
      query += delimiter;
    }

    return query;
  }, "");
}
