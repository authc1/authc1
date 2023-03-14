export interface QueryOptions {
  tableName: string;
  fields?: string;
  where?: {
    conditions: string;
    params: any[];
  };
  join?: {
    table: string;
    on: string;
  };
}

interface InsertOptions {
  tableName: string;
  data: Record<string, any>;
}

interface UpdateOptions {
  tableName: string;
  data: Record<string, any>;
  where: {
    conditions: string;
    params: any[];
  };
}

class DatabaseHelper {
  private db: D1Database;

  constructor(db: D1Database) {
    this.db = db;
  }

  async fetchOne(options: QueryOptions): Promise<any> {
    let query = `SELECT ${options.fields || "*"} FROM ${options.tableName}`;

    if (options.join) {
      query += ` INNER JOIN ${options.join.table} ON ${options.join.on}`;
    }

    if (options.where) {
      query += ` WHERE ${options.where.conditions}`;
    }

    const result = await this.db.prepare(query).bind(options.where?.params);

    return result;
  }

  async update(options: UpdateOptions): Promise<void> {
    let query = `UPDATE ${options.tableName} SET `;

    const setValues = Object.keys(options.data)
      .map((key) => `${key} = ?`)
      .join(", ");

    const whereClause = options.where?.conditions || "1 = 1";

    query += `${setValues} WHERE ${whereClause}`;

    const params = Object.values(options.data).concat(options.where?.params);

    await this.db.run(query, params);
  }

  async insert(options: InsertOptions): Promise<void> {
    const fields = Object.keys(options.data).join(", ");
    const placeholders = Object.keys(options.data)
      .map(() => "?")
      .join(", ");

    const query = `INSERT INTO ${options.tableName} (${fields}) VALUES (${placeholders})`;

    const params = Object.values(options.data);

    await this.db.run(query, params);
  }
}

const db = new Database(":memory:");