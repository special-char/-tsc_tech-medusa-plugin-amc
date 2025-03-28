import { Migration } from '@mikro-orm/migrations';

export class Migration20250328063842 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "product_warranty_terms" ("id" text not null, "days" integer not null default 0, "service_interval" integer not null default 0, "product_id" text not null, "variant_id" text not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "product_warranty_terms_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_product_warranty_terms_deleted_at" ON "product_warranty_terms" (deleted_at) WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "warranty_transactions" ("id" text not null, "start_date" timestamptz not null, "end_date" timestamptz not null, "duration_days" integer not null, "order_id" text not null, "order_line_item_id" text not null, "product_id" text not null, "variant_id" text not null, "customer_id" text not null, "amc_id" text not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "warranty_transactions_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_warranty_transactions_deleted_at" ON "warranty_transactions" (deleted_at) WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "product_warranty_terms" cascade;`);

    this.addSql(`drop table if exists "warranty_transactions" cascade;`);
  }

}
