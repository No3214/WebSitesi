#!/usr/bin/env bash
# Oda fotograflarindan (YALNIZ gercek kareler, sifir hallusinasyon) sinematik
# tanitim videosu. "Videografik" his icin: her karede yavas yon-tutarli PUSH-IN
# (zoompan Ken Burns) + kareler arasi YONLU gecis (smoothleft/right/up). Boylece
# slideshow degil, kamera mekanda ilerliyormus hissi olusur.
# Web-optimize: 1280x720, faststart, sessiz. Kullanim: <foto-dizini> <cikti.mp4>
set -euo pipefail
SRC="$1"; OUT="$2"
mapfile -t IMGS < <(ls "$SRC"/*.jpg "$SRC"/*.jpeg 2>/dev/null | sort -V)
N=${#IMGS[@]}
if [ "$N" -lt 2 ]; then echo "en az 2 foto gerekli: $SRC"; exit 1; fi

DUR=4.2; XF=0.7; FPS=30
W=1280; H=720; OW=2560; OH=1440
FR=$(awk "BEGIN{print int($DUR*$FPS)}")
ZEXPR="min(zoom+0.0009,1.12)"   # yavas surekli push-in
XPAN=("iw/2-(iw/zoom/2)" "(iw-iw/zoom)*0.04" "(iw-iw/zoom)*0.96" "iw/2-(iw/zoom/2)")
YPAN=("ih/2-(ih/zoom/2)" "(ih-ih/zoom)*0.04" "ih/2-(ih/zoom/2)" "(ih-ih/zoom)*0.96")
TRANS=("smoothleft" "smoothright" "smoothup" "slideleft")

INPUTS=(); FILT=""
for i in "${!IMGS[@]}"; do
  INPUTS+=(-loop 1 -t "$DUR" -i "${IMGS[$i]}")
  xp="${XPAN[$((i % 4))]}"; yp="${YPAN[$((i % 4))]}"
  FILT+="[$i:v]scale=${OW}:${OH}:force_original_aspect_ratio=increase,crop=${OW}:${OH},"
  FILT+="zoompan=z='${ZEXPR}':x='${xp}':y='${yp}':d=${FR}:s=${W}x${H}:fps=${FPS},"
  FILT+="setsar=1,format=yuv420p[v$i];"
done
LAST="[v0]"; total=$DUR
for ((i=1;i<N;i++)); do
  OFF=$(awk "BEGIN{print $total - $XF}")
  TR="${TRANS[$(((i-1) % 4))]}"
  FILT+="${LAST}[v$i]xfade=transition=${TR}:duration=$XF:offset=$OFF[x$i];"
  LAST="[x$i]"; total=$(awk "BEGIN{print $total + $DUR - $XF}")
done
FILT="${FILT%;}"
ffmpeg -y "${INPUTS[@]}" -filter_complex "$FILT" -map "$LAST" -an \
  -c:v libx264 -preset medium -crf 24 -pix_fmt yuv420p -movflags +faststart -r $FPS "$OUT" >/dev/null 2>&1
echo "OK: $OUT ($(du -h "$OUT" | cut -f1))"
