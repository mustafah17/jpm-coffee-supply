export const metadata = {
  title: 'Supply Items App',
  description: 'Manage coffee shop supply items',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}