
import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { createRoot } from 'react-dom/client';

// --- DATA STRUCTURES ---
interface Question {
  id: number;
  text: string;
  options: string[];
  correctAnswerIndex: number;
  topic: string;
  explanation: string;
}

interface Achievement {
    id: string;
    name: string;
    description: string;
    icon: string;
}

interface UserProfile {
  level: number;
  xp: number;
  masteredTopics: string[];
  unlockedAchievements: string[];
  studyStreak: number;
  lastStudiedTimestamp: number | null;
}

interface Reply {
    id: number;
    author: string;
    text: string;
}

interface ForumPost {
    id: number;
    title: string;
    author: string;
    category: '讀書計畫' | '法規討論' | '資源分享' | '心情抒發';
    content: string;
    replies: Reply[];
}


// --- MOCK DATA ---
const questions: Question[] = [
  // Topic: IEP Development
  { id: 1, topic: 'IEP Development', text: 'IEP 代表什麼？', options: ['個別化教育計畫', '制度化教育計畫', '個別化參與協議', '綜合評估流程'], correctAnswerIndex: 0, explanation: 'IEP是「Individualized Education Program」的縮寫，中文為「個別化教育計畫」。這是一份為每位特殊需求學生量身打造的法律文件，旨在確保他們獲得適當的教育支持與服務。' },
  { id: 2, topic: 'IEP Development', text: 'IEP 必須至少多久檢討一次？', options: ['每6個月', '每年', '每2年', '僅在家長要求時'], correctAnswerIndex: 1, explanation: '根據法律規定，IEP團隊必須至少每年召開一次會議來檢討學生的進步情況，並根據需要更新IEP內容，以確保其持續符合學生的需求。' },
  { id: 3, topic: 'IEP Development', text: '下列何者是 IEP 團隊的必要成員？', options: ['學校校長', '特教老師', '學校心理師', '學生的家庭醫生'], correctAnswerIndex: 1, explanation: 'IEP團隊的核心成員包括學生的家長、至少一位普通教育老師、一位特殊教育老師以及一位能解釋評估結果的學校代表。特教老師是不可或缺的角色。' },
  { id: 4, topic: 'IEP Development', text: 'IEP 中「現況表現水準」的主要目的是什麼？', options: ['列出學生成績', '概述學生行為計畫', '建立教育目標的基準線', '描述學生病史'], correctAnswerIndex: 2, explanation: '「現況表現水準」(PLOP) 描述了學生目前的學業和功能性表現，作為設定年度目標的起點和基準，以便追蹤學生的進步。' },
  { id: 5, topic: 'IEP Development', text: '在特殊教育的背景下，「LRE」代表什麼？', options: ['長期補救教育', '最少限制環境', '學習資源均衡', '地方審查實體'], correctAnswerIndex: 1, explanation: 'LRE 代表「Least Restrictive Environment」，即「最少限制環境」。此原則要求，在最大程度上，讓特殊需求學生與普通同儕一起接受教育。' },

  // Topic: Behavioral Management
  { id: 6, topic: 'Behavioral Management', text: '功能性行為評量（FBA）是用來確定...', options: ['學生的認知水平', '行為的功能或目的', '適當的學術安置', '學生接受特殊教育的資格'], correctAnswerIndex: 1, explanation: 'FBA 的主要目的是透過收集數據來了解一個特定行為背後的原因或「功能」（例如，為了獲得關注、逃避任務），以便制定有效的介入策略。' },
  { id: 7, topic: 'Behavioral Management', text: '下列何者是正向增強的例子？', options: ['學生完成作業後給予貼紙', '因行為不當而將學生送到隔離區', '取消學生的休息時間', '忽略學生的情緒爆發'], correctAnswerIndex: 0, explanation: '正向增強是指在一個行為發生後，提供一個愉快的刺激（如貼紙），從而增加該行為未來再次發生的可能性。' },
  { id: 8, topic: 'Behavioral Management', text: '行為介入計畫（BIP）是基於...的結果而制定的。', options: ['標準化測驗', '親師會議', '功能性行為評量（FBA）', '醫療評估'], correctAnswerIndex: 2, explanation: 'BIP 是一個根據 FBA 的發現所制定的具體計畫。它旨在教導替代行為，並改變環境以預防問題行為的發生。' },
  { id: 9, topic: 'Behavioral Management', text: '「代幣制度」是一種應用下列哪個原則的策略？', options: ['懲罰', '消弱', '代幣增強', '負向增強'], correctAnswerIndex: 2, explanation: '代幣制度是一種系統性的增強策略，學生因表現出目標行為而獲得代幣（如星星或點數），這些代幣後續可以兌換實質的獎勵。' },

  // Topic: Special Education Laws and Regulations
  { id: 10, topic: 'Special Education Laws and Regulations', text: '根據中華民國特殊教育法，「零拒絕」原則的核心意涵為何？', options: ['所有學生都必須在普通班上課', '學校不得以任何理由拒絕身心障礙學生入學', '特殊教育學生免除所有考試', '家長可以為孩子選擇任何學校'], correctAnswerIndex: 1, explanation: '「零拒絕」是特殊教育的基本精神，保障所有身心障礙學生皆有接受適性教育的權利，學校不能因其身心障礙狀況而拒絕其入學申請。' },
  { id: 11, topic: 'Special Education Laws and Regulations', text: '下列何者非鑑定及就學輔導會（鑑輔會）的職責？', options: ['評估學生的特殊教育需求', '決定學生的安置場所', '編寫學生的個別化教育計畫(IEP)', '處理特殊教育申訴案件'], correctAnswerIndex: 2, explanation: '鑑輔會負責鑑定、安置與輔導，而IEP的具體內容是由學校的IEP團隊（包括家長、老師等）共同編寫的，鑑輔會負責審核IEP的合適性而非直接編寫。' },
  { id: 12, topic: 'Special Education Laws and Regulations', text: '《特殊教育法》規定，高級中等以下各教育階段學校，其特殊教育學生人數在幾人以上應設立特殊教育組？', options: ['10人', '15人', '20人', '30人'], correctAnswerIndex: 1, explanation: '根據《特殊教育學生調整入學年齡及修業年限實施辦法》，為滿足學生需求，主管機關可同意調整其入學年齡及修業年限，並非由學校單方面決定。' },
  
  // Topic: Curriculum & Instruction
  { id: 13, topic: 'Curriculum & Instruction', text: '下列哪一項較符合國中集中式特教班學生社區本位教學的原則？', options: ['購買學習單和作業單讓學生練習', '鼓勵學生在不同的環境中學習技能', '鼓勵學生到社區中學習數學、國文、英文等課程', '鼓勵學生將學習成果展示給社區民眾觀看'], correctAnswerIndex: 1, explanation: '社區本位教學（CBI）的核心原則是在真實的社區環境中教導功能性技能，並促進學習的類化（generalization），因此鼓勵學生在「不同的環境中」學習是關鍵。' },
  { id: 14, topic: 'Curriculum & Instruction', text: '普通班老師在進行海洋生物教學後，要求同學們繳交一篇書面報告，但允許身心障礙學生小華畫出三種常見的海洋生物。這屬於哪一種課程調整？', options: ['學習內容', '學習歷程', '學習環境', '學習評量'], correctAnswerIndex: 3, explanation: '此作法改變了學生「繳交成果」的方式（從書面報告改為繪畫），這是屬於「學習評量」或「成果」的調整，旨在讓學生能用自己的優勢管道展現所學。' },
  { id: 15, topic: 'Curriculum & Instruction', text: '老師教導智能障礙學生穿外套，先將技能分解成數個步驟，然後從「最後一個步驟」開始教，直到學生能完成。這是哪一種行為改變策略？', options: ['正向連鎖', '反向連鎖', '逐步養成', '區別性增強'], correctAnswerIndex: 1, explanation: '從技能的最後一個步驟開始逆向教學，稱為「反向連鎖」（Backward Chaining）。這種方法能讓學生在每次練習時都能成功完成整個任務，從而獲得立即的增強。' },
  { id: 16, topic: 'Curriculum & Instruction', text: '國小智能障礙學生在學習「分數」單元時有困難，老師將學習內容調整為「能使用零錢在販賣機中購買10元飲料」。這屬於哪一種課程調整？', options: ['簡化', '減量', '分解', '替代'], correctAnswerIndex: 3, explanation: '此調整將抽象的學術概念（分數）替換為一個具體的、功能性的生活技能（用錢購物），這屬於「替代」課程的調整策略。' },
  { id: 17, topic: 'Curriculum & Instruction', text: '在規劃課程時，考量到所有學生的需求，預先設計彈性的目標、方法、教材與評量，以減少後續調整的需求。這是下列何種概念的體現？', options: ['通用設計課程 (UDC)', '區分性教學', '多層次教學', '個別化教育計畫'], correctAnswerIndex: 0, explanation: '通用設計課程（Universally Designed Curriculum, UDC or UDL）強調在課程設計之初就內建彈性，以滿足最大多數學生的學習需求，而非事後補救。' },
  { id: 18, topic: 'Curriculum & Instruction', text: '老師在教室中安排了多個學習角落，並放置學生感興趣的玩具，當學生主動走向某個玩具時，老師才介入並引導他進行溝通。這是應用了哪一種教學法？', options: ['結構化教學', '隨機教學/自然情境教學', '直接教學', '合作學習'], correctAnswerIndex: 1, explanation: '自然情境教學（Milieu Teaching）或稱隨機教學，其核心精神是在自然發生的情境中，利用學生的動機來安排教學活動，藉此促進溝通與學習的類化。' },

  // Topic: Learner Development & Adaptive Guidance
  { id: 19, topic: 'Learner Development & Adaptive Guidance', text: '某生被持續、反覆出現的思想、衝動及影像等意念所困擾，且會重複某些行為來減輕焦慮。該生最有可能的診斷為何？', options: ['強迫症', '畏懼症', '恐慌症', '廣泛性焦慮症'], correctAnswerIndex: 0, explanation: '持續且侵入性的意念（強迫思考）與重複性的行為（強迫行為）是強迫症（Obsessive-Compulsive Disorder, OCD）的典型核心症狀。' },
  { id: 20, topic: 'Learner Development & Adaptive Guidance', text: '某生在剛出生時被檢查出第15對染色體異常，二至四歲時開始出現無法控制食慾且肌肉張力不足的現象。該生最可能屬於下列何種類型？', options: ['唐氏症', '貓哭症候群', '雷特氏症候群', '普瑞德-威利氏症候群（小胖威利症）'], correctAnswerIndex: 3, explanation: '第15對染色體長臂部分基因功能缺失、無法控制的食慾（導致肥胖）以及肌肉張力低下是普瑞德-威利氏症候群（Prader-Willi Syndrome）的典型特徵。' },
  { id: 21, topic: 'Learner Development & Adaptive Guidance', text: '關於學習障礙學生的敘述，下列何者正確？', options: ['智力通常在正常或更高範圍', '學習問題主要是由感官損傷（如視障）造成', '藥物治療是提升學業成就最有效的方法', '學習障礙在女性中的發生率高於男性'], correctAnswerIndex: 0, explanation: '學習障礙的定義之一，是學生的智力正常，但在特定的學習領域（如閱讀、書寫、數學）上表現出預期外的困難。其困難並非由智力、感官或情緒障礙所直接導致。' },
  { id: 22, topic: 'Learner Development & Adaptive Guidance', text: '對於因腦瘤導致全盲的國小二年級學生，下列哪些特殊需求領域課程應列為優先？', options: ['點字、定向行動', '社會技巧、功能性動作', '輔助科技、職業教育', '溝通訓練、點字'], correctAnswerIndex: 0, explanation: '對於全盲的學生而言，學習獨立閱讀書寫的工具（點字）以及安全獨立行走的能力（定向行動）是他們參與教育和社會活動最基礎且核心的技能，應優先教導。' },
  { id: 23, topic: 'Learner Development & Adaptive Guidance', text: '某位腦性麻痺學生智商約60，經過輔具評估後，他現在可以上學。從最少限制環境（LRE）的觀點，該生較「不適合」安置於何處？', options: ['普通班', '分散式資源班', '集中式特教班', '特殊教育學校'], correctAnswerIndex: 3, explanation: '最少限制環境（LRE）原則強調應讓學生盡可能地與普通同儕一起學習。特殊教育學校是隔離程度最高的安置選項，因此在學生有能力於普通學校環境學習時，此選項最不符合LRE原則。' },
  { id: 24, topic: 'Learner Development & Adaptive Guidance', text: '針對注意力缺陷過動症（ADHD）學生的教室環境調整，下列哪一項較為適切？', options: ['減少教室環境中可預測的刺激', '增加教室環境中可預測的刺激', '讓學生坐在教室後方', '讓學生在教室中自由走動'], correctAnswerIndex: 1, explanation: '對於ADHD學生，一個結構化、可預測性高的學習環境有助於減少分心，增加學生的安全感與專注力。因此，增加可預測性（如固定的作息、清楚的規則）是重要的策略。' },
];

const LEARNING_MODULES = [
  { id: 'IEP Development', name: '個別化教育計畫 (IEP) 開發', prerequisites: [], type: 'topic' },
  { id: 'Special Education Laws and Regulations', name: '特教法規', prerequisites: [], type: 'topic' },
  { id: 'Curriculum & Instruction', name: '課程與教學', prerequisites: [], type: 'topic' },
  { id: 'Learner Development & Adaptive Guidance', name: '學習者發展與適性輔導', prerequisites: [], type: 'topic' },
  { id: 'Behavioral Management', name: '行為管理', prerequisites: ['Learner Development & Adaptive Guidance'], type: 'topic' },
  { id: 'boss_1', name: '綜合期末測驗', prerequisites: ['IEP Development', 'Behavioral Management', 'Special Education Laws and Regulations', 'Curriculum & Instruction', 'Learner Development & Adaptive Guidance'], type: 'boss' }
];

const ACHIEVEMENTS: Achievement[] = [
    { id: 'first_mastery', name: '主題先鋒', description: '精通你的第一個主題。', icon: '🎓' },
    { id: 'boss_slayer', name: '魔王殺手', description: '擊敗你的第一個魔王戰。', icon: '🐉' },
    { id: 'perfect_score', name: '完美主義者', description: '在任何測驗中獲得100%的分數。', icon: '🎯' },
    { id: 'xp_earner_100', name: '百夫長', description: '獲得超過100點總經驗值。', icon: '🌟' },
    { id: 'streak_10', name: '學習馬拉松', description: '連續10天完成一個學習模組。', icon: '🔥' },
];

const mockPosts: ForumPost[] = [
    {
        id: 1,
        title: '分享我的三個月讀書計畫，大家一起加油！',
        author: '有志者事竟成',
        category: '讀書計畫',
        content: '各位戰友大家好！距離考試越來越近，我規劃了一份三個月衝刺計畫，主要分為三個階段：\n\n第一個月：專攻教育專業科目，每天至少念6小時。\n第二個月：開始加入國文和數學的複習，並開始做歷屆試題。\n第三個月：全力刷題，錯題訂正，並保持手感。\n\n希望對大家有幫助，也歡迎大家分享自己的計畫！',
        replies: [
            { id: 1, author: '必上榜', text: '感謝分享！你的計畫很詳細，我剛好在煩惱怎麼安排時間，太有用了！' },
            { id: 2, author: '教育小菜鳥', text: '請問專業科目有推薦的書單嗎？覺得坊間的參考書好多...' },
        ],
    },
    {
        id: 2,
        title: '請問關於「最少限制環境(LRE)」的考古題疑問',
        author: '法規小書僮',
        category: '法規討論',
        content: '做到一題考古題，問說對於一位可以使用輔具在普通學校活動的腦麻學生，最不適合的安置場所是哪裡？答案是「特殊教育學校」。我想確認一下，我的理解是只要學生有能力，就應該盡量在普通學校的環境，這樣對嗎？',
        replies: [
            { id: 1, author: '特教前輩', text: '你的理解是正確的。LRE的核心精神就是「融合」，除非學生的障礙程度嚴重到在普通學校環境中無法受益，否則都應以最接近普通教育的環境為優先考量。' },
        ],
    },
    {
        id: 3,
        title: '考前壓力好大，大家都怎麼調適？',
        author: '焦慮的考生',
        category: '心情抒發',
        content: '每天都覺得念不完，看到身邊的朋友一個個好像都很穩，就覺得更焦慮了。晚上都睡不太好，大家有什麼紓壓的好方法嗎？',
        replies: [
            { id: 1, author: '運動是王道', text: '我每天都會去跑半小時步，流汗真的很有用！' },
            { id: 2, author: '美食撫慰人心', text: '偶爾會放縱自己吃一頓大餐，覺得心情會好很多。' },
            { id: 3, author: '有志者事竟成', text: '找個朋友聊聊，把心裡的垃圾倒出來也很有幫助！加油！' },
        ],
    }
];

const XP_PER_CORRECT_ANSWER = 10;
const MASTERY_THRESHOLD = 0.9; // 90%
const XP_FOR_LEVEL_UP = [100, 250, 500, 1000]; // XP needed to reach level 2, 3, 4, 5...
const BOSS_XP_BONUS = 50;

type Page = 'practice' | 'bank' | 'learn' | 'achievements' | 'community';

// --- HELPER FUNCTIONS ---
const calculateLevel = (xp: number) => {
  let level = 1;
  let xpNeeded = 0;
  for (const xpThreshold of XP_FOR_LEVEL_UP) {
    xpNeeded = xpThreshold;
    if (xp < xpNeeded) break;
    level++;
  }
  return { level, xpForNextLevel: xpNeeded };
};

const areTimestampsOnConsecutiveDays = (ts1: number, ts2: number) => {
    const date1 = new Date(ts1);
    const date2 = new Date(ts2);

    date1.setHours(0, 0, 0, 0);
    date2.setHours(0, 0, 0, 0);

    const diffTime = date2.getTime() - date1.getTime();
    const diffDays = diffTime / (1000 * 60 * 60 * 24);

    return diffDays === 1;
};

const areTimestampsOnSameDay = (ts1: number, ts2: number) => {
    const date1 = new Date(ts1);
    const date2 = new Date(ts2);
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
};

// --- COMPONENTS ---

const HomeView = ({ userProfile, onStartModule }) => {
  const { level, xpForNextLevel } = calculateLevel(userProfile.xp);
  const xpForCurrentLevel = XP_FOR_LEVEL_UP[level - 2] || 0;
  const xpProgress = xpForNextLevel > xpForCurrentLevel ? (userProfile.xp - xpForCurrentLevel) / (xpForNextLevel - xpForCurrentLevel) * 100 : 100;

  const isModuleUnlocked = (module) => {
    if (module.prerequisites.length === 0) return true;
    return module.prerequisites.every(prereq => userProfile.masteredTopics.includes(prereq));
  };

  return (
    <div className="page-content">
      <div className="user-progress">
        <div className="user-stats">
            <div className="level-display">等級 {level}</div>
            {userProfile.studyStreak > 0 && (
                <div className="streak-display">🔥 連擊 {userProfile.studyStreak} 天</div>
            )}
        </div>
        <div className="xp-bar-container">
          <div className="xp-bar" style={{ width: `${xpProgress}%` }}></div>
        </div>
        <div className="xp-text">{userProfile.xp} / {xpForNextLevel} 經驗值</div>
      </div>

      <div className="topic-list">
        <h2>學習模組</h2>
        {LEARNING_MODULES.map(module => {
          const unlocked = isModuleUnlocked(module);
          const mastered = userProfile.masteredTopics.includes(module.id);
          const isBoss = module.type === 'boss';
          
          let itemClass = isBoss ? 'boss-battle-item' : 'topic-item';
          if (!unlocked) {
            itemClass += ' locked';
          }

          return (
            <div
              key={module.id}
              className={itemClass}
              onClick={() => unlocked && onStartModule(module.id)}
              aria-disabled={!unlocked}
              role="button"
            >
              <span>{module.name} {mastered ? (isBoss ? '👑' : '✅') : ''}</span>
              <span>{!unlocked ? '🔒' : (isBoss ? '⚔️' : '▶️')}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const AchievementsView = ({ userProfile }) => {
    return (
        <div className="page-content achievements-view">
            <h2>成就</h2>
            <div className="achievements-list">
                {ACHIEVEMENTS.map(ach => {
                    const isUnlocked = userProfile.unlockedAchievements.includes(ach.id);
                    return (
                        <div key={ach.id} className={`achievement-item ${isUnlocked ? 'unlocked' : 'locked'}`}>
                            <div className="achievement-icon">{ach.icon}</div>
                            <div className="achievement-details">
                                <h3>{ach.name}</h3>
                                <p>{ach.description}</p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

const QuestionBankView = ({ questions }) => {
  const [expandedTopic, setExpandedTopic] = useState<string | null>(null);
  const [expandedQuestionId, setExpandedQuestionId] = useState<number | null>(null);

  const questionsByTopic = useMemo(() => {
    const moduleMap = new Map(LEARNING_MODULES.map(m => [m.id, m.name]));
    
    return questions.reduce((acc, question) => {
        const topicName = moduleMap.get(question.topic) || question.topic;
        (acc[topicName] = acc[topicName] || []).push(question);
        return acc;
    }, {} as Record<string, Question[]>);
  }, [questions]);

  const toggleTopic = (topicName: string) => {
    setExpandedTopic(prev => (prev === topicName ? null : topicName));
    setExpandedQuestionId(null); // Collapse questions when topic changes
  };

  const toggleQuestion = (questionId: number) => {
    setExpandedQuestionId(prev => (prev === questionId ? null : questionId));
  };

  const topicOrder = LEARNING_MODULES.filter(m => m.type === 'topic').map(m => m.name);

  return (
    <div className="page-content question-bank-view">
      <h2>試題庫</h2>
      <p className="description">瀏覽所有考題，點擊主題展開問題，再點擊問題查看詳解。</p>
      <div className="topic-accordion">
        {topicOrder.map(topicName => {
          const topicQuestions = questionsByTopic[topicName] || [];
          if (topicQuestions.length === 0) return null;
          const isExpanded = expandedTopic === topicName;
          return (
            <div key={topicName} className="topic-section">
              <button className="topic-header" onClick={() => toggleTopic(topicName)} aria-expanded={isExpanded}>
                <span>{topicName} ({topicQuestions.length})</span>
                <span className={`arrow ${isExpanded ? 'expanded' : ''}`}>▼</span>
              </button>
              {isExpanded && (
                <div className="question-list">
                  {topicQuestions.map(q => {
                    const isQuestionExpanded = expandedQuestionId === q.id;
                    return (
                      <div key={q.id} className="question-list-item">
                        <button className="question-summary" onClick={() => toggleQuestion(q.id)} aria-expanded={isQuestionExpanded}>
                          {q.text}
                        </button>
                        {isQuestionExpanded && (
                          <div className="question-detail-view">
                            <div className="options-list">
                              {q.options.map((opt, index) => (
                                <div key={index} className={`option-item ${index === q.correctAnswerIndex ? 'correct' : ''}`}>
                                  {opt}
                                </div>
                              ))}
                            </div>
                            <div className="explanation-box">
                                <h4>詳解</h4>
                                <p>{q.explanation}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

const QuizView = ({ moduleId, onQuizComplete }) => {
  const quizQuestions = useMemo(() => {
    const module = LEARNING_MODULES.find(m => m.id === moduleId);
    if (module?.type === 'boss') {
      const allPrereqTopics = LEARNING_MODULES.flatMap(m => m.prerequisites);
      const uniqueTopics = [...new Set(allPrereqTopics)];
      return questions.filter(q => uniqueTopics.includes(q.topic));
    }
    return questions.filter(q => q.topic === moduleId);
  }, [moduleId]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [userAnswers, setUserAnswers] = useState<(number | null)[]>([]);
  const [isAnswered, setIsAnswered] = useState(false);

  const currentQuestion = quizQuestions[currentQuestionIndex];

  const handleSelectAnswer = (index: number) => {
    if (isAnswered) return;
    setSelectedAnswer(index);
    setIsAnswered(true);
  };
  
  const handleNext = () => {
      const newAnswers = [...userAnswers, selectedAnswer];
      setUserAnswers(newAnswers);
      setIsAnswered(false);
      setSelectedAnswer(null);

      if (currentQuestionIndex < quizQuestions.length - 1) {
          setCurrentQuestionIndex(currentQuestionIndex + 1);
      } else {
          // Quiz finished
          let score = 0;
          quizQuestions.forEach((q, i) => {
              if (q.correctAnswerIndex === newAnswers[i]) {
                  score++;
              }
          });
          onQuizComplete(score, quizQuestions.length);
      }
  };

  return (
    <div className="quiz-view">
      <div className="quiz-header">
         <div className="quiz-progress-bar-container">
            <div className="quiz-progress-bar" style={{ width: `${((currentQuestionIndex) / quizQuestions.length) * 100}%` }}></div>
         </div>
         <p className="question-counter">{currentQuestionIndex + 1} / {quizQuestions.length}</p>
      </div>

      <h2 className="question-text">{currentQuestion.text}</h2>
      
      <div className="quiz-scroll-content">
        <div className="options-grid">
          {currentQuestion.options.map((option, index) => {
            let btnClass = 'option-btn';
            if (isAnswered) {
              if (index === currentQuestion.correctAnswerIndex) {
                btnClass += ' correct';
              } else if (index === selectedAnswer) {
                btnClass += ' incorrect';
              }
            } else if (index === selectedAnswer) {
              btnClass += ' selected';
            }

            return (
              <button key={index} className={btnClass} onClick={() => handleSelectAnswer(index)} disabled={isAnswered}>
                {option}
              </button>
            );
          })}
        </div>
        
        {isAnswered && (
            <div className="explanation-box">
                <h4>詳解</h4>
                <p>{currentQuestion.explanation}</p>
            </div>
        )}
      </div>

      <div className="quiz-footer">
        {isAnswered && (
          <button className="btn" onClick={handleNext}>
            {currentQuestionIndex < quizQuestions.length - 1 ? '下一題' : '完成測驗'}
          </button>
        )}
      </div>
    </div>
  );
};

const ResultsView = ({ score, totalQuestions, moduleName, isBossBattle, bonusXp, newlyUnlocked, onReturnToPage }) => {
    const percentage = Math.round((score / totalQuestions) * 100);
    const isMastered = percentage >= (MASTERY_THRESHOLD * 100);

    let feedbackMessage;
    let summaryText;

    if (isBossBattle) {
      if (isMastered) {
        summaryText = "魔王已擊敗！";
        feedbackMessage = `太厲害了！你已經征服了 ${moduleName} 並獲得了 ${bonusXp} 點額外經驗值！`;
      } else {
        summaryText = "就差一點了！";
        feedbackMessage = "這個魔王很強大！複習相關主題後再試一次以取得勝利。";
      }
    } else {
       summaryText = isMastered ? '主題已精通！' : '測驗完成！';
       if (isMastered) {
          feedbackMessage = `恭喜！你已精通 ${moduleName}。`;
       } else if (percentage >= 70) {
          feedbackMessage = "做得很好！繼續練習以完全精通。";
       } else {
          feedbackMessage = "別放棄！複習教材後再試一次。";
       }
    }
    
    const circleColor = isMastered ? 'var(--correct-color)' : percentage > 50 ? 'var(--accent-color)' : 'var(--incorrect-color)';

    return (
        <div className="results-view">
            <div className="score-circle" style={{ backgroundColor: circleColor }}>
                {percentage}%
            </div>
            <h2 className="summary-text">{summaryText}</h2>
            <p className="feedback-text">{feedbackMessage}</p>

            {newlyUnlocked.length > 0 && (
                <div className="new-achievements-section">
                    <h3>成就已解鎖！</h3>
                    {newlyUnlocked.map(ach => (
                         <div key={ach.id} className="new-achievement-item">
                            <span className="achievement-icon">{ach.icon}</span>
                            <span>{ach.name}</span>
                        </div>
                    ))}
                </div>
            )}

            <button className="btn" onClick={onReturnToPage}>返回</button>
        </div>
    );
};

const LearnPageContainer = () => {
    const [view, setView] = useState<'hub' | 'flashcards' | 'studyGuide'>('hub');
    const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);

    const handleSelect = (mode: 'flashcards' | 'studyGuide', topicId: string) => {
        setSelectedTopicId(topicId);
        setView(mode);
    };

    const handleReturn = () => {
        setSelectedTopicId(null);
        setView('hub');
    };
    
    const LearnHubView = ({ onSelect }) => {
        const studyTopics = LEARNING_MODULES.filter(m => m.type === 'topic');
        return (
            <div className="page-content learn-hub-view">
                <h2>學習模式</h2>
                <p className="description">選擇一種模式與主題開始學習。</p>
                
                <div className="learn-mode-section">
                  <h3 className="learn-mode-title">閃卡模式</h3>
                  <p className="learn-mode-description">透過點擊卡片來快速複習問題與答案。</p>
                  <div className="topic-grid">
                      {studyTopics.map(topic => (
                          <button key={topic.id} className="topic-card" onClick={() => onSelect('flashcards', topic.id)}>
                              {topic.name}
                          </button>
                      ))}
                  </div>
                </div>
    
                <div className="learn-mode-section">
                  <h3 className="learn-mode-title">學習指南</h3>
                  <p className="learn-mode-description">在單一頁面上查看主題的所有問題與詳解。</p>
                  <div className="topic-grid">
                      {studyTopics.map(topic => (
                          <button key={topic.id} className="topic-card" onClick={() => onSelect('studyGuide', topic.id)}>
                              {topic.name}
                          </button>
                      ))}
                  </div>
                </div>
            </div>
        );
    };
    
    const FlashcardView = ({ topicId, onReturn }) => {
        const topicQuestions = useMemo(() => questions.filter(q => q.topic === topicId), [topicId]);
        const topicName = LEARNING_MODULES.find(m => m.id === topicId)?.name || '';
    
        const [currentIndex, setCurrentIndex] = useState(0);
        const [isFlipped, setIsFlipped] = useState(false);
        
        const handleNext = () => {
            if (currentIndex < topicQuestions.length - 1) {
                setIsFlipped(false); // Reset flip state for next card
                setCurrentIndex(currentIndex + 1);
            }
        };
        
        const handlePrev = () => {
            if (currentIndex > 0) {
                setIsFlipped(false); // Reset flip state for prev card
                setCurrentIndex(currentIndex - 1);
            }
        };
    
        const currentQuestion = topicQuestions[currentIndex];
    
        if (!currentQuestion) {
            return (
                <div className="page-content">
                    <p>此主題沒有可用的問題。</p>
                    <button className="btn" onClick={onReturn}>返回</button>
                </div>
            );
        }
    
        return (
            <div className="page-content flashcard-view">
                <div className="flashcard-header">
                    <h3>{topicName}</h3>
                    <button className="btn-secondary btn-back" onClick={onReturn}>返回主題</button>
                </div>
                
                <p className="flashcard-progress">{currentIndex + 1} / {topicQuestions.length}</p>
    
                <div className="flashcard-container" onClick={() => setIsFlipped(!isFlipped)}>
                    <div className={`flashcard ${isFlipped ? 'flipped' : ''}`}>
                        <div className="flashcard-face flashcard-front">
                            <p>{currentQuestion.text}</p>
                        </div>
                        <div className="flashcard-face flashcard-back">
                            <h4>答案：</h4>
                            <p className="answer">{currentQuestion.options[currentQuestion.correctAnswerIndex]}</p>
                            <div className="explanation-box">
                                <h4>詳解</h4>
                                <p>{currentQuestion.explanation}</p>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div className="flashcard-nav">
                    <button className="btn" onClick={handlePrev} disabled={currentIndex === 0}>上一張</button>
                    <button className="btn" onClick={handleNext} disabled={currentIndex === topicQuestions.length - 1}>下一張</button>
                </div>
            </div>
        );
    };

    const StudyGuideView = ({ topicId, onReturn }) => {
        const topicQuestions = useMemo(() => questions.filter(q => q.topic === topicId), [topicId]);
        const topicName = LEARNING_MODULES.find(m => m.id === topicId)?.name || '';
    
        return (
            <div className="page-content study-guide-view">
                <div className="study-guide-header">
                    <h3>{topicName}</h3>
                    <button className="btn-secondary btn-back" onClick={onReturn}>返回學習中心</button>
                </div>
                <div className="study-guide-content">
                    {topicQuestions.map((q, qIndex) => (
                        <div key={q.id} className="guide-question-item">
                            <p className="guide-question-text">{qIndex + 1}. {q.text}</p>
                            <div className="guide-options-list">
                                {q.options.map((opt, index) => (
                                    <div key={index} className={`guide-option-item ${index === q.correctAnswerIndex ? 'correct' : ''}`}>
                                        {opt}
                                    </div>
                                ))}
                            </div>
                            <div className="explanation-box">
                                <h4>詳解</h4>
                                <p>{q.explanation}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    if (view === 'flashcards' && selectedTopicId) {
        return <FlashcardView topicId={selectedTopicId} onReturn={handleReturn} />;
    }
    
    if (view === 'studyGuide' && selectedTopicId) {
        return <StudyGuideView topicId={selectedTopicId} onReturn={handleReturn} />;
    }

    return <LearnHubView onSelect={handleSelect} />;
};

const CommunityPageContainer = () => {
    const [view, setView] = useState<'list' | 'detail'>('list');
    const [selectedPostId, setSelectedPostId] = useState<number | null>(null);

    const handleSelectPost = (postId: number) => {
        setSelectedPostId(postId);
        setView('detail');
    };

    const handleReturnToList = () => {
        setSelectedPostId(null);
        setView('list');
    };

    const ForumListView = ({ posts, onSelectPost }) => {
        return (
            <div className="page-content forum-list-view">
                <h2>社群論壇</h2>
                <div className="post-list">
                    {posts.map(post => (
                        <div key={post.id} className="post-item" onClick={() => onSelectPost(post.id)}>
                            <div className="post-item-header">
                                <span className={`post-item-category category-${post.category}`}>{post.category}</span>
                                <h3 className="post-item-title">{post.title}</h3>
                            </div>
                            <div className="post-item-meta">
                                <span>👤 {post.author}</span>
                                <span>💬 {post.replies.length} 則回覆</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    };
    
    const PostDetailView = ({ post, onBack }) => {
        return (
            <div className="page-content post-detail-view">
                 <div className="post-detail-header">
                    <button className="btn-secondary btn-back" onClick={onBack}>返回論壇</button>
                </div>
                <div className="post-content-container">
                    <h2 className="post-title">{post.title}</h2>
                    <p className="post-author">由 {post.author}</p>
                    <div className="post-body">
                        {post.content.split('\n').map((paragraph, index) => (
                            <p key={index}>{paragraph}</p>
                        ))}
                    </div>
                </div>

                <div className="reply-section">
                    <h3>回覆</h3>
                    <div className="reply-list">
                        {post.replies.map(reply => (
                            <div key={reply.id} className="reply-item">
                                <p className="reply-author">{reply.author} 說：</p>
                                <p className="reply-text">{reply.text}</p>
                            </div>
                        ))}
                         {post.replies.length === 0 && <p className="no-replies">目前沒有回覆。</p>}
                    </div>
                </div>
            </div>
        );
    };


    if (view === 'detail' && selectedPostId) {
        const post = mockPosts.find(p => p.id === selectedPostId);
        if (post) {
            return <PostDetailView post={post} onBack={handleReturnToList} />;
        }
    }

    return <ForumListView posts={mockPosts} onSelectPost={handleSelectPost} />;
};


const NavigationBar = ({ currentPage, onNavigate }: { currentPage: Page, onNavigate: (page: Page) => void }) => {
    const navItems = [
        { id: 'practice', icon: '🎯', label: '練習' },
        { id: 'bank', icon: '📚', label: '題庫' },
        { id: 'learn', icon: '💡', label: '學習' },
        { id: 'achievements', icon: '🌟', label: '成就' },
        { id: 'community', icon: '👥', label: '社群' },
    ];

    return (
        <nav className="navigation-bar">
            {navItems.map(item => (
                <button 
                    key={item.id} 
                    className={`nav-item ${currentPage === item.id ? 'active' : ''}`}
                    onClick={() => onNavigate(item.id as Page)}
                    aria-label={item.label}
                >
                    <span className="icon">{item.icon}</span>
                    <span className="label">{item.label}</span>
                </button>
            ))}
        </nav>
    );
};

const App = () => {
  const [activeView, setActiveView] = useState<'page' | 'quiz' | 'results'>('page');
  const [currentPage, setCurrentPage] = useState<Page>('practice');
  const [userProfile, setUserProfile] = useState<UserProfile>({
    level: 1,
    xp: 0,
    masteredTopics: [],
    unlockedAchievements: [],
    studyStreak: 0,
    lastStudiedTimestamp: null,
  });
  const [currentModuleId, setCurrentModuleId] = useState<string | null>(null);
  const [lastQuizResult, setLastQuizResult] = useState<{score: number, totalQuestions: number, bonusXp: number, newlyUnlocked: Achievement[] } | null>(null);
  
  const handleNavigate = (page: Page) => {
      setCurrentPage(page);
      setActiveView('page');
  };

  const handleStartModule = (moduleId: string) => {
    setCurrentModuleId(moduleId);
    setActiveView('quiz');
  };
  
  const checkAchievements = (profile: UserProfile, score: number, totalQuestions: number, moduleId: string): { updatedProfile: UserProfile, newlyUnlocked: Achievement[] } => {
      const newlyUnlocked: Achievement[] = [];
      const currentAchievements = new Set(profile.unlockedAchievements);
      
      const module = LEARNING_MODULES.find(m => m.id === moduleId)!;
      const isMastered = score / totalQuestions >= MASTERY_THRESHOLD;
      
      // 1. First Mastery
      if (profile.masteredTopics.length === 1 && !profile.masteredTopics.includes(moduleId) && isMastered && !currentAchievements.has('first_mastery')) {
          const ach = ACHIEVEMENTS.find(a => a.id === 'first_mastery')!;
          newlyUnlocked.push(ach);
          currentAchievements.add(ach.id);
      } else if (profile.masteredTopics.length === 0 && isMastered && !currentAchievements.has('first_mastery')) {
          // Case for the very first mastered topic
          const ach = ACHIEVEMENTS.find(a => a.id === 'first_mastery')!;
          newlyUnlocked.push(ach);
          currentAchievements.add(ach.id);
      }
      
      // 2. Boss Slayer
      if (module.type === 'boss' && isMastered && !currentAchievements.has('boss_slayer')) {
          const ach = ACHIEVEMENTS.find(a => a.id === 'boss_slayer')!;
          newlyUnlocked.push(ach);
          currentAchievements.add(ach.id);
      }
      
      // 3. Perfectionist
      if (score === totalQuestions && !currentAchievements.has('perfect_score')) {
          const ach = ACHIEVEMENTS.find(a => a.id === 'perfect_score')!;
          newlyUnlocked.push(ach);
          currentAchievements.add(ach.id);
      }
      
      // 4. Centurion (100+ XP)
      if (profile.xp >= 100 && !currentAchievements.has('xp_earner_100')) {
          const ach = ACHIEVEMENTS.find(a => a.id === 'xp_earner_100')!;
          newlyUnlocked.push(ach);
          currentAchievements.add(ach.id);
      }
      
      // 5. 10-Day Streak
      if (profile.studyStreak >= 10 && !currentAchievements.has('streak_10')) {
          const ach = ACHIEVEMENTS.find(a => a.id === 'streak_10')!;
          newlyUnlocked.push(ach);
          currentAchievements.add(ach.id);
      }

      return {
          updatedProfile: { ...profile, unlockedAchievements: Array.from(currentAchievements) },
          newlyUnlocked
      };
  };

  const handleQuizComplete = (score: number, totalQuestions: number) => {
    const earnedXp = score * XP_PER_CORRECT_ANSWER;
    const percentage = score / totalQuestions;
    const module = LEARNING_MODULES.find(m => m.id === currentModuleId)!;
    const isBoss = module.type === 'boss';
    let bonusXp = 0;
    const isMastered = percentage >= MASTERY_THRESHOLD;
    
    let updatedMasteredTopics = [...userProfile.masteredTopics];
    if(isMastered && !updatedMasteredTopics.includes(currentModuleId!)) {
        updatedMasteredTopics.push(currentModuleId!);
        if (isBoss) {
            bonusXp = BOSS_XP_BONUS;
        }
    }
    
    // --- STREAK LOGIC ---
    const now = Date.now();
    let newStreak = userProfile.studyStreak;
    if (userProfile.lastStudiedTimestamp) {
        if (!areTimestampsOnSameDay(now, userProfile.lastStudiedTimestamp)) {
             if (areTimestampsOnConsecutiveDays(userProfile.lastStudiedTimestamp, now)) {
                newStreak += 1; // It's a consecutive day
             } else {
                newStreak = 1; // Streak is broken, reset to 1
             }
        }
        // If it's the same day, streak doesn't change.
    } else {
        newStreak = 1; // First ever session
    }

    let tempProfile = {
        ...userProfile,
        xp: userProfile.xp + earnedXp + bonusXp,
        masteredTopics: updatedMasteredTopics,
        studyStreak: newStreak,
        lastStudiedTimestamp: now,
    };

    const { updatedProfile, newlyUnlocked } = checkAchievements(tempProfile, score, totalQuestions, currentModuleId!);
    
    setUserProfile(updatedProfile);
    setLastQuizResult({ score, totalQuestions, bonusXp, newlyUnlocked });
    setActiveView('results');
  };

  const handleReturnToPage = () => {
      setCurrentModuleId(null);
      setLastQuizResult(null);
      setActiveView('page');
      setCurrentPage('practice');
  };
  
  const renderActiveView = () => {
      if (activeView === 'quiz' && currentModuleId) {
          return <QuizView moduleId={currentModuleId} onQuizComplete={handleQuizComplete} />;
      }
      if (activeView === 'results' && lastQuizResult && currentModuleId) {
          const currentModule = LEARNING_MODULES.find(m => m.id === currentModuleId)!;
          return (
              <ResultsView 
                  score={lastQuizResult.score} 
                  totalQuestions={lastQuizResult.totalQuestions}
                  moduleName={currentModule.name}
                  isBossBattle={currentModule.type === 'boss'}
                  bonusXp={lastQuizResult.bonusXp}
                  newlyUnlocked={lastQuizResult.newlyUnlocked}
                  onReturnToPage={handleReturnToPage} 
              />
          );
      }

      // Default to page view
      switch (currentPage) {
          case 'practice':
              return <HomeView userProfile={userProfile} onStartModule={handleStartModule} />;
          case 'bank':
              return <QuestionBankView questions={questions} />;
          case 'learn':
              return <LearnPageContainer />;
          case 'achievements':
              return <AchievementsView userProfile={userProfile} />;
          case 'community':
              return <CommunityPageContainer />;
          default:
              return <HomeView userProfile={userProfile} onStartModule={handleStartModule} />;
      }
  };

  return (
    <div className="app-container">
      <header className="header">
        <h1>教甄通</h1>
      </header>
      <main>
        {renderActiveView()}
      </main>
      <NavigationBar currentPage={currentPage} onNavigate={handleNavigate} />
    </div>
  );
};

const container = document.getElementById('root');
const root = createRoot(container!);
root.render(<App />);
