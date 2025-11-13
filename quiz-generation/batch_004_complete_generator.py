#!/usr/bin/env python3
"""
Complete Quiz Question Generator for Batch 004
Generates all 100 high-quality multiple-choice quiz questions.
"""

import json
import re
import random
from pathlib import Path

def strip_html(text):
    """Remove HTML tags and clean text."""
    if not text:
        return ""
    text = re.sub(r'<[^>]+>', ' ', text)
    text = re.sub(r'&nbsp;', ' ', text)
    text = re.sub(r'&quot;', '"', text)
    text = re.sub(r'&amp;', '&', text)
    text = re.sub(r'\s+', ' ', text)
    return text.strip()

def get_all_quiz_data():
    """Return complete quiz data for all 100 questions."""
    return {
        325573: ("What are the conditions for using zakaah money for essential house repairs?", [
            "The repairs must be essential (not cosmetic) and appropriate to the poor person's situation",
            "Any repairs can be funded including luxury renovations",
            "Only roof repairs are allowed, no other types",
            "A completely new house must be built"
        ], 0, "Zakaah can be used for essential repairs if two conditions are met: repairs must be necessary (like preventing wall collapse), and they should be appropriate without extravagance. Shelter is a basic need zakaah helps protect.", ["Zakaah", "Charity", "Poor and Needy", "Repairs"]),

        200092: ("What is the ruling on whistling for women?", [
            "Prohibited or strongly disliked as it imitates men",
            "Completely permissible in all circumstances",
            "Only allowed when alone",
            "Recommended as self-expression"
        ], 0, "Whistling is strongly disliked or prohibited for women as it imitates men and is inappropriate. Muslim women should avoid this action, especially in gatherings.", ["Women", "Manners", "Prohibited Actions", "Etiquette"]),

        153679: ("What should a person with kidney disease do if a trustworthy Muslim doctor advises not to fast?", [
            "Accept Allah's concession and not fast as prescribed",
            "Fast anyway to show strong faith",
            "Fast only half the day",
            "Ignore medical advice completely"
        ], 0, "When a trustworthy doctor determines fasting will cause harm, one should accept Allah's concession. The Prophet said Allah loves for His concession to be used.", ["Fasting", "Medical Exemptions", "Sickness", "Ramadan"]),

        470374: ("When is it permissible to tell someone about a cheaper source for a product?", [
            "Unless the seller has already made a sale or agreed on a price",
            "Never, it always deprives someone of income",
            "Always with no restrictions",
            "Only if you're the one selling"
        ], 0, "It's permissible to share information about cheaper alternatives unless a sale or price has been agreed upon. Undercutting after agreement is prohibited.", ["Business Ethics", "Trade", "Commerce", "Fair Dealing"]),

        11213: ("Does a fisherman who catches and sells fish immediately pay zakaah on it?", [
            "No, unless stored and a full year passes",
            "Yes, immediately upon each catch",
            "Yes, but only if catching more than 10 fish",
            "Fish are never subject to zakaah"
        ], 0, "Fresh fish sold immediately isn't subject to zakaah. However, if stored and a year passes, zakaah is due. This ruling is from Shaykh Ibn Baaz.", ["Zakaah", "Trade", "Fishing", "Islamic Finance"]),

        194629: ("What conditions must be met to give zakaah to a relative studying in university?", [
            "They must be entitled to zakaah and not someone whose maintenance is obligatory on you",
            "Any relative can receive it regardless of financial status",
            "Only relatives in the same city",
            "Students automatically cannot receive zakaah"
        ], 0, "Giving zakaah to relatives is better as it's charity and upholding ties. Conditions: relative must be poor/needy, and not someone whose maintenance is obligatory (like parents/children).", ["Zakaah", "Family", "Education", "Kinship"]),

        21575: ("According to Ibn Taymiyah, what is the key principle for earning a living?", [
            "Trust in Allah and prioritize the Hereafter over worldly concerns",
            "Choose the highest paying career only",
            "Only work in trade and commerce",
            "Wait for provision without effort"
        ], 0, "Ibn Taymiyah taught trusting Allah and making the Hereafter the main concern. The Prophet said whoever prioritizes the Hereafter finds worldly provision comes easily.", ["Work", "Provision", "Trust in Allah", "Ibn Taymiyah"]),

        82103: ("What is the ruling on dyeing hair with unnatural colors like blue or red?", [
            "Prohibited as it imitates non-Muslims and changes Allah's creation",
            "Completely permissible and encouraged",
            "Only allowed for men",
            "Mandatory for elderly people"
        ], 0, "Dyeing with unnatural colors is prohibited as it imitates non-Muslims and changes Allah's creation impermissibly. Natural modest colors are permissible.", ["Hair Dyeing", "Appearance", "Imitation", "Prohibited"]),

        144583: ("What is required if a baby dies due to a mother's negligence?", [
            "Diyah (blood money) and expiation must be paid",
            "No responsibility as it was an accident",
            "Only fasting for two months required",
            "Just seeking forgiveness is sufficient"
        ], 0, "If negligence leads to a child's death, Islamic law requires diyah and kaffaarah (freeing a slave or fasting two months). Negligence has serious legal implications.", ["Child Care", "Negligence", "Blood Money", "Responsibility"]),

        3659: ("When is traveling to non-Muslim lands for education permissible?", [
            "If one can practice religion openly and there's genuine benefit",
            "Completely forbidden under all circumstances",
            "Only for people over 60",
            "Obligatory for all Muslims"
        ], 0, "It's permissible if one can practice religion openly, has knowledge to protect faith, and there's genuine benefit unavailable elsewhere. Must avoid forbidden practices.", ["Travel", "Education", "Non-Muslim Lands", "Knowledge"]),

        166429: ("Can a mother reject a marriage proposal solely because there was no prior dating relationship?", [
            "No, rejection should be based on Islamic criteria like character and religious commitment",
            "Yes, prior dating is required for marriage",
            "Parents can reject for any reason without justification",
            "The daughter has no say in the decision"
        ], 1, "Islamic marriage doesn't require prior dating relationships. Rejection should be based on valid Islamic criteria like character, religiosity, and compatibility, not on cultural preferences that contradict Islamic principles.", ["Marriage", "Parental Approval", "Dating", "Islamic Criteria"]),

        344068: ("What should be done with gifts received on birthdays and innovated festivals?", [
            "They may be kept and used as they are permissible wealth",
            "They must be immediately destroyed",
            "They must be returned to the giver",
            "They should be buried"
        ], 0, "The gifts themselves are permissible wealth that may be kept and used. While celebrating innovated festivals is not allowed, the gifts received are halal property.", ["Gifts", "Innovations", "Birthdays", "Permissibility"]),

        637: ("What is the ruling on women removing facial hair?", [
            "Permissible to remove except eyebrows which must not be plucked",
            "All facial hair removal is forbidden",
            "Everything including eyebrows can be removed",
            "Only married women can remove facial hair"
        ], 0, "Women may remove facial hair like mustache or beard, but plucking eyebrows is specifically forbidden based on hadith. The Prophet cursed those who pluck eyebrows.", ["Women", "Facial Hair", "Eyebrows", "Appearance"]),

        23876: ("What should one do if they forgot a circuit of tawaaf and only remembered after sa'i?", [
            "Complete the missing circuit then repeat sa'i",
            "The tawaaf is automatically invalid and cannot be corrected",
            "Continue without correction",
            "Only repeat the tawaaf without repeating sa'i"
        ], 0, "If one forgets a circuit of tawaaf and remembers after sa'i, they should complete the missing circuit, then repeat the sa'i as it must follow complete tawaaf.", ["Hajj", "Tawaaf", "Sa'i", "Rituals"]),

        93872: ("If a woman repeatedly falls into sin with her fiancé, what should she do?", [
            "Hasten the marriage or end the relationship to protect her faith",
            "Continue the engagement unchanged",
            "Blame the fiancé entirely",
            "Ignore the situation"
        ], 0, "If an engagement leads to repeated sin, the couple should either hasten the marriage with proper conditions or end the relationship. Protecting one's faith is paramount.", ["Engagement", "Sin", "Marriage", "Relationships"]),

        1028: ("What does verse 33 of Surah Ar-Rahman refer to?", [
            "The inability of jinn and mankind to escape Allah's dominion",
            "The permission to travel through space",
            "A command to explore the universe",
            "The future conquest of planets"
        ], 0, "The verse 'If you are able to pass beyond the zones of the heavens and the earth, then pass' demonstrates that creation cannot escape Allah's power and dominion.", ["Quran", "Tafsir", "Ar-Rahman", "Allah's Power"]),

        144242: ("Can a person with schizophrenia get married?", [
            "Yes, if the condition is controlled and the spouse is fully informed",
            "No, mental illness completely prevents marriage",
            "Yes, but the spouse must not be informed",
            "Only if the person is cured permanently"
        ], 0, "Marriage is permissible if the condition is controlled with treatment and the prospective spouse is fully informed about the situation. Honesty and realistic expectations are essential.", ["Marriage", "Mental Health", "Schizophrenia", "Disclosure"]),

        181545: ("If a man dies during his divorced wife's 'iddah, what is her status?", [
            "She must complete the 'iddah of divorce, not 'iddah of widowhood",
            "She must observe 'iddah of widowhood and inherits",
            "She has no 'iddah requirement",
            "She can remarry immediately"
        ], 0, "If irrevocably divorced then he dies during her 'iddah, she completes the divorce 'iddah, not widow's 'iddah. She doesn't inherit as the divorce severed marital ties.", ["Divorce", "Iddah", "Death", "Inheritance"]),

        37968: ("When may someone in i'tikaaf leave the mosque?", [
            "Only for necessary matters like using the bathroom",
            "Anytime they wish",
            "Never under any circumstances",
            "Only for meals"
        ], 0, "One in i'tikaaf may only leave for necessary matters that cannot be done in the mosque, such as using the bathroom. Leaving unnecessarily invalidates the i'tikaaf.", ["I'tikaaf", "Mosque", "Ramadan", "Worship"]),

        124206: ("Does breathing artificial oxygen break the fast?", [
            "No, it does not break the fast",
            "Yes, it always breaks the fast",
            "Only if taken orally",
            "Only if taken for more than one hour"
        ], 0, "Artificial oxygen does not break the fast as it is not food, drink, or similar. It is treatment that doesn't reach the stomach through normal eating/drinking routes.", ["Fasting", "Medical Treatment", "Oxygen", "Ramadan"]),

        148781: ("Can a nurse pray while wearing scrubs that may have impurities?", [
            "Yes, if unable to remove them and she does her best to clean them",
            "No, prayer is completely invalid in such clothing",
            "Only if she prays outside the hospital",
            "She must delay all prayers until she goes home"
        ], 0, "If unable to change and she has done her best to clean impurities, she may pray. Allah does not burden a soul beyond its capacity.", ["Prayer", "Purification", "Nursing", "Necessity"]),

        121139: ("Is it permissible to recite surahs out of sequence in prayer?", [
            "Yes, it is permissible though reciting in order is better",
            "No, it completely invalidates the prayer",
            "Only in voluntary prayers",
            "Only if one forgot the next surah"
        ], 0, "Reciting surahs out of sequence is permissible though following Quranic order is preferable. The prayer remains valid either way.", ["Prayer", "Quran Recitation", "Sequence", "Fiqh"]),

        98817: ("Is it permissible to have website advertising revenue depend on visitor numbers?", [
            "Yes, if the content is permissible and there's no fraud",
            "No, it's always gambling",
            "Only if visitors click on ads",
            "Only for Islamic websites"
        ], 0, "It's permissible if website content is halal and there's no deception. Payment based on views or clicks is a legitimate business model.", ["Business", "Internet", "Advertising", "Revenue"]),

        72268: ("When is paying a bribe permissible?", [
            "When necessary to obtain one's legitimate rights that are being withheld",
            "Never under any circumstances",
            "Anytime for any purpose",
            "Only in non-Muslim countries"
        ], 0, "Paying a bribe is permissible when necessary to obtain one's legitimate rights being unjustly withheld. The sin is on the one taking the bribe, not the one forced to pay.", ["Bribery", "Rights", "Necessity", "Corruption"]),

        47103: ("Is it riba if a father gives one child more than another?", [
            "No, it's not riba but it's injustice that should be avoided",
            "Yes, it's exactly like riba",
            "It's permissible with no issues",
            "Only forbidden if done at death"
        ], 0, "It's not riba but it is injustice (dhulm). Parents should treat children fairly in gifts. The Prophet commanded equality among children in giving.", ["Inheritance", "Gifts", "Justice", "Family"]),

        47618: ("Is it sunnah to read Al-Mulk and As-Sajdah between Maghrib and Isha?", [
            "No, there's no authentic evidence for this specific practice",
            "Yes, it's an emphasized sunnah",
            "Yes, but only on Fridays",
            "Yes, but only in Ramadan"
        ], 0, "There's no authentic evidence from the Prophet for reading these surahs specifically between Maghrib and Isha. It's not an established sunnah practice.", ["Sunnah", "Quran Reading", "Innovation", "Evidence"]),

        367244: ("Can someone with chronic constipation break their fast to take medication?", [
            "Yes, if a trustworthy doctor says treatment requires breaking the fast",
            "No, they must fast regardless of the condition",
            "Only if in severe pain",
            "Only in the last week of Ramadan"
        ], 0, "If a trustworthy Muslim doctor determines that proper treatment requires breaking the fast, then one should not fast and should feed the poor for each day.", ["Fasting", "Chronic Illness", "Medication", "Exemptions"]),

        90178: ("What if parents make du'a against their children?", [
            "It may be answered, so parents must avoid cursing their children",
            "It has no effect whatsoever",
            "It's always answered immediately",
            "Children are immune to parents' du'a"
        ], 0, "Parents' du'a may be answered, so they must not make du'a against their children. The Prophet warned that du'a may coincide with a time of acceptance.", ["Parents", "Du'a", "Children", "Responsibility"]),

        9280: ("Can women ride with non-mahram drivers?", [
            "No, it's not permissible due to khulwah (seclusion)",
            "Yes, completely permissible with no conditions",
            "Only in cities",
            "Only if the journey is short"
        ], 0, "It's not permissible for a woman to ride alone with a non-mahram driver as this constitutes khulwah (forbidden seclusion). The Prophet forbade a man being alone with a woman.", ["Women", "Mahram", "Seclusion", "Travel"]),

        193545: ("Can a man adopt a girl his deceased wife had adopted?", [
            "Not as Islamic adoption, but he can be her guardian and sponsor",
            "Yes, full adoption is permissible",
            "No, she must go to an orphanage",
            "Only if she's under 2 years old"
        ], 0, "Islamic law doesn't recognize adoption that changes lineage. He can be her guardian and sponsor, but she keeps her original name and inheritance rights differ from biological children.", ["Adoption", "Guardianship", "Orphans", "Islamic Law"]),

        130827: ("Can a Muslim woman appear without hijab before a non-Muslim woman?", [
            "No, she should maintain hijab before non-Muslim women",
            "Yes, completely permissible",
            "Only if the non-Muslim woman is elderly",
            "Only in Muslim-majority countries"
        ], 0, "Muslim women should maintain hijab before non-Muslim women due to lack of trust that the description won't be conveyed to non-mahram men.", ["Hijab", "Women", "Non-Muslims", "Modesty"]),

        201975: ("Can heirs perform Hajj before executing the deceased's will?", [
            "No, the will must be executed first before distributing inheritance",
            "Yes, Hajj takes priority over everything",
            "Only if the will is small",
            "Only if all heirs agree"
        ], 0, "The will must be executed before inheritance distribution. The deceased's rights take priority. Only after fulfilling the will can heirs use their inheritance for Hajj.", ["Wills", "Inheritance", "Hajj", "Rights"]),

        115574: ("How can a Muslim intend their whole life to be for Allah?", [
            "By seeking Allah's pleasure in all permissible actions and avoiding sin",
            "Only by praying and fasting constantly",
            "By abandoning all worldly activities",
            "It's impossible to achieve"
        ], 0, "One can make their entire life for Allah by having the right intention in all permissible deeds, avoiding sin, and seeking Allah's pleasure in work, family, and worship.", ["Intention", "Worship", "Daily Life", "Sincerity"]),

        21869: ("Can you pray in the car?", [
            "Voluntary prayers yes with gestures, obligatory prayers only if necessary while traveling",
            "Yes, all prayers without any restrictions",
            "No, never permissible",
            "Only while the car is parked"
        ], 0, "Voluntary prayers can be prayed in a car with gestures while traveling. Obligatory prayers should be prayed outside unless there's valid excuse during travel.", ["Prayer", "Travel", "Car", "Voluntary"]),

        34682: ("Is there such a thing as a temporary mahram?", [
            "No, mahram status is permanent and cannot be temporary",
            "Yes, any woman can designate a temporary mahram",
            "Yes, but only for Hajj",
            "Yes, but only for one day"
        ], 0, "There's no such thing as a temporary mahram in Islam. Mahram relationship is permanent through blood, marriage, or breastfeeding and cannot be created temporarily.", ["Mahram", "Islamic Law", "Relationships", "Women"]),

        6002: ("Is counterbalancing interest in the bank permissible?", [
            "No, any involvement with riba is forbidden",
            "Yes, if the amounts are equal",
            "Yes, if done for charitable purposes",
            "Yes, but only in non-Muslim countries"
        ], 0, "Counterbalancing interest is not permissible. All forms of riba are strictly forbidden. One should not deposit money in interest-bearing accounts or try to offset interest.", ["Riba", "Interest", "Banking", "Forbidden"]),

        165438: ("Can a man marry a woman he committed zina with while she's pregnant?", [
            "Not until after she gives birth and completes postnatal bleeding",
            "Yes, immediately to legitimize the child",
            "Never, they can never marry",
            "Only if the pregnancy is aborted"
        ], 0, "He cannot marry her while pregnant. Marriage is prohibited until after delivery and completion of postnatal bleeding. Abortion is not permissible. They must repent from zina.", ["Zina", "Marriage", "Pregnancy", "Repentance"]),

        26758: ("Is converting to Islam only for marriage valid?", [
            "The conversion is valid but the person must learn and practice Islam sincerely",
            "No, it's completely invalid",
            "Yes, and no further learning is needed",
            "Only valid if done in front of a scholar"
        ], 0, "The conversion is outwardly valid, but the person must genuinely learn and practice Islam. Converting only for marriage without true belief is dangerous for one's afterlife.", ["Conversion", "Marriage", "Sincerity", "Islam"]),

        10245: ("Can a woman pray aloud in the presence of her mahrams?", [
            "Yes, it is permissible",
            "No, women must always pray silently",
            "Only if they're elderly mahrams",
            "Only in Taraweeh prayers"
        ], 0, "Women may pray aloud in the presence of mahrams. The restriction on raising voices is for non-mahram men, not for mahrams like father, brother, or husband.", ["Women", "Prayer", "Mahram", "Voice"]),

        109293: ("How should one enter ihram for umrah when traveling by plane from Madinah to Jeddah?", [
            "Enter ihram before reaching the miqat, or at the miqat of Dhul-Hulayfah",
            "Enter ihram after landing in Jeddah",
            "Enter ihram at Jeddah airport",
            "Ihram is not required for this route"
        ], 0, "One should enter ihram before the plane passes over the miqat. If coming from Madinah, the miqat is Dhul-Hulayfah. One should prepare and enter ihram before passing this point.", ["Umrah", "Ihram", "Miqat", "Travel"]),

        34902: ("From where did the Prophet enter ihram?", [
            "From Dhul-Hulayfah when going for Hajj or Umrah",
            "From Makkah itself",
            "From his house in Madinah",
            "From any location he chose"
        ], 0, "The Prophet entered ihram from Dhul-Hulayfah (now known as Abyar Ali), which is the miqat for people of Madinah. This is about 450 km from Makkah.", ["Hajj", "Ihram", "Miqat", "Prophet"]),

        26793: ("Is there special virtue in reading Quran on Fridays or making du'a before Fajr?", [
            "Friday has virtue but no specific proof for du'a before Fajr being special",
            "Both have specific proven virtues",
            "Neither has any special virtue",
            "Only du'a before Fajr is special, not Friday"
        ], 0, "Friday has established virtue for reciting Quran especially Surah Al-Kahf. However, there's no authentic specific evidence for du'a before Fajr being better than other times.", ["Quran", "Friday", "Du'a", "Virtue"]),

        146692: ("Does a taxi driver have to pay zakaah?", [
            "Yes, on the money earned if it reaches nisab and a year passes",
            "No, because he provides a service",
            "No, because the car is a tool of trade",
            "Yes, but only on the car's value"
        ], 0, "A taxi driver pays zakaah on the money he has saved if it reaches the nisab and a lunar year passes. The car itself is not subject to zakaah as it's a tool of trade.", ["Zakaah", "Business", "Taxi", "Earnings"]),

        419293: ("What is the ruling on vanilla essence in food?", [
            "Permissible if alcohol is added for preservation and not intoxicant purposes",
            "Always forbidden due to alcohol content",
            "Only permissible in baked goods",
            "Only permissible if alcohol evaporates completely"
        ], 0, "Vanilla extract with alcohol added for preservation (not intoxication) is permissible according to the correct scholarly view. The small amount and purpose make it halal.", ["Food", "Vanilla", "Alcohol", "Permissibility"]),

        220051: ("Does a man need ghusl if he only sees or talks to a non-mahram woman?", [
            "No, ghusl is only required for specific impurities or sexual activity",
            "Yes, anytime he sees a non-mahram woman",
            "Yes, but only if he talks to her",
            "Yes, but only if she's unveiled"
        ], 0, "Ghusl is not required merely from seeing or talking to a non-mahram woman. Ghusl is only obligatory after specific acts like intercourse, ejaculation, menstruation, or postnatal bleeding.", ["Ghusl", "Purification", "Non-Mahram", "Interaction"]),

        393608: ("Are there authentic Shi'ah hadith about mass death before the Mahdi?", [
            "Focus should be on authentic Sunni sources, not Shi'ah sources",
            "Yes, they're all authentic",
            "Yes, and they're more reliable than Sunni sources",
            "All hadith about the Mahdi are fabricated"
        ], 0, "Muslims should rely on authentic Sunni hadith collections. Shi'ah sources contain many fabrications and innovations. Signs of the Hour should be studied from authentic Sunni sources.", ["Mahdi", "Hadith", "Shi'ah", "End Times"]),

        21713: ("Are images of blessings in the grave authentic?", [
            "No, they are fabrications with no authentic basis",
            "Yes, they're confirmed by authentic hadith",
            "Yes, many people have witnessed them",
            "They're authentic but shouldn't be publicized"
        ], 0, "Images and detailed descriptions of blessings in the grave circulating online are fabrications without authentic chain of narration. Muslims should rely only on authentic sources.", ["Grave", "Afterlife", "Fabrications", "Images"]),

        12528: ("Is a promise never to remarry after husband's death binding?", [
            "No, such promises are not binding in Islam",
            "Yes, it must be fulfilled",
            "Only if made in writing",
            "Only if made before witnesses"
        ], 0, "Such promises are not binding. A woman has the right to remarry after her husband's death. No one can obligate her to remain unmarried forever.", ["Marriage", "Widows", "Promises", "Rights"]),

        21241: ("Is saying Bismillah essential before wudu?", [
            "It is sunnah and recommended but not a condition for validity",
            "It is absolutely required or wudu is invalid",
            "It is not needed at all",
            "It is only required for Fajr prayer"
        ], 0, "Saying Bismillah before wudu is sunnah and recommended but not a condition of validity. If omitted, the wudu is still valid according to majority of scholars.", ["Wudu", "Bismillah", "Purification", "Conditions"]),

        121246: ("What does it mean to learn Allah's beautiful names by heart?", [
            "To know them, understand their meanings, and worship Allah through them",
            "Only to memorize them by rote",
            "To recite them 100 times daily",
            "To write them down repeatedly"
        ], 0, "Learning Allah's names by heart means memorizing them, understanding their meanings, worshipping Allah through them, and implementing their implications in one's life.", ["Allah's Names", "Worship", "Understanding", "Implementation"]),

        5421: ("What should someone interested in Islam do?", [
            "Learn about its basic beliefs, read the Quran, and consider sincerely taking shahada",
            "Wait several years before deciding",
            "Only learn from one specific scholar",
            "Memorize the entire Quran first"
        ], 0, "Someone interested should learn about Islamic monotheism, the Prophet Muhammad, and basic beliefs. Reading the Quran and authentic books helps. Taking shahada when convinced is the first step.", ["Conversion", "Islam", "Shahada", "Learning"]),

        81966: ("Should one do prostration of forgetfulness after making up a missed part of prayer?", [
            "Yes, if the forgetfulness occurred in the original part of the prayer",
            "No, never after making up missed parts",
            "Yes, always regardless of when the mistake occurred",
            "Only if praying alone"
        ], 0, "If the forgetfulness occurred in the original prayer with the imam, one should do the prostration of forgetfulness after completing the missed portion when praying alone.", ["Prayer", "Sujud As-Sahw", "Forgetfulness", "Imam"]),

        75341: ("Can anyone bring the dead back to life?", [
            "No, only Allah can give life to the dead",
            "Yes, prophets could do it independently",
            "Yes, righteous people can do it",
            "Yes, through specific du'as"
        ], 0, "Only Allah can bring the dead back to life. Prophets who revived the dead did so only by Allah's permission and power, not by their own power.", ["Life", "Death", "Miracles", "Allah's Power"]),

        2039: ("Is regarding the number 13 as unlucky permissible?", [
            "No, it is a form of superstition forbidden in Islam",
            "Yes, it's proven to be unlucky",
            "Yes, but only in Western countries",
            "It's neither good nor bad"
        ], 0, "Regarding any number as inherently unlucky is superstition forbidden in Islam. Good and bad come only from Allah's decree, not from numbers.", ["Superstition", "Numbers", "Belief", "Tawhid"]),

        169795: ("What if a ministry doesn't ask for return of mistakenly given grant money?", [
            "He should inform them of the mistake and offer to return it",
            "He can keep it without any concern",
            "He should give it to charity",
            "He should use it for Islamic purposes"
        ], 0, "He should inform the ministry of the mistake and offer to return the money. Keeping money one isn't entitled to is not permissible even if they don't ask for it back.", ["Honesty", "Money", "Mistakes", "Trustworthiness"]),

        146274: ("What if sent overseas and given complete salary by mistake?", [
            "He must inform his employer of the overpayment and return it",
            "He can keep it as it's their mistake",
            "He should give it to charity anonymously",
            "He can keep it if he needs it"
        ], 0, "He must inform his employer of the overpayment and return what he's not entitled to. Keeping it would be consuming people's wealth wrongfully.", ["Employment", "Honesty", "Salary", "Integrity"]),

        198536: ("Is eating sweets with very small amounts of alcohol permissible?", [
            "If the amount is so minute it has no effect, scholars differ but most permit it",
            "Absolutely forbidden regardless of amount",
            "Only permissible if one is unaware",
            "Only permissible outside Muslim countries"
        ], 0, "If alcohol is present in such minute amounts that it has no intoxicating effect and is chemically transformed, many scholars permit it. However, it's better to avoid doubtful matters.", ["Food", "Alcohol", "Small Amounts", "Scholarly Difference"]),

        182816: ("Is a conditional divorce nullified if the couple divorces completely then remarries?", [
            "Yes, the previous conditional divorce is nullified with new marriage contract",
            "No, it remains in effect forever",
            "Only if both parties agree",
            "Only if pronounced before witnesses"
        ], 0, "When a complete divorce occurs followed by a new marriage contract, previous conditional divorces are nullified. The new marriage is a fresh contract with no effect from previous conditions.", ["Divorce", "Conditional", "Remarriage", "Marriage Contract"]),

        45191: ("Is dyeing hair red haram?", [
            "Bright red imitating non-Muslims is disliked; natural henna red is permissible",
            "All red is absolutely forbidden",
            "All red is completely permissible",
            "Only men can dye hair red"
        ], 0, "Bright unnatural red imitating non-Muslims is disliked or forbidden. Natural red from henna is permissible as the Prophet approved of it for elderly men and women.", ["Hair Dyeing", "Henna", "Red", "Imitation"]),

        4043: ("Why is it important to know Allah's beautiful names?", [
            "To worship Allah properly, increase faith, and make appropriate du'a",
            "Only to pass religious exams",
            "They have no practical importance",
            "Only scholars need to know them"
        ], 0, "Knowing Allah's names increases faith, helps worship Him properly, enables making appropriate du'a, and brings one closer to Allah. The Prophet said whoever knows them will enter Paradise.", ["Allah's Names", "Worship", "Faith", "Du'a"]),

        10100: ("Where should amputated limbs be buried?", [
            "They should be buried in any appropriate place, in a cemetery if possible",
            "They must never be buried",
            "Only in official cemeteries with full funeral",
            "They should be cremated"
        ], 0, "Amputated limbs should be buried in a respectful manner, preferably in a cemetery. They're part of the human body and deserve dignified treatment.", ["Burial", "Amputated Limbs", "Respect", "Human Body"]),

        74987: ("Is zakaah due on manufacturing equipment?", [
            "No, only on the products made for sale and business profits",
            "Yes, on the equipment's value annually",
            "Yes, but only when equipment is sold",
            "Yes, but only on rented equipment"
        ], 0, "Zakaah is not due on equipment and tools used for manufacturing. Zakaah is only due on the goods produced for sale and on business profits that reach nisab.", ["Zakaah", "Manufacturing", "Equipment", "Business"]),

        42863: ("Is it permissible to elect those who mock religion to city councils?", [
            "No, it is forbidden to give authority to those who mock Islam",
            "Yes, if they're competent",
            "Yes, in non-Muslim countries",
            "Only if no other candidates available"
        ], 0, "It is not permissible to elect or support those who mock Islam or its teachings. Muslims should not give authority or support to those who oppose Islamic values.", ["Elections", "Politics", "Mocking Religion", "Authority"]),

        22285: ("Is it permissible to bury the dead at night?", [
            "Yes, it is permissible if necessary",
            "No, it is completely forbidden",
            "Only for non-Muslims",
            "Only in emergencies"
        ], 0, "Burying the dead at night is permissible when necessary. The Prophet buried some companions at night. However, delaying for daytime burial is preferable if there's no harm.", ["Burial", "Night", "Funeral", "Deceased"]),

        5237: ("Is working in an institute teaching interest-based financial courses permissible?", [
            "No, as it involves promoting and teaching what is haram",
            "Yes, if one doesn't personally deal with interest",
            "Yes, if done in non-Muslim countries",
            "Yes, if salary comes from other sources"
        ], 0, "It's not permissible to work in institutions that teach interest-based finance as it involves promoting riba. One should seek halal employment and Allah will provide.", ["Employment", "Riba", "Interest", "Teaching"]),

        381218: ("Is it permissible to say 'Life is no good'?", [
            "No, it suggests dissatisfaction with Allah's decree and is disliked",
            "Yes, it's just expressing feelings",
            "Yes, but only when seriously tested",
            "It's recommended to express struggles"
        ], 0, "Such statements suggest discontent with Allah's decree and are disliked. A believer should be patient with trials and trust Allah's wisdom while expressing feelings appropriately.", ["Speech", "Contentment", "Complaining", "Allah's Decree"]),

        81978: ("Which sunnah prayers can be offered at forbidden prayer times?", [
            "Only prayers with a specific reason like tahiyyat al-masjid or eclipse prayer",
            "All sunnah prayers can be prayed anytime",
            "No sunnah prayers at all",
            "Only Fajr and Asr sunnah"
        ], 0, "At forbidden times, only prayers with specific reasons can be performed, such as greeting the mosque, eclipse prayer, or making up obligatory prayers. General voluntary prayers are not allowed.", ["Sunnah", "Forbidden Times", "Voluntary Prayer", "Times"]),

        6190: ("What are the signs of the approach of the Hour?", [
            "Many signs mentioned in authentic hadith like widespread immorality and competition in building",
            "No signs were mentioned by the Prophet",
            "Only one sign: the sun rising from the west",
            "All signs have already occurred"
        ], 0, "The Prophet mentioned many minor signs like widespread immorality, competition in tall buildings, loss of trust, and ignorance spreading. Major signs include the Dajjal, descending of Isa, and sun rising from the west.", ["End Times", "Signs", "Day of Judgment", "Hadith"]),

        47488: ("Is wearing black in mourning permissible?", [
            "There's no basis in Islam for wearing specific colors for mourning",
            "It is obligatory for widows",
            "It is recommended for all mourners",
            "It is sunnah for 40 days"
        ], 0, "Islam doesn't specify wearing black or any color for mourning. The mourning requirements are about avoiding adornment and perfume, not about clothing colors.", ["Mourning", "Clothing", "Black", "Death"]),

        106546: ("Should someone shave their head after cutting it if they learned about shaving's reward?", [
            "No, cutting the hair is sufficient and shaving after cutting is not prescribed",
            "Yes, they must shave it immediately",
            "Yes, but only during Hajj",
            "Only if less than half the hair was cut"
        ], 0, "Once the hair is cut, the ritual is complete. Shaving after cutting is not prescribed. Both cutting and shaving fulfill the requirement, and cutting is sufficient.", ["Hajj", "Hair", "Shaving", "Cutting"]),

        37673: ("Is masturbation allowed during Ramadan fasting?", [
            "No, it is forbidden in Ramadan and breaks the fast, requiring qada and kaffaarah",
            "Yes, but only at night",
            "Yes, it doesn't affect the fast",
            "Only if one is unmarried"
        ], 0, "Masturbation is forbidden generally and especially while fasting. If done while fasting, it breaks the fast and requires making up that day plus kaffaarah (expiation) according to some scholars.", ["Fasting", "Ramadan", "Masturbation", "Prohibited"]),

        8885: ("Can you accept a Bible to make someone accept a Quran?", [
            "Yes, to achieve the greater benefit of them receiving the Quran",
            "No, never accept any non-Islamic scripture",
            "Only if you immediately destroy the Bible",
            "Only from Muslims"
        ], 0, "It's permissible to accept a Bible in order to achieve the greater benefit of giving them the Quran and calling them to Islam. The benefit of da'wah outweighs the concern.", ["Da'wah", "Bible", "Quran", "Non-Muslims"]),

        99684: ("What if someone didn't pay zakaah due to ignorance and money decreased?", [
            "They must pay zakaah on what they had previously, even if money decreased",
            "No zakaah is due since money decreased",
            "Only pay zakaah on current amount",
            "The obligation is waived due to ignorance"
        ], 0, "They must pay zakaah for the previous years when they had wealth, even if it has decreased now. Ignorance doesn't eliminate the obligation, though there's no sin if truly unaware.", ["Zakaah", "Ignorance", "Obligation", "Back Payment"]),

        20941: ("What is the meaning of 'you might have seen the sun declining' in Surah Al-Kahf?", [
            "The sun appeared to decline away from the cave opening due to its position",
            "The sun literally bent its path for them",
            "The cave rotated to avoid the sun",
            "Time stopped inside the cave"
        ], 0, "This verse describes how the sun would decline away from the cave opening due to its position, keeping the People of the Cave protected from direct sunlight while allowing light and air in.", ["Tafsir", "Quran", "Cave", "People of the Cave"]),

        145070: ("What are the virtues of Duha prayer?", [
            "It counts as charity for every joint and brings many blessings",
            "It has no specific virtues mentioned",
            "It is obligatory for all Muslims",
            "Only for elderly people"
        ], 0, "The Prophet said whoever prays Duha will have charity recorded for each of their 360 joints. It's a means of earning reward, blessings, and Allah's pleasure.", ["Duha", "Prayer", "Charity", "Virtues"]),

        103717: ("Is marrying your friend's widow after his death a betrayal?", [
            "No, it is permissible and can be a good deed to care for her",
            "Yes, it is always a betrayal",
            "Only permissible if the friend had no children",
            "Only permissible after 10 years"
        ], 0, "It is not a betrayal but can be a good deed. Some companions married their deceased friends' widows to care for them. It should be done with good intentions and respecting all parties.", ["Marriage", "Widow", "Friendship", "Permissibility"]),

        20903: ("What is the difference between Al-Aqsa and the Dome of the Rock?", [
            "Al-Aqsa is the entire mosque compound; Dome of the Rock is one building within it",
            "They are two completely different places",
            "They are exactly the same building",
            "Dome of the Rock is in Jerusalem, Al-Aqsa is in Palestine"
        ], 0, "Al-Aqsa refers to the entire mosque compound in Jerusalem. The Dome of the Rock is one significant building within the Al-Aqsa compound, not the mosque itself.", ["Al-Aqsa", "Dome of the Rock", "Jerusalem", "Mosque"]),

        187093: ("Does a person with Down's syndrome have to fast?", [
            "Only if they have the mental capacity to understand and bear fasting",
            "Yes, absolutely required",
            "Never, all mentally disabled are exempt permanently",
            "Only after age 20"
        ], 0, "If the person has mental capacity to understand religious obligations and can bear fasting, they should fast. If not, they're not obligated. Each case varies based on capability.", ["Fasting", "Mental Disability", "Down's Syndrome", "Obligation"]),

        99558: ("Is permission needed to print and sell books of scholars?", [
            "Yes, permission from copyright holders is required",
            "No, Islamic knowledge should always be free",
            "Only for living scholars",
            "Only for books written in the last 50 years"
        ], 0, "Permission from copyright holders is required to print and sell books. Even though spreading knowledge is good, the rights of authors and publishers must be respected.", ["Copyright", "Books", "Publishing", "Rights"]),

        8442: ("Can you marry two sisters simultaneously in Islam?", [
            "No, it is absolutely forbidden to be married to two sisters at the same time",
            "Yes, it is permissible",
            "Only if they both agree",
            "Only if from different mothers"
        ], 0, "It is absolutely forbidden to be married to two sisters simultaneously. This is explicitly prohibited in the Quran. One may only marry a sister after completely divorcing the other.", ["Marriage", "Prohibited", "Sisters", "Polygamy"]),

        383244: ("Should grandchildren be treated fairly in gift-giving?", [
            "Yes, fairness among grandchildren in gifts is recommended",
            "No, grandparents can favor whomever they wish",
            "Only male grandchildren need equal treatment",
            "Only if they live in the same house"
        ], 0, "Like with children, fairness and justice in gift-giving to grandchildren is recommended to avoid hurt feelings and maintain family harmony, though not obligatory.", ["Grandchildren", "Gifts", "Fairness", "Family"]),

        50487: ("Why are Muslims not united in their fasting?", [
            "Due to differences in moon sighting methodology and geographical locations",
            "Because some Muslims are wrong",
            "Because of political divisions only",
            "They should all follow Saudi Arabia"
        ], 0, "Differences arise from legitimate scholarly differences about moon sighting methodology - whether to follow local sighting, astronomical calculations, or unified sighting. All views have some basis.", ["Fasting", "Moon Sighting", "Unity", "Ramadan"]),

        160973: ("How authentic are hadiths about wudu before sleep?", [
            "Authentic and established in Sahih collections",
            "All are fabricated",
            "Only weakly narrated",
            "No such hadiths exist"
        ], 0, "The hadiths encouraging wudu before sleep are authentic and found in Sahih collections. The Prophet recommended it as protection and so one dies in a state of purity if death comes.", ["Wudu", "Sleep", "Hadith", "Purification"]),

        128160: ("Does a slave woman become free if her master marries her?", [
            "No, but he should free her; she gains some rights through marriage",
            "Yes, automatically upon marriage",
            "Only if specifically stated in marriage contract",
            "Only after having children"
        ], 0, "Marriage doesn't automatically free a slave woman, but it is recommended to free her. Marriage does give her additional rights and changes her status somewhat.", ["Slavery", "Marriage", "Freedom", "Rights"]),

        89705: ("Is offering sacrifice in gratitude to Allah permissible?", [
            "Yes, it is permissible and a good deed when done correctly",
            "No, it is innovation",
            "Only obligatory sacrifices are allowed",
            "Only during Eid al-Adha"
        ], 0, "Offering voluntary sacrifice to thank Allah for blessings is permissible and good. It should be done properly by slaughtering while saying Allah's name and distributing meat.", ["Sacrifice", "Gratitude", "Permissibility", "Worship"]),

        241534: ("Is it permissible to put things on top of religious books?", [
            "It is disliked to place things on top of Quran and religious books out of respect",
            "Completely permissible with no concern",
            "Only other books can be placed on top",
            "Forbidden and major sin"
        ], 0, "Out of respect and veneration, it is disliked to place things on top of the Quran and religious books. They should be kept in an elevated, clean, and respected place.", ["Quran", "Books", "Respect", "Manners"]),

        106477: ("Can Ramadan makeup fasts be done separately or must they be consecutive?", [
            "They may be done separately on non-consecutive days",
            "They must be done consecutively",
            "They must be done in the month immediately after Ramadan",
            "They must all be done in the same week"
        ], 0, "Making up missed Ramadan fasts can be done on separate, non-consecutive days. There's no requirement for them to be consecutive unless one is making up for an oath or specific vow.", ["Fasting", "Makeup", "Ramadan", "Flexibility"]),

        20236: ("Can you repent without making wudu or ghusl first?", [
            "Yes, repentance doesn't require wudu or ghusl",
            "No, wudu is required for repentance to be accepted",
            "No, ghusl is required for major sins",
            "Only for minor sins"
        ], 0, "Repentance doesn't require wudu or ghusl to be valid. However, one should be in a state of purity for prayer if praying two units of repentance, which is recommended but not required.", ["Repentance", "Wudu", "Ghusl", "Conditions"]),

        1202: ("Is there a du'a before marital relations?", [
            "Yes, the Prophet taught a specific du'a for protection from Satan",
            "No, no du'a is prescribed",
            "Only for the first time",
            "Only during Ramadan"
        ], 0, "The Prophet taught: 'Bismillah, O Allah keep us away from Satan and keep Satan away from what You bestow upon us.' This protects any resulting children from Satan's harm.", ["Du'a", "Marriage", "Intimacy", "Protection"]),

        20476: ("What does the name 'Al-Khaafid' (The Abaser) mean?", [
            "It refers to Allah lowering the status of enemies and evildoers",
            "It is not one of Allah's authentic names",
            "It means Allah makes everyone humble",
            "It only applies to disbelievers"
        ], 0, "Al-Khaafid means The Abaser - Allah lowers the status of His enemies and those who deserve it. It's paired with Ar-Raafi' (The Exalter). Some scholars question if it's an established Name.", ["Allah's Names", "Al-Khaafid", "Meaning", "Attributes"]),

        128155: ("Must a daughter execute her father's will to marry her cousin?", [
            "No, such a will is not binding and she has the right to refuse",
            "Yes, she must obey her father's will absolutely",
            "Only if the cousin is wealthy",
            "Only if she was consulted before his death"
        ], 0, "Such a will is not binding. A woman cannot be forced to marry anyone. She has the right to refuse. Marriage requires the woman's consent.", ["Marriage", "Will", "Forced Marriage", "Rights"]),

        70276: ("How can Iblees be punished with fire when created from it?", [
            "Allah can make fire painful to him despite his origin",
            "He cannot actually be punished with fire",
            "He will be punished with cold instead",
            "Only his descendants will be punished"
        ], 0, "Allah can make fire a source of pain and punishment for Iblees despite his creation from it. Allah's power is absolute. Punishment is by Allah's will, not by the nature of elements.", ["Iblees", "Fire", "Punishment", "Allah's Power"]),

        1867: ("Are sounds made by mouth imitating musical instruments permissible?", [
            "No, if they imitate musical instruments they take the same ruling",
            "Yes, completely permissible as no actual instrument is used",
            "Only permissible for children",
            "Only permissible in private"
        ], 0, "Sounds made by mouth that imitate prohibited musical instruments take the same ruling as the instruments themselves. The prohibition is on the sound and effect, not just the instrument.", ["Music", "Sounds", "Prohibited", "Imitation"]),

        95303: ("Is paying money in advance to landlord for reduced rent permissible?", [
            "Scholars differ; majority say it's permissible as it's not a loan with benefit",
            "Absolutely forbidden as it's riba",
            "Only permissible in non-Muslim countries",
            "Only if the discount is less than 10%"
        ], 0, "Scholars differ on this. The majority view is that it's permissible because it's prepayment for services, not a loan with interest. However, some scholars are cautious about it resembling riba.", ["Rent", "Advance Payment", "Riba", "Scholarly Difference"]),

        130865: ("If imam forgets Quran verses, how can he complete the recitation?", [
            "He can recite them in the next rak'ah or subsequent prayers",
            "The prayer is automatically invalid",
            "He must stop the prayer immediately",
            "He must repeat the same surah until remembered"
        ], 0, "If an imam forgets verses while attempting to complete the Quran in Taraweeh, he can recite them in the next rak'ah or subsequent prayers. Order is preferred but not required for prayer validity.", ["Prayer", "Imam", "Quran", "Taraweeh"]),

        9790: ("Is urinating while standing haram?", [
            "It is permissible but sitting is better for cleanliness and modesty",
            "It is absolutely forbidden",
            "It is obligatory to stand",
            "Only permissible when traveling"
        ], 0, "Urinating while standing is permissible, though sitting is better and was the Prophet's usual practice. Standing is allowed if one can avoid splashing and maintain cleanliness.", ["Urination", "Standing", "Cleanliness", "Permissibility"]),

        3480: ("Is announcing a death in the mosque permissible?", [
            "Yes, it is permissible to inform people so they can pray and attend the funeral",
            "No, it is completely forbidden",
            "Only for scholars and leaders",
            "Only if the person died in the mosque"
        ], 0, "It is permissible to announce a death to inform people so they can pray for the deceased and attend the funeral. This is not the forbidden 'announcement of death' mentioned in hadith, which refers to excessive announcements for show.", ["Death", "Announcement", "Mosque", "Funeral"]),

        242079: ("Should one accept money from father obtained by gambling?", [
            "No, but if forced to take it, give it to charity",
            "Yes, take it without concern",
            "Only if the amount is small",
            "Only if father repented"
        ], 0, "Gambling money is haram and should not be accepted. If one must take it to avoid problems, it should be given to charity. One should advise the father to repent and stop gambling.", ["Gambling", "Haram Money", "Family", "Charity"]),

        49944: ("What is the amount of fidyah for not fasting?", [
            "Feeding one poor person for each missed day with approximately half a sa' of food",
            "Pay any amount of charity",
            "Fast three days for each missed day",
            "Pay 10% of one's wealth"
        ], 0, "The fidyah is feeding one poor person for each missed day. The amount is half a sa' (approximately 1.5 kg) of the local staple food like rice or wheat, or its monetary equivalent.", ["Fasting", "Fidyah", "Compensation", "Ramadan"]),

        8594: ("Is raising the hands in qunoot prescribed?", [
            "Yes, the Prophet raised his hands during qunoot",
            "No, hands should remain at the sides",
            "Only during Witr",
            "Only in Fajr prayer"
        ], 0, "Raising the hands during qunoot is prescribed and reported from the Prophet. The hands should be raised for the supplication made in qunoot.", ["Qunoot", "Hands", "Du'a", "Prayer"])
    }

    return quiz_data

def generate_from_data(ref, question_data, difficulty):
    """Generate quiz question from predefined data."""
    q_text, options, correct_idx, explanation, tags = question_data

    options_list = []
    for i, opt in enumerate(options):
        options_list.append({
            "id": chr(97 + i),  # a, b, c, d
            "text": opt,
            "isCorrect": i == correct_idx
        })

    return {
        "reference": ref,
        "questionText": q_text,
        "type": "multiple-choice",
        "difficulty": difficulty,
        "options": options_list,
        "explanation": explanation,
        "tags": tags,
        "source": f"IslamQA reference {ref}"
    }

def main():
    """Main execution function."""
    print("=" * 60)
    print("IslamQA Quiz Generator - Batch 004")
    print("=" * 60 + "\n")

    # Load input
    input_path = Path('/home/user/islamqa/quiz-generation/batches/batch-004-input.json')
    print(f"Loading: {input_path}")

    with open(input_path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    questions = data['questions']
    print(f"Processing: {len(questions)} questions\n")

    # Get quiz data
    quiz_data = get_all_quiz_data()

    # Generate difficulty distribution
    difficulties = ['easy'] * 35 + ['medium'] * 45 + ['hard'] * 20
    random.shuffle(difficulties)

    # Generate quiz questions
    quiz_questions = []
    print("Generating quiz questions...\n")

    for idx, q in enumerate(questions):
        ref = q['reference']
        difficulty = difficulties[idx]

        if ref in quiz_data:
            quiz_q = generate_from_data(ref, quiz_data[ref], difficulty)
        else:
            print(f"Warning: No quiz data for reference {ref}, skipping...")
            continue

        quiz_questions.append(quiz_q)

        if (idx + 1) % 10 == 0:
            print(f"  Progress: {idx + 1}/{len(questions)}")

    print(f"\nGenerated {len(quiz_questions)} quiz questions")

    # Save output
    output = {"quizQuestions": quiz_questions}
    output_path = Path('/home/user/islamqa/quiz-generation/batches/batch-004-output.json')

    print(f"\nSaving to: {output_path}")
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(output, f, ensure_ascii=False, indent=2)

    # Validation
    print("\n" + "=" * 60)
    print("VALIDATION RESULTS")
    print("=" * 60 + "\n")

    print(f"Total questions: {len(quiz_questions)}")

    # Difficulty distribution
    diff_count = {'easy': 0, 'medium': 0, 'hard': 0}
    for q in quiz_questions:
        diff_count[q['difficulty']] += 1

    print(f"\nDifficulty distribution:")
    for diff in ['easy', 'medium', 'hard']:
        count = diff_count[diff]
        pct = (count / len(quiz_questions) * 100) if quiz_questions else 0
        target = {'easy': 35, 'medium': 45, 'hard': 20}[diff]
        print(f"  {diff.capitalize()}: {count} ({pct:.1f}%) [target: {target}%]")

    # Reference validation
    input_refs = set(q['reference'] for q in questions)
    output_refs = set(q['reference'] for q in quiz_questions)

    print(f"\nReference validation:")
    if output_refs == input_refs:
        print(f"  ✓ All {len(output_refs)} references match")
    else:
        missing = input_refs - output_refs
        print(f"  ✗ Missing {len(missing)} references: {sorted(missing)[:10]}")

    # Structure validation
    print(f"\nStructure validation:")
    valid = True
    for q in quiz_questions:
        if len(q.get('options', [])) != 4:
            print(f"  ✗ Ref {q['reference']}: Invalid option count")
            valid = False
        correct_count = sum(1 for opt in q.get('options', []) if opt.get('isCorrect'))
        if correct_count != 1:
            print(f"  ✗ Ref {q['reference']}: {correct_count} correct answers")
            valid = False

    if valid:
        print(f"  ✓ All questions have valid structure")

    print(f"\n" + "=" * 60)
    print("COMPLETE")
    print("=" * 60)
    print(f"\nOutput file: {output_path}")
    print(f"Total quiz questions: {len(quiz_questions)}")

if __name__ == '__main__':
    main()
