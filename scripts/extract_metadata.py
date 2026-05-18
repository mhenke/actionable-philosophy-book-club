#!/usr/bin/env python3
"""
Extract file metadata (duration, fileSize) for meeting assets.

Scans meeting directories for media files (mp4, m4a, pptx) and generates
JSON that can be merged into docs/manifest.json. Outputs fileSize in MB.

Usage:
  python3 extract_metadata.py                  # Scan from cwd
  python3 extract_metadata.py /path/to/meetings
  python3 extract_metadata.py --patch docs/manifest.json
"""

import json
import os
import subprocess
import sys
from pathlib import Path
from typing import Dict, Any, Optional, List


def get_file_size_mb(file_path: str) -> float:
    """Get file size in MB. Uses decimals for files < 1 MB, rounds larger files."""
    size_bytes = os.path.getsize(file_path)
    size_mb = size_bytes / (1024 * 1024)
    # For small files, show decimal precision; for large files, round
    return round(size_mb, 1) if size_mb < 1 else round(size_mb)


def get_video_duration(file_path: str) -> Optional[int]:
    """Extract duration in seconds from mp4/m4a using ffprobe."""
    try:
        result = subprocess.run(
            [
                'ffprobe',
                '-v', 'error',
                '-show_entries', 'format=duration',
                '-of', 'default=noprint_wrappers=1:nokey=1:nokey=1',
                file_path
            ],
            capture_output=True,
            text=True,
            timeout=10
        )
        if result.returncode == 0 and result.stdout.strip():
            return int(float(result.stdout.strip()))
    except (subprocess.TimeoutExpired, FileNotFoundError):
        pass
    return None


def scan_meetings_dir(meetings_root: str) -> Dict[str, Any]:
    """
    Scan meetings directory and extract metadata for all assets.
    Returns dict keyed by meeting ID with updated metadata.
    """
    meetings_root = Path(meetings_root)
    results = {}

    for meeting_dir in sorted(meetings_root.glob('meeting-*')):
        if not meeting_dir.is_dir():
            continue

        meeting_id = meeting_dir.name
        metadata = {'id': meeting_id}

        # Video (mp4 in recordings/)
        recordings_dir = meeting_dir / 'recordings'
        if recordings_dir.exists():
            for mp4_file in recordings_dir.glob('*.mp4'):
                rel_path = str(mp4_file.relative_to(meetings_root.parent))
                file_size = get_file_size_mb(str(mp4_file))
                duration = get_video_duration(str(mp4_file))

                key = mp4_file.stem
                metadata[f'video_{key}'] = {
                    'file': rel_path,
                    'fileSize': file_size,
                    'duration': duration
                }

            # Audio (m4a in recordings/)
            for m4a_file in recordings_dir.glob('*.m4a'):
                rel_path = str(m4a_file.relative_to(meetings_root.parent))
                file_size = get_file_size_mb(str(m4a_file))
                duration = get_video_duration(str(m4a_file))

                key = m4a_file.stem
                metadata[f'audio_{key}'] = {
                    'file': rel_path,
                    'fileSize': file_size,
                    'duration': duration
                }

        # Slides (pptx in slides/)
        slides_dir = meeting_dir / 'slides'
        if slides_dir.exists():
            for pptx_file in slides_dir.glob('*.pptx'):
                rel_path = str(pptx_file.relative_to(meetings_root.parent))
                file_size = get_file_size_mb(str(pptx_file))

                key = pptx_file.stem
                metadata[f'slides_{key}'] = {
                    'file': rel_path,
                    'fileSize': file_size
                }

        # Resources (images in resources/)
        resources_dir = meeting_dir / 'resources'
        if resources_dir.exists():
            for image_file in resources_dir.glob('*.png'):
                rel_path = str(image_file.relative_to(meetings_root.parent))
                file_size = get_file_size_mb(str(image_file))

                key = image_file.stem
                metadata[f'resource_{key}'] = {
                    'file': rel_path,
                    'fileSize': file_size
                }
            for image_file in resources_dir.glob('*.jpg'):
                rel_path = str(image_file.relative_to(meetings_root.parent))
                file_size = get_file_size_mb(str(image_file))

                key = image_file.stem
                metadata[f'resource_{key}'] = {
                    'file': rel_path,
                    'fileSize': file_size
                }

        if len(metadata) > 1:  # More than just 'id'
            results[meeting_id] = metadata

    return results


def generate_metadata_json(meetings_root: str) -> str:
    """Generate complete metadata JSON suitable for manifest.json."""
    metadata = scan_meetings_dir(meetings_root)
    return json.dumps(metadata, indent=2)


def patch_manifest(manifest_path: str, meetings_root: str) -> None:
    """
    Patch docs/manifest.json with extracted metadata.
    Updates duration and fileSize fields in existing meeting entries.
    """
    manifest_path = Path(manifest_path)
    
    if not manifest_path.exists():
        print(f"Error: {manifest_path} not found", file=sys.stderr)
        sys.exit(1)

    # Load current manifest
    with open(manifest_path) as f:
        manifest = json.load(f)

    # Scan for metadata
    metadata = scan_meetings_dir(meetings_root)

    # Patch each meeting
    for meeting_obj in manifest.get('meetings', []):
        meeting_id = meeting_obj.get('id')
        if meeting_id not in metadata:
            continue

        meeting_meta = metadata[meeting_id]

        # Video metadata
        for key in list(meeting_meta.keys()):
            if key == 'id':
                continue
            if key.startswith('video_'):
                if meeting_obj.get('video'):
                    meeting_obj['video'].update({
                        'fileSize': meeting_meta[key]['fileSize'],
                        'duration': meeting_meta[key]['duration']
                    })

        # Slides metadata (now including fileSize)
        for key in list(meeting_meta.keys()):
            if key.startswith('slides_'):
                if meeting_obj.get('slides'):
                    meeting_obj['slides']['fileSize'] = meeting_meta[key]['fileSize']

        # Podcast/alternate audio metadata
        for podcast in meeting_obj.get('podcasts', []):
            for key in list(meeting_meta.keys()):
                if key.startswith('audio_'):
                    meta = meeting_meta[key]
                    if podcast.get('file') == meta['file']:
                        podcast['fileSize'] = meta['fileSize']
                        if meta['duration']:
                            podcast['duration'] = meta['duration']

        # Resource metadata
        for resource in meeting_obj.get('resources', []):
            for key in list(meeting_meta.keys()):
                if key.startswith('resource_'):
                    meta = meeting_meta[key]
                    if resource.get('file') == meta['file']:
                        resource['fileSize'] = meta['fileSize']

    # Write back
    with open(manifest_path, 'w') as f:
        json.dump(manifest, f, indent=2)

    print(f"✓ Patched {manifest_path}")


def main():
    if len(sys.argv) < 2:
        # Default: scan current directory
        meetings_root = 'meetings'
    elif sys.argv[1] == '--patch':
        # Patch mode
        if len(sys.argv) < 3:
            print("Usage: extract_metadata.py --patch <manifest.json> [meetings_root]", file=sys.stderr)
            sys.exit(1)
        manifest_path = sys.argv[2]
        meetings_root = sys.argv[3] if len(sys.argv) > 3 else 'meetings'
        patch_manifest(manifest_path, meetings_root)
        return
    else:
        meetings_root = sys.argv[1]

    # Scan and output JSON
    print(generate_metadata_json(meetings_root))


if __name__ == '__main__':
    main()
