import Image from 'next/image';
import {cn} from 'cn';

type BrandLogoProps = {
 className?: string;
 sizes?: string;
};

export function BrandLogo({className,sizes='120px'}:BrandLogoProps) {
 return <Image
  src="/brand/bam-logo.png"
  alt="BAM"
  width={960}
  height={307}
  sizes={sizes}
  loading="eager"
  className={cn('block h-auto w-28 max-w-full shrink-0 object-contain',className)}
 />;
}
