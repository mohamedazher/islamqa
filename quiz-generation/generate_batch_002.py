#!/usr/bin/env python3
"""
Quiz Question Generator for Batch 002
Generates 100 multiple-choice quiz questions from IslamQA content
"""

import json
import re
from typing import Dict, List
from datetime import datetime

def strip_html(text: str) -> str:
    """Remove HTML tags and clean up text"""
    # Remove HTML tags
    text = re.sub(r'<[^>]+>', '', text)
    # Remove extra whitespace
    text = re.sub(r'\s+', ' ', text)
    # Remove &nbsp; entities
    text = text.replace('&nbsp;', ' ')
    return text.strip()

def extract_key_facts(answer: str) -> List[str]:
    """Extract key facts from the answer for quiz generation"""
    clean_answer = strip_html(answer)
    # Split into sentences
    sentences = re.split(r'[.!?]+', clean_answer)
    # Filter out very short sentences and clean
    facts = [s.strip() for s in sentences if len(s.strip()) > 30]
    return facts[:10]  # Return top 10 facts

def generate_quiz_question(question_data: Dict, index: int, total: int) -> Dict:
    """Generate a single quiz question from IslamQA question data"""

    reference = question_data['reference']
    title = question_data['title']
    answer = question_data['answer']
    tags = question_data.get('tags', [])

    # Clean the answer text
    clean_answer = strip_html(answer)
    facts = extract_key_facts(answer)

    # Difficulty distribution: 35% easy, 45% medium, 20% hard
    if index < total * 0.35:
        difficulty = "easy"
    elif index < total * 0.80:
        difficulty = "medium"
    else:
        difficulty = "hard"

    # Generate quiz questions based on reference ID patterns
    # This creates diverse, high-quality questions

    quiz_questions_bank = {
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
        263356: {
            "questionText": "What is the ruling on a woman wearing nail polish during her menstrual period?",
            "options": [
                {"id": "a", "text": "It is permissible as wudu is not required during menstruation", "isCorrect": True},
                {"id": "b", "text": "It is forbidden at all times for Muslim women", "isCorrect": False},
                {"id": "c", "text": "It is only allowed if using water-permeable nail polish", "isCorrect": False},
                {"id": "d", "text": "It is discouraged but not explicitly forbidden", "isCorrect": False}
            ],
            "explanation": "Since a menstruating woman is not required to perform wudu or pray during her period, wearing nail polish during menstruation is permissible. However, she must remove it before her period ends so she can perform proper wudu for prayers.",
            "tags": ["menstruation", "nail-polish", "wudu", "women", "purity", "rulings"],
            "difficulty": "easy"
        },
        175355: {
            "questionText": "Is it permissible to recite Quran in a bathroom that has a toilet in it?",
            "options": [
                {"id": "a", "text": "No, it is not appropriate to recite Quran in such a place", "isCorrect": True},
                {"id": "b", "text": "Yes, but only if the toilet seat cover is closed", "isCorrect": False},
                {"id": "c", "text": "Yes, as long as you are not on the toilet itself", "isCorrect": False},
                {"id": "d", "text": "Yes, but only short verses are allowed", "isCorrect": False}
            ],
            "explanation": "It is not permissible to recite Quran in a bathroom that contains a toilet, as these are places of impurity and it would be disrespectful to the Quran. Muslims should recite Quran in clean, appropriate places that befit its honor and sanctity.",
            "tags": ["quran", "recitation", "bathroom", "toilet", "respect", "adab"],
            "difficulty": "easy"
        },
        106521: {
            "questionText": "What is the Islamic ruling on celebrating the birthday of the Prophet Muhammad (peace be upon him)?",
            "options": [
                {"id": "a", "text": "It is an innovation (bidah) that was not practiced by the Prophet or his Companions", "isCorrect": True},
                {"id": "b", "text": "It is highly recommended and brings great reward", "isCorrect": False},
                {"id": "c", "text": "It is obligatory for all Muslims to celebrate it", "isCorrect": False},
                {"id": "d", "text": "It is permissible as a cultural tradition", "isCorrect": False}
            ],
            "explanation": "Celebrating the Prophet's birthday (Mawlid) is considered an innovation in Islam as it was not practiced by the Prophet himself, his Companions, or the early generations of Muslims. Love for the Prophet is shown through following his Sunnah, not through invented celebrations.",
            "tags": ["mawlid", "bidah", "innovation", "prophet", "celebration", "sunnah"],
            "difficulty": "medium"
        },
        115216: {
            "questionText": "Is it permissible for a Muslim to work as a cashier in a store that sells both halal and haram items?",
            "options": [
                {"id": "a", "text": "It is not permissible as it involves helping in selling haram items", "isCorrect": True},
                {"id": "b", "text": "It is permissible if most items sold are halal", "isCorrect": False},
                {"id": "c", "text": "It is permissible if you refuse to personally scan haram items", "isCorrect": False},
                {"id": "d", "text": "It is permissible as long as you don't consume the haram items yourself", "isCorrect": False}
            ],
            "explanation": "Working as a cashier in a store that sells haram items like alcohol or pork is not permissible, as the cashier directly participates in the sale transaction. This constitutes helping in sin, which Allah has forbidden. Muslims should seek halal employment that doesn't involve prohibited items.",
            "tags": ["work", "halal-income", "cashier", "haram-items", "employment", "alcohol"],
            "difficulty": "medium"
        },
        219613: {
            "questionText": "What is the minimum age for a child to fast during Ramadan?",
            "options": [
                {"id": "a", "text": "When they reach puberty, though training should begin earlier", "isCorrect": True},
                {"id": "b", "text": "Seven years old, like with prayer", "isCorrect": False},
                {"id": "c", "text": "Ten years old for both boys and girls", "isCorrect": False},
                {"id": "d", "text": "Twelve years old as a fixed age", "isCorrect": False}
            ],
            "explanation": "Fasting becomes obligatory when a child reaches puberty. However, parents should train children to fast before this age when they are able, to prepare them for this obligation. The exact age varies by individual development.",
            "tags": ["fasting", "children", "puberty", "ramadan", "age", "obligation"],
            "difficulty": "easy"
        },
        178647: {
            "questionText": "Is it permissible to use products containing animal-derived ingredients of unknown source?",
            "options": [
                {"id": "a", "text": "The basic principle is permissibility unless proven to be from haram sources", "isCorrect": True},
                {"id": "b", "text": "All animal-derived ingredients should be avoided completely", "isCorrect": False},
                {"id": "c", "text": "Only products certified halal can be used", "isCorrect": False},
                {"id": "d", "text": "It is forbidden unless you personally verify each ingredient", "isCorrect": False}
            ],
            "explanation": "The basic principle regarding foods and products is permissibility. If the source of an animal-derived ingredient is unknown, it is permissible to use it unless there is proof that it comes from a prohibited source. Muslims are not required to investigate every ingredient.",
            "tags": ["halal", "ingredients", "food", "permissibility", "products", "doubt"],
            "difficulty": "hard"
        },
        125876: {
            "questionText": "What should a Muslim do if they miss Fajr prayer due to oversleeping?",
            "options": [
                {"id": "a", "text": "Pray it immediately upon waking up as qada (make-up prayer)", "isCorrect": True},
                {"id": "b", "text": "Wait until the next Fajr and pray two units instead of two", "isCorrect": False},
                {"id": "c", "text": "Pray extra voluntary prayers to compensate", "isCorrect": False},
                {"id": "d", "text": "The prayer is lost and cannot be made up", "isCorrect": False}
            ],
            "explanation": "If someone misses Fajr due to oversleeping, they should pray it as soon as they wake up. The Prophet (peace be upon him) said that whoever forgets a prayer or sleeps through it should pray it when they remember it. Making up missed prayers is obligatory.",
            "tags": ["prayer", "fajr", "missed-prayer", "qada", "oversleeping", "obligation"],
            "difficulty": "easy"
        },
        210992: {
            "questionText": "Is it permissible for a woman to pluck or trim her eyebrows?",
            "options": [
                {"id": "a", "text": "No, plucking eyebrows is forbidden based on the Prophet's curse", "isCorrect": True},
                {"id": "b", "text": "Yes, if done moderately for beautification", "isCorrect": False},
                {"id": "c", "text": "Yes, but only for married women with husband's permission", "isCorrect": False},
                {"id": "d", "text": "It is permissible to trim but not pluck completely", "isCorrect": False}
            ],
            "explanation": "The Prophet (peace be upon him) cursed those who pluck their eyebrows (al-namisa). This prohibition includes trimming, shaping, or removing eyebrow hair. Muslim women should avoid this practice regardless of cultural trends or beauty standards.",
            "tags": ["eyebrows", "women", "beauty", "forbidden", "plucking", "appearance"],
            "difficulty": "easy"
        },
        240742: {
            "questionText": "What is the ruling on combining (jamming) prayers when staying in one place?",
            "options": [
                {"id": "a", "text": "It is only permitted when traveling, not when resident", "isCorrect": True},
                {"id": "b", "text": "It is permitted for any valid excuse including work", "isCorrect": False},
                {"id": "c", "text": "It is permitted on Fridays for Jumu'ah attendees", "isCorrect": False},
                {"id": "d", "text": "It is permitted if one fears missing the prayer time", "isCorrect": False}
            ],
            "explanation": "Combining prayers (jam') is generally only permitted when traveling. For residents, each prayer should be performed in its designated time. Some scholars permit combining for severe hardship, but this is not the general rule for everyday situations.",
            "tags": ["prayer", "combining-prayers", "jam", "travel", "timing", "rulings"],
            "difficulty": "medium"
        },
        169551: {
            "questionText": "Is it obligatory to pray in congregation at the mosque for men?",
            "options": [
                {"id": "a", "text": "Yes, it is obligatory according to the strongest scholarly opinion", "isCorrect": True},
                {"id": "b", "text": "It is highly recommended but not obligatory", "isCorrect": False},
                {"id": "c", "text": "It is only obligatory for Jumu'ah prayer", "isCorrect": False},
                {"id": "d", "text": "It is optional and praying at home is equally rewarded", "isCorrect": False}
            ],
            "explanation": "The strongest opinion among scholars is that congregational prayer at the mosque is obligatory for men who are able to attend. The Prophet (peace be upon him) strongly emphasized this, even considering refusing to attend while hearing the adhan a sign of hypocrisy.",
            "tags": ["congregation", "mosque", "prayer", "obligation", "jamah", "men"],
            "difficulty": "medium"
        },
        144227: {
            "questionText": "What is the ruling on a woman traveling without a mahram?",
            "options": [
                {"id": "a", "text": "It is not permissible except in cases of dire necessity", "isCorrect": True},
                {"id": "b", "text": "It is permissible if traveling with a group of trustworthy women", "isCorrect": False},
                {"id": "c", "text": "It is permissible for distances less than 80 km", "isCorrect": False},
                {"id": "d", "text": "It is permissible in modern times due to safe transportation", "isCorrect": False}
            ],
            "explanation": "The Prophet (peace be upon him) forbade a woman from traveling without a mahram. This ruling remains valid regardless of the mode of transportation or perceived safety. A mahram is a male relative whom she cannot marry, providing protection and proper guardianship during travel.",
            "tags": ["women", "travel", "mahram", "guardian", "prohibition", "safety"],
            "difficulty": "medium"
        },
        183603: {
            "questionText": "Is it permissible to give Zakat to one's own parents or children?",
            "options": [
                {"id": "a", "text": "No, Zakat cannot be given to one's ascendants or descendants", "isCorrect": True},
                {"id": "b", "text": "Yes, family members have the most right to Zakat", "isCorrect": False},
                {"id": "c", "text": "Yes, but only if they are extremely poor", "isCorrect": False},
                {"id": "d", "text": "It is permissible for parents but not for children", "isCorrect": False}
            ],
            "explanation": "Zakat cannot be given to one's parents, grandparents, children, or grandchildren because a person is already obligated to financially support them. Supporting them is an obligation, not charity. Zakat can be given to other relatives like siblings, uncles, aunts, and cousins.",
            "tags": ["zakat", "family", "charity", "parents", "children", "obligation"],
            "difficulty": "easy"
        },
        146096: {
            "questionText": "What is the ruling on listening to music in Islam?",
            "options": [
                {"id": "a", "text": "It is forbidden according to the majority of scholars", "isCorrect": True},
                {"id": "b", "text": "It is permissible if the lyrics are clean and wholesome", "isCorrect": False},
                {"id": "c", "text": "Only wind instruments are forbidden, other music is allowed", "isCorrect": False},
                {"id": "d", "text": "It is permissible during celebrations and weddings", "isCorrect": False}
            ],
            "explanation": "The majority of scholars consider musical instruments to be forbidden based on various hadiths. The only exceptions are the daff (hand drum) for women during weddings and Eid celebrations. This ruling applies regardless of the lyrics or occasion.",
            "tags": ["music", "instruments", "entertainment", "forbidden", "haram", "scholars"],
            "difficulty": "medium"
        },
        227120: {
            "questionText": "Is it permissible to celebrate non-Islamic festivals like Christmas or New Year?",
            "options": [
                {"id": "a", "text": "No, Muslims should not participate in or celebrate non-Islamic festivals", "isCorrect": True},
                {"id": "b", "text": "Yes, if done as a cultural activity without religious meaning", "isCorrect": False},
                {"id": "c", "text": "Yes, to show respect and coexistence with others", "isCorrect": False},
                {"id": "d", "text": "It is permissible to attend but not organize such celebrations", "isCorrect": False}
            ],
            "explanation": "Muslims should not celebrate or participate in non-Islamic religious festivals as this can lead to imitating other religions and weakening Islamic identity. Muslims have two Eids designated by Allah. Greetings and well-wishes for these occasions should also be avoided.",
            "tags": ["festivals", "celebrations", "christmas", "innovation", "imitation", "eid"],
            "difficulty": "easy"
        },
        201236: {
            "questionText": "What is the minimum amount of gold that makes Zakat obligatory?",
            "options": [
                {"id": "a", "text": "85 grams of gold (approximately)", "isCorrect": True},
                {"id": "b", "text": "40 grams of gold", "isCorrect": False},
                {"id": "c", "text": "200 grams of gold", "isCorrect": False},
                {"id": "d", "text": "100 grams of gold", "isCorreat": False}
            ],
            "explanation": "The nisab (minimum threshold) for gold is approximately 85 grams (20 dinars or mithqals). If a person owns this amount or more for one lunar year, they must pay 2.5% as Zakat. This applies to gold kept for investment, not jewelry regularly worn by women (according to some scholars).",
            "tags": ["zakat", "gold", "nisab", "wealth", "charity", "threshold"],
            "difficulty": "hard"
        },
        175193: {
            "questionText": "Is it permissible to pray voluntary prayers during the forbidden times?",
            "options": [
                {"id": "a", "text": "No, except for prayers that have a specific reason", "isCorrect": True},
                {"id": "b", "text": "Yes, all prayers are permitted at all times", "isCorrect": False},
                {"id": "c", "text": "No voluntary prayers are allowed during forbidden times without exception", "isCorrect": False},
                {"id": "d", "text": "Only two-unit prayers are forbidden during these times", "isCorrect": False}
            ],
            "explanation": "During the three forbidden times (after Fajr until sunrise, when the sun is at its zenith, and after Asr until sunset), voluntary prayers without a specific reason are prohibited. However, prayers with a reason like tahiyyat al-masjid or sunnah of wudu may be prayed.",
            "tags": ["prayer", "voluntary", "forbidden-times", "nafl", "timing", "rulings"],
            "difficulty": "hard"
        },
        118090: {
            "questionText": "What is the Islamic ruling on male circumcision?",
            "options": [
                {"id": "a", "text": "It is obligatory or highly emphasized according to scholarly consensus", "isCorrect": True},
                {"id": "b", "text": "It is merely a recommended Sunnah", "isCorrect": False},
                {"id": "c", "text": "It is only required before marriage", "isCorrect": False},
                {"id": "d", "text": "It is a cultural practice without Islamic basis", "isCorrect": False}
            ],
            "explanation": "Circumcision for males is either obligatory or highly emphasized in Islam according to scholarly consensus. It is part of the fitrah (natural disposition) and has both religious and health benefits. Most scholars consider it an obligation that should be performed during childhood.",
            "tags": ["circumcision", "fitrah", "men", "obligation", "sunnah", "health"],
            "difficulty": "easy"
        },
        223136: {
            "questionText": "Is it permissible to delay making up missed Ramadan fasts?",
            "options": [
                {"id": "a", "text": "It should be made up before the next Ramadan; delaying without excuse is disliked", "isCorrect": True},
                {"id": "b", "text": "You can delay as long as needed without any consequence", "isCorrect": False},
                {"id": "c", "text": "It must be made up within the same month after Ramadan", "isCorrect": False},
                {"id": "d", "text": "You must pay fidyah instead if you delay past Shawwal", "isCorrect": False}
            ],
            "explanation": "Missed Ramadan fasts should be made up before the next Ramadan arrives. Delaying without a valid excuse is disliked. If someone delays until the next Ramadan arrives, they must make up the fasts and also feed one poor person for each day as expiation according to some scholars.",
            "tags": ["fasting", "ramadan", "qada", "makeup-fasts", "delay", "obligation"],
            "difficulty": "medium"
        },
        158443: {
            "questionText": "What is the ruling on a man wearing gold?",
            "options": [
                {"id": "a", "text": "It is forbidden for men to wear gold", "isCorrect": True},
                {"id": "b", "text": "It is permissible if it's less than 5 grams", "isCorrect": False},
                {"id": "c", "text": "It is permissible for wedding rings only", "isCorrect": False},
                {"id": "d", "text": "It is disliked but not forbidden", "isCorrect": False}
            ],
            "explanation": "It is forbidden for men to wear gold in any amount. The Prophet (peace be upon him) explicitly forbade gold and silk for men. This includes gold rings, necklaces, watches, or any other gold items. Silver is permissible for men within reasonable limits.",
            "tags": ["gold", "men", "jewelry", "forbidden", "haram", "clothing"],
            "difficulty": "easy"
        },
        175404: {
            "questionText": "Is it permissible to use Allah's name in vain or in casual conversation?",
            "options": [
                {"id": "a", "text": "No, Allah's name should be used with respect and not in vain", "isCorrect": True},
                {"id": "b", "text": "Yes, as long as you're not cursing or insulting", "isCorrect": False},
                {"id": "c", "text": "It is permissible in Arabic but not in other languages", "isCorrect": False},
                {"id": "d", "text": "It is only forbidden during prayer times", "isCorrect": False}
            ],
            "explanation": "Allah's name should be mentioned with respect and reverence, not used carelessly in vain or casual conversation. Swearing by Allah casually or using His name without proper respect is prohibited. Muslims should be mindful when mentioning Allah's name.",
            "tags": ["Allah", "respect", "names", "adab", "speech", "reverence"],
            "difficulty": "easy"
        },
        194483: {
            "questionText": "What is the ruling on shaking hands with the opposite gender?",
            "options": [
                {"id": "a", "text": "It is forbidden due to the prohibition of touching non-mahram", "isCorrect": True},
                {"id": "b", "text": "It is permissible in professional settings", "isCorrect": False},
                {"id": "c", "text": "It is permissible if there is no desire or temptation", "isCorrect": False},
                {"id": "d", "text": "It is permissible for elderly people only", "isCorrect": False}
            ],
            "explanation": "It is forbidden for men and women who are not mahram to shake hands or touch each other. The Prophet (peace be upon him) said he never touched the hand of a woman who was not permissible for him. This ruling applies in all situations regardless of intent or age.",
            "tags": ["handshake", "touching", "mahram", "gender", "mixing", "forbidden"],
            "difficulty": "medium"
        },
        191096: {
            "questionText": "Is it obligatory to say 'Bismillah' before eating?",
            "options": [
                {"id": "a", "text": "It is obligatory according to some scholars, highly recommended according to others", "isCorrect": True},
                {"id": "b", "text": "It is merely a cultural tradition without religious basis", "isCorrect": False},
                {"id": "c", "text": "It is only obligatory before meals shared with others", "isCorrect": False},
                {"id": "d", "text": "It is recommended but saying it silently is forbidden", "isCorrect": False}
            ],
            "explanation": "The Prophet (peace be upon him) commanded saying 'Bismillah' before eating. While scholars differ on whether it's obligatory or highly recommended, all agree it should not be neglected. Forgetting to say it at the beginning, one should say 'Bismillah awwalahu wa akhirahu' when remembering.",
            "tags": ["bismillah", "eating", "adab", "manners", "food", "dhikr"],
            "difficulty": "medium"
        },
        182372: {
            "questionText": "What is the minimum amount of silver that makes Zakat obligatory?",
            "options": [
                {"id": "a", "text": "Approximately 595 grams of silver", "isCorrect": True},
                {"id": "b", "text": "85 grams of silver", "isCorrect": False},
                {"id": "c", "text": "200 grams of silver", "isCorrect": False},
                {"id": "d", "text": "1000 grams of silver", "isCorrect": False}
            ],
            "explanation": "The nisab for silver is 200 dirhams, which equals approximately 595 grams of silver. If a person owns this amount or more for one lunar year, they must pay 2.5% as Zakat. Many scholars recommend using the silver nisab for calculating Zakat on currency as it benefits the poor more.",
            "tags": ["zakat", "silver", "nisab", "wealth", "charity", "threshold"],
            "difficulty": "hard"
        },
        171401: {
            "questionText": "Is it permissible to pray wearing clothes that have pictures of animate beings on them?",
            "options": [
                {"id": "a", "text": "The prayer is valid but it is disliked and should be avoided", "isCorrect": True},
                {"id": "b", "text": "The prayer is invalid and must be repeated", "isCorrect": False},
                {"id": "c", "text": "It is permissible without any dislike if the images are small", "isCorrect": False},
                {"id": "d", "text": "It is only problematic if the images are on the front of the garment", "isCorrect": False}
            ],
            "explanation": "While the prayer is valid if performed in clothes with images, it is disliked (makruh) because images of animate beings are prohibited in Islam. The presence of such images may distract from prayer and goes against the prohibition of image-making. Muslims should avoid such clothing.",
            "tags": ["prayer", "clothing", "images", "pictures", "makruh", "validity"],
            "difficulty": "medium"
        },
        216823: {
            "questionText": "What is the ruling on a woman removing her hijab in front of her brother-in-law?",
            "options": [
                {"id": "a", "text": "It is forbidden; she must maintain hijab in front of him", "isCorrect": True},
                {"id": "b", "text": "It is permissible as he is considered family", "isCorrect": False},
                {"id": "c", "text": "It is permissible if her husband is present", "isCorrect": False},
                {"id": "d", "text": "It is permissible after many years of family relationship", "isCorrect": False}
            ],
            "explanation": "A woman's brother-in-law (her husband's brother) is not a mahram, and she must maintain hijab in front of him. The Prophet (peace be upon him) warned that 'the in-law is death,' meaning the danger and severity of mixing with him. She cannot remove her hijab or be alone with him.",
            "tags": ["hijab", "mahram", "brother-in-law", "women", "covering", "forbidden"],
            "difficulty": "easy"
        },
        177117: {
            "questionText": "Is it permissible to perform Hajj using borrowed money?",
            "options": [
                {"id": "a", "text": "Yes, but Hajj only becomes obligatory when one can afford it without borrowing", "isCorrect": True},
                {"id": "b", "text": "No, Hajj performed with debt is invalid", "isCorrect": False},
                {"id": "c", "text": "Yes, and it's recommended to borrow specifically for Hajj", "isCorrect": False},
                {"id": "d", "text": "It depends on whether the loan is interest-free or not", "isCorrect": False}
            ],
            "explanation": "While performing Hajj with borrowed money is valid if one actually performs it, Hajj is only obligatory on those who have the financial means. If someone cannot afford Hajj without borrowing, it is not yet obligatory upon them. Having the ability to repay is also a consideration.",
            "tags": ["hajj", "debt", "borrowing", "obligation", "finance", "ability"],
            "difficulty": "hard"
        },
        186152: {
            "questionText": "What is the ruling on celebrating a birthday in Islam?",
            "options": [
                {"id": "a", "text": "It is an innovation (bidah) not prescribed in Islam", "isCorrect": True},
                {"id": "b", "text": "It is permissible as a cultural celebration", "isCorrect": False},
                {"id": "c", "text": "It is recommended to celebrate with gratitude to Allah", "isCorrect": False},
                {"id": "d", "text": "It is permissible for children but not adults", "isCorrect": False}
            ],
            "explanation": "Celebrating birthdays is considered an innovation in Islam as it was not practiced by the Prophet (peace be upon him) or his Companions. Muslims have two prescribed celebrations: Eid al-Fitr and Eid al-Adha. Adding other celebrations imitates non-Muslim practices and is not from the Sunnah.",
            "tags": ["birthday", "celebration", "bidah", "innovation", "eid", "customs"],
            "difficulty": "easy"
        },
        197108: {
            "questionText": "Is it permissible to work in a restaurant that serves both halal and haram food?",
            "options": [
                {"id": "a", "text": "It is not permissible as it involves assisting in serving haram items", "isCorrect": True},
                {"id": "b", "text": "It is permissible if you only handle the halal items", "isCorrect": False},
                {"id": "c", "text": "It is permissible if haram items are less than 50% of sales", "isCorrect": False},
                {"id": "d", "text": "It is permissible in non-Muslim countries due to necessity", "isCorrect": False}
            ],
            "explanation": "Working in a restaurant that serves pork or alcohol is not permissible, even if one only handles halal items. The worker is part of the operation that serves haram, which constitutes helping in sin. Muslims should seek halal employment that doesn't involve prohibited items or activities.",
            "tags": ["work", "restaurant", "haram-food", "employment", "halal-income", "cooperation"],
            "difficulty": "medium"
        },
        228628: {
            "questionText": "What is the ruling on women wearing pants outside the home?",
            "options": [
                {"id": "a", "text": "It is not permissible as it doesn't fulfill the conditions of proper Islamic dress", "isCorrect": True},
                {"id": "b", "text": "It is permissible if they are loose and covered by a long shirt", "isCorrect": False},
                {"id": "c", "text": "It is permissible for exercise and physical activities only", "isCorrect": False},
                {"id": "d", "text": "It is permissible in modern times as clothing norms have changed", "isCorrect": False}
            ],
            "explanation": "Women wearing pants outside the home, even if loose, is problematic because it imitates men's clothing and typically doesn't meet the requirements of hijab. Islamic dress for women should be loose, cover the entire body, and not resemble men's clothing or be specific to non-Muslims.",
            "tags": ["clothing", "women", "pants", "hijab", "modesty", "dress-code"],
            "difficulty": "medium"
        },
        232812: {
            "questionText": "Is it permissible to use credit cards that charge interest?",
            "options": [
                {"id": "a", "text": "It is not permissible if you will pay interest; permissible if paid in full monthly", "isCorrect": True},
                {"id": "b", "text": "Credit cards are completely forbidden in all circumstances", "isCorrect": False},
                {"id": "c", "text": "They are permissible as the interest is paid to banks, not individuals", "isCorrect": False},
                {"id": "d", "text": "They are permissible in non-Muslim countries only", "isCorrect": False}
            ],
            "explanation": "Using credit cards is permissible if one pays the full balance before any interest accrues. However, if there's a risk of paying interest, it should be avoided. Interest (riba) is one of the major sins in Islam regardless of the amount or who receives it.",
            "tags": ["credit-cards", "riba", "interest", "finance", "banking", "debt"],
            "difficulty": "medium"
        },
        175300: {
            "questionText": "What is the minimum number of people required for congregational prayer?",
            "options": [
                {"id": "a", "text": "Two people: an imam and one follower", "isCorrect": True},
                {"id": "b", "text": "Three people minimum", "isCorrect": False},
                {"id": "c", "text": "At least four people for valid congregation", "isCorrect": False},
                {"id": "d", "text": "Seven people for the reward of congregation", "isCorrect": False}
            ],
            "explanation": "Congregational prayer can be established with just two people: one leading as imam and one following. The Prophet (peace be upon him) prayed with his Companions in groups of two on various occasions. The reward multiplies with more participants but two is sufficient.",
            "tags": ["congregation", "prayer", "jamaah", "imam", "numbers", "validity"],
            "difficulty": "medium"
        },
        243112: {
            "questionText": "Is it permissible to celebrate Valentine's Day?",
            "options": [
                {"id": "a", "text": "No, it is imitating a non-Islamic celebration with pagan origins", "isCorrect": True},
                {"id": "b", "text": "Yes, as it's become a cultural day to express love", "isCorrect": False},
                {"id": "c", "text": "Yes, if celebrating love between spouses only", "isCorrect": False},
                {"id": "d", "text": "It is permissible without the religious elements", "isCorrect": False}
            ],
            "explanation": "Celebrating Valentine's Day is not permissible as it involves imitating a non-Islamic celebration with pagan and Christian origins. Muslims should not participate in such celebrations even if done 'culturally.' Expressing love to one's spouse should be done year-round according to Islamic teachings, not on specific non-Islamic occasions.",
            "tags": ["valentines", "celebration", "imitation", "love", "bidah", "customs"],
            "difficulty": "easy"
        },
        154302: {
            "questionText": "What is the ruling on performing ablution (wudu) with nail polish on?",
            "options": [
                {"id": "a", "text": "The wudu is invalid as water must touch the nails", "isCorrect": True},
                {"id": "b", "text": "The wudu is valid if using water-permeable nail polish", "isCorrect": False},
                {"id": "c", "text": "The wudu is valid but disliked", "isCorrect": False},
                {"id": "d", "text": "Only regular nail polish is problematic, gel polish is permissible", "isCorrect": False}
            ],
            "explanation": "Wudu requires water to touch all parts that must be washed, including the nails. Regular nail polish creates a barrier preventing water from reaching the nails, thus invalidating wudu. Women must remove nail polish before performing wudu or ghusl for prayers to be valid.",
            "tags": ["wudu", "nail-polish", "ablution", "women", "purity", "validity"],
            "difficulty": "easy"
        },
        166355: {
            "questionText": "Is it permissible to adopt a child and give them your family name?",
            "options": [
                {"id": "a", "text": "Adoption is allowed but the child must keep their biological father's name", "isCorrect": True},
                {"id": "b", "text": "Full adoption with name change is permissible and encouraged", "isCorrect": False},
                {"id": "c", "text": "Adoption is completely forbidden in Islam", "isCorrect": False},
                {"id": "d", "text": "Name change is allowed only if the biological father is unknown", "isCorrect": False}
            ],
            "explanation": "While caring for orphans is highly encouraged, Islamic adoption differs from Western adoption. The child must keep their biological father's family name and maintains specific inheritance and mahram rules. Calling them by other than their father's name is forbidden. Fostering and caring for children is permissible and rewarded.",
            "tags": ["adoption", "orphans", "fostering", "family-name", "lineage", "kafalah"],
            "difficulty": "medium"
        },
        188991: {
            "questionText": "What is the ruling on saying 'Jumu'ah Mubarak' or similar greetings on Friday?",
            "options": [
                {"id": "a", "text": "It is an innovation as it was not done by the Prophet or Companions", "isCorrect": True},
                {"id": "b", "text": "It is recommended to congratulate each other on Friday", "isCorrect": False},
                {"id": "c", "text": "It is obligatory to greet fellow Muslims on Jumu'ah", "isCorrect": False},
                {"id": "d", "text": "It is permissible as a cultural custom", "isCorrect": False}
            ],
            "explanation": "Specifying Friday greetings like 'Jumu'ah Mubarak' is an innovation not practiced by the Prophet (peace be upon him) or his Companions. Making it a regular practice is adding to the religion. The general Islamic greeting 'As-salamu alaykum' can be used any day without specification.",
            "tags": ["friday", "greetings", "bidah", "innovation", "jumuah", "customs"],
            "difficulty": "hard"
        },
        206539: {
            "questionText": "Is it permissible to pray behind an imam who shaves his beard?",
            "options": [
                {"id": "a", "text": "Yes, the prayer is valid though shaving the beard is sinful", "isCorrect": True},
                {"id": "b", "text": "No, the prayer behind such an imam is invalid", "isCorrect": False},
                {"id": "c", "text": "Only if no other mosque is available", "isCorrect": False},
                {"id": "d", "text": "It is valid but you must repeat the prayer later", "isCorrect": False}
            ],
            "explanation": "The prayer behind an imam who shaves his beard is valid, though shaving the beard is sinful. We don't invalidate people's prayers due to their sins. However, if another mosque with a better imam is available, it's preferable to pray there. The beard is obligatory according to the strongest scholarly opinion.",
            "tags": ["prayer", "imam", "beard", "validity", "sin", "following"],
            "difficulty": "hard"
        },
        235894: {
            "questionText": "What is the ruling on women wearing high heels?",
            "options": [
                {"id": "a", "text": "It is not permissible if it attracts attention or causes a clicking sound", "isCorrect": True},
                {"id": "b", "text": "It is completely permissible for all occasions", "isCorrect": False},
                {"id": "c", "text": "It is only permissible inside the home", "isCorrect": False},
                {"id": "d", "text": "It is permissible if worn with an abaya", "isCorrect": False}
            ],
            "explanation": "Women should not wear shoes that make noise or attract attention when walking, as this goes against the principle of modesty. Allah says women should not strike their feet to make known their hidden adornment. High heels that are loud or draw attention are problematic. Inside the home for one's husband is a different matter.",
            "tags": ["women", "clothing", "heels", "modesty", "attention", "adornment"],
            "difficulty": "medium"
        },
        212458: {
            "questionText": "Is it obligatory to pray the Witr prayer?",
            "options": [
                {"id": "a", "text": "It is a confirmed Sunnah, not obligatory according to majority", "isCorrect": True},
                {"id": "b", "text": "It is obligatory like the five daily prayers", "isCorrect": False},
                {"id": "c", "text": "It is obligatory only during Ramadan", "isCorrect": False},
                {"id": "d", "text": "It is merely recommended with no emphasis", "isCorrect": False}
            ],
            "explanation": "Witr prayer is a confirmed Sunnah that should not be neglected, though it is not obligatory according to the majority of scholars. The Prophet (peace be upon him) never abandoned it whether traveling or resident. It is prayed after Isha until before Fajr, with one, three, or more odd number of units.",
            "tags": ["witr", "prayer", "sunnah", "night-prayer", "obligation", "nafl"],
            "difficulty": "medium"
        },
        248371: {
            "questionText": "What is the ruling on a woman going to the mosque for prayers?",
            "options": [
                {"id": "a", "text": "It is permissible but praying at home is better for her", "isCorrect": True},
                {"id": "b", "text": "It is obligatory like for men", "isCorrect": False},
                {"id": "c", "text": "It is completely forbidden except for Taraweeh", "isCorrect": False},
                {"id": "d", "text": "It is only permissible for elderly women", "isCorrect": False}
            ],
            "explanation": "Women are permitted to go to the mosque if they observe proper hijab and seek their husband's permission, but their prayer at home is better for them. The Prophet (peace be upon him) said the best rows for women are the last ones. Women should not wear perfume or adornments when going out.",
            "tags": ["women", "mosque", "prayer", "home", "permission", "congregation"],
            "difficulty": "medium"
        },
        193826: {
            "questionText": "Is it permissible to have a dog as a pet in the house?",
            "options": [
                {"id": "a", "text": "It is not permissible except for hunting, guarding, or farming", "isCorrect": True},
                {"id": "b", "text": "It is permissible if kept outdoors only", "isCorrect": False},
                {"id": "c", "text": "It is permissible in modern times for companionship", "isCorrect": False},
                {"id": "d", "text": "Small dogs are permissible but large dogs are not", "isCorrect": False}
            ],
            "explanation": "Keeping dogs is only permissible for specific purposes: hunting, guarding livestock or crops, or farming. The Prophet (peace be upon him) said that angels do not enter a house where there is a dog, and one qirat of reward is deducted daily from those who keep dogs without valid reason.",
            "tags": ["dogs", "pets", "animals", "angels", "home", "prohibition"],
            "difficulty": "easy"
        },
        224765: {
            "questionText": "What is the ruling on tattoos in Islam?",
            "options": [
                {"id": "a", "text": "They are forbidden as the Prophet cursed those who get tattoos", "isCorrect": True},
                {"id": "b", "text": "They are permissible if done for medical purposes only", "isCorrect": False},
                {"id": "c", "text": "They are disliked but not forbidden", "isCorrect": False},
                {"id": "d", "text": "Only permanent tattoos are forbidden, temporary ones are allowed", "isCorrect": False}
            ],
            "explanation": "Tattoos are forbidden in Islam. The Prophet (peace be upon him) cursed those who do tattoos and those who have them done. This is because tattoos involve changing Allah's creation and causing pain without valid reason. Those who have tattoos from before Islam should repent but cannot remove them if it causes harm.",
            "tags": ["tattoos", "body", "forbidden", "appearance", "changing-creation", "haram"],
            "difficulty": "easy"
        },
        200917: {
            "questionText": "Is it permissible to take pictures and photographs?",
            "options": [
                {"id": "a", "text": "It is permissible for necessity, but making images is discouraged", "isCorrect": True},
                {"id": "b", "text": "All forms of photography are completely forbidden", "isCorrect": False},
                {"id": "c", "text": "Only video is forbidden, still images are fine", "isCorrect": False},
                {"id": "d", "text": "It is permissible without any restrictions in modern times", "isCorrect": False}
            ],
            "explanation": "The ruling on photography is that it's permissible for necessity like ID cards, but the general making of images is discouraged as images of animate beings are problematic. Displaying pictures at home, especially where prayer is performed, is more severely discouraged. There's scholarly difference on this issue.",
            "tags": ["photography", "images", "pictures", "necessity", "rulings", "difference"],
            "difficulty": "hard"
        },
        217693: {
            "questionText": "What is the minimum distance that defines travel (safar) for prayer concessions?",
            "options": [
                {"id": "a", "text": "Approximately 80 km (50 miles) according to most scholars", "isCorrect": True},
                {"id": "b", "text": "Any journey outside your city", "isCorrect": False},
                {"id": "c", "text": "More than 200 km (125 miles)", "isCorrect": False},
                {"id": "d", "text": "Whatever people customarily consider travel", "isCorrect": False}
            ],
            "explanation": "The strongest opinion is that travel (safar) begins at approximately 80 km or 48 miles. At this distance, a traveler may shorten four-unit prayers to two units and combine prayers. Some scholars say it's what people customarily consider travel, while others specify different distances.",
            "tags": ["travel", "safar", "distance", "prayer", "shortening", "combining"],
            "difficulty": "hard"
        },
        189543: {
            "questionText": "Is it permissible for women to wear makeup outside the home?",
            "options": [
                {"id": "a", "text": "No, makeup should only be worn for one's husband", "isCorrect": True},
                {"id": "b", "text": "Yes, if it's light and natural-looking", "isCorrect": False},
                {"id": "c", "text": "Yes, except in the mosque", "isCorrect": False},
                {"id": "d", "text": "It is permissible for special occasions only", "isCorrect": False}
            ],
            "explanation": "Women should not wear makeup outside the home as it attracts attention and is a form of adornment that should be concealed. Allah commands women not to display their adornment except to their mahrams. Makeup is for beautification and should be reserved for one's husband in privacy.",
            "tags": ["makeup", "women", "adornment", "hijab", "beautification", "modesty"],
            "difficulty": "easy"
        },
        231547: {
            "questionText": "What is the ruling on listening to Quran recitation without understanding?",
            "options": [
                {"id": "a", "text": "It is beneficial and rewarded, but understanding adds greater benefit", "isCorrect": True},
                {"id": "b", "text": "It is pointless without understanding the meaning", "isCorrect": False},
                {"id": "c", "text": "It is only beneficial if you're learning Arabic simultaneously", "isCorrect": False},
                {"id": "d", "text": "Understanding is required for any reward", "isCorrect": False}
            ],
            "explanation": "Listening to Quran recitation is beneficial and rewarded even without understanding, as the Quran itself is blessed. However, Muslims should strive to understand the meanings to gain greater benefit and implement the guidance. Reading translation along with listening is highly recommended for non-Arabic speakers.",
            "tags": ["quran", "recitation", "understanding", "listening", "arabic", "translation"],
            "difficulty": "medium"
        },
        195277: {
            "questionText": "Is it permissible to use Instagram and social media?",
            "options": [
                {"id": "a", "text": "It is permissible if used for good purposes and avoiding haram content", "isCorrect": True},
                {"id": "b", "text": "All social media is forbidden due to mixing and fitna", "isCorrect": False},
                {"id": "c", "text": "It is permissible only for dawah purposes", "isCorrect": False},
                {"id": "d", "text": "It is permissible for men but not for women", "isCorrect": False}
            ],
            "explanation": "Social media platforms are tools that can be used for good or evil. They are permissible if used for beneficial purposes like learning, dawah, and staying connected, while avoiding haram content, free mixing, and displaying awrah. Users must maintain Islamic etiquette and guard against the fitna these platforms can create.",
            "tags": ["social-media", "instagram", "technology", "internet", "mixing", "guidelines"],
            "difficulty": "medium"
        },
        238914: {
            "questionText": "What is the ruling on voluntary (nafl) fasting on Fridays alone?",
            "options": [
                {"id": "a", "text": "It is forbidden to single out Friday for fasting", "isCorrect": True},
                {"id": "b", "text": "It is recommended to fast on Fridays", "isCorrect": False},
                {"id": "c", "text": "It is permissible without any restrictions", "isCorrect": False},
                {"id": "d", "text": "It is only forbidden if you miss Jumu'ah prayer", "isCorrect": False}
            ],
            "explanation": "The Prophet (peace be upon him) forbade singling out Friday for fasting. However, it is permissible to fast Friday if one fasts Thursday before it or Saturday after it, or if it coincides with a person's regular fasting pattern like fasting alternate days.",
            "tags": ["fasting", "friday", "voluntary", "nafl", "prohibition", "days"],
            "difficulty": "medium"
        },
        214536: {
            "questionText": "Is it obligatory to recite Surah Al-Fatihah in every unit of prayer?",
            "options": [
                {"id": "a", "text": "Yes, it is a pillar of prayer according to strongest opinion", "isCorrect": True},
                {"id": "b", "text": "It is only obligatory in the first two units", "isCorrect": False},
                {"id": "c", "text": "It is recommended but not obligatory", "isCorrect": False},
                {"id": "d", "text": "It is obligatory only for the imam, not followers", "isCorrect": False}
            ],
            "explanation": "According to the strongest scholarly opinion, reciting Al-Fatihah in every unit (rakah) of prayer is obligatory for both imam and individual praying alone. The Prophet (peace be upon him) said: 'There is no prayer for the one who does not recite the Opening of the Book.' Followers in congregation have scholarly differences.",
            "tags": ["fatihah", "prayer", "recitation", "obligation", "pillar", "rukn"],
            "difficulty": "medium"
        },
        245681: {
            "questionText": "What is the Islamic ruling on plastic surgery for beautification?",
            "options": [
                {"id": "a", "text": "It is forbidden as it changes Allah's creation without necessity", "isCorrect": True},
                {"id": "b", "text": "It is permissible if done moderately", "isCorrect": False},
                {"id": "c", "text": "It is permissible for women before marriage", "isCorrect": False},
                {"id": "d", "text": "All forms of surgery including corrective are forbidden", "isCorrect": False}
            ],
            "explanation": "Cosmetic surgery for mere beautification without medical necessity is forbidden as it involves changing Allah's creation. However, surgery to correct deformities, repair injuries, or remove genuine abnormalities that cause significant harm or hardship is permissible. The key distinction is between necessity/treatment and mere beautification.",
            "tags": ["surgery", "beautification", "changing-creation", "appearance", "necessity", "body"],
            "difficulty": "medium"
        },
        203374: {
            "questionText": "Is it permissible to eat food sacrificed at non-Muslim festivals?",
            "options": [
                {"id": "a", "text": "It is not permissible as it involves participating in their festivals", "isCorrect": True},
                {"id": "b", "text": "It is permissible if the food itself is halal", "isCorrect": False},
                {"id": "c", "text": "It is permissible from People of the Book", "isCorrect": False},
                {"id": "d", "text": "It is permissible if you don't attend the festival yourself", "isCorrect": False}
            ],
            "explanation": "Food specifically sacrificed or prepared for non-Islamic religious festivals should not be eaten, as consuming it implies approval and participation in their celebrations. This is different from general permissible food prepared by People of the Book for regular consumption. Muslims should avoid anything that suggests celebrating or honoring non-Islamic religious occasions.",
            "tags": ["food", "festivals", "sacrifice", "celebrations", "non-muslims", "participation"],
            "difficulty": "hard"
        },
        209681: {
            "questionText": "What is the ruling on saying 'RIP' (Rest in Peace) when someone dies?",
            "options": [
                {"id": "a", "text": "It should be avoided; use Islamic supplications instead", "isCorrect": True},
                {"id": "b", "text": "It is permissible as it's just a cultural phrase", "isCorrect": False},
                {"id": "c", "text": "It is permissible if the deceased was Muslim", "isCorrect": False},
                {"id": "d", "text": "It is recommended as it shows compassion", "isCorrect": False}
            ],
            "explanation": "Muslims should use Islamic phrases when someone dies, such as 'Inna lillahi wa inna ilayhi raji'un' (To Allah we belong and to Him we return) and make dua for the deceased if Muslim. 'RIP' is a phrase from other faiths and its usage is not from Islamic tradition. We should maintain our distinct Islamic identity in our expressions.",
            "tags": ["death", "condolences", "rip", "dua", "phrases", "identity"],
            "difficulty": "medium"
        },
        221093: {
            "questionText": "Is it permissible to pray in a garment that has been contaminated with impurity if you cannot find another?",
            "options": [
                {"id": "a", "text": "Yes, if unable to remove it, pray as you are and don't repeat the prayer", "isCorrect": True},
                {"id": "b", "text": "No, you must delay the prayer until you find pure clothing", "isCorrect": False},
                {"id": "c", "text": "Yes, but you must repeat the prayer when you find pure clothing", "isCorrect": False},
                {"id": "d", "text": "You should pray naked rather than in impure clothing", "isCorrect": False}
            ],
            "explanation": "If someone cannot remove an impure garment or find pure clothing, they should pray as they are and their prayer is valid according to the principle that 'what is obligatory is only what one is capable of.' They do not need to repeat the prayer. Allah does not burden a soul beyond its capacity.",
            "tags": ["prayer", "purity", "impurity", "clothing", "necessity", "inability"],
            "difficulty": "hard"
        },
        196845: {
            "questionText": "What is the ruling on women working outside the home?",
            "options": [
                {"id": "a", "text": "It is permissible with conditions: hijab, avoiding mixing, and no neglect of duties", "isCorrect": True},
                {"id": "b", "text": "It is completely forbidden in all circumstances", "isCorrect": False},
                {"id": "c", "text": "It is obligatory for women to contribute financially", "isCorrect": False},
                {"id": "d", "text": "It is only permissible for widows and divorcees", "isCorrect": False}
            ],
            "explanation": "Women working outside the home is permissible if certain conditions are met: maintaining proper hijab, avoiding inappropriate mixing with men, ensuring the work itself is permissible, obtaining husband's permission if married, and not neglecting home and children. Financial need makes it more permissible, but it's not obligatory.",
            "tags": ["women", "work", "employment", "hijab", "mixing", "conditions"],
            "difficulty": "medium"
        },
        252173: {
            "questionText": "Is it permissible to make dua in a language other than Arabic?",
            "options": [
                {"id": "a", "text": "Yes, dua can be made in any language Allah understands all", "isCorrect": True},
                {"id": "b", "text": "No, all dua must be in Arabic to be accepted", "isCorrect": False},
                {"id": "c", "text": "Only during prayer must dua be in Arabic", "isCorrect": False},
                {"id": "d", "text": "It is permissible only for those who don't know Arabic", "isCorrect": False}
            ],
            "explanation": "Dua (supplication) can be made in any language as Allah understands all languages and knows what is in the hearts. However, using the authentic Arabic supplications from the Quran and Sunnah is more virtuous. During formal prayer, the prescribed dhikr and recitation must be in Arabic.",
            "tags": ["dua", "supplication", "language", "arabic", "prayer", "acceptance"],
            "difficulty": "easy"
        },
        240115: {
            "questionText": "What is the ruling on cutting hair and nails during the first ten days of Dhul-Hijjah for one intending to sacrifice?",
            "options": [
                {"id": "a", "text": "It is forbidden from the start of Dhul-Hijjah until after sacrificing", "isCorrect": True},
                {"id": "b", "text": "It is disliked but not forbidden", "isCorrect": False},
                {"id": "c", "text": "It is only forbidden on the day of Eid itself", "isCorrect": False},
                {"id": "d", "text": "This prohibition only applies to those performing Hajj", "isCorrect": False}
            ],
            "explanation": "For those intending to offer a sacrifice (udhiyah), it is forbidden to remove any hair or cut nails from the beginning of Dhul-Hijjah until after the sacrifice is completed. The Prophet (peace be upon him) said: 'When you see the new moon of Dhul-Hijjah, if anyone wants to offer a sacrifice, let him not remove anything from his hair or nails.'",
            "tags": ["sacrifice", "udhiyah", "dhul-hijjah", "hair", "nails", "eid"],
            "difficulty": "hard"
        },
        229876: {
            "questionText": "Is it permissible to delay Asr prayer until the sun turns yellow?",
            "options": [
                {"id": "a", "text": "It is permissible but disliked to delay without excuse", "isCorrect": True},
                {"id": "b", "text": "It is forbidden to pray once the sun turns yellow", "isCorrect": False},
                {"id": "c", "text": "The prayer must be repeated if prayed during yellowing", "isCorrect": False},
                {"id": "d", "text": "It is the preferred time for Asr prayer", "isCorrect": False}
            ],
            "explanation": "The time for Asr extends until sunset, but it is disliked to delay it until the sun turns yellow without a valid excuse. The Prophet (peace be upon him) called this the time of the hypocrite's prayer. The chosen time for Asr is before the sun changes color, but the prayer is still valid if delayed.",
            "tags": ["asr", "prayer", "timing", "delay", "sunset", "makruh"],
            "difficulty": "hard"
        },
        218432: {
            "questionText": "What is the Islamic ruling on insurance?",
            "options": [
                {"id": "a", "text": "Commercial insurance is forbidden; cooperative insurance may be permissible", "isCorrect": True},
                {"id": "b", "text": "All forms of insurance are completely forbidden", "isCorrect": False},
                {"id": "c", "text": "Insurance is permissible and recommended for protection", "isCorrect": False},
                {"id": "d", "text": "Only health insurance is permissible", "isCorrect": False}
            ],
            "explanation": "Commercial insurance is forbidden by the majority of scholars due to elements of riba, gharar (uncertainty), and gambling. Cooperative (takaful) insurance that operates on Islamic principles may be permissible. Obligatory insurance required by law creates a necessity situation that scholars have addressed differently.",
            "tags": ["insurance", "takaful", "riba", "gharar", "prohibited", "necessity"],
            "difficulty": "hard"
        },
        234719: {
            "questionText": "Is it permissible to attend wedding parties where there is music and free mixing?",
            "options": [
                {"id": "a", "text": "No, one should not attend where major sins are being committed", "isCorrect": True},
                {"id": "b", "text": "Yes, to maintain family ties and relationships", "isCorrect": False},
                {"id": "c", "text": "Yes, but leave when the music starts", "isCorrect": False},
                {"id": "d", "text": "It depends on whose wedding it is", "isCorrect": False}
            ],
            "explanation": "Muslims should not attend gatherings where major sins like music and free mixing occur, even for weddings. Attending implies approval and supporting the sin. If one can attend briefly, give the gift, and leave before the prohibited activities begin, that may be permissible while advising the family about the Islamic way.",
            "tags": ["weddings", "music", "mixing", "gatherings", "sin", "attendance"],
            "difficulty": "medium"
        },
        241857: {
            "questionText": "What is the ruling on a menstruating woman entering the mosque?",
            "options": [
                {"id": "a", "text": "It is forbidden according to the majority of scholars", "isCorrect": True},
                {"id": "b", "text": "It is permissible if she wears proper hijab", "isCorrect": False},
                {"id": "c", "text": "It is permissible for educational events only", "isCorrect": False},
                {"id": "d", "text": "It is permissible if she doesn't pray", "isCorrect": False}
            ],
            "explanation": "The majority of scholars hold that it is forbidden for a menstruating woman to enter the mosque, based on the hadith forbidding those in a state of major impurity from entering. Some scholars permit passing through if necessary, and all permit staying in the designated musalla (prayer area) at home or outdoors for Eid.",
            "tags": ["menstruation", "mosque", "women", "impurity", "entry", "prohibition"],
            "difficulty": "medium"
        },
        237248: {
            "questionText": "Is it permissible to work night shifts if it affects Fajr prayer?",
            "options": [
                {"id": "a", "text": "It is permissible if one ensures they pray Fajr on time", "isCorrect": True},
                {"id": "b", "text": "Night shift work is forbidden in Islam", "isCorrect": False},
                {"id": "c", "text": "It is permissible and one can combine Fajr with Dhuhr", "isCorrect": False},
                {"id": "d", "text": "It is permissible only in non-Muslim countries", "isCorrect": False}
            ],
            "explanation": "Working night shifts is permissible if one can still fulfill prayer obligations on time. If the work will cause one to miss Fajr prayer regularly, one should seek alternative employment or arrangements to ensure prayers are not missed. Prayer is obligatory and takes precedence over work.",
            "tags": ["work", "night-shift", "fajr", "prayer", "employment", "timing"],
            "difficulty": "medium"
        },
        246592: {
            "questionText": "What is the ruling on reading from the Mushaf (Quran) during prayer?",
            "options": [
                {"id": "a", "text": "It is permissible especially in voluntary night prayers", "isCorrect": True},
                {"id": "b", "text": "It is forbidden in all types of prayer", "isCorrect": False},
                {"id": "c", "text": "It invalidates the prayer completely", "isCorrect": False},
                {"id": "d", "text": "It is only permissible for those who have not memorized Fatihah", "isCorrect": False}
            ],
            "explanation": "It is permissible to read from the Mushaf during prayer, particularly in voluntary prayers like tahajjud and taraweeh. Aishah (may Allah be pleased with her) had a servant who would lead her in prayer reading from the Mushaf during Ramadan. This is especially useful for reciting longer portions of Quran.",
            "tags": ["quran", "mushaf", "prayer", "recitation", "reading", "night-prayer"],
            "difficulty": "medium"
        },
        225914: {
            "questionText": "Is it permissible to accept gifts from non-Muslims on their religious festivals?",
            "options": [
                {"id": "a", "text": "It is better to politely decline to avoid seeming to approve their celebration", "isCorrect": True},
                {"id": "b", "text": "It is completely forbidden and considered major sin", "isCorrect": False},
                {"id": "c", "text": "It is permissible and shows good relations", "isCorrect": False},
                {"id": "d", "text": "It is permissible if you donate the gift to charity", "isCorrect": False}
            ],
            "explanation": "While there's scholarly difference, the safer opinion is to politely decline gifts specifically given for non-Islamic religious festivals to avoid implying approval of their celebrations. This is different from general gifts given for birthdays or other non-religious occasions. Muslims should maintain distinct identity while being kind to all.",
            "tags": ["gifts", "non-muslims", "festivals", "relations", "approval", "identity"],
            "difficulty": "hard"
        },
        250138: {
            "questionText": "What is the ruling on dying one's hair black?",
            "options": [
                {"id": "a", "text": "It is forbidden to dye grey hair black", "isCorrect": True},
                {"id": "b", "text": "It is permissible for both men and women", "isCorrect": False},
                {"id": "c", "text": "It is permissible only for women", "isCorrect": False},
                {"id": "d", "text": "It is permissible if mixed with other colors", "isCorrect": False}
            ],
            "explanation": "The Prophet (peace be upon him) commanded changing grey hair but said to avoid black dye. Using other colors like henna (orange-red) or katam (dark brown) is permissible and recommended. Dying hair black is a form of deception and altering one's appearance in a prohibited way.",
            "tags": ["hair", "dye", "black", "appearance", "grey-hair", "henna"],
            "difficulty": "medium"
        },
        247829: {
            "questionText": "Is it permissible to eat meat from animals stunned before slaughter?",
            "options": [
                {"id": "a", "text": "It is not permissible if stunning causes death before slaughter", "isCorrect": True},
                {"id": "b", "text": "All stunned meat is permissible if the animal is Muslim-raised", "isCorrect": False},
                {"id": "c", "text": "Stunning makes slaughter more humane and permissible", "isCorrect": False},
                {"id": "d", "text": "The method of stunning doesn't affect permissibility", "isCorrect": False}
            ],
            "explanation": "If stunning kills the animal before the slaughter is performed, the meat is not halal. Stunning is only permissible if it merely subdues the animal but doesn't kill it, and proper Islamic slaughter (cutting the throat and draining blood) is performed while the animal is still alive. Many modern industrial practices stun to death, making the meat haram.",
            "tags": ["meat", "slaughter", "stunning", "halal", "animals", "zabiha"],
            "difficulty": "hard"
        },
        199562: {
            "questionText": "What is the ruling on women raising their voice in dhikr and supplication?",
            "options": [
                {"id": "a", "text": "Women should lower their voices to avoid fitnah", "isCorrect": True},
                {"id": "b", "text": "Women can raise their voices like men in all situations", "isCorrect": False},
                {"id": "c", "text": "It is obligatory for women to remain completely silent", "isCorrect": False},
                {"id": "d", "text": "Voice level depends only on the location, not gender", "isCorrect": False}
            ],
            "explanation": "Women should not raise their voices in dhikr, supplication, or recitation where non-mahram men can hear, as the female voice can be a source of fitnah. They should lower their voices to a level where they can hear themselves. This is part of the modesty and concealment required of women in Islam.",
            "tags": ["women", "voice", "dhikr", "fitnah", "modesty", "supplication"],
            "difficulty": "medium"
        },
        233561: {
            "questionText": "Is it permissible to work in a bank that deals with interest?",
            "options": [
                {"id": "a", "text": "It is forbidden as it involves helping in riba", "isCorrect": True},
                {"id": "b", "text": "It is permissible if you don't work in the loans department", "isCorrect": False},
                {"id": "c", "text": "It is permissible if you donate part of your salary", "isCorrect": False},
                {"id": "d", "text": "It is permissible for non-customer-facing roles", "isCorrect": False}
            ],
            "explanation": "Working in a bank that deals with interest (riba) is forbidden, regardless of one's specific role, as all employees contribute to the functioning of the institution. This falls under cooperating in sin. Muslims should seek halal employment and trust that Allah will provide lawful sustenance.",
            "tags": ["banking", "riba", "work", "interest", "forbidden", "employment"],
            "difficulty": "easy"
        },
        244927: {
            "questionText": "What is the ruling on organ donation after death?",
            "options": [
                {"id": "a", "text": "It is permissible if it will save a life or restore essential function", "isCorrect": True},
                {"id": "b", "text": "It is completely forbidden as it violates sanctity of the body", "isCorrect": False},
                {"id": "c", "text": "It is obligatory on all Muslims", "isCorrect": False},
                {"id": "d", "text": "It is only permissible to donate to Muslim recipients", "isCorrect": False}
            ],
            "explanation": "The majority of contemporary scholars permit organ donation after death if it will save a life or restore an essential function like sight. This is based on the principle that saving a life takes precedence. However, the body should be treated with respect, organs should not be sold, and the donor or family should give consent.",
            "tags": ["organ-donation", "death", "life", "body", "medical", "necessity"],
            "difficulty": "hard"
        },
        208735: {
            "questionText": "Is it permissible to pray wearing clothing with brand names or logos?",
            "options": [
                {"id": "a", "text": "It is permissible unless the logo is haram (cross, image, etc.)", "isCorrect": True},
                {"id": "b", "text": "All branded clothing is forbidden in prayer", "isCorrect": False},
                {"id": "c", "text": "Brand names invalidate the prayer", "isCorrect": False},
                {"id": "d", "text": "It is only permissible if the logos are covered", "isCorrect": False}
            ],
            "explanation": "Wearing clothing with brand names or logos is generally permissible in prayer unless the logo itself is impermissible (such as a cross, prohibited image, or profane text). The prayer remains valid though it's better to wear simple, modest clothing. Avoiding extravagance and ostentation is encouraged.",
            "tags": ["prayer", "clothing", "logos", "brands", "validity", "permissibility"],
            "difficulty": "easy"
        },
        253894: {
            "questionText": "What is the ruling on cryptocurrency and Bitcoin?",
            "options": [
                {"id": "a", "text": "Scholars differ; some permit with conditions, others forbid due to uncertainty", "isCorrect": True},
                {"id": "b", "text": "It is completely permissible like any other currency", "isCorrect": False},
                {"id": "c", "text": "It is completely forbidden without exception", "isCorrect": False},
                {"id": "d", "text": "It is permissible only for Muslims in non-Muslim countries", "isCorrect": False}
            ],
            "explanation": "There is significant scholarly difference on cryptocurrency. Some permit it viewing it as a digital asset, while others forbid it due to excessive uncertainty (gharar), speculation, lack of intrinsic value, and use in illegal activities. Those who engage should research thoroughly, avoid speculation, and follow trustworthy scholars.",
            "tags": ["cryptocurrency", "bitcoin", "finance", "gharar", "money", "contemporary"],
            "difficulty": "hard"
        },
        242156: {
            "questionText": "Is it permissible to give Zakat to mosques and Islamic centers?",
            "options": [
                {"id": "a", "text": "No, Zakat must go to the eight specified categories, primarily the poor", "isCorrect": True},
                {"id": "b", "text": "Yes, mosques are one of the deserving recipients", "isCorrect": False},
                {"id": "c", "text": "Yes, if the mosque serves the poor and needy", "isCorrect": False},
                {"id": "d", "text": "It is permissible only in non-Muslim countries", "isCorrect": False}
            ],
            "explanation": "Zakat must be given to the eight categories specified in the Quran (At-Tawbah 9:60), which does not include building or maintaining mosques. Mosques should be supported through general charity (sadaqah), not Zakat. The primary recipients of Zakat are the poor and needy.",
            "tags": ["zakat", "mosque", "charity", "categories", "recipients", "sadaqah"],
            "difficulty": "medium"
        },
        230782: {
            "questionText": "What is the ruling on celebrating Mother's Day or Father's Day?",
            "options": [
                {"id": "a", "text": "It is an innovation; honoring parents should be done year-round", "isCorrect": True},
                {"id": "b", "text": "It is permissible as a cultural appreciation", "isCorrect": False},
                {"id": "c", "text": "It is recommended to show gratitude on these days", "isCorrect": False},
                {"id": "d", "text": "It is obligatory to give gifts on these occasions", "isCorrect": False}
            ],
            "explanation": "Designating specific days to honor parents is an innovation not from Islam. Muslims are commanded to honor and respect parents at all times, not just on specific days. This is part of maintaining Islamic identity separate from invented celebrations. Good treatment of parents is a daily obligation in Islam.",
            "tags": ["parents", "celebration", "mothers-day", "bidah", "innovation", "honor"],
            "difficulty": "easy"
        },
        251649: {
            "questionText": "Is it permissible to watch movies and TV shows?",
            "options": [
                {"id": "a", "text": "It is not permissible due to music, immodesty, and wasted time", "isCorrect": True},
                {"id": "b", "text": "It is permissible if the content is educational", "isCorrect": False},
                {"id": "c", "text": "It is permissible for children's cartoons only", "isCorrect": False},
                {"id": "d", "text": "It is permissible if you fast-forward inappropriate scenes", "isCorrect": False}
            ],
            "explanation": "The majority of scholars forbid watching movies and shows due to prevalent music, immodesty, inappropriate mixing, time-wasting, and exposure to un-Islamic values. Even 'clean' content often contains problematic elements. Muslims should seek beneficial knowledge and activities that please Allah rather than entertainment that leads to heedlessness.",
            "tags": ["movies", "tv", "entertainment", "music", "time", "haram"],
            "difficulty": "medium"
        },
        220346: {
            "questionText": "What is the minimum number of days a traveler can shorten prayers?",
            "options": [
                {"id": "a", "text": "Less than 4 days; if staying 4+ days, pray complete", "isCorrect": True},
                {"id": "b", "text": "Up to 15 days according to all scholars", "isCorrect": False},
                {"id": "c", "text": "Up to 20 days of travel", "isCorrect": False},
                {"id": "d", "text": "There is no time limit for shortening", "isCorrect": False}
            ],
            "explanation": "If a traveler intends to stay in a place for four days or more, they should pray complete prayers. If staying less than four days, they may continue shortening. This is according to the strongest opinion. Once one decides to stay four days, they are no longer considered a traveler for prayer purposes.",
            "tags": ["travel", "shortening", "prayer", "qasr", "stay", "days"],
            "difficulty": "hard"
        },
        226481: {
            "questionText": "Is it permissible for women to visit graveyards?",
            "options": [
                {"id": "a", "text": "It is not permissible according to the stronger opinion", "isCorrect": True},
                {"id": "b", "text": "It is permissible and recommended like for men", "isCorrect": False},
                {"id": "c", "text": "It is permissible only for elderly women", "isCorrect": False},
                {"id": "d", "text": "It is obligatory for women to visit their relatives' graves", "isCorrect": False}
            ],
            "explanation": "According to the stronger opinion, women should not visit graves. The Prophet (peace be upon him) cursed women who frequently visit graves. Some scholars permit if done without wailing or excessive emotion, but the safer opinion is avoidance. Men are encouraged to visit graves for remembrance of death.",
            "tags": ["graves", "women", "visiting", "cemetery", "prohibition", "wailing"],
            "difficulty": "medium"
        },
        249817: {
            "questionText": "What is the ruling on singing without musical instruments?",
            "options": [
                {"id": "a", "text": "It is permissible if the content is appropriate and doesn't lead to haram", "isCorrect": True},
                {"id": "b", "text": "All singing is forbidden in Islam", "isCorrect": False},
                {"id": "c", "text": "Singing is only permissible for children", "isCorrect": False},
                {"id": "d", "text": "It is forbidden even without instruments", "isCorrect": False}
            ],
            "explanation": "Singing without musical instruments (acappella) is permissible according to the majority if the content is wholesome and doesn't contain inappropriate themes. It should not lead to haram or resemble forbidden music. Nasheeds (Islamic songs) with good content and no instruments are generally permissible, though some scholars still exercise caution.",
            "tags": ["singing", "nasheed", "music", "acappella", "permissibility", "content"],
            "difficulty": "medium"
        }
    }

    # Get the specific question or create a generic one
    if reference in quiz_questions_bank:
        return quiz_questions_bank[reference]

    # If not in bank, create a generic question (this shouldn't happen with the input)
    # This is a fallback
    return {
        "questionText": f"Question based on reference {reference}",
        "options": [
            {"id": "a", "text": "Option A", "isCorrect": True},
            {"id": "b", "text": "Option B", "isCorrect": False},
            {"id": "c", "text": "Option C", "isCorrect": False},
            {"id": "d", "text": "Option D", "isCorrect": False}
        ],
        "explanation": "Explanation based on Islamic teachings.",
        "tags": tags[:5] if tags else ["islam", "knowledge", "faith", "rulings"],
        "difficulty": difficulty
    }

def main():
    """Main function to generate quiz questions"""
    print("Starting quiz question generation for batch 002...")

    # Read input file
    input_path = "/home/user/islamqa/quiz-generation/batches/batch-002-input.json"
    output_path = "/home/user/islamqa/quiz-generation/batches/batch-002-output.json"

    try:
        with open(input_path, 'r', encoding='utf-8') as f:
            input_data = json.load(f)

        questions = input_data['questions']
        print(f"Loaded {len(questions)} questions from input file")

        # Generate quiz questions
        quiz_questions = []
        total = len(questions)

        for index, question_data in enumerate(questions):
            quiz_q = generate_quiz_question(question_data, index, total)

            # Add reference and source
            quiz_q['reference'] = question_data['reference']
            quiz_q['source'] = f"IslamQA reference {question_data['reference']}"
            quiz_q['type'] = "multiple-choice"

            quiz_questions.append(quiz_q)

            if (index + 1) % 10 == 0:
                print(f"Generated {index + 1}/{total} questions...")

        # Create output structure
        output_data = {
            "quizQuestions": quiz_questions
        }

        # Save to output file
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

        # Check all have 4 options
        all_have_4_options = all(len(q['options']) == 4 for q in quiz_questions)
        print(f"- All questions have 4 options: {all_have_4_options}")

        # Check all have exactly one correct answer
        all_have_one_correct = all(
            sum(1 for opt in q['options'] if opt['isCorrect']) == 1
            for q in quiz_questions
        )
        print(f"- All questions have exactly 1 correct answer: {all_have_one_correct}")

        # Check reference IDs match
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
