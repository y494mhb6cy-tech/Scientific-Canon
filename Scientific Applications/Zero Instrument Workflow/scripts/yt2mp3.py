#!/usr/bin/env python3
"""Download YouTube audio as MP3 for the phi13 workflow."""
import argparse
import re
import shutil
import subprocess
import sys
from pathlib import Path


def fail(msg: str) -> None:
    print(f"ERROR: {msg}")
    sys.exit(1)


def repo_root() -> Path:
    return Path(__file__).resolve().parents[1]


def sanitize_filename(name: str) -> str:
    """Remove or replace characters that are problematic in filenames."""
    # Remove/replace problematic characters
    name = re.sub(r'[<>:"/\\|?*]', '', name)
    # Replace spaces with underscores
    name = name.replace(' ', '_')
    # Remove multiple underscores
    name = re.sub(r'_+', '_', name)
    # Remove leading/trailing underscores
    name = name.strip('_')
    # Limit length
    if len(name) > 100:
        name = name[:100]
    return name


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Download YouTube audio as MP3 for phi13 processing."
    )
    parser.add_argument(
        "url",
        type=str,
        help="YouTube URL to download.",
    )
    parser.add_argument(
        "-o", "--output",
        type=str,
        default=None,
        help="Output filename (without extension). Defaults to video title.",
    )
    parser.add_argument(
        "--out-dir",
        type=Path,
        default=None,
        help="Output directory (default: audio/sources).",
    )
    parser.add_argument(
        "--quality",
        type=str,
        default="192",
        help="Audio quality in kbps (default: 192).",
    )
    return parser.parse_args()


def get_video_title(url: str) -> str:
    """Fetch video title from YouTube."""
    result = subprocess.run(
        ["yt-dlp", "--get-title", url],
        capture_output=True,
        text=True,
        check=True,
    )
    return result.stdout.strip()


def download_audio(url: str, output_path: Path, quality: str) -> None:
    """Download audio from YouTube and convert to MP3."""
    # Use yt-dlp to download and convert to mp3
    subprocess.run(
        [
            "yt-dlp",
            "-x",  # Extract audio
            "--audio-format", "mp3",
            "--audio-quality", quality,
            "-o", str(output_path),
            url,
        ],
        check=True,
    )


def main() -> None:
    args = parse_args()

    # Check dependencies
    if shutil.which("yt-dlp") is None:
        fail("yt-dlp not found. Install with: brew install yt-dlp")

    if shutil.which("ffmpeg") is None:
        fail("ffmpeg not found. Install with: brew install ffmpeg")

    # Determine output directory
    out_dir = args.out_dir
    if out_dir is None:
        out_dir = repo_root() / "audio" / "sources"
    out_dir.mkdir(parents=True, exist_ok=True)

    # Determine output filename
    if args.output:
        filename = sanitize_filename(args.output)
    else:
        print("Fetching video title...")
        title = get_video_title(args.url)
        filename = sanitize_filename(title)
        print(f"Title: {title}")

    output_path = out_dir / f"{filename}.mp3"

    # Check if file already exists
    if output_path.exists():
        print(f"File already exists: {output_path}")
        response = input("Overwrite? [y/N]: ").strip().lower()
        if response != 'y':
            print("Aborted.")
            sys.exit(0)

    print(f"Downloading audio from: {args.url}")
    print(f"Output: {output_path}")

    download_audio(args.url, output_path, args.quality)

    print()
    print("SUCCESS")
    print(f"Downloaded: {output_path}")
    print()
    print("To process with phi13:")
    print(f"  ./phi13 /{filename}.mp3")


if __name__ == "__main__":
    main()
