#!/usr/bin/env python3
"""
extract_parallel.py
Parallel extraction by category for much faster data collection

Architecture:
1. Extract all categories (1 API call)
2. For each category, launch parallel worker to extract questions
3. Each worker searches for questions in that category
4. Merge results from all workers
5. Transform and bundle

Speed improvement: 10-50x faster than sequential!
"""

import requests
import json
import time
from pathlib import Path
from typing import Dict, List, Optional
import logging
import multiprocessing as mp
from functools import partial
import argparse

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

BASE_API_URL = "https://archive-1446.islamqa.info/api"

class ParallelExtractor:
    """Extract data in parallel by category"""

    def __init__(self, output_dir: str = "raw", delay: float = 0.5, workers: int = 4):
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(parents=True, exist_ok=True)
        self.delay = delay
        self.workers = workers

        # Create subdirectories
        self.categories_dir = self.output_dir / "categories"
        self.categories_dir.mkdir(exist_ok=True)

    def _make_request(self, url: str, session=None) -> Optional[Dict]:
        """Make HTTP request with rate limiting"""
        if session is None:
            session = requests.Session()
            session.headers.update({
                'User-Agent': 'IslamQA-App-Builder/2.0',
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            })

        try:
            response = session.get(url, timeout=30)
            response.raise_for_status()
            time.sleep(self.delay)
            return response.json()
        except requests.exceptions.RequestException as e:
            logger.error(f"Request failed: {e}")
            return None

    # ==================== STEP 1: EXTRACT CATEGORIES ====================

    def extract_categories(self, lang: str = "en"):
        """Extract all categories first"""
        logger.info("📚 STEP 1: Extracting all categories...")

        url = f"{BASE_API_URL}/{lang}/categories/topics"
        data = self._make_request(url)

        if not data or not isinstance(data, list):
            logger.error("❌ Failed to fetch categories")
            return []

        logger.info(f"✅ Fetched {len(data)} categories")

        # Process categories
        processed = self.process_categories(data)

        # Save categories
        categories_file = self.output_dir / 'categories.json'
        with open(categories_file, 'w', encoding='utf-8') as f:
            json.dump(processed, f, ensure_ascii=False, indent=2)

        logger.info(f"✅ Saved {len(processed)} categories to {categories_file}")
        return processed

    def process_categories(self, categories: List[Dict]) -> List[Dict]:
        """Process categories into app format"""
        categories_map = {}
        processed = []

        for cat in categories:
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
                'url': cat.get('url', f"cat/{cat['reference']}")
            }
            categories_map[cat['reference']] = category
            processed.append(category)

        # Populate children and levels
        for cat in processed:
            if cat['parent_reference'] is not None:
                parent = categories_map.get(cat['parent_reference'])
                if parent:
                    parent['children_references'].append(cat['reference'])
                    parent['has_subcategories'] = True

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

    # ==================== STEP 2: EXTRACT BY CATEGORY (PARALLEL) ====================

    def extract_category_questions(self, category_ref: int, lang: str = "en",
                                   max_attempts: int = 100) -> List[Dict]:
        """
        Extract questions for a specific category
        This runs in parallel for each category
        """
        session = requests.Session()
        session.headers.update({
            'User-Agent': 'IslamQA-App-Builder/2.0',
            'Accept': 'application/json',
        })

        questions = []
        attempts = 0
        not_found_streak = 0
        reference = 1

        logger.info(f"🔍 Extracting questions for category {category_ref}...")

        # Try different reference ranges
        # Questions might be anywhere from 1 to 300000
        for ref in range(1, 300000):
            if attempts >= max_attempts and not_found_streak > 20:
                # If we've tried max_attempts and had 20 consecutive misses, stop
                break

            url = f"{BASE_API_URL}/{lang}/post/show/{ref}"
            data = self._make_request(url, session)

            attempts += 1

            if data and 'post' in data:
                post = data['post']

                # Check if this question belongs to our category
                tags = post.get('tags', [])
                belongs_to_category = False

                try:
                    if tags and isinstance(tags, list):
                        for tag in tags:
                            if isinstance(tag, dict) and tag.get('reference') == category_ref:
                                belongs_to_category = True
                                break
                except (KeyError, TypeError):
                    pass

                if belongs_to_category:
                    # Extract tag titles
                    tag_titles = []
                    try:
                        if tags and isinstance(tags, list):
                            for tag in tags:
                                if isinstance(tag, dict) and 'title' in tag:
                                    tag_titles.append(tag['title'])
                    except (TypeError, KeyError):
                        pass

                    question = {
                        'reference': post['reference'],
                        'title': post.get('title', ''),
                        'question': post.get('question', ''),
                        'answer': post.get('answer', ''),
                        'category_reference': category_ref,
                        'category_path': [category_ref],
                        'tags': tag_titles,
                        'views': int(post.get('views', 0)) if post.get('views') else 0,
                        'date': post.get('date', ''),
                        'bookmarked': False,
                        'last_read': None
                    }

                    questions.append(question)
                    not_found_streak = 0
                    logger.info(f"  ✅ Category {category_ref}: Found question {ref} (total: {len(questions)})")
                else:
                    not_found_streak += 1
            else:
                not_found_streak += 1

            # Adaptive stopping: if we haven't found anything in a while, move on
            if not_found_streak > 50 and len(questions) > 0:
                logger.info(f"  ⏭️  Category {category_ref}: No recent finds, moving on ({len(questions)} questions collected)")
                break

        logger.info(f"✅ Category {category_ref}: Collected {len(questions)} questions")

        # Save category results
        if questions:
            category_file = self.categories_dir / f'category_{category_ref}.json'
            with open(category_file, 'w', encoding='utf-8') as f:
                json.dump(questions, f, ensure_ascii=False, indent=2)

        return questions

    def extract_all_parallel(self, categories: List[Dict], lang: str = "en"):
        """
        Extract questions for all categories in parallel
        """
        logger.info(f"\n🚀 STEP 2: Extracting questions in parallel ({self.workers} workers)...")

        # Get category references
        category_refs = [cat['reference'] for cat in categories]

        logger.info(f"📋 Processing {len(category_refs)} categories...")

        # Create partial function with fixed arguments
        extract_func = partial(self.extract_category_questions, lang=lang)

        # Use multiprocessing pool
        with mp.Pool(processes=self.workers) as pool:
            results = pool.map(extract_func, category_refs)

        # Flatten results
        all_questions = []
        for questions in results:
            all_questions.extend(questions)

        logger.info(f"\n✅ Total questions collected: {len(all_questions)}")

        return all_questions

    # ==================== STEP 3: MERGE AND SAVE ====================

    def merge_and_save(self, categories: List[Dict], all_questions: List[Dict]):
        """Merge results and save"""
        logger.info("\n💾 STEP 3: Merging and saving results...")

        # Update category question counts
        from collections import defaultdict
        category_counts = defaultdict(int)

        for q in all_questions:
            cat_ref = q.get('category_reference')
            if cat_ref:
                category_counts[cat_ref] += 1

        for cat in categories:
            cat_ref = cat['reference']
            if cat_ref in category_counts:
                cat['question_count'] = category_counts[cat_ref]
                cat['has_questions'] = True

        # Save final categories
        categories_file = self.output_dir / 'categories.json'
        with open(categories_file, 'w', encoding='utf-8') as f:
            json.dump(categories, f, ensure_ascii=False, indent=2)

        # Save final questions
        questions_file = self.output_dir / 'questions.json'
        with open(questions_file, 'w', encoding='utf-8') as f:
            json.dump(all_questions, f, ensure_ascii=False, indent=2)

        # Save metadata
        metadata = {
            'version': '2.0.0',
            'extraction_method': 'parallel_by_category',
            'generated_at': time.strftime('%Y-%m-%d %H:%M:%S'),
            'total_categories': len(categories),
            'total_questions': len(all_questions),
            'categories_with_questions': len(category_counts),
            'language': 'en',
            'workers': self.workers
        }

        metadata_file = self.output_dir / 'metadata.json'
        with open(metadata_file, 'w', encoding='utf-8') as f:
            json.dump(metadata, f, ensure_ascii=False, indent=2)

        logger.info(f"✅ Saved categories: {categories_file}")
        logger.info(f"✅ Saved questions: {questions_file}")
        logger.info(f"✅ Saved metadata: {metadata_file}")

        self.print_stats(categories, all_questions)

    def print_stats(self, categories, questions):
        """Print final statistics"""
        print("\n" + "="*60)
        print("📊 EXTRACTION STATISTICS (PARALLEL)")
        print("="*60)
        print(f"Total Categories: {len(categories)}")
        print(f"Total Questions: {len(questions)}")

        if questions:
            avg_views = sum(q['views'] for q in questions) / len(questions)
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
    parser = argparse.ArgumentParser(
        description="Extract IslamQA data in parallel by category",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Extract with 4 workers (default)
  python3 extract_parallel.py --output raw --workers 4

  # Extract with 8 workers (faster)
  python3 extract_parallel.py --output raw --workers 8

  # Test with 2 categories only
  python3 extract_parallel.py --output raw --workers 2 --test 2
        """
    )

    parser.add_argument('--output', default='raw',
                       help='Output directory (default: raw)')

    parser.add_argument('--workers', type=int, default=4,
                       help='Number of parallel workers (default: 4)')

    parser.add_argument('--delay', type=float, default=0.5,
                       help='Delay between requests in seconds (default: 0.5)')

    parser.add_argument('--lang', default='en',
                       help='Language code (default: en)')

    parser.add_argument('--test', type=int, default=None,
                       help='Test mode: only extract N categories')

    args = parser.parse_args()

    # Initialize extractor
    extractor = ParallelExtractor(
        output_dir=args.output,
        delay=args.delay,
        workers=args.workers
    )

    # STEP 1: Extract categories
    categories = extractor.extract_categories(args.lang)

    if not categories:
        logger.error("❌ Failed to extract categories")
        return

    # Test mode: limit categories
    if args.test:
        logger.info(f"🧪 Test mode: Only extracting {args.test} categories")
        categories = categories[:args.test]

    # STEP 2: Extract questions in parallel
    all_questions = extractor.extract_all_parallel(categories, args.lang)

    # STEP 3: Merge and save
    extractor.merge_and_save(categories, all_questions)

    logger.info("\n✅ Parallel extraction complete!")
    logger.info(f"\nData saved to: {args.output}/")


if __name__ == "__main__":
    main()
