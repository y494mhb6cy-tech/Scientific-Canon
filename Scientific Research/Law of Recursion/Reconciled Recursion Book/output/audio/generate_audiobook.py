#!/usr/bin/env python3
"""
Generate audiobook from text file using Microsoft Edge TTS (free, high-quality neural voices)
Splits long text into chapters to avoid API limits, then combines them.
"""

import asyncio
import edge_tts
import os
import re
import subprocess
from pathlib import Path

# Configuration
INPUT_FILE = "/Users/Joshuaabickel/Desktop/Desktop/Reconciled Recursion/output/audio/Recursive_Reconciliation_Audiobook.txt"
OUTPUT_DIR = "/Users/Joshuaabickel/Desktop/Desktop/Reconciled Recursion/output/audio"
OUTPUT_FILE = os.path.join(OUTPUT_DIR, "Recursive_Reconciliation_Audiobook.mp3")

# High-quality narrator voice
VOICE = "en-GB-RyanNeural"
RATE = "-5%"  # Slightly slower for contemplative content

def clean_text(text):
    """Clean markdown and prepare text for narration"""
    # Convert markdown headers to spoken text
    text = re.sub(r'^## (Chapter \d+)\s*[—–-]\s*(.+)$', r'\n\n\1: \2.\n\n', text, flags=re.MULTILINE)
    text = re.sub(r'^## (.+)$', r'\n\n\1.\n\n', text, flags=re.MULTILINE)
    text = re.sub(r'^### (.+)$', r'\n\n\1.\n\n', text, flags=re.MULTILINE)
    text = re.sub(r'^# (.+)$', r'\n\n\1.\n\n', text, flags=re.MULTILINE)

    # Remove markdown formatting
    text = re.sub(r'\*\*(.+?)\*\*', r'\1', text)
    text = re.sub(r'\*(.+?)\*', r'\1', text)
    text = re.sub(r'_(.+?)_', r'\1', text)

    # Clean up dashes
    text = text.replace('—', ' — ')
    text = text.replace('–', ' – ')
    text = re.sub(r'‑', '-', text)  # non-breaking hyphen

    return text.strip()

def split_into_sections(text):
    """Split text into sections (chapters/parts) for processing"""
    # Split on chapter markers
    pattern = r'((?:^|\n)(?:## (?:Chapter \d+|Preface|Epilogue)|# ))'

    parts = re.split(pattern, text)

    sections = []
    current_section = ""

    for i, part in enumerate(parts):
        if re.match(r'\n?(?:## (?:Chapter \d+|Preface|Epilogue)|# )', part):
            if current_section.strip():
                sections.append(current_section.strip())
            current_section = part
        else:
            current_section += part

    if current_section.strip():
        sections.append(current_section.strip())

    # If we didn't get good splits, just split by size
    if len(sections) <= 1:
        # Split into ~3000 word chunks
        words = text.split()
        chunk_size = 3000
        sections = []
        for i in range(0, len(words), chunk_size):
            chunk = ' '.join(words[i:i + chunk_size])
            sections.append(chunk)

    return sections

async def generate_section_audio(text, output_path, section_num, total):
    """Generate audio for a single section"""
    print(f"  Generating section {section_num}/{total}...")

    communicate = edge_tts.Communicate(text, VOICE, rate=RATE)
    await communicate.save(output_path)

    size_kb = os.path.getsize(output_path) / 1024
    print(f"  Section {section_num} complete ({size_kb:.0f} KB)")

async def main():
    print(f"Reading text from: {INPUT_FILE}")

    with open(INPUT_FILE, 'r', encoding='utf-8') as f:
        text = f.read()

    text = clean_text(text)
    word_count = len(text.split())

    print(f"Text loaded: {word_count:,} words")
    print(f"Estimated audiobook length: ~{word_count // 150} minutes")
    print(f"Using voice: {VOICE}")

    # Split into sections
    sections = split_into_sections(text)
    print(f"Split into {len(sections)} sections")

    # Create temp directory for section files
    temp_dir = os.path.join(OUTPUT_DIR, "temp_sections")
    os.makedirs(temp_dir, exist_ok=True)

    section_files = []

    # Generate audio for each section
    print("\nGenerating audio sections...")
    for i, section in enumerate(sections, 1):
        section_path = os.path.join(temp_dir, f"section_{i:03d}.mp3")
        section_files.append(section_path)

        try:
            await generate_section_audio(section, section_path, i, len(sections))
        except Exception as e:
            print(f"  Error on section {i}: {e}")
            # Try splitting this section further
            words = section.split()
            if len(words) > 1500:
                mid = len(words) // 2
                part1 = ' '.join(words[:mid])
                part2 = ' '.join(words[mid:])

                section_path_a = os.path.join(temp_dir, f"section_{i:03d}a.mp3")
                section_path_b = os.path.join(temp_dir, f"section_{i:03d}b.mp3")

                # Remove failed file from list and add new ones
                section_files.remove(section_path)
                section_files.extend([section_path_a, section_path_b])

                print(f"  Retrying section {i} in two parts...")
                await generate_section_audio(part1, section_path_a, f"{i}a", len(sections))
                await generate_section_audio(part2, section_path_b, f"{i}b", len(sections))

    # Combine all sections using ffmpeg if available, otherwise use cat
    print("\nCombining sections into final audiobook...")

    # Create file list for ffmpeg
    list_file = os.path.join(temp_dir, "files.txt")
    with open(list_file, 'w') as f:
        for section_file in sorted(section_files):
            if os.path.exists(section_file):
                f.write(f"file '{section_file}'\n")

    # Try ffmpeg first (better quality)
    try:
        result = subprocess.run(
            ['ffmpeg', '-y', '-f', 'concat', '-safe', '0', '-i', list_file, '-c', 'copy', OUTPUT_FILE],
            capture_output=True,
            text=True
        )
        if result.returncode != 0:
            raise Exception(result.stderr)
        print("Combined with ffmpeg")
    except Exception as e:
        print(f"ffmpeg not available, using simple concatenation...")
        # Simple binary concatenation (works for MP3)
        with open(OUTPUT_FILE, 'wb') as outfile:
            for section_file in sorted(section_files):
                if os.path.exists(section_file):
                    with open(section_file, 'rb') as infile:
                        outfile.write(infile.read())

    # Cleanup temp files
    print("Cleaning up temporary files...")
    for f in os.listdir(temp_dir):
        os.remove(os.path.join(temp_dir, f))
    os.rmdir(temp_dir)

    # Final stats
    size_mb = os.path.getsize(OUTPUT_FILE) / (1024 * 1024)
    print(f"\n{'='*50}")
    print(f"Audiobook generated successfully!")
    print(f"Output: {OUTPUT_FILE}")
    print(f"File size: {size_mb:.1f} MB")
    print(f"{'='*50}")

if __name__ == "__main__":
    asyncio.run(main())
