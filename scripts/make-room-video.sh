#!/usr/bin/env bash
# Oda fotograflarindan (yalniz gercek kareler) sade crossfade tanitim videosu.
# Web-optimize: 1280x720, faststart, sessiz. Kullanim: <foto-dizini> <cikti.mp4>
set -euo pipefail
SRC="$1"; OUT="$2"
mapfile -t IMGS < <(ls "$SRC"/*.jpg 2>/dev/null | sort -V)
N=${#IMGS[@]}
if [ "$N" -lt 2 ]; then echo "en az 2 foto gerekli: $SRC"; exit 1; fi
DUR=3.2; XF=0.8; FPS=25
INPUTS=(); FILT=""
for i in "${!IMGS[@]}"; do
  INPUTS+=(-loop 1 -t "$DUR" -i "${IMGS[$i]}")
  FILT+="[$i:v]scale=1280:720:force_original_aspect_ratio=increase,crop=1280:720,setsar=1,fps=$FPS,format=yuv420p[v$i];"
done
LAST="[v0]"; total=$DUR
for ((i=1;i<N;i++)); do
  OFF=$(awk "BEGIN{print $total - $XF}")
  FILT+="${LAST}[v$i]xfade=transition=fade:duration=$XF:offset=$OFF[x$i];"
  LAST="[x$i]"; total=$(awk "BEGIN{print $total + $DUR - $XF}")
done
FILT="${FILT%;}"
ffmpeg -y "${INPUTS[@]}" -filter_complex "$FILT" -map "$LAST" -an \
  -c:v libx264 -preset veryfast -crf 26 -pix_fmt yuv420p -movflags +faststart -r $FPS "$OUT" >/dev/null 2>&1
