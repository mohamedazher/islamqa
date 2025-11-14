#!/usr/bin/env python3
"""
IslamQA Data Extraction - Dump File Method
Downloads and processes NDJSON dump files from IslamQA CDN
Much faster and simpler than API-based extraction (~20 seconds vs 50 minutes)
"""

import json
import gzip
import requests
from pathlib import Path
from typing import Dict, List
from collections import defaultdict

# Configuration
CDN_BASE_URL = "https://files.zadapps.info/m.islamqa.info"
MANIFEST_URL = f"{CDN_BASE_URL}/dumps/manifest.json"
LANG = "en"
OUTPUT_DIR = Path(__file__).parent.parent.parent / "public" / "data"

class IslamQADumpExtractor:
    """Extract and transform IslamQA dump files"""

    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'IslamQA-DumpExtractor/1.0',
            'Accept': 'application/json'
        })

        # Data storage
        self.categories_by_ref: Dict[int, Dict] = {}
        self.questions_by_ref: Dict[int, Dict] = {}

        # Make sure output directory exists
        OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    def download_manifest(self) -> Dict:
        """Download and parse manifest.json"""
        print("📥 Downloading manifest...")
        response = self.session.get(MANIFEST_URL, timeout=30)
        response.raise_for_status()
        manifest = response.json()
        print(f"✅ Manifest downloaded")
        return manifest

    def find_latest_dump(self, manifest: Dict) -> Dict:
        """Find the latest dump for specified language"""
        dumps = manifest.get('dumps', [])
        lang_dumps = [d for d in dumps if d.get('lang') == LANG]

        if not lang_dumps:
            raise ValueError(f"No dumps found for language: {LANG}")

        # Get the most recent dump
        latest = max(lang_dumps, key=lambda d: d.get('date', 0))

        print(f"\n📦 Latest {LANG.upper()} dump:")
        print(f"   Folder: {latest['folder']}")
        print(f"   Records: {latest['file']['created']:,}")
        print(f"   Size (compressed): {latest['file']['sizeCompressed'] / 1024 / 1024:.1f} MB")
        print(f"   Size (uncompressed): {latest['file']['sizeUncompressed'] / 1024 / 1024:.1f} MB")

        return latest

    def download_dump(self, dump_info: Dict) -> bytes:
        """Download compressed dump file"""
        folder = dump_info['folder']
        filename = dump_info['file']['name']
        url = f"{CDN_BASE_URL}/{folder}/{filename}"

        print(f"\n📥 Downloading dump file...")
        print(f"   URL: {url}")

        response = self.session.get(url, timeout=120, stream=True)
        response.raise_for_status()

        # Download with progress
        total_size = int(response.headers.get('content-length', 0))
        downloaded = 0
        chunks = []

        for chunk in response.iter_content(chunk_size=8192):
            if chunk:
                chunks.append(chunk)
                downloaded += len(chunk)
                if total_size > 0:
                    percent = (downloaded / total_size) * 100
                    print(f"\r   Progress: {percent:.1f}% ({downloaded / 1024 / 1024:.1f} MB)", end='')

        print(f"\n✅ Download complete")
        return b''.join(chunks)

    def parse_dump(self, compressed_data: bytes):
        """Parse NDJSON dump file and extract data"""
        print(f"\n🔍 Parsing dump file...")

        # Check if already decompressed (server may auto-decompress)
        try:
            # Try to decompress
            data = gzip.decompress(compressed_data)
        except gzip.BadGzipFile:
            # Already decompressed
            data = compressed_data

        lines = data.decode('utf-8').strip().split('\n')

        print(f"   Total records: {len(lines):,}")

        # Parse each line
        topics_count = 0
        answers_count = 0
        other_count = 0

        for idx, line in enumerate(lines):
            try:
                record = json.loads(line)
                record_type = record.get('type')
                record_data = record.get('data', {})

                if record_type == 'topic':
                    self._process_topic(record_data)
                    topics_count += 1
                elif record_type == 'answer':
                    self._process_answer(record_data)
                    answers_count += 1
                else:
                    other_count += 1

                # Progress indicator
                if (idx + 1) % 1000 == 0:
                    print(f"\r   Processed: {idx + 1:,}/{len(lines):,} records", end='')

            except json.JSONDecodeError as e:
                print(f"\n⚠️  Error parsing line {idx + 1}: {e}")
                continue

        print(f"\n\n✅ Parsing complete:")
        print(f"   Topics/Categories: {topics_count:,}")
        print(f"   Answers/Questions: {answers_count:,}")
        print(f"   Other records: {other_count:,}")

    def _process_topic(self, data: Dict):
        """Transform topic/category to app format"""
        ref = data.get('reference')
        if not ref:
            return

        # Extract ancestor references for hierarchy
        ancestors = data.get('ancestors', [])
        ancestor_refs = [a.get('reference') for a in ancestors if a.get('reference')]

        category = {
            'reference': ref,
            'title': data.get('title', ''),
            'description': data.get('description', ''),
            'parent_reference': data.get('parentId'),
            'children_references': [],  # Will be populated later
            'has_subcategories': False,  # Will be updated later
            'has_questions': data.get('answerCount', 0) > 0,
            'question_count': data.get('answerCount', 0),
            'level': len(ancestor_refs),
            'ancestors': ancestor_refs,
            'url': f'/category/{ref}'
        }

        self.categories_by_ref[ref] = category

    def _process_answer(self, data: Dict):
        """Transform answer/question to app format"""
        ref = data.get('reference')
        if not ref:
            return

        # Extract topics/categories
        topics = data.get('topics', [])
        category_refs = [t.get('reference') for t in topics if t.get('reference')]
        primary_category_ref = category_refs[0] if category_refs else None

        # Create category records from topics if they don't exist
        # This ensures all categories referenced by questions exist
        for topic in topics:
            topic_ref = topic.get('reference')
            if topic_ref and topic_ref not in self.categories_by_ref:
                # Extract ancestor references
                ancestors = topic.get('ancestors', [])
                ancestor_refs = [a.get('reference') for a in ancestors if a.get('reference')]

                # Determine parent (last ancestor)
                parent_ref = ancestor_refs[-1] if ancestor_refs else None

                # Create category from topic data
                self.categories_by_ref[topic_ref] = {
                    'reference': topic_ref,
                    'title': topic.get('title', ''),
                    'description': topic.get('description', ''),
                    'parent_reference': parent_ref,
                    'children_references': [],
                    'has_subcategories': False,
                    'has_questions': True,  # We know it has at least this question
                    'question_count': 0,  # Will be calculated later if needed
                    'level': len(ancestor_refs),
                    'ancestors': ancestor_refs,
                    'url': f'/category/{topic_ref}'
                }

        # Extract taxonomies
        taxonomies = {
            'old_category': [
                {
                    'reference': t.get('reference'),
                    'title': t.get('title', ''),
                    'ancestors': t.get('ancestors', [])
                }
                for t in topics
            ] if topics else [],
            'file': [],
            'learnWithUs': [],
            'subsite': [],
            'source': {'title': data.get('source', {}).get('title')} if data.get('source') else None
        }

        question = {
            'reference': ref,
            'title': data.get('title', ''),
            'question': data.get('question', ''),
            'answer': data.get('body', ''),
            'categories': category_refs,
            'primary_category': primary_category_ref,
            'tags': [t.get('title', '') for t in topics] if topics else [],
            'taxonomies': taxonomies,
            'views': int(data.get('views', 0)) if data.get('views') else 0,
            'date': data.get('showDate', ''),
            'content_langs': data.get('contentLangs', []),
            'bookmarked': False,
            'last_read': None
        }

        self.questions_by_ref[ref] = question

    def build_category_hierarchy(self):
        """Build parent-child relationships for categories"""
        print(f"\n🔗 Building category hierarchy...")

        # Build children references
        for ref, category in self.categories_by_ref.items():
            parent_ref = category.get('parent_reference')
            if parent_ref and parent_ref in self.categories_by_ref:
                parent = self.categories_by_ref[parent_ref]
                if ref not in parent['children_references']:
                    parent['children_references'].append(ref)
                parent['has_subcategories'] = True

        print(f"✅ Hierarchy built")

    def save_data(self):
        """Save transformed data to JSON files"""
        print(f"\n💾 Saving data...")

        # Convert to lists and sort
        categories_list = sorted(
            self.categories_by_ref.values(),
            key=lambda c: (c.get('level', 0), c.get('title', ''))
        )

        questions_list = sorted(
            self.questions_by_ref.values(),
            key=lambda q: -q.get('views', 0)  # Sort by views descending
        )

        # Save categories
        categories_file = OUTPUT_DIR / 'categories.json'
        with open(categories_file, 'w', encoding='utf-8') as f:
            json.dump(categories_list, f, ensure_ascii=False, indent=2)

        print(f"✅ Saved {len(categories_list):,} categories to {categories_file}")

        # Save questions
        questions_file = OUTPUT_DIR / 'questions.json'
        with open(questions_file, 'w', encoding='utf-8') as f:
            json.dump(questions_list, f, ensure_ascii=False, indent=2)

        print(f"✅ Saved {len(questions_list):,} questions to {questions_file}")

        # Save metadata
        metadata = {
            'version': '3.0.0',
            'method': 'dump-file-extraction',
            'language': LANG,
            'total_categories': len(categories_list),
            'total_questions': len(questions_list),
            'generated_at': self._get_timestamp()
        }

        metadata_file = OUTPUT_DIR / 'metadata.json'
        with open(metadata_file, 'w', encoding='utf-8') as f:
            json.dump(metadata, f, ensure_ascii=False, indent=2)

        print(f"✅ Saved metadata to {metadata_file}")

        # Print file sizes
        cat_size = categories_file.stat().st_size / 1024 / 1024
        q_size = questions_file.stat().st_size / 1024 / 1024

        print(f"\n📊 Output file sizes:")
        print(f"   categories.json: {cat_size:.2f} MB")
        print(f"   questions.json: {q_size:.2f} MB")
        print(f"   Total: {cat_size + q_size:.2f} MB")

    def _get_timestamp(self) -> str:
        """Get current timestamp"""
        from datetime import datetime
        return datetime.utcnow().isoformat() + 'Z'

    def run(self):
        """Run the complete extraction process"""
        print("="*70)
        print("🚀 IslamQA Dump File Extraction")
        print("="*70)

        try:
            # Step 1: Download manifest
            manifest = self.download_manifest()

            # Step 2: Find latest dump
            dump_info = self.find_latest_dump(manifest)

            # Step 3: Download dump
            compressed_data = self.download_dump(dump_info)

            # Step 4: Parse dump
            self.parse_dump(compressed_data)

            # Step 5: Build hierarchy
            self.build_category_hierarchy()

            # Step 6: Save data
            self.save_data()

            print("\n" + "="*70)
            print("✅ EXTRACTION COMPLETE!")
            print("="*70)
            print(f"\nData saved to: {OUTPUT_DIR}/")
            print("  - categories.json")
            print("  - questions.json")
            print("  - metadata.json")

        except Exception as e:
            print(f"\n❌ Error: {e}")
            import traceback
            traceback.print_exc()
            raise


def main():
    extractor = IslamQADumpExtractor()
    extractor.run()


if __name__ == "__main__":
    main()
