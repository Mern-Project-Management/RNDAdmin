const fs = require('fs');
const path = require('path');

const dirs = [
  'blogs',
  'build-your-future',
  'cookies-policies',
  'life-at-rnd',
  'our-creative-minds',
  'our-expertise',
  'our-journey',
  'portfolio',
  'privacy-policies',
  'services',
  'terms-conditions',
  '[services]'
];

dirs.forEach(dir => {
  const fullPath = path.join('b:/RND/RNDNext/src/app', dir);
  if(fs.existsSync(fullPath)) {
    const slug = dir.replace(/\[|\]/g, '');
    const content = `import { Metadata } from 'next';
import { getDynamicMetadata } from '@/utils/getMetaData';

export async function generateMetadata(): Promise<Metadata> {
  return await getDynamicMetadata('${slug}', {
    title: '${slug.replace(/-/g, ' ').replace(/\\b\\w/g, l => l.toUpperCase())} - RND Technosoft',
    description: 'Explore ${slug.replace(/-/g, ' ')} at RND Technosoft.',
  });
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
`;
    fs.writeFileSync(path.join(fullPath, 'layout.tsx'), content);
    console.log('Generated layout for', dir);
  }
});
