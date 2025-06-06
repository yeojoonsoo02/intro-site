import SocialLinks from './SocialLinks';

const profile = {
  name: "여준수",
  tagline: "웹 개발자 & 사업가",
  email: "yeojoonsoo02@gmail.com",
  photo: "/profile.jpg", // public 폴더에 이미지 추가 필요
  interests: ["블로그", "수영", "독서", "탁구"],
  intro: [
    "평소 카페 탐방을 즐기며, 친구들과 운동을 하러 다녀요. 새로운 사람을 만나는 걸 좋아하고, 독서를 통해 다양한 아이디어를 얻고 있습니다.",
    "최근에는 웹 개발과 AI에 관심을 갖고 다양한 프로젝트에 도전하고 있습니다.",
  ],
  region: "경기도 김포시 운양동",
};

export default function ProfileCard() {
  return (
    <section className="max-w-[600px] mx-auto mt-20 mb-8 px-2">
      <div className="bg-card rounded-[20px] shadow-lg p-6 sm:p-8 flex flex-col items-center">
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
        <div className="text-[2rem] font-semibold text-[color:var(--foreground)] mb-2">{profile.name}</div>
        {/* 태그라인 */}
        <div className="text-[1.25rem] text-[color:var(--muted)] mb-3">{profile.tagline}</div>
        {/* 이메일 + SNS */}
        <div className="flex items-center justify-center gap-4 mb-6 flex-wrap">
          <a
            href={`mailto:${profile.email}`}
            className="flex items-center gap-1.5 text-[color:var(--muted)] hover:text-[color:var(--primary)] transition-colors text-base"
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
        <div className="w-full h-px bg-[color:var(--border)] my-6" />
        {/* 관심사·취미 */}
        <div className="w-full text-center mb-6">
          <div className="text-base font-semibold text-[color:var(--foreground)] mb-2">관심사·취미</div>
          <div className="flex flex-wrap justify-center gap-2">
            {profile.interests.map((tag) => (
              <span
                key={tag}
                className="bg-[color:var(--background)] text-[color:var(--foreground)] rounded-md px-3 py-1 text-sm font-medium border border-[color:var(--border)]"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
        {/* 자기소개 */}
        <div className="w-full text-center">
          <div className="text-base font-semibold text-[color:var(--foreground)] mb-2">소개</div>
          <div className="space-y-3 text-[color:var(--foreground)] text-[1rem] leading-relaxed">
            {profile.intro.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        </div>
        {/* 지역 */}
        <div className="mt-8 text-sm text-[color:var(--muted)]">{profile.region}</div>
      </div>
    </section>
  );
}
