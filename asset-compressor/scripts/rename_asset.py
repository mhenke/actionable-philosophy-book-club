#!/usr/bin/env python3
# asset-compressor/scripts/rename_asset.py
# Rename and organize a meeting asset to match the project naming convention.
#
# Usage:
#   python3 scripts/rename_asset.py <file> --meeting NN --slug <kebab-slug> [--type deep-dive|critique|debate] [--dry-run]

import os
import sys
import re
import json
import shutil
import argparse

# Unified extension mapping aligned with client-side src/01-utils.js validation
EXTENSION_MAPPING = {
    'mp4': {'category': 'recording', 'subdir': 'recordings'},
    'm4a': {'category': 'recording', 'subdir': 'recordings'},
    'pptx': {'category': 'slides', 'subdir': 'slides'},
    'pdf': {'category': 'slides', 'subdir': 'slides'},
    'png': {'category': 'resource', 'subdir': 'resources'},
    'jpg': {'category': 'resource', 'subdir': 'resources'},
    'jpeg': {'category': 'resource', 'subdir': 'resources'},
    'gif': {'category': 'resource', 'subdir': 'resources'},
    'svg': {'category': 'resource', 'subdir': 'resources'},
    'webp': {'category': 'resource', 'subdir': 'resources'},
}

# Standard expected recording types
KNOWN_RECORDING_TYPES = {'deep-dive', 'critique', 'debate'}

def sanitize_slug(slug):
    """Sanitize slug to kebab-case, converting spaces to hyphens and removing invalid characters."""
    s = slug.lower().strip()
    s = re.sub(r'[\s_]+', '-', s)
    s = re.sub(r'[^a-z0-9\-]', '', s)
    s = re.sub(r'-+', '-', s)
    return s.strip('-')

def parse_args():
    parser = argparse.ArgumentParser(
        description="Rename and organize a meeting asset to match naming conventions."
    )
    parser.add_argument("file", help="Path to the source file to rename.")
    parser.add_argument("--meeting", help="Meeting number (e.g. 01 or 1). Optional if only one meeting folder exists.")
    parser.add_argument("--slug", required=True, help="Kebab-case title slug (e.g., clean-code-paradox).")
    parser.add_argument("--type", help="Type of recording (recordings only). e.g., deep-dive, critique, debate.")
    parser.add_argument("--dry-run", action="store_true", help="Preview the operations without modifying files.")
    return parser.parse_args()

def main():
    args = parse_args()
    
    # 1. Validate source file existence
    if not os.path.isfile(args.file):
        print(f"Error: file not found: {args.file}", file=sys.stderr)
        sys.exit(1)
        
    # 2. Extract and validate file extension
    ext = os.path.splitext(args.file)[1].lstrip('.').lower()
    if ext not in EXTENSION_MAPPING:
        supported = ", ".join(f".{x}" for x in EXTENSION_MAPPING.keys())
        print(f"Error: unsupported extension .{ext}", file=sys.stderr)
        print(f"Supported: {supported}", file=sys.stderr)
        sys.exit(1)
        
    mapping = EXTENSION_MAPPING[ext]
    category = mapping['category']
    subdir = mapping['subdir']
    
    # 3. Parameter Validation: Ensure --type is only supplied for recordings
    if args.type and category != 'recording':
        print(f"Error: --type can only be specified for recordings (got: .{ext} which is category '{category}')", file=sys.stderr)
        sys.exit(1)
        
    # Warn instead of exiting for unrecognized recording subtypes
    if args.type and category == 'recording' and args.type.lower() not in KNOWN_RECORDING_TYPES:
        supported_str = ", ".join(KNOWN_RECORDING_TYPES)
        print(f"Warning: unrecognized recording subtype '{args.type}'.", file=sys.stderr)
        print(f"Standard types are: {supported_str}", file=sys.stderr)
        
    # 4. Input Sanitization (Defining Errors Out of Existence)
    slug = sanitize_slug(args.slug)
    if not slug:
        print(f"Error: slug '{args.slug}' contains no valid characters", file=sys.stderr)
        sys.exit(1)
        
    basename = os.path.basename(args.file)
    
    # 5. Alternate Asset Detection (Run first, before constructing filename)
    is_alternate = False
    if re.search(r'[-_](alt|alternate)(\.|$|_|-)', basename, re.IGNORECASE):
        is_alternate = True
        print(f"Detected alternate asset: {basename}")
        
    # 6. Resolve meeting directory
    meeting = args.meeting
    if not meeting:
        # Check meeting folders in meetings/
        meetings_dir = "meetings"
        if not os.path.isdir(meetings_dir):
            print("Error: 'meetings' directory not found in current path", file=sys.stderr)
            sys.exit(1)
            
        dirs = sorted([
            d for d in os.listdir(meetings_dir)
            if os.path.isdir(os.path.join(meetings_dir, d)) and re.match(r'^meeting-[0-9]+', d)
        ])
        
        if len(dirs) == 1:
            m = re.match(r'^meeting-([0-9]+)', dirs[0])
            meeting = m.group(1)
            print(f"Inferred meeting: {meeting} (only meeting directory found)")
        else:
            print("Error: multiple meeting directories found; specify --meeting NN", file=sys.stderr)
            print("Available:", file=sys.stderr)
            for d in dirs:
                print(f"  {d}", file=sys.stderr)
            sys.exit(1)
            
    # Pad meeting number to 2 digits
    try:
        meeting_pad = f"{int(meeting):02d}"
    except ValueError:
        print(f"Error: invalid meeting number: {meeting}", file=sys.stderr)
        sys.exit(1)
        
    meetings_dir = "meetings"
    meeting_folders = [
        d for d in os.listdir(meetings_dir)
        if os.path.isdir(os.path.join(meetings_dir, d)) and d.startswith(f"meeting-{meeting_pad}")
    ]
    if not meeting_folders:
        print(f"Error: no directory found matching meeting-{meeting_pad}*", file=sys.stderr)
        sys.exit(1)
        
    meeting_dir_name = meeting_folders[0]
    meeting_dir = os.path.join(meetings_dir, meeting_dir_name)
    
    # 7. Construct target filename in a single clean step
    filename_parts = [meeting_pad, slug]
    if category == 'recording' and args.type:
        filename_parts.append(args.type.lower())
    if is_alternate:
        filename_parts.append("alternate")
        
    target_filename = "-".join(filename_parts) + f".{ext}"
    
    target_dir = os.path.join(meeting_dir, subdir)
    target_path = os.path.join(target_dir, target_filename)
    
    print(f"Rename:  {basename}")
    print(f"      →  {target_path}")
    
    # Simulate side effects in Dry Run Mode
    if args.dry_run:
        print(f"[Dry Run] Will create directory: {target_dir}")
        print(f"[Dry Run] Will move file: {args.file} -> {target_path}")
        if is_alternate:
            manifest_path = os.path.join(meeting_dir, "asset-manifest.json")
            print(f"[Dry Run] Will update manifest {manifest_path} with entry:")
            simulated_entry = {
                target_filename: {
                    'variant': 'alternate',
                    'source_filename': basename
                }
            }
            print(json.dumps(simulated_entry, indent=2))
        print("(dry run — no files moved)")
        sys.exit(0)
        
    # Interactive confirmation (simulates bash prompt)
    try:
        confirm = input("Move? [y/N] ").strip().lower()
    except (KeyboardInterrupt, EOFError):
        print("\nAborted.")
        sys.exit(1)
        
    if confirm != 'y':
        print("Aborted.")
        sys.exit(0)
        
    # 8. Perform directory creation and move
    os.makedirs(target_dir, exist_ok=True)
    shutil.move(args.file, target_path)
    print("Done.")
    
    # 9. Update JSON manifest safely
    if is_alternate:
        manifest_path = os.path.join(meeting_dir, "asset-manifest.json")
        manifest_data = {}
        
        if os.path.exists(manifest_path):
            try:
                with open(manifest_path, 'r') as f:
                    manifest_data = json.load(f)
            except json.JSONDecodeError as jde:
                print(f"Error: {manifest_path} is corrupted and cannot be parsed: {jde}", file=sys.stderr)
                print("Aborting manifest update to prevent data loss.", file=sys.stderr)
                sys.exit(1)
            except Exception as e:
                print(f"Error reading manifest: {e}", file=sys.stderr)
                sys.exit(1)
                
        manifest_data[target_filename] = {
            'variant': 'alternate',
            'source_filename': basename
        }
        
        try:
            with open(manifest_path, 'w') as f:
                json.dump(manifest_data, f, indent=2)
            print(f"Wrote manifest: {manifest_path}")
        except Exception as e:
            print(f"Error writing manifest: {e}", file=sys.stderr)
            sys.exit(1)

if __name__ == "__main__":
    main()
