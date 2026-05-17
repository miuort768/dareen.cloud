#!/bin/bash
# ================================================================
# coturn TURN Server - Full Setup Script for Dareen Live Classroom
# Run as root: bash setup-coturn.sh
# VPS: Ubuntu 24.04 | IP: 76.13.3.188
# ================================================================

set -e

VPS_IP="76.13.3.188"
TURN_SECRET="dareen_turn_secret_$(openssl rand -hex 16)"
TURN_REALM="dareen-edu.com"
TURN_PORT=3478
TURN_TLS_PORT=5349

echo "================================================"
echo " Installing coturn TURN Server"
echo "================================================"

apt-get update -y
apt-get install -y coturn openssl

# Enable coturn service
sed -i 's/#TURNSERVER_ENABLED=1/TURNSERVER_ENABLED=1/' /etc/default/coturn

# Backup original config
cp /etc/turnserver.conf /etc/turnserver.conf.bak 2>/dev/null || true

# Write clean config
cat > /etc/turnserver.conf << EOF
# ── Network ──────────────────────────────────────────────────────
listening-port=${TURN_PORT}
tls-listening-port=${TURN_TLS_PORT}
listening-ip=${VPS_IP}
relay-ip=${VPS_IP}
external-ip=${VPS_IP}

# ── Auth ─────────────────────────────────────────────────────────
realm=${TURN_REALM}
server-name=${TURN_REALM}

# Use time-limited HMAC credentials (most secure)
use-auth-secret
static-auth-secret=${TURN_SECRET}

# ── Security ─────────────────────────────────────────────────────
# Prevent relay abuse - only relay to public IPs
no-multicast-peers
denied-peer-ip=10.0.0.0-10.255.255.255
denied-peer-ip=172.16.0.0-172.31.255.255
denied-peer-ip=192.168.0.0-192.168.255.255

# ── Performance ──────────────────────────────────────────────────
min-port=49152
max-port=65535
total-quota=300
bps-capacity=0

# ── Logging ──────────────────────────────────────────────────────
log-file=/var/log/coturn.log
simple-log

# ── Disable unused features ──────────────────────────────────────
no-stun
no-tcp
EOF

echo ""
echo "✅ coturn configured."
echo ""

# Open firewall ports
echo "Opening firewall ports..."
ufw allow ${TURN_PORT}/udp 2>/dev/null || iptables -A INPUT -p udp --dport ${TURN_PORT} -j ACCEPT
ufw allow ${TURN_TLS_PORT}/tcp 2>/dev/null || iptables -A INPUT -p tcp --dport ${TURN_TLS_PORT} -j ACCEPT
ufw allow 49152:65535/udp 2>/dev/null || iptables -A INPUT -p udp --dport 49152:65535 -j ACCEPT

echo "✅ Firewall rules added."

# Start coturn
systemctl enable coturn
systemctl restart coturn
sleep 2

if systemctl is-active --quiet coturn; then
    echo "✅ coturn is RUNNING."
else
    echo "❌ coturn failed to start. Check: journalctl -u coturn -n 50"
    exit 1
fi

echo ""
echo "================================================================"
echo " SAVE THESE VALUES — Add to your server/.env file:"
echo "================================================================"
echo ""
echo "TURN_SERVER_URL=turn:${VPS_IP}:${TURN_PORT}"
echo "TURN_SECRET=${TURN_SECRET}"
echo "TURN_REALM=${TURN_REALM}"
echo ""
echo "================================================================"
echo " Test TURN connectivity:"
echo "   Open: https://webrtc.github.io/samples/src/content/peerconnection/trickle-ice/"
echo "   Add TURN server: turn:${VPS_IP}:${TURN_PORT}"
echo "   Username: test"
echo "   Credential: run: node -e \\"const c=require('crypto');const t=Math.floor(Date.now()/1000)+3600;const u=t+':test';console.log('user:',u,'pass:',c.createHmac('sha1','${TURN_SECRET}').update(u).digest('base64'));\""
echo "================================================================"
