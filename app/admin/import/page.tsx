import ImportManager from '@/components/ImportManager';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Import Data' };

export default function ImportPage() {
  return (
    <>
      <div className="admin-card-head">
        <h1 style={{ margin: 0 }}>Import Data</h1>
      </div>
      <ImportManager />
    </>
  );
}