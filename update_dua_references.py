#!/usr/bin/env python3
"""
Script to update missing references in sunnah-duas.json
"""

import json
import re

# Map of ID to reference (extracted from virtue field or hisn_al_muslim.txt)
REFERENCE_UPDATES = {
    5: "Ibn al-Sunnī 456",
    10: "Tabarānī in Muʿjam al-Kabīr 23/370, Tabarānī in Musnad al-Shāmiyyīn 2155",
    11: "Aḥmad 4340",
    13: "Nasā'ī 5519",
    16: "Hākim 1/525",
    19: "Ibn Hibbān 1609",
    21: "Tabarānī in Mu'jam al-Awsat 7572",
    22: "Nasā'ī in ʿAmal al-Yawm wa-l-Laylah 570",
    23: "Hākim 1/4",
    24: "Hākim 1/525",
    27: "Tabarānī in Mu'jam al-Awsat 653",
    29: "Aḥmad 17155",
    35: "Nasā'ī 1305",
    36: "Aḥmad 25019",
    37: "Hākim 1867",
    39: "Aḥmad 3712",
    52: "Aḥmad 13003",
    54: "Al-Adab al-Mufrad 716, Ibn al-Sunnī 258",
    56: "Hākim 1944",
    57: "Nasā'ī 5531",
    62: "Nasā'ī 5468",
    63: "Tabarānī 810",
    64: "Tabarānī in al-Du'ā 1339",
    69: "Hākim 1/455",
    70: "Aḥmad 16599",
    72: "Aḥmad 3823, 24392",
    74: "Hākim 977",
}

def extract_reference_from_virtue(virtue_text):
    """Extract hadith references from the virtue field"""
    if not virtue_text:
        return None

    # Common patterns for references
    patterns = [
        r'\(([^)]*(?:Bukhārī|Muslim|Tirmidhī|Tirmidhi|Abu Dawud|Nasā\'ī|Nasa|Ibn Majah|Ahmad|Tabarānī|Tabarani|Hākim|Hakim|Ibn Hibbān|Ibn Hibban|Ibn al-Sunnī|Ibn al-Sunni)[^)]*)\)',
        r'\*\(([^)]*(?:Bukhārī|Muslim|Tirmidhī|Tirmidhi|Abu Dawud|Nasā\'ī|Nasa|Ibn Majah|Ahmad|Tabarānī|Tabarani|Hākim|Hakim|Ibn Hibbān|Ibn Hibban|Ibn al-Sunnī|Ibn al-Sunni)[^)]*)\)\*',
    ]

    for pattern in patterns:
        matches = re.findall(pattern, virtue_text)
        if matches:
            # Return the last match (usually the most specific reference)
            return matches[-1]

    return None

def update_json_file(filepath):
    """Update the JSON file with missing references"""
    print(f"Reading {filepath}...")

    with open(filepath, 'r', encoding='utf-8') as f:
        data = json.load(f)

    updated_count = 0

    for dua in data['duas']:
        if dua['id'] in REFERENCE_UPDATES:
            old_ref = dua.get('reference', '')

            # If reference is already filled, skip
            if old_ref and old_ref.strip():
                print(f"ID {dua['id']}: Already has reference '{old_ref}', skipping")
                continue

            # Try to get reference from our mapping
            new_ref = REFERENCE_UPDATES[dua['id']]

            # If our mapping is empty, try to extract from virtue field
            if not new_ref:
                new_ref = extract_reference_from_virtue(dua.get('virtue', ''))

            if new_ref:
                dua['reference'] = new_ref
                updated_count += 1
                print(f"ID {dua['id']}: Updated reference to '{new_ref}'")
            else:
                print(f"ID {dua['id']}: No reference found")

    # Write updated data back to file
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    print(f"\nUpdated {updated_count} references in {filepath}")
    return updated_count

if __name__ == '__main__':
    # Update both files
    file1 = '/home/user/islamqa/public/data/dua/sunnah-duas.json'
    file2 = '/home/user/islamqa/www/data/dua/sunnah-duas.json'

    count1 = update_json_file(file1)
    count2 = update_json_file(file2)

    print(f"\n=== Summary ===")
    print(f"Total references updated: {count1}")
    print(f"Files updated: {file1}, {file2}")
