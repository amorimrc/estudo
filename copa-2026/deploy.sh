#!/bin/bash
# Deploy da Copa 2026 no Google Cloud Run
# Pré-requisito: gcloud CLI instalado e autenticado
#
# Uso:
#   1. Edite as variáveis abaixo
#   2. chmod +x deploy.sh
#   3. ./deploy.sh

set -e

# ── Configurações ──────────────────────────────────────────────
PROJECT_ID="seu-projeto-id"          # gcloud projects list
REGION="us-central1"
SERVICE_NAME="copa2026"
IMAGE="gcr.io/$PROJECT_ID/$SERVICE_NAME"

# Segredos (crie no Google Secret Manager e referencie abaixo)
GOOGLE_CLIENT_ID="seu_google_client_id"
GOOGLE_CLIENT_SECRET="seu_google_client_secret"
JWT_SECRET="um_segredo_longo_e_aleatorio"
API_FOOTBALL_KEY="sua_chave_api_football"

# ── 1. Configura projeto ───────────────────────────────────────
gcloud config set project "$PROJECT_ID"
gcloud services enable run.googleapis.com cloudbuild.googleapis.com

# ── 2. Build e push da imagem ─────────────────────────────────
gcloud builds submit --tag "$IMAGE" .

# ── 3. Deploy no Cloud Run ────────────────────────────────────
# ATENÇÃO SQLITE: sem volume montado, o banco é efêmero (reseta ao reiniciar).
# Para persistência real, adicione --add-volume e --add-volume-mount
# conforme comentário abaixo, ou migre para Cloud SQL.

gcloud run deploy "$SERVICE_NAME" \
  --image "$IMAGE" \
  --platform managed \
  --region "$REGION" \
  --allow-unauthenticated \
  --port 8080 \
  --set-env-vars "NODE_ENV=production" \
  --set-env-vars "GOOGLE_CLIENT_ID=$GOOGLE_CLIENT_ID" \
  --set-env-vars "GOOGLE_CLIENT_SECRET=$GOOGLE_CLIENT_SECRET" \
  --set-env-vars "JWT_SECRET=$JWT_SECRET" \
  --set-env-vars "API_FOOTBALL_KEY=$API_FOOTBALL_KEY"

# ── Opção: SQLite persistente com Cloud Storage (NFS) ─────────
# Descomente para montar um bucket GCS como volume:
#
# BUCKET="$PROJECT_ID-copa2026-db"
# gsutil mb -l "$REGION" "gs://$BUCKET" 2>/dev/null || true
#
# gcloud run deploy "$SERVICE_NAME" \
#   --image "$IMAGE" \
#   --platform managed \
#   --region "$REGION" \
#   --allow-unauthenticated \
#   --port 8080 \
#   --execution-environment gen2 \
#   --add-volume="name=db-vol,type=cloud-storage,bucket=$BUCKET" \
#   --add-volume-mount="volume=db-vol,mount-path=/data" \
#   --set-env-vars "DB_PATH=/data/copa2026.db,NODE_ENV=production" \
#   --set-env-vars "GOOGLE_CLIENT_ID=$GOOGLE_CLIENT_ID" \
#   --set-env-vars "GOOGLE_CLIENT_SECRET=$GOOGLE_CLIENT_SECRET" \
#   --set-env-vars "JWT_SECRET=$JWT_SECRET" \
#   --set-env-vars "API_FOOTBALL_KEY=$API_FOOTBALL_KEY"

echo ""
echo "✅ Deploy concluído!"
gcloud run services describe "$SERVICE_NAME" --region "$REGION" --format="value(status.url)"
