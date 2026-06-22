import styles from './logo.module.css';

export function Logo() {
  return (
    <div className={styles.logo}>
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="28" height="28" rx="6" fill="white" />
        <path d="M14 7V14L18 16" stroke="#c62917" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="14" cy="14" r="6" stroke="#c62917" strokeWidth="2.5" />
      </svg>
    </div>
  );
}
