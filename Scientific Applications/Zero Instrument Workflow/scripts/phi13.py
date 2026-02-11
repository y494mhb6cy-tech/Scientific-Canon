#!/usr/bin/env python3
import argparse
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

from basic_pitch import ICASSP_2022_MODEL_PATH
from basic_pitch.inference import predict
import pretty_midi


def fail(msg: str) -> None:
    print(f"ERROR: {msg}")
    sys.exit(1)


def repo_root() -> Path:
    return Path(__file__).resolve().parents[1]


def resolve_soundfont(path: Path | None) -> Path:
    if path is not None:
        return path
    return repo_root() / "soundfonts" / "FluidR3_GM.sf2"


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Transcribe audio with basic-pitch, retune to 13-TET, and render to WAV with vocals."
    )
    parser.add_argument(
        "inputs",
        type=Path,
        nargs="+",
        help=(
            "One or more input audio files (wav/mp3/etc). "
            "If missing, falls back to audio/inputs/ then audio/sources/. "
            "Shorthand like /file.mp3 maps to audio/inputs/file.mp3."
        ),
    )
    parser.add_argument(
        "--out-dir",
        type=Path,
        default=repo_root() / "audio" / "outputs",
        help="Directory for outputs (default: audio/outputs).",
    )
    parser.add_argument(
        "--soundfont",
        type=Path,
        default=None,
        help="Path to .sf2 soundfont (default: soundfonts/FluidR3_GM.sf2).",
    )
    parser.add_argument(
        "--rate",
        type=int,
        default=44100,
        help="Sample rate for WAV render (default: 44100).",
    )
    parser.add_argument(
        "--tet",
        type=int,
        default=13,
        help="Equal temperament divisions (default: 13).",
    )
    parser.add_argument(
        "--no-vocals",
        action="store_true",
        help="Skip mixing vocals back in (instrumental only).",
    )
    parser.add_argument(
        "--vocal-vol",
        type=float,
        default=0.3,
        help="Vocal volume level (default: 0.3).",
    )
    parser.add_argument(
        "--inst-vol",
        type=float,
        default=0.9,
        help="Instrumental volume level (default: 0.9).",
    )
    return parser.parse_args()


def separate_stems(input_path: Path, work_dir: Path) -> tuple[Path, Path]:
    """Separate audio into vocals and accompaniment using demucs."""
    print("Phase 0: Separating stems with demucs...")
    subprocess.run(
        [
            sys.executable,
            "-m", "demucs",
            "--two-stems", "vocals",
            "-o", str(work_dir),
            str(input_path),
        ],
        check=True,
    )
    stem_dir = work_dir / "htdemucs" / input_path.stem
    vocals = stem_dir / "vocals.wav"
    accompaniment = stem_dir / "no_vocals.wav"
    if not vocals.exists() or not accompaniment.exists():
        fail(f"Stem separation failed: expected {vocals} and {accompaniment}")
    return vocals, accompaniment


def mix_audio(
    vocal_path: Path,
    instrumental_path: Path,
    output_path: Path,
    rate: int,
    vocal_vol: float = 1.0,
    inst_vol: float = 0.5,
) -> None:
    """Mix vocals and instrumental together using ffmpeg with volume control."""
    print(f"Phase 4: Mixing vocals ({vocal_vol}) with instrumental ({inst_vol})...")
    # Use volume filters then amerge to properly layer the tracks
    filter_complex = (
        f"[0:a]volume={vocal_vol}[v];"
        f"[1:a]volume={inst_vol}[i];"
        f"[v][i]amerge=inputs=2,pan=stereo|c0<c0+c2|c1<c1+c3[out]"
    )
    subprocess.run(
        [
            "ffmpeg",
            "-y",
            "-i", str(vocal_path),
            "-i", str(instrumental_path),
            "-filter_complex", filter_complex,
            "-map", "[out]",
            "-ar", str(rate),
            str(output_path),
        ],
        check=True,
    )


def resolve_input(input_path: Path) -> Path:
    if input_path.exists():
        return input_path

    root = repo_root()

    if input_path.is_absolute():
        if input_path.parent == Path("/"):
            for folder in ("inputs", "sources"):
                candidate = root / "audio" / folder / input_path.name
                if candidate.exists():
                    return candidate
    else:
        for folder in ("inputs", "sources"):
            candidate = root / "audio" / folder / input_path
            if candidate.exists():
                return candidate

    return input_path


def pick_output_paths(out_dir: Path, stem: str, tet: int) -> tuple[Path, Path, Path, Path]:
    version = 0
    while True:
        suffix = "" if version == 0 else f"_v{version}"
        stem_versioned = f"{stem}{suffix}"
        out_midi = out_dir / f"{stem_versioned}.mid"
        out_retuned = out_dir / f"{stem_versioned}_{tet}tet.mid"
        out_instrumental = out_dir / f"{stem_versioned}_{tet}tet_instrumental.wav"
        out_final = out_dir / f"{stem_versioned}_{tet}tet.wav"
        if not (out_midi.exists() or out_retuned.exists() or out_final.exists()):
            return out_midi, out_retuned, out_instrumental, out_final
        version += 1


def main() -> None:
    args = parse_args()

    input_paths: list[Path] = []
    for input_path in args.inputs:
        resolved = resolve_input(input_path)
        if not resolved.exists():
            fail(f"Missing input file: {resolved}")
        input_paths.append(resolved)

    soundfont = resolve_soundfont(args.soundfont)
    if not soundfont.exists():
        fail(f"Missing soundfont: {soundfont}")

    if shutil.which("fluidsynth") is None:
        fail("fluidsynth not found in PATH")

    if shutil.which("ffmpeg") is None:
        fail("ffmpeg not found in PATH")

    out_dir = args.out_dir
    out_dir.mkdir(parents=True, exist_ok=True)

    onnx_model = Path(str(ICASSP_2022_MODEL_PATH)).with_suffix(".onnx")
    model_path = onnx_model if onnx_model.exists() else ICASSP_2022_MODEL_PATH

    for input_path in input_paths:
        stem = input_path.stem
        out_midi, out_retuned, out_instrumental, out_final = pick_output_paths(out_dir, stem, args.tet)

        with tempfile.TemporaryDirectory() as tmp:
            work_dir = Path(tmp)

            # Phase 0: Separate stems
            vocals_path, accompaniment_path = separate_stems(input_path, work_dir)

            print(f"Phase 1: Running basic-pitch on accompaniment...")
            _, midi_data, _ = predict(str(accompaniment_path), model_or_model_path=str(model_path))
            midi_data.write(str(out_midi))

            print(f"Phase 2: Retuning to {args.tet}-TET with pitch bend...")
            pm = pretty_midi.PrettyMIDI(str(out_midi))
            step_cents = 1200 / args.tet

            for inst in pm.instruments:
                bends = []
                for note in inst.notes:
                    original_cents = (note.pitch - 69) * 100
                    nearest_step = round(original_cents / step_cents)
                    target_cents = nearest_step * step_cents
                    bend_cents = target_cents - original_cents
                    bend = int(round((bend_cents / 200.0) * 8192))
                    if bend < -8192:
                        bend = -8192
                    elif bend > 8191:
                        bend = 8191
                    bends.append(pretty_midi.PitchBend(bend, note.start))
                    bends.append(pretty_midi.PitchBend(0, note.end))
                inst.pitch_bends = sorted(bends, key=lambda b: b.time)

            pm.write(str(out_retuned))

            print("Phase 3: Rendering retuned MIDI to WAV with FluidSynth...")
            subprocess.run(
                [
                    "fluidsynth",
                    "-ni",
                    "-F",
                    str(out_instrumental),
                    "-r",
                    str(args.rate),
                    str(soundfont),
                    str(out_retuned),
                ],
                check=True,
            )

            if args.no_vocals:
                # Just rename instrumental to final
                out_instrumental.rename(out_final)
            else:
                # Phase 4: Mix vocals back in
                mix_audio(
                    vocals_path,
                    out_instrumental,
                    out_final,
                    args.rate,
                    args.vocal_vol,
                    args.inst_vol,
                )
                out_instrumental.unlink()  # Clean up intermediate file

        print("SUCCESS")
        print(f"original MIDI: {out_midi}")
        print(f"retuned MIDI: {out_retuned}")
        print(f"final WAV: {out_final}")


if __name__ == "__main__":
    main()
