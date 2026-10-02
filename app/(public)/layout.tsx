import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import { getSettings } from '@/lib/settings';

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getSettings();

  return (
    <>
      <Nav settings={settings} />
      <main>{children}</main>
      <Footer settings={settings} />
    </>
  );
}