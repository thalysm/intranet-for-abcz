-- Script para criar a tabela Benefits
CREATE TABLE IF NOT EXISTS "Benefits" (
    "Id" uuid NOT NULL,
    "Name" character varying(200) NOT NULL,
    "Description" text NOT NULL,
    "IsActive" boolean NOT NULL DEFAULT true,
    "ImageUrl" character varying(500),
    "ButtonAction" character varying(500),
    "CreatedAt" timestamp with time zone NOT NULL,
    "UpdatedAt" timestamp with time zone,
    "CreatedByUserId" uuid NOT NULL,
    CONSTRAINT "PK_Benefits" PRIMARY KEY ("Id"),
    CONSTRAINT "FK_Benefits_Users_CreatedByUserId" FOREIGN KEY ("CreatedByUserId") REFERENCES "Users" ("Id") ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS "IX_Benefits_CreatedByUserId" ON "Benefits" ("CreatedByUserId");