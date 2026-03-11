type Props = {
  eyebrow: string;
  title: string;
  text?: string;
};

export function SectionTitle({ eyebrow, title, text }: Props) {
  return (
    <div className="section-title">
      <span className="eyebrow">{eyebrow}</span>
      <h2>{title}</h2>
      {text ? <p className="section-text">{text}</p> : null}
    </div>
  );
}
