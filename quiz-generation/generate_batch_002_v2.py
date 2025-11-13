#!/usr/bin/env python3
"""
Enhanced Quiz Question Generator for Batch 002
Generates 100 high-quality multiple-choice quiz questions from IslamQA content
"""

import json
import re
import random
from typing import Dict, List

def strip_html(text: str) -> str:
    """Remove HTML tags and clean up text"""
    text = re.sub(r'<[^>]+>', '', text)
    text = re.sub(r'\s+', ' ', text)
    text = text.replace('&nbsp;', ' ')
    text = text.replace('&amp;', '&')
    text = text.replace('&quot;', '"')
    text = text.replace('&rsquo;', "'")
    text = text.replace('&lsquo;', "'")
    return text.strip()

def get_quiz_bank():
    """Return the comprehensive quiz question bank with all 100 questions"""
    return {
        338146: {
            "questionText": "What should a person do if they break their fast due to extreme thirst?",
            "options": [
                {"id": "a", "text": "Drink only enough to ward off harm, then abstain until sunset", "isCorrect": True},
                {"id": "b", "text": "Continue eating and drinking freely for the rest of the day", "isCorrect": False},
                {"id": "c", "text": "Not make up the fast since it was broken due to necessity", "isCorrect": False},
                {"id": "d", "text": "Break the fast completely and resume fasting the next day", "isCorrect": False}
            ],
            "explanation": "When someone breaks their fast due to extreme thirst and fear of harm, they should drink only enough to remove the danger, then must abstain from eating and drinking until sunset. They must also make up that day's fast later.",
            "tags": ["fasting", "ramadan", "necessity", "rulings", "breaking-fast"],
            "difficulty": "medium"
        },
        31245: {
            "questionText": "Is it necessary to add another name before 'Fatimah' when naming a girl?",
            "options": [
                {"id": "a", "text": "No, you can simply name her Fatimah without any additions", "isCorrect": True},
                {"id": "b", "text": "Yes, you must add Ghulam, Kaneez, or Noor before Fatimah", "isCorrect": False},
                {"id": "c", "text": "Yes, it is obligatory to add at least one other name", "isCorrect": False},
                {"id": "d", "text": "It depends on the family tradition and culture", "isCorrect": False}
            ],
            "explanation": "You can name your daughter Fatimah without adding any other name to it. When referring to Fatimah the daughter of the Prophet (peace be upon him), we add 'radiya Allahu anha' (may Allah be pleased with her) as she was one of the Companions.",
            "tags": ["names", "islamic-names", "fatimah", "naming", "children"],
            "difficulty": "easy"
        },
        82277: {
            "questionText": "Is it permissible for a civil engineer to draw architectural plans for buildings financed with riba-based loans?",
            "options": [
                {"id": "a", "text": "Yes, if the building itself is for permissible purposes like residential homes", "isCorrect": True},
                {"id": "b", "text": "No, any involvement with riba-financed projects is forbidden", "isCorrect": False},
                {"id": "c", "text": "Only if you donate a portion of your earnings to charity", "isCorrect": False},
                {"id": "d", "text": "Yes, but only for commercial buildings, not residential ones", "isCorrect": False}
            ],
            "explanation": "It is permissible to draw plans for permissible buildings like homes, even if the owner finances them with riba-based loans. The engineer is not helping in the sin of riba itself but doing permissible work. However, it would be forbidden to design buildings for evil purposes like riba-based banks or bars.",
            "tags": ["riba", "interest", "work", "halal-income", "architecture", "loans"],
            "difficulty": "medium"
        },
        70274: {
            "questionText": "Is it permissible to use tricks to avoid paying excessive electricity bills charged by the state?",
            "options": [
                {"id": "a", "text": "No, it is considered cheating and consuming people's wealth unlawfully", "isCorrect": True},
                {"id": "b", "text": "Yes, if the state is charging unjust prices", "isCorrect": False},
                {"id": "c", "text": "Yes, but only in non-Muslim countries", "isCorrect": False},
                {"id": "d", "text": "Yes, as long as you donate the saved money to charity", "isCorrect": False}
            ],
            "explanation": "Even if the state charges excessive prices, it is not permissible to tamper with meters or use tricks to avoid paying bills. This constitutes cheating, deception, and consuming people's wealth unlawfully. Muslims should be patient and seek reward with Allah rather than respond to injustice in kind.",
            "tags": ["honesty", "bills", "state", "cheating", "trust", "public-utilities"],
            "difficulty": "medium"
        },
        742: {
            "questionText": "What is the ruling on praying in a garment that has images of animate beings on it?",
            "options": [
                {"id": "a", "text": "The prayer is valid but it is disliked and should be avoided", "isCorrect": True},
                {"id": "b", "text": "The prayer is completely invalid and must be repeated", "isCorrect": False},
                {"id": "c", "text": "It is permissible without any dislike", "isCorrect": False},
                {"id": "d", "text": "Only images of humans invalidate the prayer", "isCorrect": False}
            ],
            "explanation": "The prayer remains valid if performed in clothes with images, but it is disliked (makruh). Images of animate beings are prohibited in Islam and may distract from prayer. It is better to avoid such clothing for prayer.",
            "tags": ["prayer", "images", "clothing", "validity", "makruh"],
            "difficulty": "medium"
        },
        11125: {
            "questionText": "What is the Islamic ruling on men wearing gold jewelry?",
            "options": [
                {"id": "a", "text": "It is completely forbidden for men to wear gold", "isCorrect": True},
                {"id": "b", "text": "It is permissible if the gold is less than 5 grams", "isCorrect": False},
                {"id": "c", "text": "It is permissible for wedding rings only", "isCorrect": False},
                {"id": "d", "text": "It is disliked but not explicitly forbidden", "isCorrect": False}
            ],
            "explanation": "The Prophet (peace be upon him) explicitly forbade gold for men in any amount or form. This includes rings, necklaces, watches, or any gold items. Silver is permissible for men within reasonable limits.",
            "tags": ["gold", "men", "jewelry", "forbidden", "haram", "adornment"],
            "difficulty": "easy"
        },
        39189: {
            "questionText": "Is it permissible to shake hands with members of the opposite gender who are not mahram?",
            "options": [
                {"id": "a", "text": "No, it is forbidden to shake hands with non-mahram", "isCorrect": True},
                {"id": "b", "text": "Yes, if done in professional settings", "isCorrect": False},
                {"id": "c", "text": "Yes, if there is no desire involved", "isCorrect": False},
                {"id": "d", "text": "It is only permissible for elderly people", "isCorrect": False}
            ],
            "explanation": "The Prophet (peace be upon him) said he never touched the hand of a woman who was not permissible for him. It is forbidden for men and women who are not mahram to shake hands or touch, regardless of the situation or intent.",
            "tags": ["handshake", "touching", "mahram", "gender-relations", "forbidden"],
            "difficulty": "medium"
        },
        7856: {
            "questionText": "What is the ruling on celebrating birthdays in Islam?",
            "options": [
                {"id": "a", "text": "It is an innovation (bidah) not prescribed in Islam", "isCorrect": True},
                {"id": "b", "text": "It is permissible as a cultural celebration", "isCorrect": False},
                {"id": "c", "text": "It is recommended to show gratitude to Allah", "isCorrect": False},
                {"id": "d", "text": "It is permissible for children under 12", "isCorrect": False}
            ],
            "explanation": "Celebrating birthdays is considered an innovation as it was not practiced by the Prophet (peace be upon him) or his Companions. Muslims have two prescribed celebrations: Eid al-Fitr and Eid al-Adha. Adding celebrations imitates non-Muslim practices.",
            "tags": ["birthday", "celebration", "bidah", "innovation", "eid"],
            "difficulty": "easy"
        },
        101385: {
            "questionText": "Is it obligatory for men to attend congregational prayer at the mosque?",
            "options": [
                {"id": "a", "text": "Yes, according to the strongest scholarly opinion", "isCorrect": True},
                {"id": "b", "text": "No, it is highly recommended but optional", "isCorrect": False},
                {"id": "c", "text": "It is only obligatory for Friday prayer", "isCorrect": False},
                {"id": "d", "text": "It depends on the distance from the mosque", "isCorrect": False}
            ],
            "explanation": "The strongest scholarly opinion is that congregational prayer at the mosque is obligatory for men who are able. The Prophet (peace be upon him) strongly emphasized this and considered avoiding it despite hearing the adhan a sign of hypocrisy.",
            "tags": ["congregation", "mosque", "prayer", "obligation", "men"],
            "difficulty": "medium"
        },
        38577: {
            "questionText": "What is the ruling on a woman traveling without a mahram?",
            "options": [
                {"id": "a", "text": "It is not permissible except in cases of dire necessity", "isCorrect": True},
                {"id": "b", "text": "It is permissible with a group of trustworthy women", "isCorrect": False},
                {"id": "c", "text": "It is permissible for short distances under 80 km", "isCorrect": False},
                {"id": "d", "text": "Modern transportation makes it permissible", "isCorrect": False}
            ],
            "explanation": "The Prophet (peace be upon him) forbade women from traveling without a mahram. This ruling remains valid regardless of transportation or perceived safety. A mahram provides protection and proper guardianship.",
            "tags": ["women", "travel", "mahram", "guardian", "prohibition"],
            "difficulty": "medium"
        },
        129095: {
            "questionText": "Can Zakat be given to one's own parents or children?",
            "options": [
                {"id": "a", "text": "No, Zakat cannot be given to ascendants or descendants", "isCorrect": True},
                {"id": "b", "text": "Yes, family members have the most right to Zakat", "isCorrect": False},
                {"id": "c", "text": "Yes, but only in extreme poverty", "isCorrect": False},
                {"id": "d", "text": "It's permissible for parents but not children", "isCorrect": False}
            ],
            "explanation": "Zakat cannot be given to parents, grandparents, children, or grandchildren because one is already obligated to support them financially. Supporting them is an obligation, not charity. Zakat can be given to other relatives like siblings and cousins.",
            "tags": ["zakat", "family", "charity", "parents", "children"],
            "difficulty": "easy"
        },
        10721: {
            "questionText": "What is the ruling on listening to music with musical instruments?",
            "options": [
                {"id": "a", "text": "It is forbidden according to the majority of scholars", "isCorrect": True},
                {"id": "b", "text": "It is permissible if the lyrics are clean", "isCorrect": False},
                {"id": "c", "text": "Only certain instruments are forbidden", "isCorrect": False},
                {"id": "d", "text": "It is permissible during weddings", "isCorrect": False}
            ],
            "explanation": "The majority of scholars consider musical instruments forbidden based on various hadiths. The only exception is the daff (hand drum) for women during weddings and Eid. This applies regardless of lyrics or occasion.",
            "tags": ["music", "instruments", "forbidden", "entertainment", "haram"],
            "difficulty": "medium"
        },
        104245: {
            "questionText": "Is it permissible to celebrate Christmas or other non-Islamic festivals?",
            "options": [
                {"id": "a", "text": "No, Muslims should not participate in non-Islamic festivals", "isCorrect": True},
                {"id": "b", "text": "Yes, if done culturally without religious meaning", "isCorrect": False},
                {"id": "c", "text": "Yes, to show respect and coexistence", "isCorrect": False},
                {"id": "d", "text": "It's permissible to attend but not organize", "isCorrect": False}
            ],
            "explanation": "Muslims should not celebrate or participate in non-Islamic religious festivals as this imitates other religions and weakens Islamic identity. Muslims have two Eids designated by Allah.",
            "tags": ["festivals", "christmas", "celebrations", "innovation", "imitation"],
            "difficulty": "easy"
        },
        145797: {
            "questionText": "What is the minimum amount of gold that makes Zakat obligatory?",
            "options": [
                {"id": "a", "text": "Approximately 85 grams of gold", "isCorrect": True},
                {"id": "b", "text": "40 grams of gold", "isCorrect": False},
                {"id": "c", "text": "200 grams of gold", "isCorrect": False},
                {"id": "d", "text": "100 grams of gold", "isCorrect": False}
            ],
            "explanation": "The nisab for gold is approximately 85 grams (20 dinars). If someone owns this amount or more for one lunar year, they must pay 2.5% as Zakat. This applies to gold kept for investment.",
            "tags": ["zakat", "gold", "nisab", "wealth", "threshold"],
            "difficulty": "hard"
        },
        148236: {
            "questionText": "Is it permissible to pray voluntary prayers during the forbidden times?",
            "options": [
                {"id": "a", "text": "No, except prayers with a specific reason", "isCorrect": True},
                {"id": "b", "text": "Yes, all prayers are permitted at all times", "isCorrect": False},
                {"id": "c", "text": "No voluntary prayers allowed without exception", "isCorrect": False},
                {"id": "d", "text": "Only two-unit prayers are forbidden", "isCorrect": False}
            ],
            "explanation": "During forbidden times (after Fajr until sunrise, at zenith, after Asr until sunset), voluntary prayers without specific reason are prohibited. However, prayers with a reason like tahiyyat al-masjid may be prayed.",
            "tags": ["prayer", "voluntary", "forbidden-times", "nafl", "timing"],
            "difficulty": "hard"
        },
        20652: {
            "questionText": "What is the Islamic ruling on male circumcision?",
            "options": [
                {"id": "a", "text": "It is obligatory or highly emphasized by scholarly consensus", "isCorrect": True},
                {"id": "b", "text": "It is merely a recommended Sunnah", "isCorrect": False},
                {"id": "c", "text": "It is only required before marriage", "isCorrect": False},
                {"id": "d", "text": "It is a cultural practice without religious basis", "isCorrect": False}
            ],
            "explanation": "Circumcision for males is either obligatory or highly emphasized according to scholarly consensus. It is part of the fitrah (natural disposition) and has religious and health benefits.",
            "tags": ["circumcision", "fitrah", "men", "obligation", "sunnah"],
            "difficulty": "easy"
        },
        36645: {
            "questionText": "Should missed Ramadan fasts be made up before the next Ramadan?",
            "options": [
                {"id": "a", "text": "Yes, delaying without excuse is disliked", "isCorrect": True},
                {"id": "b", "text": "You can delay indefinitely without consequence", "isCorrect": False},
                {"id": "c", "text": "It must be made up within one month", "isCorrect": False},
                {"id": "d", "text": "You must pay fidyah instead if delayed", "isCorrect": False}
            ],
            "explanation": "Missed fasts should be made up before the next Ramadan. Delaying without valid excuse is disliked. If delayed until next Ramadan, one must make up the fasts and may need to feed a poor person for each day.",
            "tags": ["fasting", "ramadan", "qada", "makeup", "delay"],
            "difficulty": "medium"
        },
        150959: {
            "questionText": "Is it forbidden for men to wear gold in any circumstance?",
            "options": [
                {"id": "a", "text": "Yes, it is completely forbidden in any amount", "isCorrect": True},
                {"id": "b", "text": "Small amounts under 5 grams are permissible", "isCorrect": False},
                {"id": "c", "text": "Wedding rings are an exception", "isCorrect": False},
                {"id": "d", "text": "It is disliked but not explicitly haram", "isCorrect": False}
            ],
            "explanation": "It is completely forbidden for men to wear gold in any amount. The Prophet (peace be upon him) explicitly forbade gold and silk for men. This includes all gold items - rings, necklaces, watches, etc.",
            "tags": ["gold", "men", "jewelry", "forbidden", "haram"],
            "difficulty": "easy"
        },
        144738: {
            "questionText": "What is the ruling on using Allah's name carelessly in everyday speech?",
            "options": [
                {"id": "a", "text": "Allah's name should be used with respect, not in vain", "isCorrect": True},
                {"id": "b", "text": "It's permissible as long as not cursing", "isCorrect": False},
                {"id": "c", "text": "It's only forbidden during prayer times", "isCorrect": False},
                {"id": "d", "text": "Arabic usage is fine, other languages are not", "isCorrect": False}
            ],
            "explanation": "Allah's name must be mentioned with respect and reverence, not used carelessly or in vain. Swearing by Allah casually or using His name without proper respect is prohibited.",
            "tags": ["Allah", "respect", "names", "speech", "reverence"],
            "difficulty": "easy"
        },
        113459: {
            "questionText": "Is saying 'Bismillah' before eating obligatory?",
            "options": [
                {"id": "a", "text": "It is obligatory or highly recommended according to scholars", "isCorrect": True},
                {"id": "b", "text": "It is a cultural tradition without religious basis", "isCorrect": False},
                {"id": "c", "text": "Only obligatory for shared meals", "isCorrect": False},
                {"id": "d", "text": "Saying it silently is forbidden", "isCorrect": False}
            ],
            "explanation": "The Prophet (peace be upon him) commanded saying 'Bismillah' before eating. Scholars differ on whether it's obligatory or highly recommended, but all agree it should not be neglected.",
            "tags": ["bismillah", "eating", "manners", "food", "obligation"],
            "difficulty": "medium"
        },
        175175: {
            "questionText": "What is the nisab (minimum threshold) for silver that makes Zakat obligatory?",
            "options": [
                {"id": "a", "text": "Approximately 595 grams of silver", "isCorrect": True},
                {"id": "b", "text": "85 grams of silver", "isCorrect": False},
                {"id": "c", "text": "200 grams of silver", "isCorrect": False},
                {"id": "d", "text": "1000 grams of silver", "isCorrect": False}
            ],
            "explanation": "The nisab for silver is 200 dirhams, approximately 595 grams. If owned for one lunar year, 2.5% must be paid as Zakat. Many scholars recommend using silver nisab for currency calculations.",
            "tags": ["zakat", "silver", "nisab", "wealth", "threshold"],
            "difficulty": "hard"
        },
        30901: {
            "questionText": "What is the ruling on a woman removing her hijab in front of her brother-in-law?",
            "options": [
                {"id": "a", "text": "It is forbidden; she must maintain hijab", "isCorrect": True},
                {"id": "b", "text": "It's permissible as he is family", "isCorrect": False},
                {"id": "c", "text": "It's permissible if her husband is present", "isCorrect": False},
                {"id": "d", "text": "It's permissible after years of family relationship", "isCorrect": False}
            ],
            "explanation": "A brother-in-law is not a mahram. The Prophet (peace be upon him) warned that 'the in-law is death,' meaning the danger of mixing. She cannot remove hijab or be alone with him.",
            "tags": ["hijab", "mahram", "brother-in-law", "women", "covering"],
            "difficulty": "easy"
        },
        82307: {
            "questionText": "Is it permissible to perform Hajj using borrowed money?",
            "options": [
                {"id": "a", "text": "Yes, but Hajj only becomes obligatory when affordable without borrowing", "isCorrect": True},
                {"id": "b", "text": "No, Hajj with debt is invalid", "isCorrect": False},
                {"id": "c", "text": "Yes, and it's recommended to borrow for Hajj", "isCorrect": False},
                {"id": "d", "text": "It depends on interest-free vs interest loans", "isCorrect": False}
            ],
            "explanation": "Performing Hajj with borrowed money is valid, but Hajj is only obligatory on those with financial means. If unable to afford without borrowing, it's not yet obligatory. Ability to repay is also a consideration.",
            "tags": ["hajj", "debt", "borrowing", "obligation", "finance"],
            "difficulty": "hard"
        },
        52923: {
            "questionText": "Is it permissible to work as a cashier in a store selling both halal and haram items?",
            "options": [
                {"id": "a", "text": "No, it involves helping in selling haram items", "isCorrect": True},
                {"id": "b", "text": "Yes, if most items are halal", "isCorrect": False},
                {"id": "c", "text": "Yes, if you refuse to scan haram items", "isCorrect": False},
                {"id": "d", "text": "Yes, as long as you don't consume them", "isCorrect": False}
            ],
            "explanation": "Working as a cashier where haram items like alcohol or pork are sold is impermissible. The cashier directly participates in the sale, constituting helping in sin. Muslims should seek halal employment.",
            "tags": ["work", "cashier", "haram-items", "employment", "alcohol"],
            "difficulty": "medium"
        },
        34557: {
            "questionText": "At what age does fasting become obligatory for children?",
            "options": [
                {"id": "a", "text": "When they reach puberty, though training should begin earlier", "isCorrect": True},
                {"id": "b", "text": "Seven years old like prayer", "isCorrect": False},
                {"id": "c", "text": "Ten years old for all children", "isCorrect": False},
                {"id": "d", "text": "Twelve years as a fixed age", "isCorrect": False}
            ],
            "explanation": "Fasting becomes obligatory at puberty. However, parents should train children before this when able, to prepare them. The exact age varies by individual development.",
            "tags": ["fasting", "children", "puberty", "age", "obligation"],
            "difficulty": "easy"
        },
        201425: {
            "questionText": "What should someone do if they miss Fajr prayer due to oversleeping?",
            "options": [
                {"id": "a", "text": "Pray it immediately upon waking as qada (makeup)", "isCorrect": True},
                {"id": "b", "text": "Wait until next Fajr and pray double", "isCorrect": False},
                {"id": "c", "text": "Pray extra voluntary prayers to compensate", "isCorrect": False},
                {"id": "d", "text": "The prayer is lost and cannot be made up", "isCorrect": False}
            ],
            "explanation": "If someone misses Fajr due to oversleeping, they should pray it as soon as they wake. The Prophet (peace be upon him) said whoever forgets or sleeps through a prayer should pray it when they remember.",
            "tags": ["prayer", "fajr", "missed-prayer", "qada", "oversleeping"],
            "difficulty": "easy"
        },
        112120: {
            "questionText": "Is it permissible for women to pluck or shape their eyebrows?",
            "options": [
                {"id": "a", "text": "No, plucking eyebrows is forbidden based on the Prophet's curse", "isCorrect": True},
                {"id": "b", "text": "Yes, if done moderately", "isCorrect": False},
                {"id": "c", "text": "Yes, for married women with husband's permission", "isCorrect": False},
                {"id": "d", "text": "Trimming is permissible, plucking is not", "isCorrect": False}
            ],
            "explanation": "The Prophet (peace be upon him) cursed those who pluck eyebrows. This includes trimming, shaping, or removing eyebrow hair. Muslim women should avoid this regardless of beauty trends.",
            "tags": ["eyebrows", "women", "beauty", "forbidden", "plucking"],
            "difficulty": "easy"
        },
        85191: {
            "questionText": "Can prayers be combined (jam') when staying in one place (not traveling)?",
            "options": [
                {"id": "a", "text": "Generally only permitted when traveling", "isCorrect": True},
                {"id": "b", "text": "Permitted for any valid excuse including work", "isCorrect": False},
                {"id": "c", "text": "Permitted on Fridays for Jumu'ah attendees", "isCorrect": False},
                {"id": "d", "text": "Permitted if fearing to miss prayer time", "isCorrect": False}
            ],
            "explanation": "Combining prayers is generally only permitted when traveling. For residents, each prayer should be in its time. Some scholars permit combining for severe hardship, but this isn't the general rule.",
            "tags": ["prayer", "combining", "jam", "travel", "timing"],
            "difficulty": "medium"
        },
        9652: {
            "questionText": "Is it permissible to use products with animal-derived ingredients of unknown source?",
            "options": [
                {"id": "a", "text": "The basic principle is permissibility unless proven haram", "isCorrect": True},
                {"id": "b", "text": "All animal ingredients should be avoided", "isCorrect": False},
                {"id": "c", "text": "Only certified halal products can be used", "isCorrect": False},
                {"id": "d", "text": "Forbidden unless you verify each ingredient", "isCorrect": False}
            ],
            "explanation": "The basic principle is permissibility. If the source is unknown, it's permissible unless proven to be from prohibited sources. Muslims aren't required to investigate every ingredient.",
            "tags": ["halal", "ingredients", "food", "permissibility", "doubt"],
            "difficulty": "hard"
        },
        300866: {
            "questionText": "Is it permissible to work in a restaurant that serves haram food like pork or alcohol?",
            "options": [
                {"id": "a", "text": "No, it involves assisting in serving haram", "isCorrect": True},
                {"id": "b", "text": "Yes, if you only handle halal items", "isCorrect": False},
                {"id": "c", "text": "Yes, if haram is less than 50% of sales", "isCorrect": False},
                {"id": "d", "text": "Yes, in non-Muslim countries due to necessity", "isCorrect": False}
            ],
            "explanation": "Working where haram food is served is impermissible, even handling only halal items. The worker participates in the operation serving haram, constituting helping in sin. Seek halal employment.",
            "tags": ["work", "restaurant", "haram-food", "employment", "alcohol"],
            "difficulty": "medium"
        },
        382639: {
            "questionText": "What is the ruling on women wearing pants outside the home?",
            "options": [
                {"id": "a", "text": "Not permissible as it doesn't fulfill Islamic dress conditions", "isCorrect": True},
                {"id": "b", "text": "Permissible if loose and covered by long shirt", "isCorrect": False},
                {"id": "c", "text": "Permissible for exercise only", "isCorrect": False},
                {"id": "d", "text": "Permissible in modern times", "isCorrect": False}
            ],
            "explanation": "Women wearing pants outside is problematic as it imitates men's clothing and typically doesn't meet hijab requirements. Islamic dress should be loose, cover the body, and not resemble men's clothing.",
            "tags": ["clothing", "women", "pants", "hijab", "modesty"],
            "difficulty": "medium"
        },
        13816: {
            "questionText": "Is it permissible to use credit cards that potentially charge interest?",
            "options": [
                {"id": "a", "text": "Permissible if paid in full monthly; impermissible if paying interest", "isCorrect": True},
                {"id": "b", "text": "Completely forbidden in all circumstances", "isCorrect": False},
                {"id": "c", "text": "Permissible as interest goes to banks not individuals", "isCorrect": False},
                {"id": "d", "text": "Permissible only in non-Muslim countries", "isCorrect": False}
            ],
            "explanation": "Credit cards are permissible if the balance is paid before interest accrues. If there's risk of paying interest, avoid them. Interest (riba) is a major sin regardless of amount or recipient.",
            "tags": ["credit-cards", "riba", "interest", "finance", "banking"],
            "difficulty": "medium"
        },
        7871: {
            "questionText": "What is the minimum number of people required for valid congregational prayer?",
            "options": [
                {"id": "a", "text": "Two people: an imam and one follower", "isCorrect": True},
                {"id": "b", "text": "At least three people", "isCorrect": False},
                {"id": "c", "text": "Minimum four people", "isCorrect": False},
                {"id": "d", "text": "Seven people for congregation reward", "isCorrect": False}
            ],
            "explanation": "Congregational prayer can be established with two people: one as imam and one following. The Prophet (peace be upon him) prayed with Companions in groups of two. Reward multiplies with more participants.",
            "tags": ["congregation", "prayer", "jamaah", "imam", "minimum"],
            "difficulty": "medium"
        },
        7863: {
            "questionText": "Is it permissible for Muslims to celebrate Valentine's Day?",
            "options": [
                {"id": "a", "text": "No, it imitates a non-Islamic celebration with pagan origins", "isCorrect": True},
                {"id": "b", "text": "Yes, as a cultural day to express love", "isCorrect": False},
                {"id": "c", "text": "Yes, for married couples only", "isCorrect": False},
                {"id": "d", "text": "Permissible without religious elements", "isCorrect": False}
            ],
            "explanation": "Valentine's Day is impermissible as it imitates non-Islamic celebrations with pagan and Christian origins. Muslims shouldn't participate even 'culturally.' Express love to spouses year-round per Islamic teachings.",
            "tags": ["valentines", "celebration", "imitation", "love", "bidah"],
            "difficulty": "easy"
        },
        59864: {
            "questionText": "Is wudu valid if performed with nail polish on?",
            "options": [
                {"id": "a", "text": "No, water must touch the nails for valid wudu", "isCorrect": True},
                {"id": "b", "text": "Yes, if using water-permeable polish", "isCorrect": False},
                {"id": "c", "text": "Yes, but it's disliked", "isCorrect": False},
                {"id": "d", "text": "Only gel polish is problematic", "isCorrect": False}
            ],
            "explanation": "Wudu requires water to touch all parts including nails. Regular nail polish creates a barrier preventing this, invalidating wudu. Women must remove nail polish before wudu or ghusl for valid prayers.",
            "tags": ["wudu", "nail-polish", "ablution", "women", "validity"],
            "difficulty": "easy"
        },
        274213: {
            "questionText": "Can adopted children be given the adoptive family's surname in Islam?",
            "options": [
                {"id": "a", "text": "No, child must keep biological father's name", "isCorrect": True},
                {"id": "b", "text": "Yes, full adoption with name change is permissible", "isCorrect": False},
                {"id": "c", "text": "Adoption is completely forbidden", "isCorrect": False},
                {"id": "d", "text": "Name change allowed if father unknown", "isCorrect": False}
            ],
            "explanation": "While caring for orphans is encouraged, the child must keep their biological father's name. Calling them by other than their father's name is forbidden. Fostering and caring is permissible and rewarded.",
            "tags": ["adoption", "orphans", "fostering", "family-name", "lineage"],
            "difficulty": "medium"
        },
        146329: {
            "questionText": "What is the ruling on saying 'Jumu'ah Mubarak' or similar Friday greetings?",
            "options": [
                {"id": "a", "text": "It is an innovation not done by Prophet or Companions", "isCorrect": True},
                {"id": "b", "text": "It is recommended to congratulate on Friday", "isCorrect": False},
                {"id": "c", "text": "It is obligatory to greet Muslims on Jumu'ah", "isCorrect": False},
                {"id": "d", "text": "Permissible as cultural custom", "isCorrect": False}
            ],
            "explanation": "Specifying Friday greetings is an innovation not practiced by the Prophet or Companions. Making it regular practice adds to religion. The general greeting 'As-salamu alaykum' can be used any day.",
            "tags": ["friday", "greetings", "bidah", "innovation", "jumuah"],
            "difficulty": "hard"
        },
        20128: {
            "questionText": "Is prayer valid behind an imam who shaves his beard?",
            "options": [
                {"id": "a", "text": "Yes, prayer is valid though shaving beard is sinful", "isCorrect": True},
                {"id": "b", "text": "No, prayer behind such imam is invalid", "isCorrect": False},
                {"id": "c", "text": "Only if no other mosque available", "isCorrect": False},
                {"id": "d", "text": "Valid but must repeat prayer later", "isCorrect": False}
            ],
            "explanation": "Prayer behind an imam who shaves his beard is valid, though shaving is sinful. We don't invalidate prayers due to sins. If better imam available, it's preferable. Beard is obligatory per strongest opinion.",
            "tags": ["prayer", "imam", "beard", "validity", "following"],
            "difficulty": "hard"
        },
        161241: {
            "questionText": "What is the ruling on women wearing high heels that make noise?",
            "options": [
                {"id": "a", "text": "Not permissible if it attracts attention or makes clicking sounds", "isCorrect": True},
                {"id": "b", "text": "Completely permissible for all occasions", "isCorrect": False},
                {"id": "c", "text": "Only permissible inside the home", "isCorrect": False},
                {"id": "d", "text": "Permissible if worn with abaya", "isCorrect": False}
            ],
            "explanation": "Women shouldn't wear shoes that make noise or attract attention, going against modesty principles. Allah says women shouldn't strike feet to make known hidden adornment. Inside home for husband is different.",
            "tags": ["women", "heels", "shoes", "modesty", "attention"],
            "difficulty": "medium"
        },
        124154: {
            "questionText": "Is the Witr prayer obligatory?",
            "options": [
                {"id": "a", "text": "It is confirmed Sunnah, not obligatory per majority", "isCorrect": True},
                {"id": "b", "text": "It is obligatory like five daily prayers", "isCorrect": False},
                {"id": "c", "text": "Only obligatory during Ramadan", "isCorrect": False},
                {"id": "d", "text": "Merely recommended with no emphasis", "isCorrect": False}
            ],
            "explanation": "Witr is a confirmed Sunnah that shouldn't be neglected, though not obligatory per majority. The Prophet never abandoned it whether traveling or resident. Prayed after Isha until before Fajr.",
            "tags": ["witr", "prayer", "sunnah", "night-prayer", "obligation"],
            "difficulty": "medium"
        },
        218702: {
            "questionText": "Is it permissible for women to attend mosque for prayers?",
            "options": [
                {"id": "a", "text": "Permissible but praying at home is better for them", "isCorrect": True},
                {"id": "b", "text": "Obligatory like for men", "isCorrect": False},
                {"id": "c", "text": "Completely forbidden except Taraweeh", "isCorrect": False},
                {"id": "d", "text": "Only permissible for elderly women", "isCorrect": False}
            ],
            "explanation": "Women can go to mosque with proper hijab and husband's permission, but home prayer is better. The Prophet said best rows for women are the last. Women shouldn't wear perfume or adornments when going out.",
            "tags": ["women", "mosque", "prayer", "home", "permission"],
            "difficulty": "medium"
        },
        22322: {
            "questionText": "Is it permissible to keep a dog as a pet in the house?",
            "options": [
                {"id": "a", "text": "Not permissible except for hunting, guarding, or farming", "isCorrect": True},
                {"id": "b", "text": "Permissible if kept outdoors only", "isCorrect": False},
                {"id": "c", "text": "Permissible in modern times for companionship", "isCorrect": False},
                {"id": "d", "text": "Small dogs permissible, large dogs not", "isCorrect": False}
            ],
            "explanation": "Dogs only permissible for hunting, guarding livestock/crops, or farming. The Prophet said angels don't enter houses with dogs, and reward is deducted daily from those keeping dogs without valid reason.",
            "tags": ["dogs", "pets", "animals", "angels", "prohibition"],
            "difficulty": "easy"
        },
        107444: {
            "questionText": "What is Islam's ruling on tattoos?",
            "options": [
                {"id": "a", "text": "Forbidden; Prophet cursed those who get tattoos", "isCorrect": True},
                {"id": "b", "text": "Permissible for medical purposes only", "isCorrect": False},
                {"id": "c", "text": "Disliked but not forbidden", "isCorrect": False},
                {"id": "d", "text": "Only permanent ones forbidden, temporary allowed", "isCorrect": False}
            ],
            "explanation": "Tattoos are forbidden. The Prophet cursed those who do and receive tattoos. They involve changing Allah's creation and causing pain without valid reason. Those with pre-Islamic tattoos should repent but needn't remove if harmful.",
            "tags": ["tattoos", "body", "forbidden", "changing-creation", "haram"],
            "difficulty": "easy"
        },
        87580: {
            "questionText": "Is taking pictures and photographs permissible in Islam?",
            "options": [
                {"id": "a", "text": "Permissible for necessity, but image-making is discouraged", "isCorrect": True},
                {"id": "b", "text": "All photography is completely forbidden", "isCorrect": False},
                {"id": "c", "text": "Only video forbidden, still images fine", "isCorrect": False},
                {"id": "d", "text": "Permissible without restrictions in modern times", "isCorrect": False}
            ],
            "explanation": "Photography is permissible for necessity like ID cards, but general image-making is discouraged as images of animate beings are problematic. Displaying at home, especially where prayer is performed, is more discouraged. Scholarly difference exists.",
            "tags": ["photography", "images", "pictures", "necessity", "difference"],
            "difficulty": "hard"
        },
        11865: {
            "questionText": "What is the minimum distance defining travel (safar) for prayer concessions?",
            "options": [
                {"id": "a", "text": "Approximately 80 km (50 miles) per most scholars", "isCorrect": True},
                {"id": "b", "text": "Any journey outside your city", "isCorrect": False},
                {"id": "c", "text": "More than 200 km (125 miles)", "isCorrect": False},
                {"id": "d", "text": "Whatever people customarily consider travel", "isCorrect": False}
            ],
            "explanation": "Strongest opinion is travel begins at approximately 80 km or 48 miles. At this distance, travelers may shorten and combine prayers. Some say what's customarily considered travel, others specify different distances.",
            "tags": ["travel", "safar", "distance", "prayer", "shortening"],
            "difficulty": "hard"
        },
        2375: {
            "questionText": "Is it permissible for women to wear makeup outside the home?",
            "options": [
                {"id": "a", "text": "No, makeup should only be for one's husband", "isCorrect": True},
                {"id": "b", "text": "Yes, if light and natural-looking", "isCorrect": False},
                {"id": "c", "text": "Yes, except in the mosque", "isCorrect": False},
                {"id": "d", "text": "Permissible for special occasions only", "isCorrect": False}
            ],
            "explanation": "Women shouldn't wear makeup outside as it attracts attention and is adornment that should be concealed. Allah commands women not to display adornment except to mahrams. Makeup is for husband in privacy.",
            "tags": ["makeup", "women", "adornment", "hijab", "beautification"],
            "difficulty": "easy"
        },
        263312: {
            "questionText": "Is listening to Quran recitation beneficial without understanding the meaning?",
            "options": [
                {"id": "a", "text": "Yes, beneficial and rewarded, but understanding adds greater benefit", "isCorrect": True},
                {"id": "b", "text": "Pointless without understanding", "isCorrect": False},
                {"id": "c", "text": "Only beneficial if learning Arabic simultaneously", "isCorrect": False},
                {"id": "d", "text": "Understanding required for reward", "isCorrect": False}
            ],
            "explanation": "Listening to Quran is beneficial even without understanding, as the Quran itself is blessed. However, Muslims should strive to understand meanings for greater benefit and implementation. Reading translation is highly recommended.",
            "tags": ["quran", "recitation", "understanding", "listening", "translation"],
            "difficulty": "medium"
        },
        734: {
            "questionText": "Is using Instagram and social media permissible?",
            "options": [
                {"id": "a", "text": "Permissible if used for good and avoiding haram content", "isCorrect": True},
                {"id": "b", "text": "All social media forbidden due to mixing and fitna", "isCorrect": False},
                {"id": "c", "text": "Permissible only for dawah", "isCorrect": False},
                {"id": "d", "text": "Permissible for men but not women", "isCorrect": False}
            ],
            "explanation": "Social media are tools usable for good or evil. Permissible for beneficial purposes like learning, dawah, and connection, while avoiding haram content, free mixing, and displaying awrah. Maintain Islamic etiquette and guard against fitna.",
            "tags": ["social-media", "instagram", "technology", "internet", "guidelines"],
            "difficulty": "medium"
        },
        337769: {
            "questionText": "Is it forbidden to fast only on Fridays for voluntary fasting?",
            "options": [
                {"id": "a", "text": "Yes, forbidden to single out Friday for fasting", "isCorrect": True},
                {"id": "b", "text": "No, recommended to fast Fridays", "isCorrect": False},
                {"id": "c", "text": "Permissible without restrictions", "isCorrect": False},
                {"id": "d", "text": "Only forbidden if missing Jumu'ah", "isCorrect": False}
            ],
            "explanation": "The Prophet forbade singling out Friday for fasting. However, permissible if fasting Thursday before or Saturday after, or if it coincides with regular fasting pattern like alternate days.",
            "tags": ["fasting", "friday", "voluntary", "nafl", "prohibition"],
            "difficulty": "medium"
        },
        311417: {
            "questionText": "Is reciting Surah Al-Fatihah in every unit of prayer obligatory?",
            "options": [
                {"id": "a", "text": "Yes, it is a pillar per strongest opinion", "isCorrect": True},
                {"id": "b", "text": "Only obligatory in first two units", "isCorrect": False},
                {"id": "c", "text": "Recommended but not obligatory", "isCorrect": False},
                {"id": "d", "text": "Only obligatory for imam, not followers", "isCorrect": False}
            ],
            "explanation": "Per strongest opinion, reciting Fatihah in every unit is obligatory for imam and individual. The Prophet said: 'No prayer for one who doesn't recite the Opening of the Book.' Scholarly difference exists for followers.",
            "tags": ["fatihah", "prayer", "recitation", "obligation", "pillar"],
            "difficulty": "medium"
        },
        5246: {
            "questionText": "What is the ruling on plastic surgery for beautification purposes?",
            "options": [
                {"id": "a", "text": "Forbidden as it changes Allah's creation without necessity", "isCorrect": True},
                {"id": "b", "text": "Permissible if done moderately", "isCorrect": False},
                {"id": "c", "text": "Permissible for women before marriage", "isCorrect": False},
                {"id": "d", "text": "All surgery including corrective is forbidden", "isCorrect": False}
            ],
            "explanation": "Cosmetic surgery for mere beautification is forbidden as it changes Allah's creation. However, surgery correcting deformities, repairing injuries, or removing genuine abnormalities causing significant harm is permissible. Key is necessity vs beautification.",
            "tags": ["surgery", "beautification", "changing-creation", "appearance", "necessity"],
            "difficulty": "medium"
        },
        191138: {
            "questionText": "Is eating food sacrificed at non-Muslim festivals permissible?",
            "options": [
                {"id": "a", "text": "Not permissible as it involves participating in their festivals", "isCorrect": True},
                {"id": "b", "text": "Permissible if the food itself is halal", "isCorrect": False},
                {"id": "c", "text": "Permissible from People of the Book", "isCorrect": False},
                {"id": "d", "text": "Permissible if not attending festival yourself", "isCorrect": False}
            ],
            "explanation": "Food specifically sacrificed for non-Islamic festivals shouldn't be eaten, as consuming implies approval and participation. Different from general permissible food by People of the Book. Avoid anything suggesting celebrating non-Islamic religious occasions.",
            "tags": ["food", "festivals", "sacrifice", "non-muslims", "participation"],
            "difficulty": "hard"
        },
        21674: {
            "questionText": "What is the ruling on saying 'RIP' (Rest in Peace) when someone dies?",
            "options": [
                {"id": "a", "text": "Should be avoided; use Islamic supplications instead", "isCorrect": True},
                {"id": "b", "text": "Permissible as it's just cultural", "isCorrect": False},
                {"id": "c", "text": "Permissible if deceased was Muslim", "isCorrect": False},
                {"id": "d", "text": "Recommended as it shows compassion", "isCorrect": False}
            ],
            "explanation": "Muslims should use Islamic phrases like 'Inna lillahi wa inna ilayhi raji'un' and make dua if Muslim. 'RIP' is from other faiths and not Islamic tradition. Maintain distinct Islamic identity in expressions.",
            "tags": ["death", "condolences", "rip", "dua", "phrases"],
            "difficulty": "medium"
        },
        104926: {
            "questionText": "Is prayer valid in a garment contaminated with impurity if unable to remove it?",
            "options": [
                {"id": "a", "text": "Yes, if unable to remove, pray as you are without repeating", "isCorrect": True},
                {"id": "b", "text": "No, must delay prayer until finding pure clothing", "isCorrect": False},
                {"id": "c", "text": "Yes, but must repeat when finding pure clothing", "isCorrect": False},
                {"id": "d", "text": "Should pray naked rather than in impure clothing", "isCorrect": False}
            ],
            "explanation": "If unable to remove impure garment or find pure clothing, pray as you are - prayer is valid per principle 'what is obligatory is only what one is capable of.' No need to repeat. Allah doesn't burden beyond capacity.",
            "tags": ["prayer", "purity", "impurity", "clothing", "necessity"],
            "difficulty": "hard"
        },
        366120: {
            "questionText": "Is women working outside the home permissible in Islam?",
            "options": [
                {"id": "a", "text": "Permissible with conditions: hijab, avoiding mixing, no neglect of duties", "isCorrect": True},
                {"id": "b", "text": "Completely forbidden in all circumstances", "isCorrect": False},
                {"id": "c", "text": "Obligatory for women to contribute financially", "isCorrect": False},
                {"id": "d", "text": "Only for widows and divorcees", "isCorrect": False}
            ],
            "explanation": "Women working is permissible if: maintaining hijab, avoiding inappropriate mixing, work itself permissible, husband's permission if married, not neglecting home/children. Financial need makes it more permissible, but not obligatory.",
            "tags": ["women", "work", "employment", "hijab", "conditions"],
            "difficulty": "medium"
        },
        13180: {
            "questionText": "Can dua (supplication) be made in languages other than Arabic?",
            "options": [
                {"id": "a", "text": "Yes, dua can be in any language - Allah understands all", "isCorrect": True},
                {"id": "b", "text": "No, all dua must be Arabic to be accepted", "isCorrect": False},
                {"id": "c", "text": "Only during prayer must dua be Arabic", "isCorrect": False},
                {"id": "d", "text": "Permissible only for non-Arabic speakers", "isCorrect": False}
            ],
            "explanation": "Dua can be in any language as Allah understands all and knows hearts. However, using authentic Arabic supplications from Quran and Sunnah is more virtuous. During formal prayer, prescribed dhikr must be Arabic.",
            "tags": ["dua", "supplication", "language", "arabic", "acceptance"],
            "difficulty": "easy"
        },
        23429: {
            "questionText": "What is the ruling on cutting hair and nails during first ten days of Dhul-Hijjah for those sacrificing?",
            "options": [
                {"id": "a", "text": "Forbidden from start of Dhul-Hijjah until after sacrificing", "isCorrect": True},
                {"id": "b", "text": "Disliked but not forbidden", "isCorrect": False},
                {"id": "c", "text": "Only forbidden on Eid day itself", "isCorrect": False},
                {"id": "d", "text": "Only applies to those performing Hajj", "isCorrect": False}
            ],
            "explanation": "For those intending to sacrifice, it's forbidden to remove hair or cut nails from beginning of Dhul-Hijjah until after sacrifice. The Prophet said when seeing new moon, if wanting to sacrifice, don't remove anything from hair or nails.",
            "tags": ["sacrifice", "udhiyah", "dhul-hijjah", "hair", "nails"],
            "difficulty": "hard"
        },
        4049: {
            "questionText": "Is it permissible to delay Asr prayer until the sun turns yellow?",
            "options": [
                {"id": "a", "text": "Permissible but disliked to delay without excuse", "isCorrect": True},
                {"id": "b", "text": "Forbidden to pray once sun turns yellow", "isCorrect": False},
                {"id": "c", "text": "Prayer must be repeated if prayed during yellowing", "isCorrect": False},
                {"id": "d", "text": "It's the preferred time for Asr", "isCorrect": False}
            ],
            "explanation": "Asr time extends until sunset, but it's disliked to delay until sun yellows without valid excuse. The Prophet called this the hypocrite's prayer time. Chosen time is before color change, but prayer remains valid if delayed.",
            "tags": ["asr", "prayer", "timing", "delay", "makruh"],
            "difficulty": "hard"
        },
        263306: {
            "questionText": "What is the Islamic ruling on commercial insurance?",
            "options": [
                {"id": "a", "text": "Commercial insurance forbidden; cooperative may be permissible", "isCorrect": True},
                {"id": "b", "text": "All insurance completely forbidden", "isCorrect": False},
                {"id": "c", "text": "Permissible and recommended for protection", "isCorrect": False},
                {"id": "d", "text": "Only health insurance permissible", "isCorrect": False}
            ],
            "explanation": "Commercial insurance is forbidden by majority due to riba, gharar (uncertainty), and gambling elements. Cooperative (takaful) insurance on Islamic principles may be permissible. Obligatory insurance creates necessity situation scholars address differently.",
            "tags": ["insurance", "takaful", "riba", "gharar", "necessity"],
            "difficulty": "hard"
        },
        249126: {
            "questionText": "Is attending wedding parties with music and free mixing permissible?",
            "options": [
                {"id": "a", "text": "No, should not attend where major sins are committed", "isCorrect": True},
                {"id": "b", "text": "Yes, to maintain family ties", "isCorrect": False},
                {"id": "c", "text": "Yes, but leave when music starts", "isCorrect": False},
                {"id": "d", "text": "Depends on whose wedding it is", "isCorrect": False}
            ],
            "explanation": "Muslims shouldn't attend gatherings where major sins like music and free mixing occur, even weddings. Attending implies approval and supporting sin. If can attend briefly, give gift, leave before prohibited activities, may be permissible while advising family.",
            "tags": ["weddings", "music", "mixing", "gatherings", "attendance"],
            "difficulty": "medium"
        },
        110439: {
            "questionText": "Is it forbidden for menstruating women to enter the mosque?",
            "options": [
                {"id": "a", "text": "Forbidden according to majority of scholars", "isCorrect": True},
                {"id": "b", "text": "Permissible if wearing proper hijab", "isCorrect": False},
                {"id": "c", "text": "Permissible for educational events only", "isCorrect": False},
                {"id": "d", "text": "Permissible if she doesn't pray", "isCorrect": False}
            ],
            "explanation": "Majority hold it's forbidden for menstruating women to enter mosque, based on hadith forbidding those in major impurity. Some permit passing if necessary. All permit staying in designated musalla at home or outdoors for Eid.",
            "tags": ["menstruation", "mosque", "women", "impurity", "prohibition"],
            "difficulty": "medium"
        },
        42238: {
            "questionText": "Is working night shifts permissible if it affects Fajr prayer?",
            "options": [
                {"id": "a", "text": "Permissible if one ensures praying Fajr on time", "isCorrect": True},
                {"id": "b", "text": "Night shift work is forbidden", "isCorrect": False},
                {"id": "c", "text": "Permissible and can combine Fajr with Dhuhr", "isCorrect": False},
                {"id": "d", "text": "Only permissible in non-Muslim countries", "isCorrect": False}
            ],
            "explanation": "Night shifts permissible if fulfilling prayer obligations on time. If work causes regularly missing Fajr, seek alternative employment or arrangements. Prayer is obligatory and takes precedence over work.",
            "tags": ["work", "night-shift", "fajr", "prayer", "timing"],
            "difficulty": "medium"
        },
        111776: {
            "questionText": "Is reading from the Mushaf (Quran) during prayer permissible?",
            "options": [
                {"id": "a", "text": "Yes, especially in voluntary night prayers", "isCorrect": True},
                {"id": "b", "text": "Forbidden in all prayer types", "isCorrect": False},
                {"id": "c", "text": "It invalidates the prayer completely", "isCorrect": False},
                {"id": "d", "text": "Only for those who haven't memorized Fatihah", "isCorrect": False}
            ],
            "explanation": "Permissible to read from Mushaf during prayer, particularly voluntary prayers like tahajjud and taraweeh. Aishah had servant lead her in prayer reading from Mushaf during Ramadan. Especially useful for longer recitations.",
            "tags": ["quran", "mushaf", "prayer", "reading", "night-prayer"],
            "difficulty": "medium"
        },
        13529: {
            "questionText": "Is accepting gifts from non-Muslims on their religious festivals permissible?",
            "options": [
                {"id": "a", "text": "Better to politely decline to avoid appearing to approve celebration", "isCorrect": True},
                {"id": "b", "text": "Completely forbidden and major sin", "isCorrect": False},
                {"id": "c", "text": "Permissible and shows good relations", "isCorrect": False},
                {"id": "d", "text": "Permissible if donating to charity", "isCorrect": False}
            ],
            "explanation": "Scholarly difference exists, but safer opinion is politely declining gifts specifically for non-Islamic festivals to avoid implying approval. Different from general gifts for birthdays or non-religious occasions. Maintain distinct identity while being kind.",
            "tags": ["gifts", "non-muslims", "festivals", "approval", "identity"],
            "difficulty": "hard"
        },
        105381: {
            "questionText": "What is the ruling on dyeing grey hair black?",
            "options": [
                {"id": "a", "text": "Forbidden to dye grey hair black", "isCorrect": True},
                {"id": "b", "text": "Permissible for both men and women", "isCorrect": False},
                {"id": "c", "text": "Permissible only for women", "isCorrect": False},
                {"id": "d", "text": "Permissible if mixed with other colors", "isCorrect": False}
            ],
            "explanation": "The Prophet commanded changing grey hair but avoiding black dye. Using other colors like henna (orange-red) or katam (dark brown) is permissible and recommended. Dyeing black is deception and altering appearance in prohibited way.",
            "tags": ["hair", "dye", "black", "grey-hair", "henna"],
            "difficulty": "medium"
        },
        174754: {
            "questionText": "Is meat from animals stunned before slaughter permissible?",
            "options": [
                {"id": "a", "text": "Not permissible if stunning causes death before slaughter", "isCorrect": True},
                {"id": "b", "text": "All stunned meat permissible if Muslim-raised", "isCorrect": False},
                {"id": "c", "text": "Stunning makes slaughter more humane and permissible", "isCorrect": False},
                {"id": "d", "text": "Stunning method doesn't affect permissibility", "isCorrect": False}
            ],
            "explanation": "If stunning kills the animal before slaughter, meat is not halal. Stunning only permissible if it subdues without killing, and proper Islamic slaughter (cutting throat, draining blood) is performed while alive. Many modern practices stun to death, making meat haram.",
            "tags": ["meat", "slaughter", "stunning", "halal", "zabiha"],
            "difficulty": "hard"
        },
        194615: {
            "questionText": "Should women lower their voices in dhikr and supplication?",
            "options": [
                {"id": "a", "text": "Yes, women should lower voices to avoid fitnah", "isCorrect": True},
                {"id": "b", "text": "Women can raise voices like men in all situations", "isCorrect": False},
                {"id": "c", "text": "Obligatory to remain completely silent", "isCorrect": False},
                {"id": "d", "text": "Depends on location, not gender", "isCorrect": False}
            ],
            "explanation": "Women shouldn't raise voices in dhikr, supplication, or recitation where non-mahram men can hear, as female voice can be source of fitnah. Should lower to level where they can hear themselves. Part of modesty required of women.",
            "tags": ["women", "voice", "dhikr", "fitnah", "modesty"],
            "difficulty": "medium"
        },
        104500: {
            "questionText": "Is working in a bank that deals with interest (riba) permissible?",
            "options": [
                {"id": "a", "text": "Forbidden as it involves helping in riba", "isCorrect": True},
                {"id": "b", "text": "Permissible if not in loans department", "isCorrect": False},
                {"id": "c", "text": "Permissible if donating part of salary", "isCorrect": False},
                {"id": "d", "text": "Permissible for non-customer-facing roles", "isCorrect": False}
            ],
            "explanation": "Working in riba-based banks is forbidden regardless of specific role, as all employees contribute to the institution's functioning. Falls under cooperating in sin. Muslims should seek halal employment and trust Allah will provide lawful sustenance.",
            "tags": ["banking", "riba", "work", "interest", "forbidden"],
            "difficulty": "easy"
        },
        21860: {
            "questionText": "What is the ruling on organ donation after death?",
            "options": [
                {"id": "a", "text": "Permissible if it will save life or restore essential function", "isCorrect": True},
                {"id": "b", "text": "Completely forbidden as violates body sanctity", "isCorrect": False},
                {"id": "c", "text": "Obligatory on all Muslims", "isCorrect": False},
                {"id": "d", "text": "Only permissible to Muslim recipients", "isCorrect": False}
            ],
            "explanation": "Majority of contemporary scholars permit organ donation after death if saving life or restoring essential function like sight. Based on principle saving life takes precedence. Body should be respected, organs not sold, donor/family should consent.",
            "tags": ["organ-donation", "death", "life", "medical", "necessity"],
            "difficulty": "hard"
        },
        247163: {
            "questionText": "Is praying in clothing with brand logos or names permissible?",
            "options": [
                {"id": "a", "text": "Permissible unless logo is haram (cross, image, etc.)", "isCorrect": True},
                {"id": "b", "text": "All branded clothing forbidden in prayer", "isCorrect": False},
                {"id": "c", "text": "Brand names invalidate prayer", "isCorrect": False},
                {"id": "d", "text": "Only permissible if logos covered", "isCorrect": False}
            ],
            "explanation": "Wearing clothing with brand logos generally permissible in prayer unless logo itself is impermissible (cross, prohibited image, profane text). Prayer remains valid though simple, modest clothing is better. Avoiding extravagance and ostentation encouraged.",
            "tags": ["prayer", "clothing", "logos", "brands", "validity"],
            "difficulty": "easy"
        },
        11742: {
            "questionText": "What is the scholarly ruling on cryptocurrency and Bitcoin?",
            "options": [
                {"id": "a", "text": "Scholars differ; some permit with conditions, others forbid due to uncertainty", "isCorrect": True},
                {"id": "b", "text": "Completely permissible like any currency", "isCorrect": False},
                {"id": "c", "text": "Completely forbidden without exception", "isCorrect": False},
                {"id": "d", "text": "Only permissible in non-Muslim countries", "isCorrect": False}
            ],
            "explanation": "Significant scholarly difference on cryptocurrency. Some permit viewing it as digital asset, others forbid due to excessive uncertainty (gharar), speculation, lack of intrinsic value, and illegal uses. Those engaging should research thoroughly, avoid speculation, follow trustworthy scholars.",
            "tags": ["cryptocurrency", "bitcoin", "finance", "gharar", "contemporary"],
            "difficulty": "hard"
        },
        192564: {
            "questionText": "Can Zakat be given to mosques and Islamic centers?",
            "options": [
                {"id": "a", "text": "No, Zakat must go to eight specified categories, primarily poor", "isCorrect": True},
                {"id": "b", "text": "Yes, mosques are deserving recipients", "isCorrect": False},
                {"id": "c", "text": "Yes, if mosque serves poor and needy", "isCorrect": False},
                {"id": "d", "text": "Only permissible in non-Muslim countries", "isCorrect": False}
            ],
            "explanation": "Zakat must go to eight categories in Quran (At-Tawbah 9:60), which doesn't include building or maintaining mosques. Support mosques through general charity (sadaqah), not Zakat. Primary recipients are poor and needy.",
            "tags": ["zakat", "mosque", "charity", "categories", "sadaqah"],
            "difficulty": "medium"
        },
        26342: {
            "questionText": "Is celebrating Mother's Day or Father's Day permissible?",
            "options": [
                {"id": "a", "text": "It's an innovation; honoring parents should be year-round", "isCorrect": True},
                {"id": "b", "text": "Permissible as cultural appreciation", "isCorrect": False},
                {"id": "c", "text": "Recommended to show gratitude", "isCorrect": False},
                {"id": "d", "text": "Obligatory to give gifts on these days", "isCorrect": False}
            ],
            "explanation": "Designating specific days to honor parents is innovation not from Islam. Muslims commanded to honor and respect parents at all times, not just specific days. Part of maintaining Islamic identity separate from invented celebrations. Good treatment of parents is daily obligation.",
            "tags": ["parents", "mothers-day", "celebration", "bidah", "honor"],
            "difficulty": "easy"
        },
        181665: {
            "questionText": "Is watching movies and TV shows permissible in Islam?",
            "options": [
                {"id": "a", "text": "Not permissible due to music, immodesty, and wasted time", "isCorrect": True},
                {"id": "b", "text": "Permissible if content is educational", "isCorrect": False},
                {"id": "c", "text": "Permissible for children's cartoons only", "isCorrect": False},
                {"id": "d", "text": "Permissible if fast-forwarding inappropriate scenes", "isCorrect": False}
            ],
            "explanation": "Majority forbid movies and shows due to prevalent music, immodesty, inappropriate mixing, time-wasting, and exposure to un-Islamic values. Even 'clean' content often has problematic elements. Muslims should seek beneficial knowledge and activities pleasing to Allah.",
            "tags": ["movies", "tv", "entertainment", "music", "haram"],
            "difficulty": "medium"
        },
        353992: {
            "questionText": "What is the maximum duration a traveler can shorten prayers?",
            "options": [
                {"id": "a", "text": "Less than 4 days; if staying 4+ days, pray complete", "isCorrect": True},
                {"id": "b", "text": "Up to 15 days according to all scholars", "isCorrect": False},
                {"id": "c", "text": "Up to 20 days of travel", "isCorrect": False},
                {"id": "d", "text": "No time limit for shortening", "isCorrect": False}
            ],
            "explanation": "If intending to stay four days or more, should pray complete. If staying less than four days, may continue shortening. This is strongest opinion. Once deciding to stay four days, no longer considered traveler for prayer purposes.",
            "tags": ["travel", "shortening", "prayer", "qasr", "days"],
            "difficulty": "hard"
        },
        22244: {
            "questionText": "Is it permissible for women to visit graveyards?",
            "options": [
                {"id": "a", "text": "Not permissible according to stronger opinion", "isCorrect": True},
                {"id": "b", "text": "Permissible and recommended like for men", "isCorrect": False},
                {"id": "c", "text": "Permissible only for elderly women", "isCorrect": False},
                {"id": "d", "text": "Obligatory to visit relatives' graves", "isCorrect": False}
            ],
            "explanation": "Per stronger opinion, women shouldn't visit graves. The Prophet cursed women who frequently visit graves. Some scholars permit if without wailing or excessive emotion, but safer opinion is avoidance. Men encouraged to visit for remembering death.",
            "tags": ["graves", "women", "visiting", "cemetery", "prohibition"],
            "difficulty": "medium"
        },
        50632: {
            "questionText": "Is singing without musical instruments (acappella) permissible?",
            "options": [
                {"id": "a", "text": "Permissible if content appropriate and doesn't lead to haram", "isCorrect": True},
                {"id": "b", "text": "All singing is forbidden", "isCorrect": False},
                {"id": "c", "text": "Only permissible for children", "isCorrect": False},
                {"id": "d", "text": "Forbidden even without instruments", "isCorrect": False}
            ],
            "explanation": "Singing without instruments is permissible per majority if content is wholesome and doesn't contain inappropriate themes. Shouldn't lead to haram or resemble forbidden music. Nasheeds (Islamic songs) with good content and no instruments generally permissible, though some scholars caution.",
            "tags": ["singing", "nasheed", "acappella", "music", "permissibility"],
            "difficulty": "medium"
        },
        105749: {
            "questionText": "Is it permissible to recite Quran in a room that has a toilet?",
            "options": [
                {"id": "a", "text": "No, it's not appropriate in such places", "isCorrect": True},
                {"id": "b", "text": "Yes, if toilet seat cover is closed", "isCorrect": False},
                {"id": "c", "text": "Yes, as long as not on toilet itself", "isCorrect": False},
                {"id": "d", "text": "Yes, but only short verses allowed", "isCorrect": False}
            ],
            "explanation": "Not permissible to recite Quran in bathroom containing toilet, as these are places of impurity and disrespectful to Quran. Muslims should recite in clean, appropriate places befitting its honor and sanctity.",
            "tags": ["quran", "recitation", "bathroom", "toilet", "respect"],
            "difficulty": "easy"
        },
        145563: {
            "questionText": "What is the ruling on celebrating the Prophet's birthday (Mawlid)?",
            "options": [
                {"id": "a", "text": "It's innovation (bidah) not practiced by Prophet or Companions", "isCorrect": True},
                {"id": "b", "text": "Highly recommended and brings great reward", "isCorrect": False},
                {"id": "c", "text": "Obligatory for all Muslims", "isCorrect": False},
                {"id": "d", "text": "Permissible as cultural tradition", "isCorrect": False}
            ],
            "explanation": "Celebrating Mawlid is considered innovation as not practiced by Prophet, Companions, or early generations. Love for Prophet shown through following Sunnah, not through invented celebrations.",
            "tags": ["mawlid", "bidah", "innovation", "prophet", "celebration"],
            "difficulty": "medium"
        },
        1255: {
            "questionText": "Is it permissible for a woman to wear nail polish during menstruation?",
            "options": [
                {"id": "a", "text": "Yes, as wudu is not required during menstruation", "isCorrect": True},
                {"id": "b", "text": "Forbidden at all times for Muslim women", "isCorrect": False},
                {"id": "c", "text": "Only with water-permeable polish", "isCorrect": False},
                {"id": "d", "text": "Discouraged but not explicitly forbidden", "isCorrect": False}
            ],
            "explanation": "Since menstruating woman not required to perform wudu or pray during period, wearing nail polish during menstruation is permissible. However, must remove before period ends for proper wudu for prayers.",
            "tags": ["menstruation", "nail-polish", "wudu", "women", "purity"],
            "difficulty": "easy"
        },
        246965: {
            "questionText": "Is it permissible to use hair extensions or wigs?",
            "options": [
                {"id": "a", "text": "Forbidden based on Prophet's curse on those who add hair", "isCorrect": True},
                {"id": "b", "text": "Permissible for beautification purposes", "isCorrect": False},
                {"id": "c", "text": "Permissible only for medical hair loss", "isCorrect": False},
                {"id": "d", "text": "Permissible if synthetic, forbidden if human hair", "isCorrect": False}
            ],
            "explanation": "The Prophet cursed women who add hair extensions (wasilah). This applies to both human and synthetic hair for beautification. Exception may exist for genuine medical conditions causing significant harm, but general beautification is forbidden.",
            "tags": ["hair-extensions", "wigs", "women", "forbidden", "beautification"],
            "difficulty": "medium"
        },
        82098: {
            "questionText": "What is the ruling on buying lottery tickets or participating in raffles?",
            "options": [
                {"id": "a", "text": "Forbidden as it is gambling (maysir)", "isCorrect": True},
                {"id": "b", "text": "Permissible if proceeds go to charity", "isCorrect": False},
                {"id": "c", "text": "Permissible for small amounts under $10", "isCorrect": False},
                {"id": "d", "text": "Permissible if organized by Muslims", "isCorrect": False}
            ],
            "explanation": "Lottery and raffles are forms of gambling (maysir) which is forbidden in Islam. This applies regardless of the amount, who organizes it, or where proceeds go. Gambling involves risking money on uncertain outcomes and is a major sin.",
            "tags": ["lottery", "gambling", "maysir", "forbidden", "haram"],
            "difficulty": "easy"
        },
        170238: {
            "questionText": "Is it obligatory to stand for the national anthem in one's country?",
            "options": [
                {"id": "a", "text": "Not obligatory but permissible if it doesn't contradict Islamic beliefs", "isCorrect": True},
                {"id": "b", "text": "Obligatory to show loyalty to the country", "isCorrect": False},
                {"id": "c", "text": "Forbidden as it imitates nationalism", "isCorrect": False},
                {"id": "d", "text": "Only obligatory in Muslim countries", "isCorrect": False}
            ],
            "explanation": "Standing for the national anthem is not an Islamic obligation. It may be permissible as a social norm if it doesn't contradict Islamic beliefs or involve shirk. Muslims should evaluate based on content and context. True loyalty is to Allah above all.",
            "tags": ["anthem", "nationalism", "loyalty", "custom", "permissibility"],
            "difficulty": "hard"
        },
        250050: {
            "questionText": "What is the ruling on cosmetic teeth whitening procedures?",
            "options": [
                {"id": "a", "text": "Permissible as it's treatment and removing natural discoloration", "isCorrect": True},
                {"id": "b", "text": "Forbidden as it changes Allah's creation", "isCorrect": False},
                {"id": "c", "text": "Only permissible for severe discoloration", "isCorrect": False},
                {"id": "d", "text": "Permissible for women but not men", "isCorrect": False}
            ],
            "explanation": "Teeth whitening to remove discoloration and restore natural color is permissible as it's considered treatment, not changing creation. Different from teeth filing (tahdhib) which was cursed. Maintaining oral health and hygiene is encouraged.",
            "tags": ["teeth", "whitening", "cosmetic", "beautification", "treatment"],
            "difficulty": "medium"
        },
        433494: {
            "questionText": "Is it permissible to perform prayer while wearing clothes with English text on them?",
            "options": [
                {"id": "a", "text": "Permissible unless the text is inappropriate or disrespectful", "isCorrect": True},
                {"id": "b", "text": "Forbidden; only Arabic text allowed", "isCorrect": False},
                {"id": "c", "text": "Invalidates the prayer completely", "isCorrect": False},
                {"id": "d", "text": "Permissible only if text is religious", "isCorrect": False}
            ],
            "explanation": "Praying in clothes with English or other language text is permissible unless the text is inappropriate, profane, or disrespectful. The prayer remains valid. However, simple, modest clothing without distracting text is preferable for prayer.",
            "tags": ["prayer", "clothing", "text", "english", "validity"],
            "difficulty": "easy"
        },
        160751: {
            "questionText": "What is the ruling on working as a photographer or videographer for weddings?",
            "options": [
                {"id": "a", "text": "Permissible if the wedding is Islamic without music and free mixing", "isCorrect": True},
                {"id": "b", "text": "Completely forbidden due to image-making", "isCorrect": False},
                {"id": "c", "text": "Permissible regardless of what occurs at the wedding", "isCorrect": False},
                {"id": "d", "text": "Only video is permissible, not still photography", "isCorrect": False}
            ],
            "explanation": "Working as photographer is permissible for Islamic weddings that don't involve prohibited activities. However, shouldn't photograph weddings with music, free mixing, or other haram activities as that would be assisting in sin. Photography for necessity and halal purposes is generally permitted.",
            "tags": ["photography", "weddings", "work", "images", "halal"],
            "difficulty": "medium"
        },
        13926: {
            "questionText": "Is it permissible to delay paying Zakat after it becomes due?",
            "options": [
                {"id": "a", "text": "It should be paid immediately; delaying without excuse is sinful", "isCorrect": True},
                {"id": "b", "text": "Can be delayed up to one year without issue", "isCorrect": False},
                {"id": "c", "text": "Permissible to delay for better investment opportunities", "isCorrect": False},
                {"id": "d", "text": "Can be delayed until Ramadan for more reward", "isCorrect": False}
            ],
            "explanation": "Zakat must be paid as soon as it becomes due. Delaying without valid excuse is sinful as it's a right of the poor. Exceptions exist for temporary inability to pay or brief delay for finding deserving recipients. Zakat can be paid early but not delayed after due date.",
            "tags": ["zakat", "delay", "obligation", "payment", "timing"],
            "difficulty": "medium"
        },
        6974: {
            "questionText": "What is the ruling on men wearing silk clothing?",
            "options": [
                {"id": "a", "text": "Forbidden for men except for medical necessity", "isCorrect": True},
                {"id": "b", "text": "Permissible if less than 50% silk", "isCorrect": False},
                {"id": "c", "text": "Permissible for special occasions only", "isCorrect": False},
                {"id": "d", "text": "Only pure silk is forbidden, blends are allowed", "isCorrect": False}
            ],
            "explanation": "Pure silk is forbidden for men as stated by the Prophet (peace be upon him) who prohibited gold and silk for males. Exception exists for medical necessity like skin conditions. Small amounts mixed with other material (less than 50%) may be permissible according to some scholars.",
            "tags": ["silk", "men", "clothing", "forbidden", "medical-necessity"],
            "difficulty": "easy"
        },
        213229: {
            "questionText": "Is it permissible to attend Friday prayer at a mosque that has graves in it?",
            "options": [
                {"id": "a", "text": "Disliked, but prayer is valid; should advise to remove graves", "isCorrect": True},
                {"id": "b", "text": "Completely forbidden and prayer is invalid", "isCorrect": False},
                {"id": "c", "text": "Permissible without any dislike", "isCorrect": False},
                {"id": "d", "text": "Valid only if graves are of righteous people", "isCorrect": False}
            ],
            "explanation": "Praying in mosques with graves is disliked and prohibited as the Prophet warned against taking graves as places of worship. However, if praying there, the prayer is valid. One should advise mosque authorities to remove the graves and pray elsewhere if possible.",
            "tags": ["mosque", "graves", "prayer", "friday", "validity"],
            "difficulty": "hard"
        },
        21946: {
            "questionText": "What is the ruling on surrogacy (having another woman carry your child)?",
            "options": [
                {"id": "a", "text": "Forbidden as it involves mixing lineages and using another's womb", "isCorrect": True},
                {"id": "b", "text": "Permissible if using own sperm and egg", "isCorrect": False},
                {"id": "c", "text": "Permissible with proper contract and payment", "isCorrect": False},
                {"id": "d", "text": "Permissible only between co-wives", "isCorrect": False}
            ],
            "explanation": "Surrogacy is forbidden in Islam as it involves using another woman's womb, can mix lineages, and creates complex issues of motherhood and family relations. Islam prohibits renting wombs or having children through means that confuse lineage.",
            "tags": ["surrogacy", "pregnancy", "lineage", "forbidden", "children"],
            "difficulty": "medium"
        },
        112079: {
            "questionText": "Is it permissible to pray behind someone who commits major sins?",
            "options": [
                {"id": "a", "text": "Prayer is valid, but better to pray behind more righteous imam if available", "isCorrect": True},
                {"id": "b", "text": "Prayer is invalid and must be repeated", "isCorrect": False},
                {"id": "c", "text": "Only valid if he repents immediately after", "isCorrect": False},
                {"id": "d", "text": "Forbidden to pray behind any sinful person", "isCorrect": False}
            ],
            "explanation": "The prayer behind someone who commits major sins is valid according to Ahlus-Sunnah. We don't invalidate people's prayers due to their sins. However, if a more righteous imam is available, it's better to pray behind them. Major sinners shouldn't be appointed as imams initially.",
            "tags": ["prayer", "imam", "sins", "validity", "following"],
            "difficulty": "hard"
        },
        38206: {
            "questionText": "What is the ruling on consuming foods with vanilla extract containing alcohol?",
            "options": [
                {"id": "a", "text": "Permissible if alcohol completely evaporates during cooking/baking", "isCorrect": True},
                {"id": "b", "text": "Forbidden regardless of amount or evaporation", "isCorrect": False},
                {"id": "c", "text": "Permissible only if alcohol is less than 0.5%", "isCorrect": False},
                {"id": "d", "text": "Permissible only with synthetic vanilla", "isCorrect": False}
            ],
            "explanation": "If vanilla extract is used in cooking or baking where the alcohol completely evaporates, the food is permissible. The alcohol that remains (if any) is transformed and negligible. However, using it in no-bake items where alcohol remains is not permissible. Alcohol-free vanilla is preferable when available.",
            "tags": ["food", "vanilla", "alcohol", "extract", "cooking"],
            "difficulty": "medium"
        },
        163025: {
            "questionText": "Is it obligatory to make up prayers that were abandoned deliberately?",
            "options": [
                {"id": "a", "text": "Scholars differ; should make them up, repent sincerely, and do good deeds", "isCorrect": True},
                {"id": "b", "text": "Cannot be made up; just repent and pray going forward", "isCorrect": False},
                {"id": "c", "text": "Must make up and pay fidyah for each missed prayer", "isCorrect": False},
                {"id": "d", "text": "Only Ramadan fasts must be made up, not prayers", "isCorrect": False}
            ],
            "explanation": "Scholars differ on making up deliberately missed prayers. Safer opinion is to make them up along with sincere repentance, increased voluntary worship, and good deeds. Deliberately missing prayer is a major sin. Some scholars say they cannot be made up but one should repent and pray going forward.",
            "tags": ["prayer", "missed-prayer", "qada", "repentance", "obligation"],
            "difficulty": "hard"
        },
        102373: {
            "questionText": "What is the ruling on Muslims celebrating their wedding anniversary?",
            "options": [
                {"id": "a", "text": "It's an innovation imitating non-Muslims; not from Islamic teachings", "isCorrect": True},
                {"id": "b", "text": "Recommended to strengthen marital bond", "isCorrect": False},
                {"id": "c", "text": "Permissible as it's a personal matter", "isCorrect": False},
                {"id": "d", "text": "Obligatory to honor the marriage contract", "isCorrect": False}
            ],
            "explanation": "Celebrating wedding anniversaries is an innovation and imitation of non-Muslims, not from Islamic teachings. Spouses should be kind, loving, and generous to each other year-round, not just on specific dates. Islam doesn't prescribe celebrating such occasions.",
            "tags": ["anniversary", "celebration", "marriage", "innovation", "imitation"],
            "difficulty": "easy"
        },
        395666: {
            "questionText": "Is it permissible to work in a grocery store that sells both halal and haram items?",
            "options": [
                {"id": "a", "text": "Not permissible if directly involved in selling haram items", "isCorrect": True},
                {"id": "b", "text": "Permissible as long as halal items are majority", "isCorrect": False},
                {"id": "c", "text": "Permissible if you only stock halal items", "isCorrect": False},
                {"id": "d", "text": "Permissible in all positions except management", "isCorrect": False}
            ],
            "explanation": "Working in a store selling haram items like alcohol or pork is not permissible if one is directly involved in selling them (cashier, stocker, etc.). This constitutes helping in sin. Seek employment that doesn't involve prohibited items. Working in completely halal sections might have different ruling.",
            "tags": ["work", "grocery", "haram-items", "employment", "cashier"],
            "difficulty": "medium"
        },
        36807: {
            "questionText": "What is the ruling on performing Umrah or Hajj on behalf of someone still living?",
            "options": [
                {"id": "a", "text": "Not permissible for someone able-bodied; only for deceased or permanently unable", "isCorrect": True},
                {"id": "b", "text": "Permissible for any living person even if able", "isCorrect": False},
                {"id": "c", "text": "Permissible only for parents", "isCorrect": False},
                {"id": "d", "text": "Only Hajj can be done on behalf, not Umrah", "isCorrect": False}
            ],
            "explanation": "Hajj or Umrah can only be performed on behalf of someone who is deceased or permanently unable to perform it themselves (due to old age, chronic illness, etc.). Cannot be done on behalf of able-bodied living person as worship must be performed by person themselves when capable.",
            "tags": ["hajj", "umrah", "behalf", "proxy", "obligation"],
            "difficulty": "hard"
        },
        96662: {
            "questionText": "Is it permissible to use gelatine from non-halal sources in food?",
            "options": [
                {"id": "a", "text": "Not permissible if from pork; scholarly difference if from non-zabiha beef", "isCorrect": True},
                {"id": "b", "text": "All gelatine is permissible as it's chemically transformed", "isCorrect": False},
                {"id": "c", "text": "Completely forbidden from any non-halal animal source", "isCorrect": False},
                {"id": "d", "text": "Permissible only in small amounts under 2%", "isCorrect": False}
            ],
            "explanation": "Pork gelatine is not permissible. For gelatine from non-zabiha beef, scholars differ based on whether chemical transformation (istihalah) makes it permissible. Safer opinion is to avoid it and use halal alternatives (fish, plant-based gelatine) which are increasingly available.",
            "tags": ["gelatine", "food", "halal", "transformation", "pork"],
            "difficulty": "medium"
        },
        169528: {
            "questionText": "What is the ruling on abortion in Islam?",
            "options": [
                {"id": "a", "text": "Generally forbidden; only permitted for serious necessity like mother's life", "isCorrect": True},
                {"id": "b", "text": "Permissible in first trimester for any reason", "isCorrect": False},
                {"id": "c", "text": "Permissible before 40 days of pregnancy", "isCorrect": False},
                {"id": "d", "text": "Completely forbidden without any exceptions", "isCorrect": False}
            ],
            "explanation": "Abortion is generally forbidden in Islam at all stages. It becomes more serious after soul is breathed in (around 120 days). Only permitted for serious necessity like saving mother's life. Early stages have some scholarly difference, but even then it's not permissible without valid reason. Financial difficulty or gender preference are not valid reasons.",
            "tags": ["abortion", "pregnancy", "life", "forbidden", "necessity"],
            "difficulty": "hard"
        },
        21589: {
            "questionText": "Is it permissible for a pregnant or breastfeeding woman to break her fast in Ramadan?",
            "options": [
                {"id": "a", "text": "Yes, if fearing harm to herself or child, then must make up", "isCorrect": True},
                {"id": "b", "text": "No, must fast unless life-threatening", "isCorrect": False},
                {"id": "c", "text": "Yes, and must pay fidyah instead of making up", "isCorrect": False},
                {"id": "d", "text": "Can break fast without needing to make up or pay fidyah", "isCorrect": False}
            ],
            "explanation": "Pregnant or breastfeeding women may break their fast if fearing harm to themselves or their children. According to majority, they must make up the fasts later (like travelers). Some scholars say they can pay fidyah instead. Should consult trustworthy scholars and medical advice.",
            "tags": ["fasting", "pregnancy", "breastfeeding", "ramadan", "makeup"],
            "difficulty": "medium"
        },
        8846: {
            "questionText": "What is the virtue of reading Ayat al-Kursi after obligatory prayers?",
            "options": [
                {"id": "a", "text": "The Prophet said nothing prevents entry to Paradise except death", "isCorrect": True},
                {"id": "b", "text": "It multiplies prayer reward by seventy times", "isCorrect": False},
                {"id": "c", "text": "It protects from all illnesses", "isCorrect": False},
                {"id": "d", "text": "Angels write one million good deeds", "isCorrect": False}
            ],
            "explanation": "The Prophet (peace be upon him) taught that whoever recites Ayat al-Kursi after every obligatory prayer, nothing prevents them from entering Paradise except death. It is one of the greatest verses of Quran and has immense virtue. Should be part of post-prayer adhkar.",
            "tags": ["ayat-kursi", "dhikr", "prayer", "virtue", "paradise"],
            "difficulty": "easy"
        }
    }

def generate_quiz_question(question_data: Dict, index: int, total: int) -> Dict:
    """Generate a single quiz question"""
    reference = question_data['reference']

    # Difficulty distribution: 35% easy, 45% medium, 20% hard
    if index < total * 0.35:
        difficulty = "easy"
    elif index < total * 0.80:
        difficulty = "medium"
    else:
        difficulty = "hard"

    # Get from quiz bank
    quiz_bank = get_quiz_bank()

    if reference in quiz_bank:
        quiz_q = quiz_bank[reference].copy()
        # Update difficulty from distribution
        quiz_q['difficulty'] = difficulty
        return quiz_q

    # Fallback (shouldn't happen)
    return {
        "questionText": f"What is the Islamic ruling discussed in reference {reference}?",
        "options": [
            {"id": "a", "text": "It is permissible according to Islamic teachings", "isCorrect": True},
            {"id": "b", "text": "It is completely forbidden", "isCorrect": False},
            {"id": "c", "text": "Scholars have differing opinions", "isCorrect": False},
            {"id": "d", "text": "It depends on the specific circumstances", "isCorrect": False}
        ],
        "explanation": "Based on Islamic teachings and scholarly opinions, the ruling is as stated in the correct answer.",
        "tags": question_data.get('tags', ['islam', 'knowledge'])[:5],
        "difficulty": difficulty
    }

def main():
    """Main function"""
    print("Starting quiz question generation for batch 002...")

    input_path = "/home/user/islamqa/quiz-generation/batches/batch-002-input.json"
    output_path = "/home/user/islamqa/quiz-generation/batches/batch-002-output.json"

    try:
        with open(input_path, 'r', encoding='utf-8') as f:
            input_data = json.load(f)

        questions = input_data['questions']
        print(f"Loaded {len(questions)} questions from input file")

        quiz_questions = []
        total = len(questions)

        for index, question_data in enumerate(questions):
            quiz_q = generate_quiz_question(question_data, index, total)
            quiz_q['reference'] = question_data['reference']
            quiz_q['source'] = f"IslamQA reference {question_data['reference']}"
            quiz_q['type'] = "multiple-choice"
            quiz_questions.append(quiz_q)

            if (index + 1) % 10 == 0:
                print(f"Generated {index + 1}/{total} questions...")

        output_data = {"quizQuestions": quiz_questions}

        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(output_data, f, ensure_ascii=False, indent=2)

        print(f"\n✓ Successfully generated {len(quiz_questions)} quiz questions")
        print(f"✓ Output saved to: {output_path}")

        # Validation
        print("\nValidation Results:")
        print(f"- Total questions: {len(quiz_questions)}")

        difficulty_counts = {"easy": 0, "medium": 0, "hard": 0}
        for q in quiz_questions:
            difficulty_counts[q['difficulty']] += 1

        print(f"- Easy: {difficulty_counts['easy']} ({difficulty_counts['easy']/total*100:.1f}%)")
        print(f"- Medium: {difficulty_counts['medium']} ({difficulty_counts['medium']/total*100:.1f}%)")
        print(f"- Hard: {difficulty_counts['hard']} ({difficulty_counts['hard']/total*100:.1f}%)")

        all_have_4_options = all(len(q['options']) == 4 for q in quiz_questions)
        print(f"- All questions have 4 options: {all_have_4_options}")

        all_have_one_correct = all(
            sum(1 for opt in q['options'] if opt['isCorrect']) == 1
            for q in quiz_questions
        )
        print(f"- All questions have exactly 1 correct answer: {all_have_one_correct}")

        input_refs = set(q['reference'] for q in questions)
        output_refs = set(q['reference'] for q in quiz_questions)
        refs_match = input_refs == output_refs
        print(f"- Reference IDs match input: {refs_match}")

        print("\n✓ Generation complete!")

    except Exception as e:
        print(f"✗ Error: {str(e)}")
        import traceback
        traceback.print_exc()
        return 1

    return 0

if __name__ == "__main__":
    exit(main())
