const legalLinks = [
  { label: "이용약관", href: "https://brassy-client-c0a.notion.site/3262f1c4b9668057b854ecb685c2b4cf?source=copy_link" },
  { label: "개인정보처리방침", href: "https://brassy-client-c0a.notion.site/3262f1c4b96680b0b44ae0e392c32431?source=copy_link" },
  { label: "환불 정책", href: "https://brassy-client-c0a.notion.site/3262f1c4b96680acb5e6d5e959b3d0a7?source=copy_link" },
];

export const LegalLinks = ({ className = "" }: { className?: string }) => (
  <div className={`flex items-center justify-center gap-3 text-[10px] text-muted-foreground ${className}`}>
    {legalLinks.map((link, i) => (
      <span key={link.label} className="flex items-center gap-3">
        {i > 0 && <span className="text-border">·</span>}
        <a
          href={link.href}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-foreground transition-colors"
        >
          {link.label}
        </a>
      </span>
    ))}
  </div>
);

const Footer = () => (
  <footer className="text-center pb-6 pt-2 space-y-2">
    <LegalLinks />
    <p className="text-[11px] text-muted-foreground">
      © 2026 InstAI · 재미로 보는 테스트입니다
    </p>
  </footer>
);

export default Footer;
