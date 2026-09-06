#!/usr/bin/env python3
"""src/narration.json 의 문장을 edge-tts(ko-KR-InJoonNeural, 원음 속도)로 public/vo/<id>.mp3 생성하고 길이를 검사한다."""
import json, subprocess, sys, pathlib
root = pathlib.Path(__file__).resolve().parents[1]
segs = json.load(open(root / "src/narration.json", encoding="utf-8"))
voice = sys.argv[1] if len(sys.argv) > 1 else "ko-KR-InJoonNeural"
out = root / "public/vo"; out.mkdir(parents=True, exist_ok=True)
for s in segs:
    mp3 = out / f"{s['id']}.mp3"
    subprocess.run(["edge-tts", "--voice", voice, "--text", s["text"], "--write-media", str(mp3)], check=True, capture_output=True)
    dur = float(subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(mp3)]).decode().strip())
    win = s["end"] - s["start"]
    flag = "OK " if dur <= win else "OVER"
    print(f"{flag} {s['id']:14s} {dur:5.2f}s / window {win:5.2f}s  → ends {s['start']+dur:5.2f}")
