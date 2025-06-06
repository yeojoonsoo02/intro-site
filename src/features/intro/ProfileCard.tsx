import SocialLinks from './SocialLinks';

const profile = {
  name: "여준수",
  tagline: "웹 개발자 & 사업가",
  email: "hello@youremail.com",
  photo: "/profile.jpg",
  interests: ["여행", "운동", "독서", "테이블테니스"],
  intro: [
    "평소 카페 탐방을 즐기며, 친구들과 운동을 하러 다녀요. 새로운 사람을 만나는 걸 좋아하고, 독서를 통해 다양한 아이디어를 얻고 있습니다.",
    "최근에는 웹 개발과 AI에 관심을 갖고 다양한 프로젝트에 도전하고 있습니다.",
  ],
  region: "경기도 김포시 운양동",
};

export default function ProfileCard() {
  return (
    <section className="max-w-[600px] mx-auto mt-20 mb-8 px-2">
      <div
        className="w-full bg-[#27272A] dark:bg-[#27272A] rounded-[20px] shadow-lg p-6 sm:p-8 flex flex-col items-center"
        style={{
          background: "var(--card-bg, #27272A)",
          boxShadow: "0 2px 16px rgba(0,0,0,0.18)",
        }}
      >
        {/* 프로필 사진 */}
        <div className="mb-4">
          <img
            src={profile.photo}
            alt="프로필 사진"
            className="w-32 h-32 rounded-full border-4 border-[color:var(--primary)] object-cover shadow"
            style={{ background: "var(--background)" }}
          />
        </div>
        {/* 이름 */}
        <div className="text-[2rem] font-semibold text-[#E4E4E7] mb-2">{profile.name}</div>
        {/* 태그라인 */}
        <div className="text-[1.25rem] text-[#A1A1AA] mb-3">{profile.tagline}</div>
        {/* 이메일 + SNS */}
        <div className="flex items-center justify-center gap-4 mb-6 flex-wrap">
          <a
            href={`mailto:${profile.email}`}
            className="flex items-center gap-1.5 text-[#A1A1AA] hover:text-[color:var(--primary)] transition-colors text-base"
          >
            <svg width="20" height="20" fill="currentColor" aria-hidden="true">
              <rect width="20" height="20" rx="4" fill="none" />
              <path d="M3 5.5A2.5 2.5 0 0 1 5.5 3h9A2.5 2.5 0 0 1 17 5.5v9A2.5 2.5 0 0 1 14.5 17h-9A2.5 2.5 0 0 1 3 14.5v-9Zm2.2.5 4.3 3.7a1 1 0 0 0 1.3 0l4.3-3.7" stroke="currentColor" strokeWidth="1.2" fill="none"/>
            </svg>
            <span>{profile.email}</span>
          </a>
          <SocialLinks />
        </div>
        {/* 구분선 */}
        <div className="w-full h-px bg-[#393940] my-6" />
        {/* 관심사·취미 */}
        <div className="w-full text-center mb-6">
          <div className="text-[1rem] font-semibold text-[#E4E4E7] mb-2">관심사·취미</div>
          <div className="flex flex-wrap justify-center gap-x-1.5 gap-y-1">
            {profile.interests.map((tag, idx) => (
              <span
                key={tag}
                className="bg-[#323236] text-[#D4D4D8] rounded-full px-3 py-1 text-[0.875rem] font-normal"
                style={{
                  marginRight: idx !== profile.interests.length - 1 ? '6px' : 0,
                }}
              >
                {tag}
                {idx !== profile.interests.length - 1 && <span className="mx-1 text-[#393940]">·</span>}
              </span>
            ))}
          </div>
        </div>
        {/* 자기소개 */}
        <div className="w-full text-center mb-6">
          <div className="text-[1rem] font-semibold text-[#E4E4E7] mb-2">소개</div>
          <div className="space-y-3 text-[#C4C4C8] text-[1rem] leading-[1.5]">
            {profile.intro.map((p, i) => (
              <p key={i} className={i !== 0 ? "mt-3" : ""}>{p}</p>
            ))}
          </div>
        </div>
        {/* 위치 */}
        <div className="mt-4 text-[0.875rem] flex items-center justify-center text-[#B0B0B8] font-medium">
          <span className="mr-1" aria-hidden>📍</span>
          {profile.region}
        </div>
      </div>
    </section>
  );
}
