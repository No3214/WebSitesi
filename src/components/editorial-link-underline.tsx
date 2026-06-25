import type { AnchorHTMLAttributes, ReactNode } from "react";

import styles from "./editorial-link-underline.module.css";

type EditorialLinkUnderlineProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  children: ReactNode;
};

/**
 * Stone & Light editoryal metin-ici link.
 * Server component (sifir JS), saf CSS alt cizgi animasyonu.
 * Gercek <a> dondurur; tum anchor proplari ve href gecirilebilir.
 * Next.js dahili rotalari icin `<Link legacyBehavior passHref>` ile sarilabilir.
 */
export function EditorialLinkUnderline({
  children,
  className,
  ...rest
}: EditorialLinkUnderlineProps) {
  const classNames = [styles.link, className].filter(Boolean).join(" ");
  return (
    <a className={classNames} {...rest}>
      {children}
    </a>
  );
}

export default EditorialLinkUnderline;
