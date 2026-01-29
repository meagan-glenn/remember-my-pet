interface MemorialPageProps {
  params: Promise<{ slug: string }>;
}

export default async function MemorialPage({ params }: MemorialPageProps) {
  const { slug } = await params;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-8">
      <h1 className="text-3xl font-bold">Memorial: {slug}</h1>
      <p className="mt-4 text-muted-foreground">Public memorial page</p>
    </div>
  );
}
