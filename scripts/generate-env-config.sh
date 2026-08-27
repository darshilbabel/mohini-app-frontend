#!/bin/bash

# Generate env-config.js from environment variables at runtime
# This script should be run when deploying or starting the application

# Output file
OUTPUT_FILE="${1:-./public/env-config.js}"

echo "Generating runtime environment configuration..."

cat > "$OUTPUT_FILE" << EOF
// Runtime environment configuration
// Generated at: $(date)
// This file is auto-generated. Do not edit manually.
window._env_ = {
  REACT_APP_LOCAL_PROXY: "${REACT_APP_LOCAL_PROXY:-http://localhost:8000}",
  REACT_APP_WEBSOCKET_HOST: "${REACT_APP_WEBSOCKET_HOST:-localhost:8000}",
  REACT_APP_WEBSOCKET_RETRY_NUM: "${REACT_APP_WEBSOCKET_RETRY_NUM:-2}",
  REACT_APP_MEGA_PTM_PROFILE_ID: "${REACT_APP_MEGA_PTM_PROFILE_ID:-3}",
  REACT_APP_YLC_PROFILE_ID: "${REACT_APP_YLC_PROFILE_ID:-127}",
  REACT_APP_S3_UPLOAD_RETRY_NUM: "${REACT_APP_S3_UPLOAD_RETRY_NUM:-3}",
  REACT_APP_ADUIO_PATH: "${REACT_APP_ADUIO_PATH:-/}",
  REACT_APP_ROOT_PATH: "${REACT_APP_ROOT_PATH:-}",
  REACT_APP_RECORD_STORY_URL: "${REACT_APP_RECORD_STORY_URL:-}",
  REACT_APP_WS_PROTOCOL: "${REACT_APP_WS_PROTOCOL:-wss}"
};
EOF

echo "✓ Environment configuration generated at: $OUTPUT_FILE"
