type BrandMarkProps = {
  readonly showText?: boolean;
};

export default function BrandMark({ showText = true }: BrandMarkProps) {
  if (!showText) {
    return null;
  }

  return <div className="text-xl font-bold text-base-content">PhishGuard</div>;
}
