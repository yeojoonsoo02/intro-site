'use client';

import styles from './intro.module.css';

export default function IntroCard() {
  return (
    <div className={styles.card}>
      <h2 className={styles.title}>👋 안녕하세요! 저는 여준수입니다</h2>
      <p className={styles.description}>
        꾸준함을 무기로 삼아, AI와 개발을 배우며 성장하고 있는 개발자 지망생입니다.
      </p>
      <ul className={styles.tags}>
        <li>#GPT활용</li>
        <li>#웹개발</li>
        <li>#자기관리</li>
        <li>#목표지향</li>
      </ul>
    </div>
  );
}