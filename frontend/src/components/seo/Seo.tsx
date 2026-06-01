import { Helmet } from "react-helmet-async";
import { APP_NAME, APP_TAGLINE } from "../../lib/config";

type SeoProps = {
  title?: string;
  description?: string;
  noIndex?: boolean;
};

export const Seo = ({
  title,
  description = APP_TAGLINE,
  noIndex = false
}: SeoProps) => {
  const pageTitle = title ? `${title} | ${APP_NAME}` : APP_NAME;
  return (
    <Helmet prioritizeSeoTags>
      <html lang="id" />
      <title>{pageTitle}</title>
      <meta name="description" content={description} />
      <meta name="robots" content={noIndex ? "noindex,nofollow" : "index,follow"} />
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content="website" />
      <meta property="og:image" content="/og-staffora.svg" />
      <meta name="twitter:card" content="summary_large_image" />
    </Helmet>
  );
};
