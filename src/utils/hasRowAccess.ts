import { Context } from "hono";
import { D1QB } from "workers-qb";
import { IUsers } from "../models/users";
import { ApplicationNotFoundError } from "./errors";

export async function hasRowAccess(
  c: Context,
  tableName: string,
  conditions: string,
  params: string[]
) {
  const db = new D1QB(c.env.AUTHC1);

  const fetched = await db.fetchOne({
    tableName,
    fields: "count(*) as count",
    where: {
      conditions,
      params,
    },
  });
  console.log(fetched)

  if (!fetched || !fetched.results) {
    throw new ApplicationNotFoundError(
      "Application not found or Access Denied"
    );
  }

  const { count } = fetched.results;

  if (count === null) {
    throw new ApplicationNotFoundError(
      "Application not found or Access Denied"
    );
  }
  return count > 0;
}
