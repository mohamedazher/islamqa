#!/usr/bin/env python3
"""
IslamQA Fresh Data Extraction
Extract all data fresh from API - no old data needed
"""

import requests
import json
import time
from pathlib import Path
from typing import Dict, List, Optional
import logging
from collections import defaultdict

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

BASE_API_URL = "https://archive-1446.islamqa.info/api"

class FreshExtractor:
    """Extract data fresh from API"""

    def __init__(self, output_dir: str = "public/data", delay: float = 2.0):
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(parents=True, exist_ok=True)
        self.delay = delay
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'IslamQA-App-Builder/1.0',
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        })

        self.categories = []
        self.questions = []
        self.category_question_count = defaultdict(int)

    def _make_request(self, url: str) -> Optional[Dict]:
        """Make HTTP request with rate limiting"""
        try:
            response = self.session.get(url, timeout=30)
            response.raise_for_status()
            time.sleep(self.delay)
            return response.json()
        except requests.exceptions.RequestException as e:
            logger.error(f"Request failed: {e}")
            return None

    # ==================== STEP 1: FETCH CATEGORIES ====================

    def fetch_categories(self, lang: str = "en"):
        """Fetch and save all categories"""
        logger.info("📚 STEP 1: Fetching categories...")

        url = f"{BASE_API_URL}/{lang}/categories/topics"
        data = self._make_request(url)

        if not data or not isinstance(data, list):
            logger.error("❌ Failed to fetch categories")
            return False

        self.categories = data
        logger.info(f"✅ Fetched {len(self.categories)} categories")

        # Process and save
        processed = self.process_categories()
        self.save_categories(processed)

        return True

    def process_categories(self) -> List[Dict]:
        """Transform categories into app format"""
        categories_map = {}
        processed = []

        # Create category objects
        for cat in self.categories:
            category = {
                'reference': cat['reference'],
                'title': cat['title'],
                'description': cat.get('description', ''),
                'parent_reference': cat.get('parent_reference'),
                'children_references': [],
                'has_subcategories': False,
                'has_questions': False,
                'question_count': 0,
                'level': 0,
                'url': cat.get('url', '')
            }
            categories_map[cat['reference']] = category
            processed.append(category)

        # Populate children
        for cat in processed:
            if cat['parent_reference'] is not None:
                parent = categories_map.get(cat['parent_reference'])
                if parent:
                    parent['children_references'].append(cat['reference'])
                    parent['has_subcategories'] = True

        # Calculate levels
        def calculate_level(cat):
            if cat['parent_reference'] is None:
                return 0
            parent = categories_map.get(cat['parent_reference'])
            if parent:
                return calculate_level(parent) + 1
            return 0

        for cat in processed:
            cat['level'] = calculate_level(cat)

        return processed

    def save_categories(self, categories):
        """Save categories to file"""
        file_path = self.output_dir / 'categories.json'
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(categories, f, ensure_ascii=False, indent=2)
        logger.info(f"✅ Saved {len(categories)} categories to {file_path}")

    # ==================== STEP 2: DISCOVER QUESTIONS ====================

    def discover_questions(self, start_ref: int, end_ref: int, lang: str = "en"):
        """
        Discover questions by trying sequential reference IDs
        """
        logger.info(f"\n📥 STEP 2: Discovering questions from {start_ref} to {end_ref}...")

        total_range = end_ref - start_ref + 1
        found_count = 0
        not_found_count = 0

        for ref in range(start_ref, end_ref + 1):
            progress = ((ref - start_ref + 1) / total_range) * 100

            logger.info(f"[{progress:.1f}%] Trying reference {ref}... (Found: {found_count}, Missing: {not_found_count})")

            url = f"{BASE_API_URL}/{lang}/post/show/{ref}"
            data = self._make_request(url)

            if data and 'post' in data:
                post = data['post']

                # Get category reference
                category_ref = None
                tags = post.get('tags', [])

                # Handle tags - could be list of dicts or other format
                try:
                    if tags and isinstance(tags, list) and len(tags) > 0:
                        first_tag = tags[0]
                        if isinstance(first_tag, dict):
                            category_ref = first_tag.get('reference')
                except (KeyError, TypeError, IndexError):
                    pass

                # Count for category
                if category_ref:
                    self.category_question_count[category_ref] += 1

                # Process question - extract tag titles safely
                tag_titles = []
                try:
                    if tags and isinstance(tags, list):
                        for tag in tags:
                            if isinstance(tag, dict) and 'title' in tag:
                                tag_titles.append(tag['title'])
                except (TypeError, KeyError):
                    pass

                # Process question
                question = {
                    'reference': post['reference'],
                    'title': post.get('title', ''),
                    'question': post.get('question', ''),
                    'answer': post.get('answer', ''),
                    'category_reference': category_ref,
                    'category_path': [category_ref] if category_ref else [],
                    'tags': tag_titles,
                    'views': int(post.get('views', 0)) if post.get('views') else 0,
                    'date': post.get('date', ''),
                    'bookmarked': False,
                    'last_read': None
                }

                self.questions.append(question)
                found_count += 1

                # Save progress every 50 questions
                if found_count % 50 == 0:
                    self.save_progress()
            else:
                not_found_count += 1

        logger.info(f"\n✅ Discovery complete: Found {found_count} questions, {not_found_count} not found")

    def save_progress(self):
        """Save questions collected so far"""
        file_path = self.output_dir / 'questions.json'
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(self.questions, f, ensure_ascii=False, indent=2)
        logger.info(f"💾 Progress saved: {len(self.questions)} questions")

    # ==================== STEP 3: FINALIZE ====================

    def finalize(self):
        """Update category counts and save metadata"""
        logger.info("\n📊 Finalizing...")

        # Update categories with question counts
        categories_file = self.output_dir / 'categories.json'
        with open(categories_file, 'r', encoding='utf-8') as f:
            categories = json.load(f)

        for cat in categories:
            cat_ref = cat['reference']
            if cat_ref in self.category_question_count:
                count = self.category_question_count[cat_ref]
                cat['question_count'] = count
                cat['has_questions'] = count > 0

        # Save updated categories
        with open(categories_file, 'w', encoding='utf-8') as f:
            json.dump(categories, f, ensure_ascii=False, indent=2)

        # Save final questions
        self.save_progress()

        # Save metadata
        metadata = {
            'version': '1.0.0',
            'generated_at': time.strftime('%Y-%m-%d %H:%M:%S'),
            'total_categories': len(categories),
            'total_questions': len(self.questions),
            'categories_with_questions': len(self.category_question_count),
            'language': 'en'
        }

        metadata_file = self.output_dir / 'metadata.json'
        with open(metadata_file, 'w', encoding='utf-8') as f:
            json.dump(metadata, f, ensure_ascii=False, indent=2)

        self.print_stats(categories)

    def print_stats(self, categories):
        """Print final statistics"""
        print("\n" + "="*60)
        print("📊 FINAL STATISTICS")
        print("="*60)
        print(f"Total Categories: {len(categories)}")
        print(f"Categories with Questions: {len(self.category_question_count)}")
        print(f"Total Questions: {len(self.questions)}")

        if self.questions:
            avg_views = sum(q['views'] for q in self.questions) / len(self.questions)
            print(f"Average Views: {avg_views:.0f}")

        # File sizes
        cat_file = self.output_dir / 'categories.json'
        q_file = self.output_dir / 'questions.json'

        if cat_file.exists() and q_file.exists():
            cat_size = cat_file.stat().st_size / 1024 / 1024
            q_size = q_file.stat().st_size / 1024 / 1024
            print(f"\n📦 File Sizes:")
            print(f"  categories.json: {cat_size:.2f} MB")
            print(f"  questions.json: {q_size:.2f} MB")
            print(f"  Total: {cat_size + q_size:.2f} MB")

        print("="*60)


def main():
    import argparse

    parser = argparse.ArgumentParser(
        description="Extract IslamQA data fresh from API",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Test with small range
  python3 extract_fresh.py --range 100000 100200 --output test_output

  # Full extraction (recommended range based on IslamQA data)
  python3 extract_fresh.py --range 1 300000 --output public/data

  # Continue from where you left off
  python3 extract_fresh.py --range 150000 300000 --output public/data
        """
    )

    parser.add_argument('--range', nargs=2, type=int, required=True,
                       metavar=('START', 'END'),
                       help='Range of reference IDs to try (e.g., 1 300000)')

    parser.add_argument('--output', default='public/data',
                       help='Output directory (default: public/data)')

    parser.add_argument('--delay', type=float, default=2.0,
                       help='Delay between requests in seconds (default: 2.0)')

    parser.add_argument('--lang', default='en',
                       help='Language code (default: en)')

    args = parser.parse_args()

    # Initialize extractor
    extractor = FreshExtractor(output_dir=args.output, delay=args.delay)

    # Estimate time
    total_requests = args.range[1] - args.range[0] + 1
    estimated_hours = (total_requests * args.delay) / 3600
    logger.info(f"⏱️  Estimated time: {estimated_hours:.1f} hours for {total_requests} requests")

    if total_requests > 1000:
        response = input(f"\nThis will try {total_requests} reference IDs. Continue? (y/n): ")
        if response.lower() != 'y':
            logger.info("❌ Cancelled")
            return

    # STEP 1: Categories
    if not extractor.fetch_categories(args.lang):
        return

    # STEP 2: Discover questions
    extractor.discover_questions(args.range[0], args.range[1], args.lang)

    # STEP 3: Finalize
    extractor.finalize()

    logger.info("\n✅ Extraction complete!")
    logger.info(f"\nData saved to: {args.output}/")
    logger.info("  - categories.json")
    logger.info("  - questions.json")
    logger.info("  - metadata.json")


if __name__ == "__main__":
    main()
