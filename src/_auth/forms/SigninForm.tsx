import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { SigninValidation } from '@/lib/validation';
import Loader from '@/components/shared/Loader';
import { useToast } from '@/components/ui/use-toast';
import { useSignInAccount } from '@/lib/react-query/queriesAndMutations';
import { useUserContext } from '@/context/AuthContext';

export default function SigninForm() {
	const { toast } = useToast();
	const navigate = useNavigate();
	const { checkAuthUser, isLoading: isUserLoading } = useUserContext();

	const { mutateAsync: signInAccount, isLoading } = useSignInAccount();

	// 1. Define your form.
	const form = useForm<z.infer<typeof SigninValidation>>({
		resolver: zodResolver(SigninValidation),
		defaultValues: {
			email: '',
			password: '',
		},
	});

	// 2. Define a submit handler.
	async function onSubmit(values: z.infer<typeof SigninValidation>) {
		const session = await signInAccount({ email: values.email, password: values.password });

		if (!session) return toast({ title: 'Login failed, please try again.' });

		const isLoggedIn = await checkAuthUser();

		if (isLoggedIn) {
			form.reset();
			navigate('/');
		} else {
			return toast({ title: 'Login failed, please try again.' });
		}
	}

	return (
		<Form {...form}>
			<div className='sm:w-420 flex-center flex-col'>
				<img src='/assets/images/logo.svg' alt='logo' />

				<h2 className='h3-bold md:h2-bold pt-5 sm:pt-12'>Log in to your account</h2>
				<p className='text-light-3 small-medium md:base-regular mt-2'>
					Welcome back, please enter your details
				</p>

				<form onSubmit={form.handleSubmit(onSubmit)} className='flex flex-col gap-5 w-full mt-4'>
					<FormField
						control={form.control}
						name='email'
						render={({ field }) => (
							<FormItem>
								<FormLabel>Email</FormLabel>
								<FormControl>
									<Input type='email' className='shad-input' placeholder='Your email' {...field} />
								</FormControl>
								<FormMessage className='text-red' />
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name='password'
						render={({ field }) => (
							<FormItem>
								<FormLabel>Password</FormLabel>
								<FormControl>
									<Input
										autoComplete='current-password'
										type='password'
										className='shad-input'
										placeholder='Your password'
										{...field}
									/>
								</FormControl>
								<FormMessage className='text-red' />
							</FormItem>
						)}
					/>

					<Button className='shad-button_primary' type='submit'>
						{isLoading || isUserLoading ? (
							<div className='flex-center gap-2'>
								<Loader /> Loading...
							</div>
						) : (
							'Log in'
						)}
					</Button>

					<p className='text-small-regular text-light-2 text-center m-2'>
						Don't have an account?
						<Link to={'/sign-up'} className='text-primary-500 text-small-semibold ml-1'>
							Sign up
						</Link>
					</p>
				</form>
			</div>
		</Form>
	);
}
