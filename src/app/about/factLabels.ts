// 프로필 표의 행 이름들. 로케일 JSON에 없는 항목이라 여기 모아둔다.
// 짧고 일반적인 단어만 담는다 — 긴 문장을 여기서 번역해 지어내지 않는다.

export interface FactLabels {
  summaryHeading: string;
  whyHeading: string;
  why: string;
  values: string;
  goal: string;
  name: string;
  alsoWritten: string;
  clan: string;
  occupation: string;
  education: string;
  nationality: string;
  email: string;
  website: string;
  nationalityValue: string;
  updated: string;
}

const LABELS: Record<string, FactLabels> = {
  ko: {
    summaryHeading: '한 줄 요약', whyHeading: '왜 / 무엇을 / 어디로', why: '왜', values: '가치', goal: '1~2년',
    name: '이름', alsoWritten: '다른 표기', clan: '본관', occupation: '직업',
    education: '학력', nationality: '국적', email: '이메일', website: '공식 사이트',
    nationalityValue: '대한민국',
    updated: '마지막 업데이트',
  },
  en: {
    summaryHeading: 'At a glance', whyHeading: 'Why / What / Where', why: 'Why', values: 'Values', goal: '1–2 years',
    name: 'Name', alsoWritten: 'Also written', clan: 'Clan', occupation: 'Occupation',
    education: 'Education', nationality: 'Nationality', email: 'Email', website: 'Website',
    nationalityValue: 'South Korea',
    updated: 'Last updated',
  },
  ja: {
    summaryHeading: '基本情報', whyHeading: 'なぜ / 何を / どこへ', why: 'なぜ', values: '価値観', goal: '1〜2年',
    name: '名前', alsoWritten: '別表記', clan: '本貫', occupation: '職業',
    education: '学歴', nationality: '国籍', email: 'メール', website: '公式サイト',
    nationalityValue: '韓国',
    updated: '最終更新',
  },
  zh: {
    summaryHeading: '基本信息', whyHeading: '为何 / 做什么 / 去向', why: '为何', values: '价值观', goal: '1~2年',
    name: '姓名', alsoWritten: '其他写法', clan: '本贯', occupation: '职业',
    education: '学历', nationality: '国籍', email: '邮箱', website: '官方网站',
    nationalityValue: '韩国',
    updated: '最后更新',
  },
  es: {
    summaryHeading: 'De un vistazo', whyHeading: 'Por qué / Qué / Hacia dónde', why: 'Por qué', values: 'Valores', goal: '1–2 años',
    name: 'Nombre', alsoWritten: 'Otras grafías', clan: '', occupation: 'Ocupación',
    education: 'Formación', nationality: 'Nacionalidad', email: 'Correo', website: 'Sitio web',
    nationalityValue: 'Corea del Sur',
    updated: 'Última actualización',
  },
  fr: {
    summaryHeading: 'En bref', whyHeading: 'Pourquoi / Quoi / Vers où', why: 'Pourquoi', values: 'Valeurs', goal: '1–2 ans',
    name: 'Nom', alsoWritten: 'Autres graphies', clan: '', occupation: 'Profession',
    education: 'Formation', nationality: 'Nationalité', email: 'E-mail', website: 'Site officiel',
    nationalityValue: 'Corée du Sud',
    updated: 'Dernière mise à jour',
  },
  de: {
    summaryHeading: 'Auf einen Blick', whyHeading: 'Warum / Was / Wohin', why: 'Warum', values: 'Werte', goal: '1–2 Jahre',
    name: 'Name', alsoWritten: 'Andere Schreibweisen', clan: '', occupation: 'Beruf',
    education: 'Ausbildung', nationality: 'Nationalität', email: 'E-Mail', website: 'Website',
    nationalityValue: 'Südkorea',
    updated: 'Zuletzt aktualisiert',
  },
  pt: {
    summaryHeading: 'Resumo', whyHeading: 'Por quê / O quê / Para onde', why: 'Por quê', values: 'Valores', goal: '1–2 anos',
    name: 'Nome', alsoWritten: 'Outras grafias', clan: '', occupation: 'Ocupação',
    education: 'Formação', nationality: 'Nacionalidade', email: 'E-mail', website: 'Site oficial',
    nationalityValue: 'Coreia do Sul',
    updated: 'Última atualização',
  },
  ru: {
    summaryHeading: 'Кратко', whyHeading: 'Почему / Что / Куда', why: 'Почему', values: 'Ценности', goal: '1–2 года',
    name: 'Имя', alsoWritten: 'Другие написания', clan: '', occupation: 'Род занятий',
    education: 'Образование', nationality: 'Гражданство', email: 'Эл. почта', website: 'Сайт',
    nationalityValue: 'Республика Корея',
    updated: 'Обновлено',
  },
};

// 본관은 한자문화권 밖에서는 통하지 않는 개념이라 ko/ja/zh에서만 노출한다(clan을 빈 값으로 둠).
export function getFactLabels(lang: string): FactLabels {
  return LABELS[lang] ?? LABELS.en;
}
