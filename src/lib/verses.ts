// Built-in verse library. Each verse uses a real UUID so it can be stored
// directly in Supabase without hitting a type mismatch on the verse_id column.

export interface Verse {
  id:          string; // UUID format
  reference:   string;
  text:        string;
  translation: string;
  reflection:  string;
}

export const BUILT_IN_VERSES: Verse[] = [
  { id: "00000000-0000-0000-0000-000000000001", reference: "Philippians 4:19", translation: "ESV",
    text: "And my God will supply every need of yours according to his riches in glory in Christ Jesus.",
    reflection: "A reminder that provision is not our burden alone to carry — we plan, and we trust." },
  { id: "00000000-0000-0000-0000-000000000002", reference: "Matthew 6:31–33", translation: "ESV",
    text: "Do not be anxious, saying, 'What shall we eat?' or 'What shall we drink?' … your heavenly Father knows that you need them all.",
    reflection: "Planning ahead is wisdom; worrying ahead is weight. Lay down the worry, keep the plan." },
  { id: "00000000-0000-0000-0000-000000000003", reference: "Proverbs 31:15", translation: "ESV",
    text: "She rises while it is yet night and provides food for her household.",
    reflection: "Quiet, faithful preparation is one of love's most ordinary and extraordinary acts." },
  { id: "00000000-0000-0000-0000-000000000004", reference: "Psalm 34:8", translation: "ESV",
    text: "Oh, taste and see that the Lord is good! Blessed is the man who takes refuge in him!",
    reflection: "Every meal shared is an invitation to remember goodness." },
  { id: "00000000-0000-0000-0000-000000000005", reference: "1 Timothy 5:8", translation: "ESV",
    text: "But if anyone does not provide for his relatives, and especially for members of his household, he has denied the faith.",
    reflection: "Provision is an act of love made concrete — as real as bread on the table." },
  { id: "00000000-0000-0000-0000-000000000006", reference: "Proverbs 13:4", translation: "ESV",
    text: "The soul of the sluggard craves and gets nothing, while the soul of the diligent is richly supplied.",
    reflection: "A weekly plan is a small act of diligence. Small acts compound." },
  { id: "00000000-0000-0000-0000-000000000007", reference: "Colossians 3:23", translation: "ESV",
    text: "Whatever you do, work heartily, as for the Lord and not for men.",
    reflection: "Even grocery lists can be offered as work done for a higher purpose." },
  { id: "00000000-0000-0000-0000-000000000008", reference: "Luke 12:24", translation: "ESV",
    text: "Consider the ravens: they neither sow nor reap, they have neither storehouse nor barn, and yet God feeds them.",
    reflection: "He who feeds the ravens will not forget your household." },
  { id: "00000000-0000-0000-0000-000000000009", reference: "Proverbs 15:17", translation: "ESV",
    text: "Better is a dinner of herbs where love is than a fattened ox and hatred with it.",
    reflection: "What is on the table matters less than who is at the table." },
  { id: "00000000-0000-0000-0000-000000000010", reference: "Romans 12:13", translation: "ESV",
    text: "Contribute to the needs of the saints and seek to show hospitality.",
    reflection: "A planned pantry is a pantry ready to share." },
  { id: "00000000-0000-0000-0000-000000000011", reference: "Psalm 23:1", translation: "ESV",
    text: "The Lord is my shepherd; I shall not want.",
    reflection: "Not because I have everything, but because He is enough." },
  { id: "00000000-0000-0000-0000-000000000012", reference: "Proverbs 21:5", translation: "ESV",
    text: "The plans of the diligent lead surely to abundance, but everyone who is hasty comes only to poverty.",
    reflection: "A few minutes of planning each week saves many frustrated, expensive moments." },
  { id: "00000000-0000-0000-0000-000000000013", reference: "Deuteronomy 8:10", translation: "ESV",
    text: "And you shall eat and be full, and you shall bless the Lord your God for the good land he has given you.",
    reflection: "Gratitude and planning belong together at the table." },
  { id: "00000000-0000-0000-0000-000000000014", reference: "Ecclesiastes 9:7", translation: "ESV",
    text: "Go, eat your bread with joy, and drink your wine with a merry heart, for God has already approved what you do.",
    reflection: "Enjoy what you set before you today." },
  { id: "00000000-0000-0000-0000-000000000015", reference: "Isaiah 58:7", translation: "ESV",
    text: "Is it not to share your bread with the hungry and bring the homeless poor into your house?",
    reflection: "Provision planned is provision ready to overflow." },
  { id: "00000000-0000-0000-0000-000000000016", reference: "Matthew 14:19", translation: "ESV",
    text: "Taking the five loaves and the two fish, he looked up to heaven and said a blessing.",
    reflection: "Small provision, offered with gratitude, becomes more than enough." },
  { id: "00000000-0000-0000-0000-000000000017", reference: "Proverbs 27:23", translation: "ESV",
    text: "Know well the condition of your flocks, and give attention to your herds.",
    reflection: "Know your pantry. Know your people. Tend both." },
  { id: "00000000-0000-0000-0000-000000000018", reference: "Joshua 1:9", translation: "ESV",
    text: "Be strong and courageous. Do not be frightened, and do not be dismayed.",
    reflection: "Even the week ahead — with its unknowns — is held." },
  { id: "00000000-0000-0000-0000-000000000019", reference: "Lamentations 3:22–23", translation: "ESV",
    text: "The steadfast love of the Lord never ceases; his mercies never come to an end; they are new every morning.",
    reflection: "New day, new mercies, new opportunity to begin again." },
  { id: "00000000-0000-0000-0000-000000000020", reference: "Galatians 6:9", translation: "ESV",
    text: "Let us not grow weary of doing good, for in due season we will reap, if we do not give up.",
    reflection: "The faithful, repeated work of caring for a home is a harvest-bearing thing." },
  { id: "00000000-0000-0000-0000-000000000021", reference: "Psalm 104:14–15", translation: "ESV",
    text: "You cause the grass to grow for the livestock and plants for man to cultivate, that he may bring forth food from the earth.",
    reflection: "Behind every meal is a long chain of provision going back to the one who made seeds." },
  { id: "00000000-0000-0000-0000-000000000022", reference: "John 6:35", translation: "ESV",
    text: "I am the bread of life; whoever comes to me shall not hunger, and whoever believes in me shall never thirst.",
    reflection: "The deepest hunger is not solved by any grocery list." },
  { id: "00000000-0000-0000-0000-000000000023", reference: "Proverbs 31:27", translation: "ESV",
    text: "She looks well to the ways of her household and does not eat the bread of idleness.",
    reflection: "Looking well to the household is an act of dignity, not diminishment." },
  { id: "00000000-0000-0000-0000-000000000024", reference: "Matthew 6:11", translation: "ESV",
    text: "Give us this day our daily bread.",
    reflection: "Daily dependence is not weakness — it is the proper posture of a creature before its Creator." },
  { id: "00000000-0000-0000-0000-000000000025", reference: "Psalm 37:25", translation: "ESV",
    text: "I have been young, and now am old, yet I have not seen the righteous forsaken or his children begging for bread.",
    reflection: "A testimony across a lifetime: He provides." },
  { id: "00000000-0000-0000-0000-000000000026", reference: "Proverbs 3:9", translation: "ESV",
    text: "Honor the Lord with your wealth and with the firstfruits of all your produce.",
    reflection: "Before the menu and the shopping list, there is an act of the heart." },
  { id: "00000000-0000-0000-0000-000000000027", reference: "Acts 2:46", translation: "ESV",
    text: "Breaking bread in their homes, they received their food with glad and generous hearts.",
    reflection: "The daily table is holy ground when glad and generous hearts sit around it." },
  { id: "00000000-0000-0000-0000-000000000028", reference: "Genesis 1:29", translation: "ESV",
    text: "Behold, I have given you every plant yielding seed … You shall have them for food.",
    reflection: "The first grocery list was written by God, and it was generous." },
  { id: "00000000-0000-0000-0000-000000000029", reference: "Philippians 4:11", translation: "ESV",
    text: "I have learned, in whatever situation I am, to be content.",
    reflection: "Contentment is a practice, not a personality trait. It is learned." },
  { id: "00000000-0000-0000-0000-000000000030", reference: "Psalm 128:2", translation: "ESV",
    text: "You shall eat the fruit of the labor of your hands; you shall be blessed, and it shall be well with you.",
    reflection: "There is a quiet blessing in honest work and a full table." },
  { id: "00000000-0000-0000-0000-000000000031", reference: "Hebrews 13:5", translation: "ESV",
    text: "Keep your life free from love of money, and be content with what you have.",
    reflection: "A well-planned household spends less on impulse and more on intention." },
];

// Selects today's verse using the UTC day number as an index.
// Same day always returns the same verse; cycles through the list indefinitely.
export function getDailyVerse(): Verse {
  const now    = new Date();
  const utcDay = Math.floor(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()) / 86_400_000
  );
  return BUILT_IN_VERSES[utcDay % BUILT_IN_VERSES.length];
}
