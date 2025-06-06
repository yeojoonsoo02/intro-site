'use client';

const SNS = [
	{
		href: 'https://blog.naver.com/yeojoonsoo02',
		label: '여준수 블로그',
		icon: (
			<svg
				className="w-7 h-7"
				fill="currentColor"
				viewBox="0 0 24 24"
				aria-hidden="true"
			>
				<rect width="24" height="24" rx="5" />
				<text
					x="50%"
					y="60%"
					textAnchor="middle"
					fontSize="13"
					fill="#03c75a"
					fontWeight="bold"
					dy=".3em"
				>
					N
				</text>
			</svg>
		),
		color: '#03c75a',
	},
	{
		href: 'https://www.instagram.com/yeojoonsoo02/',
		label: '여준수 인스타그램',
		icon: (
			<svg
				className="w-7 h-7"
				fill="currentColor"
				viewBox="0 0 24 24"
				aria-hidden="true"
			>
				<rect width="24" height="24" rx="6" />
				<g>
					<circle
						cx="12"
						cy="12"
						r="5"
						stroke="currentColor"
						strokeWidth="2"
						fill="none"
					/>
					<circle cx="18" cy="6" r="1.2" fill="currentColor" />
				</g>
			</svg>
		),
		color: '#e1306c',
	},
	{
		href: 'https://open.kakao.com/o/somekakaolink',
		label: '여준수 카카오톡',
		icon: (
			<svg
				className="w-7 h-7"
				fill="currentColor"
				viewBox="0 0 24 24"
				aria-hidden="true"
			>
				<ellipse
					cx="12"
					cy="12"
					rx="10"
					ry="9"
					fill="currentColor"
				/>
				<ellipse
					cx="12"
					cy="18"
					rx="3"
					ry="1.2"
					fill="#fff"
				/>
			</svg>
		),
		color: '#fee500',
	},
	{
		href: 'https://github.com/yeojoonsoo02/intro-site',
		label: '프로젝트(GitHub)',
		icon: (
			<svg
				className="w-7 h-7"
				fill="currentColor"
				viewBox="0 0 24 24"
				aria-hidden="true"
			>
				<path d="M12 2C6.48 2 2 6.58 2 12.26c0 4.48 2.87 8.28 6.84 9.63.5.09.68-.22.68-.48 0-.24-.01-.87-.01-1.7-2.78.62-3.37-1.36-3.37-1.36-.45-1.18-1.1-1.5-1.1-1.5-.9-.63.07-.62.07-.62 1 .07 1.53 1.05 1.53 1.05.89 1.56 2.34 1.11 2.91.85.09-.66.35-1.11.63-1.37-2.22-.26-4.56-1.14-4.56-5.07 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.7 0 0 .84-.28 2.75 1.05A9.38 9.38 0 0 1 12 6.84c.85.004 1.7.12 2.5.35 1.9-1.33 2.74-1.05 2.74-1.05.55 1.4.2 2.44.1 2.7.64.72 1.03 1.63 1.03 2.75 0 3.94-2.34 4.8-4.57 5.06.36.32.68.94.68 1.9 0 1.37-.01 2.47-.01 2.8 0 .27.18.58.69.48C19.13 20.54 22 16.74 22 12.26 22 6.58 17.52 2 12 2z" />
			</svg>
		),
		color: '#24292f',
	},
	{
		href: 'https://www.instagram.com/chatko.ai/',
		label: '챗코 인스타그램',
		icon: (
			<svg
				className="w-7 h-7"
				fill="currentColor"
				viewBox="0 0 24 24"
				aria-hidden="true"
			>
				<rect width="24" height="24" rx="6" />
				<g>
					<circle
						cx="12"
						cy="12"
						r="5"
						stroke="currentColor"
						strokeWidth="2"
						fill="none"
					/>
					<circle cx="18" cy="6" r="1.2" fill="currentColor" />
				</g>
			</svg>
		),
		color: '#e1306c',
	},
	{
		href: 'https://blog.naver.com/chatgpt_krguide',
		label: '챗코 블로그',
		icon: (
			<svg
				className="w-7 h-7"
				fill="currentColor"
				viewBox="0 0 24 24"
				aria-hidden="true"
			>
				<rect width="24" height="24" rx="5" />
				<text
					x="50%"
					y="60%"
					textAnchor="middle"
					fontSize="13"
					fill="#03c75a"
					fontWeight="bold"
					dy=".3em"
				>
					N
				</text>
			</svg>
		),
		color: '#03c75a',
	},
];

export default function SocialLinks() {
	return (
		<nav className="flex justify-center items-center gap-5 mt-4 flex-wrap w-full">
			{SNS.map(({ href, label, icon, color }) => (
				<a
					key={href}
					href={href}
					target="_blank"
					rel="noopener noreferrer"
					aria-label={label}
					className="sns-icon transition-colors"
					style={{ color }}
				>
					<span className="sr-only">{label}</span>
					{icon}
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