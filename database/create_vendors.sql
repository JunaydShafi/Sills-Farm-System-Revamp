--Create vendor table
CREATE TABLE "vendors" (
    "id" SERIAL NOT NULL,
    "vendor_id" VARCHAR(30) NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "pNum" VARCHAR(25) NOT NULL,
    "street" VARCHAR(300) NOT NULL,
    "city" VARCHAR(150) NOT NULL,
    "state" VARCHAR(2) NOT NULL,
    "zip" VARCHAR(10) NOT NULL,
    "taxId" BOOL NOT NULL,
    "defaultAcc" VARCHAR(30) NOT NULL,
    "custAccId" VARCHAR(20) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vendors_pkey" PRIMARY KEY ("id")
);

-- Create Unique Index
CREATE UNIQUE INDEX "vendors_vendor_code_key" ON "vendors"("vendor_id");