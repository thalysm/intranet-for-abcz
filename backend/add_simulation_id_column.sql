-- Adiciona a coluna SimulationId na tabela Requests
ALTER TABLE "Requests" ADD COLUMN IF NOT EXISTS "SimulationId" uuid NULL;

-- Cria a foreign key constraint para a tabela LoanSimulations
ALTER TABLE "Requests" ADD CONSTRAINT "FK_Requests_LoanSimulations_SimulationId" 
    FOREIGN KEY ("SimulationId") REFERENCES "LoanSimulations" ("Id") ON DELETE SET NULL;

-- Atualiza o histórico de migrations para marcar como aplicada
INSERT INTO "__EFMigrationsHistory" ("MigrationId", "ProductVersion") 
VALUES ('20251130063000_AddSimulationIdToRequests', '9.0.0')
ON CONFLICT ("MigrationId") DO NOTHING;