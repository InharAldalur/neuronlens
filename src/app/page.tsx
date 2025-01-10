import Image from 'next/image';
import { Chrome } from 'lucide-react';
import { SignInButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs';
import { SubscriptionButton } from '@/components/subscription-button';

export default function LandingPage() {
	return (
		<div className='w-screen h-screen bg-black'>
			<div className='bg-green-800/10 relative rounded-xl p-4 w-full h-full flex flex-col'>
				<img
					src='/img/bg.webp'
					alt='Background'
					className='absolute inset-0 w-full h-full object-cover'
				/>
				<header className='flex justify-between items-center '>
					<div className='flex items-center'>
						<Image
							width={600}
							height={100}
							src='/img/logo.webp'
							alt='ViewVolt logo'
							className='w-36'
						/>
					</div>
					<SignedIn>
						<UserButton afterSignOutUrl='/' />
					</SignedIn>
				</header>

				<main className='flex-grow z-10 flex flex-col justify-center items-center text-white  px-10'>
					<div className='w-full max-w-8xl justify-center flex flex-col px-16 lg:flex-row items-center'>
						<div className='text-white flex justify-center flex-col items-center'>
							<img
								src='/img/logo.webp'
								alt='ViewVolt logo'
								className='w-48 mb-6'
							/>
							<h1 className='text-5xl font-bold leading-tighter tracking-tighter '>
								Save time watching youtube smarter
							</h1>
							<p className='text-xl mt-3 text-white/80'>
								A chrome extension to skip the boring and watch the essential.
								Powered by AI segmenting.
							</p>
							<SignedOut>
								<SignInButton
									mode='modal'
									signUpFallbackRedirectUrl='https://lens.neuroneleven.com'
								>
									<button className='bg-gray-800/50 hover:bg-gray-800/60 font-bold text-white py-4 px-10 rounded-full backdrop-blur-2xl mt-6 flex items-center gap-2'>
										<Chrome size={20} />
										Get the extension
									</button>
								</SignInButton>
							</SignedOut>
							<SignedIn>
								<SubscriptionButton />
							</SignedIn>
							<iframe
								className='w-full max-w-xl rounded-xl mt-10 aspect-video'
								src='https://www.youtube.com/embed/AMPg0rHN2vA'
								title='ViewVolt Demo Video'
								allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
								allowFullScreen
							/>
						</div>
					</div>
				</main>
			</div>
		</div>
	);
}
