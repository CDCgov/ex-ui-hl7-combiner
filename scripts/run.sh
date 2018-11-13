#!/bin/sh

# write config with env vars
CONFIG_LOCATION="/usr/share/nginx/html/config.js"
echo "Writing config file to $CONFIG_LOCATION..."
cat <<EOF > $CONFIG_LOCATION
window.config = {
  SECURE_MODE: $SECURE_MODE,
  COMBINER_URL: "$COMBINER_URL",
  HL7_UTILS_URL: "$HL7_UTILS_URL",
  AUTH_URL: "$AUTH_URL"
};
EOF

echo "Starting nginx..."
nginx -c /home/nginx.conf