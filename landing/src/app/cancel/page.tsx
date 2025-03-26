import Image from 'next/image';
import { UserButton } from '@clerk/nextjs';
import Link from 'next/link';

export default function CancelPage() {
	return (
		<div className='w-screen h-screen bg-white p-2'>
			<div className='bg-green-800/10 rounded-xl p-4 w-full h-full flex flex-col'>
				<header className='flex justify-between items-center'>
					<div className='flex items-center'>
						<Image
							width={600}
							height={100}
							src='/img/logo.webp'
							alt='ViewVolt logo'
							className='w-36'
						/>
					</div>
					<UserButton afterSignOutUrl='/' />
				</header>

				<main className='flex-grow flex items-center justify-center text-gray-800 px-10'>
					<div className='text-center'>
						<h1 className='text-4xl font-bold mb-4'>Subscription Cancelled</h1>
						<p className='text-xl mb-8'>
							Your subscription process has been cancelled. No charges were
							made.
						</p>
						<Link
							href='/'
							className='bg-gray-800 font-bold text-white py-3 px-6 rounded-lg'
						>
							Return to Home
						</Link>
					</div>
				</main>
			</div>
		</div>
	);
}
