import { useParams } from 'react-router-dom';
import Layout from '@/components/Layout';
import AreaExplorer from '@/components/AreaExplorer';
import { SUBURB_GROUPS } from '@/lib/suburbs';

function slugToSuburb(slug: string): string {
  const allSuburbs = SUBURB_GROUPS.flatMap(g => g.suburbs);
  const normalized = slug.toLowerCase().replace(/-/g, ' ').replace(/'/g, "'");
  return allSuburbs.find(s => s.toLowerCase().replace(/'/g, "'") === normalized) || '';
}

export default function Area() {
  const { suburb } = useParams<{ suburb: string }>();
  const resolvedSuburb = suburb ? slugToSuburb(suburb) : '';

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <AreaExplorer initialSuburb={resolvedSuburb} />
      </div>
    </Layout>
  );
}
