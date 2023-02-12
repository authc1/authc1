export enum FetchTypes {
  ONE = "ONE",
  ALL = "ALL",
}

async function execute(params: {
  query: String;
  arguments?: (string | number | boolean | null)[];
  fetchType?: any;
}): Promise<any> {
  throw new Error("Execute method not implemented");
}
export async function insert(params: any): Promise<any> {
  return execute({
    query: _insert(params),
    arguments: Object.values(params.data),
    fetchType: FetchTypes.ALL,
  });
}

function _insert(params: any): string {
  const columns = Object.keys(params.data).join(", ");
  const values: Array<string> = [];
  Object.keys(params.data).forEach((key, index) => {
    values.push(`?${index + 1}`);
  });

  return (
    `INSERT ${onConflict(params.onConflict)}INTO ${
      params.tableName
    } (${columns}) VALUES(${values.join(", ")})` + returning(params.returning)
  );
}

function onConflict(resolution?: any): string {
  if (resolution) {
    return `OR ${resolution} `;
  }
  return "";
}

function returning(value?: string | Array<string>): string {
  if (!value) return "";
  if (typeof value === "string") return ` RETURNING ${value}`;

  return ` RETURNING ${value.join(", ")}`;
}
