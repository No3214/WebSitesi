#!/usr/bin/env bash
# v2 (2026-07-02) — owner geri bildirimi uzerine yeniden tasarlandi (v1 "kotu":
# titrek zoompan + slayt-vari yonlu gecisler + aceleci tempo). Ilkeler:
#  1) JITTER FIX: zoompan 1920x1080 IC cozunurlukte calisir, cikti lanczos ile
#     1280x720'ye indirilir (superornekleme subpiksel titremesini keser).
#  2) SESSIZ LUKS TEMPO: kare basina 5.5s, 1.1s yumusak CROSSFADE (fade) —
#     yonlu smooth/slide gecisler kaldirildi.
#  3) NEFES ALAN KAMERA: push-in / pull-out ritmi; zoom tavani 1.12 -> 1.08.
#  4) Hafif editoryal grade: kontrast 1.02, doygunluk 1.05 (gercek kalir).
#  5) FFMPEG 8 UYUMU: girdiler TEK KARE (-loop/-t YOK); zoompan d=FR tam FR
#     kare uretir -> sure deterministik. (-loop 1 -t ile ffmpeg 8'de sure
#     patliyordu: 18s yerine 772s cikti — 2026-07-02 tespiti.)
# Kullanim: make-room-video.sh <foto-dizini> <cikti.mp4>
set -euo pipefail
SRC="$1"; OUT="$2"
mapfile -t IMGS < <(ls "$SRC"/*.jpg "$SRC"/*.jpeg 2>/dev/null | sort -V)
N=${#IMGS[@]}
if [ "$N" -lt 2 ]; then echo "en az 2 foto gerekli: $SRC"; exit 1; fi

DUR=5.5; XF=1.1; FPS=30
IW=1920; IH=1080   # zoompan ic render (superornekleme)
W=1280; H=720      # cikti
FR=$(awk "BEGIN{print int($DUR*$FPS)}")

INPUTS=(); FILT=""
for i in "${!IMGS[@]}"; do
  INPUTS+=(-i "${IMGS[$i]}")
  if [ $((i % 2)) -eq 0 ]; then
    Z="min(1+0.00048*on,1.08)"                      # push-in
    X="(iw-iw/zoom)*(0.38+0.14*on/${FR})"
    Y="(ih-ih/zoom)*0.46"
  else
    Z="max(1.08-0.00048*on,1.0)"                    # pull-out
    X="(iw-iw/zoom)/2"
    Y="(ih-ih/zoom)*0.42"
  fi
  FILT+="[$i:v]scale=${IW}:${IH}:force_original_aspect_ratio=increase:flags=lanczos,crop=${IW}:${IH},"
  FILT+="zoompan=z='${Z}':x='${X}':y='${Y}':d=${FR}:s=${IW}x${IH}:fps=${FPS},"
  FILT+="scale=${W}:${H}:flags=lanczos,eq=contrast=1.02:saturation=1.05,setsar=1,format=yuv420p[v$i];"
done
LAST="[v0]"; total=$DUR
for ((i=1;i<N;i++)); do
  OFF=$(awk "BEGIN{print $total - $XF}")
  FILT+="${LAST}[v$i]xfade=transition=fade:duration=$XF:offset=$OFF[x$i];"
  LAST="[x$i]"; total=$(awk "BEGIN{print $total + $DUR - $XF}")
done
FILT="${FILT%;}"
ffmpeg -y "${INPUTS[@]}" -filter_complex "$FILT" -map "$LAST" -an \
  -c:v libx264 -preset fast -crf 23 -pix_fmt yuv420p -movflags +faststart -r $FPS "$OUT" >/dev/null 2>&1
echo "OK: $OUT ($(du -h "$OUT" | cut -f1))"
