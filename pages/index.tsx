import dynamic from 'next/dynamic';
import Head from 'next/head';
import UI from '../components/UI';

const GameScene = dynamic(() => import('../components/GameScene'), {
  ssr: false,
});

export default function Home() {
  return (
    <>
      <Head>
        <title>Solo Leveling - 3D Action RPG</title>
        <meta name="description" content="Experience the world of Solo Leveling in immersive 3D gameplay" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main style={{
        width: '100vw',
        height: '100vh',
        margin: 0,
        padding: 0,
        overflow: 'hidden',
        background: '#020617'
      }}>
        <GameScene />
        <UI />
      </main>
    </>
  );
}
