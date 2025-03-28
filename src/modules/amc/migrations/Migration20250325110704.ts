import { Migration } from "@mikro-orm/migrations";

export class Migration20250325110704 extends Migration {
  override async up(): Promise<void> {
    this.addSql(
      `create table if not exists "amc" ("id" text not null, "title" text not null, "sku" text not null, "barcode" text not null, "duration" integer not null default 0, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "amc_pkey" primary key ("id"));`
    );
    this.addSql(
      `CREATE INDEX IF NOT EXISTS "IDX_amc_deleted_at" ON "amc" (deleted_at) WHERE deleted_at IS NULL;`
    );
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "amc" cascade;`);
  }
}
