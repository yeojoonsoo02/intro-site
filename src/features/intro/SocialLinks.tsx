'use client';

const SNS = [
	{
		href: 'https://blog.naver.com/yeojoonsoo02',
		label: '여준수 블로그',
		color: '#03c75a',
		img: '/sns/naver.svg',
	},
	{
		href: 'https://www.instagram.com/yeojoonsoo02/',
		label: '여준수 인스타그램',
		color: '#e1306c',
		img: '/sns/instagram.svg',
	},
	{
		href: 'https://open.kakao.com/o/somekakaolink',
		label: '여준수 카카오톡',
		color: '#fee500',
		img: '/sns/kakao.svg',
	},
	{
		href: 'https://github.com/yeojoonsoo02/intro-site',
		label: '프로젝트(GitHub)',
		color: '#24292f',
		img: '/sns/github.svg',
	},
];

export default function SocialLinks({
	colored = false,
	useImg = false,
}: {
	colored?: boolean;
	useImg?: boolean;
}) {
	return (
		<nav className="flex justify-center items-center gap-5 mt-4 flex-wrap w-full">
			{SNS.map(({ href, label, color, img }) => (
				<a
					key={href}
					href={href}
					target="_blank"
					rel="noopener noreferrer"
					aria-label={label}
					className="sns-icon transition-colors"
					style={colored ? { color } : undefined}
				>
					<span className="sr-only">{label}</span>
					{useImg ? (
						<img
							src={img}
							alt={label}
							className="w-7 h-7"
							style={{
								filter: colored ? undefined : 'grayscale(1) opacity(0.7)',
							}}
						/>
					) : (
						// fallback: 기존 SVG 아이콘 등
						<span className="w-7 h-7 block" />
					)}
				</a>
			))}
			<style jsx>{`
				.sns-icon {
					display: flex;
					align-items: center;
					justify-content: center;
					font-size: 1.7rem;
					border-radius: 50%;
					background: none;
					width: 2.7rem;
					height: 2.7rem;
					transition: color 0.18s, background 0.18s;
					color: var(--muted);
				}
				.sns-icon:hover {
					color: var(--primary);
					background: rgba(37, 99, 235, 0.08);
				}
				@media (max-width: 600px) {
					.sns-icon {
						font-size: 1.3rem;
						width: 2.2rem;
						height: 2.2rem;
					}
				}
			`}</style>
		</nav>
	);
}